import { logger } from "@playground/shared-types";
import type { Database, Json } from "@playground/supabase";
import { computeContentHash } from "@playground/supabase/ingestion-runs";
import type { SupabaseClient } from "@supabase/supabase-js";
import { fetchActionSessions } from "./action";
import {
  changedFieldPaths,
  classifyChange,
  createsIngestionRecord,
  type PreviousService,
  type RcoChange,
} from "./change";
import { isRcoAuthError, isRcoRateLimitError, type RcoClient } from "./client";
import { toOriginId } from "./config";
import { compareWithDiVersion, type DiComparisonRow } from "./di-comparison";
import {
  buildActionDocument,
  pickReferenceSession,
  type RcoActionDocument,
} from "./document";
import { actionToMarkdown } from "./markdown";
import type { SessionOffre } from "./session-offre";
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

export type RcoBatchResult = {
  requested: number;
  processed: number;
  interrupted: boolean;
  missing: number;
  changes: Record<RcoChange, number>;
  structuresWritten: number;
  ingestionRecordsCreated: number;
  errors: Array<{ numeroAction: string; error: string }>;
  // One entry per processed action, so the UI can link each one to its fiche.
  outcomes: RcoActionOutcome[];
};

export type RcoActionOutcome = {
  numeroAction: string;
  change: RcoChange | "missing" | "error";
  // Top-level fields that differ from the previous RCO version.
  changedFields?: string[];
  // Baseline only: common fields of the DI version next to the RCO values.
  diComparison?: DiComparisonRow[];
};

// A DI previous version has another shape: diffing it would list every field.
const DIFFABLE_CHANGES = new Set<RcoChange>(["sessions_only", "content"]);

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

const PENDING_LOOKUP_CHUNK = 200;

// Actions never stored as RCO yet, in search order: each click loads the next ones.
export async function pickActionsNotYetLoaded(
  supabase: Supabase,
  numeroActions: string[],
  maxActions: number,
): Promise<string[]> {
  const picked: string[] = [];
  for (
    let start = 0;
    start < numeroActions.length && picked.length < maxActions;
    start += PENDING_LOOKUP_CHUNK
  ) {
    const chunk = numeroActions.slice(start, start + PENDING_LOOKUP_CHUNK);
    const latest = await fetchLatestServices(supabase, chunk.map(toOriginId));
    picked.push(
      ...chunk.filter(
        (numeroAction) =>
          latest.get(toOriginId(numeroAction))?.origin !== "RCO",
      ),
    );
  }
  return picked.slice(0, maxActions);
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

async function writeServiceVersion(
  supabase: Supabase,
  action: PlannedAction,
  structureUuidByOriginId: Map<string, string>,
  runId: string,
): Promise<void> {
  const { data: service, error } = await supabase
    .from("services")
    .insert(toVersionRow(action.document, action.hash, runId))
    .select("id")
    .single();
  if (error || !service)
    throw new Error(`services insert failed: ${error?.message}`);

  if (!createsIngestionRecord(action.change, action.document)) return;

  const { error: recordError } = await supabase
    .from("ingestion_records")
    .insert({
      service_id: service.id,
      structure_id: structureUuidByOriginId.get(action.structure.id) ?? null,
      markdown: actionToMarkdown(action.document, action.structure),
      metadata: {
        ...action.document,
        structure: action.structure,
      } as unknown as Json,
    });
  if (recordError) {
    // Otherwise the next run sees an unchanged hash and never creates the record.
    await supabase.from("services").delete().eq("id", service.id);
    throw new Error(`ingestion_records insert failed: ${recordError.message}`);
  }
}

async function fetchSessionsByAction(
  client: RcoClient,
  numeroActions: string[],
  result: RcoBatchResult,
): Promise<Array<{ numeroAction: string; sessions: SessionOffre[] }>> {
  const fetched: Array<{ numeroAction: string; sessions: SessionOffre[] }> = [];
  for (const numeroAction of numeroActions) {
    try {
      const sessions = await fetchActionSessions(client, numeroAction);
      if (sessions.length === 0) {
        result.missing++;
        result.outcomes.push({ numeroAction, change: "missing" });
      } else fetched.push({ numeroAction, sessions });
    } catch (error) {
      if (isRcoAuthError(error)) throw error;
      if (isRcoRateLimitError(error)) {
        // Stop here: the checkpoint resumes from this action.
        result.interrupted = true;
        break;
      }
      result.errors.push({ numeroAction, error: errorMessage(error) });
      result.outcomes.push({ numeroAction, change: "error" });
    }
    result.processed++;
  }
  return fetched;
}

export async function ingestRcoActions(
  supabase: Supabase,
  client: RcoClient,
  numeroActions: string[],
  { runId, dryRun }: { runId: string; dryRun: boolean },
): Promise<RcoBatchResult> {
  const result: RcoBatchResult = {
    requested: numeroActions.length,
    processed: 0,
    interrupted: false,
    missing: 0,
    changes: {
      new: 0,
      unchanged: 0,
      baseline: 0,
      sessions_only: 0,
      content: 0,
    },
    structuresWritten: 0,
    ingestionRecordsCreated: 0,
    errors: [],
    outcomes: [],
  };

  const fetched = await fetchSessionsByAction(client, numeroActions, result);
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

  if (dryRun) {
    logger.info(
      { runId, changes: result.changes },
      "RCO dry run: nothing written",
    );
    for (const action of planned) result.outcomes.push(toOutcome(action));
    return result;
  }

  const { uuidByOriginId, written } = await writeStructures(
    supabase,
    planned.map(({ structure }) => structure),
    runId,
  );
  result.structuresWritten = written;

  for (const action of planned) {
    const { numeroAction, change } = action;
    if (change === "unchanged") {
      result.outcomes.push(toOutcome(action));
      continue;
    }
    try {
      await writeServiceVersion(supabase, action, uuidByOriginId, runId);
      if (createsIngestionRecord(change, action.document))
        result.ingestionRecordsCreated++;
      result.outcomes.push(toOutcome(action));
    } catch (error) {
      result.errors.push({ numeroAction, error: errorMessage(error) });
      result.outcomes.push({ numeroAction, change: "error" });
    }
  }

  return result;
}
