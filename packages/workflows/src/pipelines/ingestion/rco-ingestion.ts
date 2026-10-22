/**
 * @file pipelines/ingestion/rco-ingestion.ts
 *
 * RCO ingestion, kept separate from diIngestionWorkflow so the source can be
 * switched back to DI. Imports every action matching the catalogue criteria
 * from /recherche only: the detail (/offre) is read when a fiche is arbitrated.
 *
 * Flow:
 *   [1] createRcoRunStep    → ingestion_runs row ("running" lock)
 *   [2] ingestRcoStep       → /recherche (all pages) + structures/services/records
 *   [3] completeRcoRunStep  → completed | failed
 */

import {
  completeRcoRunStep,
  createRcoRunStep,
  ingestRcoStep,
} from "../../steps/ingestion/ingest-rco";

export async function rcoIngestionWorkflow() {
  "use workflow";

  // biome-ignore lint/suspicious/noConsole: pino cannot be used in "use workflow" scope
  console.log("🚀 RCO ingestion started");

  const runId = await createRcoRunStep();
  try {
    const totals = await ingestRcoStep(runId);
    await completeRcoRunStep(runId, "completed", totals);
    // biome-ignore lint/suspicious/noConsole: pino cannot be used in "use workflow" scope
    console.log(
      JSON.stringify({ msg: "🏁 RCO ingestion completed", runId, ...totals }),
    );
    return { runId, status: "completed" as const, ...totals };
  } catch (error) {
    // Frees the "running" lock.
    await completeRcoRunStep(runId, "failed", undefined, String(error));
    throw error;
  }
}
