import {
  type RcoActionSessions,
  type RcoBatchResult,
  rcoProvider,
} from "@playground/rco-offre-info";
import { logger } from "@playground/shared-types";
import {
  completeIngestionRun,
  createIngestionRun,
  saveIngestionCheckpoint,
} from "@playground/supabase/ingestion-runs";
import { FatalError } from "@workflow/errors";
import { getSupabaseClient } from "./utils";

// Keeps the services_latest `.in()` lookups under the URL length limit.
const INGEST_CHUNK_SIZE = 200;

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
    actions = await rcoProvider.fetchAll();
  } catch (error) {
    if (rcoProvider.isFatalError(error))
      throw new FatalError((error as Error).message);
    throw error;
  }
  logger.info({ runId, count: actions.length }, "✔ RCO actions found");

  let totals = rcoProvider.emptyResult();
  for (let start = 0; start < actions.length; start += INGEST_CHUNK_SIZE) {
    const batch = await rcoProvider.ingestBatch(
      supabase,
      actions.slice(start, start + INGEST_CHUNK_SIZE),
      runId,
    );
    totals = rcoProvider.addResult(totals, batch);
    logger.info(
      { runId, processed: batch.processed, changes: batch.changes },
      "✔ RCO batch ingested",
    );
  }
  // Read by the latest run card.
  await saveIngestionCheckpoint(supabase, runId, { totals });
  return totals;
}

export async function completeRcoRunStep(
  runId: string,
  status: "completed" | "failed",
  totals: RcoBatchResult = rcoProvider.emptyResult(),
  failure?: string,
): Promise<void> {
  "use step";
  const errorDetails = failure
    ? { failure, errors: rcoProvider.errorsOf(totals) }
    : rcoProvider.errorsOf(totals);
  await completeIngestionRun(
    getSupabaseClient(),
    runId,
    rcoProvider.toRunStats(totals),
    status,
    failure || rcoProvider.errorsOf(totals).length > 0
      ? errorDetails
      : undefined,
  );
}
