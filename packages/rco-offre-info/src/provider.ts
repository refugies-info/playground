import { logger } from "@playground/shared-types";
import type { Database, Json } from "@playground/supabase";
import { computeContentHash } from "@playground/supabase/ingestion-runs";
import {
  fetchLatestServices,
  fetchStructureIdsBySiret,
  type IngestionProvider,
  type ServiceVersion,
  writeServiceVersions,
  writeStructures,
} from "@playground/supabase/source-ingestion";
import type { SupabaseClient } from "@supabase/supabase-js";
import { getRcoClientFromEnv, isRcoAuthError } from "./api/client";
import { type RcoActionSessions, searchActionSessions } from "./api/search";
import { toOriginId } from "./config";
import {
  changedFieldPaths,
  classifyChange,
  createsIngestionRecord,
  type RcoChange,
} from "./lheo/change";
import {
  buildActionDocument,
  pickReferenceSession,
  type RcoActionDocument,
} from "./lheo/document";
import { actionToMarkdown } from "./lheo/markdown";
import {
  buildStructureDocument,
  type RcoStructureDocument,
  resolveStructureId,
} from "./lheo/structure";

type Supabase = SupabaseClient<Database>;

type PlannedAction = {
  numeroAction: string;
  document: RcoActionDocument;
  hash: string;
  structure: RcoStructureDocument;
  change: RcoChange;
};

export type RcoBatchResult = {
  processed: number;
  changes: Record<RcoChange, number>;
  structuresWritten: number;
  ingestionRecordsCreated: number;
  errors: Array<{ numeroAction: string; error: string }>;
};

const emptyRcoBatchResult = (): RcoBatchResult => ({
  processed: 0,
  changes: { new: 0, unchanged: 0, baseline: 0, sessions_only: 0, content: 0 },
  structuresWritten: 0,
  ingestionRecordsCreated: 0,
  errors: [],
});

// A DI previous version has another shape: diffing it would list every field.
const DIFFABLE_CHANGES = new Set<RcoChange>(["sessions_only", "content"]);

const errorMessage = (error: unknown) =>
  error instanceof Error ? error.message : String(error);

const toServiceVersion = ({
  document,
  hash,
  structure,
  change,
}: PlannedAction): ServiceVersion => ({
  document,
  hash,
  structure,
  toIngestionRecord: createsIngestionRecord(change, document)
    ? () => ({
        markdown: actionToMarkdown(document, structure),
        metadata: { ...document, structure } as unknown as Json,
      })
    : null,
});

const addBatchResult = (
  total: RcoBatchResult,
  batch: RcoBatchResult,
): RcoBatchResult => ({
  processed: total.processed + batch.processed,
  changes: {
    new: total.changes.new + batch.changes.new,
    unchanged: total.changes.unchanged + batch.changes.unchanged,
    baseline: total.changes.baseline + batch.changes.baseline,
    sessions_only: total.changes.sessions_only + batch.changes.sessions_only,
    content: total.changes.content + batch.changes.content,
  },
  structuresWritten: total.structuresWritten + batch.structuresWritten,
  ingestionRecordsCreated:
    total.ingestionRecordsCreated + batch.ingestionRecordsCreated,
  errors: [...total.errors, ...batch.errors],
});

const toRunStats = (totals: RcoBatchResult) => ({
  totalFetched: totals.processed,
  totalInserted: totals.changes.new,
  totalUpdated:
    totals.changes.baseline +
    totals.changes.sessions_only +
    totals.changes.content,
  totalUnchanged: totals.changes.unchanged,
  totalErrors: totals.errors.length,
});

async function ingestRcoActions(
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
    });
  }

  if (planned.length === 0) return result;

  const { uuidByOriginId, written } = await writeStructures(
    supabase,
    planned.map(({ structure }) => structure),
    runId,
    "RCO",
  );
  result.structuresWritten = written;

  const changed = planned.filter(({ change }) => change !== "unchanged");
  if (changed.length === 0) return result;
  try {
    result.ingestionRecordsCreated = await writeServiceVersions(
      supabase,
      changed.map(toServiceVersion),
      uuidByOriginId,
      runId,
      "RCO",
    );
  } catch (error) {
    result.errors.push(
      ...changed.map(({ numeroAction }) => ({
        numeroAction,
        error: errorMessage(error),
      })),
    );
  }
  return result;
}

export const rcoProvider: IngestionProvider<RcoActionSessions, RcoBatchResult> =
  {
    runSource: "rco",
    fetchAll: () => searchActionSessions(getRcoClientFromEnv()),
    isFatalError: isRcoAuthError,
    ingestBatch: ingestRcoActions,
    emptyResult: emptyRcoBatchResult,
    addResult: addBatchResult,
    toRunStats,
    errorsOf: (result) => result.errors,
  };
