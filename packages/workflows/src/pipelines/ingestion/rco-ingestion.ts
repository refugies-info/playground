/**
 * @file pipelines/ingestion/rco-ingestion.ts
 *
 * RCO ingestion, kept separate from diIngestionWorkflow so the source can be
 * switched back to DI. Progress is checkpointed after each batch: a rate
 * limit stops the run as "interrupted" and the next trigger resumes it.
 *
 * Flow:
 *   [1] prepareRcoRunStep       → new run + /recherche, or resume a checkpoint
 *   [2] ingestRcoBatchStep      → per batch of 25: /offre + structures/services/records
 *   [3] saveRcoCheckpointStep   → nextIndex + running totals
 *   [4] completeRcoRunStep      → completed | interrupted
 */

import type { RcoBatchResult, RcoRunOptions } from "@playground/offre-info";
import {
  completeRcoRunStep,
  ingestRcoBatchStep,
  prepareRcoRunStep,
  saveRcoCheckpointStep,
} from "../../steps/ingestion/ingest-rco";

const BATCH_SIZE = 25;

const addBatchResult = (
  total: RcoBatchResult,
  batch: RcoBatchResult,
): RcoBatchResult => ({
  requested: total.requested + batch.requested,
  processed: total.processed + batch.processed,
  interrupted: batch.interrupted,
  missing: total.missing + batch.missing,
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
  outcomes: [...total.outcomes, ...batch.outcomes],
});

export async function rcoIngestionWorkflow(options: RcoRunOptions) {
  "use workflow";

  // biome-ignore lint/suspicious/noConsole: pino cannot be used in "use workflow" scope
  console.log(`🚀 RCO ingestion started ${JSON.stringify(options)}`);

  const {
    runId,
    numeroActions,
    nextIndex,
    totals: previousTotals,
  } = await prepareRcoRunStep(options);

  let totals = previousTotals;
  let index = nextIndex;
  try {
    while (index < numeroActions.length) {
      const batch = numeroActions.slice(index, index + BATCH_SIZE);
      const batchResult = await ingestRcoBatchStep(
        runId,
        batch,
        options.dryRun,
      );
      totals = addBatchResult(totals, batchResult);
      index += batchResult.processed;
      await saveRcoCheckpointStep(runId, {
        numeroActions,
        nextIndex: index,
        totals,
      });

      if (batchResult.interrupted) {
        await completeRcoRunStep(runId, totals, "interrupted");
        // biome-ignore lint/suspicious/noConsole: pino cannot be used in "use workflow" scope
        console.log(
          `⏸ RCO ingestion interrupted by rate limit at ${index}/${numeroActions.length}`,
        );
        return {
          runId,
          status: "interrupted" as const,
          nextIndex: index,
          ...totals,
        };
      }
    }
  } catch (error) {
    // Frees the "running" lock; the checkpoint still points at the failed batch.
    await completeRcoRunStep(runId, totals, "failed", String(error));
    throw error;
  }

  await completeRcoRunStep(runId, totals, "completed");
  // biome-ignore lint/suspicious/noConsole: pino cannot be used in "use workflow" scope
  console.log(
    JSON.stringify({ msg: "🏁 RCO ingestion completed", runId, ...totals }),
  );
  return { runId, status: "completed" as const, nextIndex: index, ...totals };
}
