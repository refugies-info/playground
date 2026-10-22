/**
 * @file ingest-rco.ts
 *
 * Steps of the RCO (API Offre Info) ingestion. No AI involved: search,
 * change detection and DI continuity are deterministic.
 */

import {
  emptyRcoBatchResult,
  getRcoClientFromEnv,
  ingestRcoActions,
  isRcoAuthError,
  type RcoActionSessions,
  type RcoBatchResult,
  searchActionSessions,
} from "@playground/offre-info";
import { logger } from "@playground/shared-types";
import {
  completeIngestionRun,
  createIngestionRun,
} from "@playground/supabase/ingestion-runs";
import { FatalError } from "@workflow/errors";
import { getSupabaseClient } from "./utils";

// Keeps the services_latest `.in()` lookups under the URL length limit.
const INGEST_CHUNK_SIZE = 200;

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

export async function createRcoRunStep(): Promise<string> {
  "use step";
  return createIngestionRun(getSupabaseClient(), {
    source: "rco",
    type: "services",
    options: {},
  });
}

export async function ingestRcoStep(runId: string): Promise<RcoBatchResult> {
  "use step";
  const supabase = getSupabaseClient();
  let actions: RcoActionSessions[];
  try {
    actions = await searchActionSessions(getRcoClientFromEnv());
  } catch (error) {
    if (isRcoAuthError(error)) throw new FatalError((error as Error).message);
    throw error;
  }
  logger.info({ runId, count: actions.length }, "✔ RCO actions found");

  let totals = emptyRcoBatchResult();
  for (let start = 0; start < actions.length; start += INGEST_CHUNK_SIZE) {
    const batch = await ingestRcoActions(
      supabase,
      actions.slice(start, start + INGEST_CHUNK_SIZE),
      runId,
    );
    totals = addBatchResult(totals, batch);
    logger.info({ runId, ...batch }, "✔ RCO batch ingested");
  }
  return totals;
}

export async function completeRcoRunStep(
  runId: string,
  status: "completed" | "failed",
  totals: RcoBatchResult = emptyRcoBatchResult(),
  failure?: string,
): Promise<void> {
  "use step";
  const errorDetails = failure
    ? { failure, errors: totals.errors }
    : totals.errors;
  await completeIngestionRun(
    getSupabaseClient(),
    runId,
    toRunStats(totals),
    status,
    failure || totals.errors.length > 0 ? errorDetails : undefined,
  );
}
