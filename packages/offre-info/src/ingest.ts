import { logger } from "@playground/shared-types";
import type { Database, Json } from "@playground/supabase";
import { computeContentHash } from "@playground/supabase/ingestion-runs";
import type { SupabaseClient } from "@supabase/supabase-js";
import {
  changedFieldPaths,
  classifyChange,
  createsIngestionRecord,
  type PreviousService,
  type RcoChange,
} from "./change";
import { toOriginId } from "./config";
import { compareWithDiVersion, type DiComparisonRow } from "./di-comparison";
import {
  buildActionDocument,
  pickReferenceSession,
  type RcoActionDocument,
} from "./document";
import { actionToMarkdown } from "./markdown";
import type { RcoActionSessions } from "./search";
import {
  buildStructureDocument,
  type RcoStructureDocument,
  resolveStructureId,
} from "./structure";

type Supabase = SupabaseClient<Database>;

type LatestService = PreviousService & { structure_id: string | null };

type PlannedAction = {
  numeroAction: string;
  document: RcoActionDocument;
  hash: string;
  structure: RcoStructureDocument;
  change: RcoChange;
  changedFields: string[];
  diComparison?: DiComparisonRow[];
};

export type RcoActionOutcome = {
  numeroAction: string;
  change: RcoChange | "error";
  // Top-level fields that differ from the previous RCO version.
  changedFields?: string[];
  // Baseline only: common fields of the DI version next to the RCO values.
  diComparison?: DiComparisonRow[];
};

export type RcoBatchResult = {
  processed: number;
  changes: Record<RcoChange, number>;
  structuresWritten: number;
  ingestionRecordsCreated: number;
  errors: Array<{ numeroAction: string; error: string }>;
  // One entry per processed action, so the UI can link each one to its fiche.
  outcomes: RcoActionOutcome[];
};

export const emptyRcoBatchResult = (): RcoBatchResult => ({
  processed: 0,
  changes: { new: 0, unchanged: 0, baseline: 0, sessions_only: 0, content: 0 },
  structuresWritten: 0,
  ingestionRecordsCreated: 0,
  errors: [],
  outcomes: [],
});

const toOutcome = ({
  numeroAction,
  change,
  changedFields,
  diComparison,
}: PlannedAction): RcoActionOutcome => ({
  numeroAction,
  change,
  changedFields,
  diComparison,
});

// A DI previous version has another shape: diffing it would list every field.
const DIFFABLE_CHANGES = new Set<RcoChange>(["sessions_only", "content"]);

const errorMessage = (error: unknown) =>
  error instanceof Error ? error.message : String(error);

const toVersionRow = (
  document: { id: string },
  hash: string,
  runId: string,
) => ({
  raw_data: JSON.stringify(document),
  data: document as unknown as Json,
  content_hash: hash,
  origin: "RCO" as const,
  ingestion_run_id: runId,
});

async function fetchLatestServices(
  supabase: Supabase,
  originIds: string[],
): Promise<Map<string, LatestService>> {
  const { data, error } = await supabase
    .from("services_latest")
    .select("origin_id, origin, content_hash, data, structure_id")
    .in("origin_id", originIds);
  if (error) throw new Error(`services_latest lookup failed: ${error.message}`);

  const latestByOriginId = new Map<string, LatestService>();
  for (const row of data ?? []) {
    if (!row.origin_id || !row.origin) continue;
    latestByOriginId.set(row.origin_id, {
      origin: row.origin,
      content_hash: row.content_hash,
      data: row.data,
      structure_id: row.structure_id,
    });
  }
  return latestByOriginId;
}

async function fetchStructureIdsBySiret(
  supabase: Supabase,
  sirets: string[],
): Promise<Map<string, string>> {
  if (sirets.length === 0) return new Map();
  const { data, error } = await supabase
    .from("structures_latest")
    .select("origin_id, siret:data->>siret")
    .in("data->>siret", [...new Set(sirets)]);
  if (error)
    throw new Error(`structures_latest siret lookup failed: ${error.message}`);

  const structureIdBySiret = new Map<string, string>();
  for (const row of data ?? []) {
    if (row.origin_id && row.siret && !structureIdBySiret.has(row.siret)) {
      structureIdBySiret.set(row.siret, row.origin_id);
    }
  }
  return structureIdBySiret;
}

async function writeStructures(
  supabase: Supabase,
  structures: RcoStructureDocument[],
  runId: string,
): Promise<{ uuidByOriginId: Map<string, string>; written: number }> {
  const structureById = new Map(
    structures.map((structure) => [structure.id, structure]),
  );
  const { data: latest, error } = await supabase
    .from("structures_latest")
    .select("id, origin_id, content_hash")
    .in("origin_id", [...structureById.keys()]);
  if (error)
    throw new Error(`structures_latest lookup failed: ${error.message}`);

  const uuidByOriginId = new Map<string, string>();
  const hashByOriginId = new Map<string, string | null>();
  for (const row of latest ?? []) {
    if (!row.origin_id || !row.id) continue;
    uuidByOriginId.set(row.origin_id, row.id);
    hashByOriginId.set(row.origin_id, row.content_hash);
  }

  const changed = [...structureById.values()]
    .map((structure) => ({ structure, hash: computeContentHash(structure) }))
    .filter(({ structure, hash }) => hashByOriginId.get(structure.id) !== hash);
  if (changed.length === 0) return { uuidByOriginId, written: 0 };

  const { data: inserted, error: insertError } = await supabase
    .from("structures")
    .insert(
      changed.map(({ structure, hash }) =>
        toVersionRow(structure, hash, runId),
      ),
    )
    .select("id, origin_id");
  if (insertError)
    throw new Error(`structures insert failed: ${insertError.message}`);

  for (const row of inserted ?? []) {
    if (row.origin_id) uuidByOriginId.set(row.origin_id, row.id);
  }
  return { uuidByOriginId, written: changed.length };
}

async function writeServiceVersions(
  supabase: Supabase,
  actions: PlannedAction[],
  structureUuidByOriginId: Map<string, string>,
  runId: string,
): Promise<number> {
  const { data: services, error } = await supabase
    .from("services")
    .insert(
      actions.map(({ document, hash }) => toVersionRow(document, hash, runId)),
    )
    .select("id, origin_id");
  if (error || !services)
    throw new Error(`services insert failed: ${error?.message}`);

  const serviceIdByOriginId = new Map(
    services.map((service) => [service.origin_id, service.id]),
  );
  const records = actions
    .filter(({ change, document }) => createsIngestionRecord(change, document))
    .map((action) => ({
      service_id: serviceIdByOriginId.get(action.document.id) as string,
      structure_id: structureUuidByOriginId.get(action.structure.id) ?? null,
      markdown: actionToMarkdown(action.document, action.structure),
      metadata: {
        ...action.document,
        structure: action.structure,
      } as unknown as Json,
    }));
  if (records.length === 0) return 0;

  const { error: recordError } = await supabase
    .from("ingestion_records")
    .insert(records);
  if (recordError) {
    // Otherwise the next run sees an unchanged hash and never creates the records.
    await supabase
      .from("services")
      .delete()
      .in(
        "id",
        services.map((service) => service.id),
      );
    throw new Error(`ingestion_records insert failed: ${recordError.message}`);
  }
  return records.length;
}

export async function ingestRcoActions(
  supabase: Supabase,
  fetched: RcoActionSessions[],
  runId: string,
): Promise<RcoBatchResult> {
  const result = emptyRcoBatchResult();
  result.processed = fetched.length;
  if (fetched.length === 0) return result;

  const latestServices = await fetchLatestServices(
    supabase,
    fetched.map(({ numeroAction }) => toOriginId(numeroAction)),
  );
  const structureIdBySiret = await fetchStructureIdsBySiret(
    supabase,
    fetched.flatMap(
      ({ sessions }) =>
        pickReferenceSession(sessions).organisme_responsable?.siret ?? [],
    ),
  );

  const planned: PlannedAction[] = [];
  for (const { numeroAction, sessions } of fetched) {
    const organisme = pickReferenceSession(sessions).organisme_responsable;
    const previous = latestServices.get(toOriginId(numeroAction));
    const structureId = resolveStructureId({
      knownStructureId: previous?.structure_id ?? null,
      siret: organisme?.siret ?? null,
      structureIdBySiret,
    });
    if (!organisme || !structureId) {
      result.errors.push({
        numeroAction,
        error: "organisme_responsable without siret",
      });
      result.outcomes.push({ numeroAction, change: "error" });
      continue;
    }

    const document = buildActionDocument(sessions, structureId);
    const change = classifyChange(previous, document);
    result.changes[change]++;
    const changedFields = DIFFABLE_CHANGES.has(change)
      ? changedFieldPaths(previous?.data, document)
      : [];
    if (changedFields.length > 0) {
      logger.info(
        { numeroAction, change, changedFields },
        "RCO action changed",
      );
    }
    planned.push({
      numeroAction,
      document,
      hash: computeContentHash(document),
      structure: buildStructureDocument(organisme, structureId),
      change,
      changedFields,
      diComparison:
        change === "baseline"
          ? compareWithDiVersion(previous?.data, document)
          : undefined,
    });
  }

  if (planned.length === 0) return result;

  const { uuidByOriginId, written } = await writeStructures(
    supabase,
    planned.map(({ structure }) => structure),
    runId,
  );
  result.structuresWritten = written;

  const changed = planned.filter(({ change }) => change !== "unchanged");
  if (changed.length === 0) {
    result.outcomes.push(...planned.map(toOutcome));
    return result;
  }
  try {
    result.ingestionRecordsCreated = await writeServiceVersions(
      supabase,
      changed,
      uuidByOriginId,
      runId,
    );
    result.outcomes.push(...planned.map(toOutcome));
  } catch (error) {
    result.errors.push(
      ...changed.map(({ numeroAction }) => ({
        numeroAction,
        error: errorMessage(error),
      })),
    );
    result.outcomes.push(
      ...planned.map((action) =>
        action.change === "unchanged"
          ? toOutcome(action)
          : { numeroAction: action.numeroAction, change: "error" as const },
      ),
    );
  }
  return result;
}
