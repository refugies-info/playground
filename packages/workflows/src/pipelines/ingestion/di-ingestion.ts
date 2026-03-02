/**
 * @file pipelines/ingestion/di-ingestion.ts
 *
 * Orchestrates the full DI ingestion pipeline.
 *
 * Flow:
 *   [1] ingestStructuresStep   → di_structures
 *   [2] ingestServicesStep     → di_services
 *   [3] processRecordsStep     → ingestion_records (only if new data)
 *   [4] fanOutDiRecordsStep    → N × diSingleRecordWorkflow (fan-out)
 */

import { fanOutDiRecordsStep } from "../../steps/ingestion/di-single-record-steps";
import {
  ingestServicesStep,
  ingestStructuresStep,
  processRecordsStep,
} from "../../steps/ingestion/ingest-di";

export async function diIngestionWorkflow() {
  "use workflow";

  const startedAt = Date.now();
  // biome-ignore lint/suspicious/noConsole: pino cannot be used in "use workflow" scope
  console.log("🚀 DI Ingestion Workflow started");

  // 1. Ingest Structures
  const structuresResult = await ingestStructuresStep();

  // 2. Ingest Services
  const servicesResult = await ingestServicesStep();

  // 3. Process records (only if new data)
  if (servicesResult.runId) {
    // biome-ignore lint/suspicious/noConsole: pino cannot be used in "use workflow" scope
    console.log(
      `▶ [3/4] New data detected (runId: ${servicesResult.runId}) — processing records`,
    );
    await processRecordsStep(servicesResult.runId);
  } else {
    // biome-ignore lint/suspicious/noConsole: pino cannot be used in "use workflow" scope
    console.log(
      "⏭ [3/4] No new data — skipping record processing, fan-out will still run for pending records",
    );
  }

  // 4. Fan-out — always run to process pending records
  // biome-ignore lint/suspicious/noConsole: pino cannot be used in "use workflow" scope
  console.log(
    "▶ [4/4] Fan-out: claiming records and spawning child workflows...",
  );
  const fanOutResult = await fanOutDiRecordsStep(
    servicesResult.runId ?? "no-new-data",
  );
  // biome-ignore lint/suspicious/noConsole: pino cannot be used in "use workflow" scope
  console.log(
    `✔ [4/4] Fan-out complete — ${fanOutResult.spawned} child workflow(s) spawned`,
  );

  const durationMs = Date.now() - startedAt;
  // biome-ignore lint/suspicious/noConsole: pino cannot be used in "use workflow" scope
  console.log(
    JSON.stringify({
      msg: `🏁 DI Ingestion Workflow completed in ${Math.round(durationMs / 1000)}s`,
      durationMs,
      structures: {
        inserted: structuresResult.totalInserted,
        updated: structuresResult.totalUpdated,
        errors: structuresResult.errors.length,
      },
      services: {
        inserted: servicesResult.totalInserted,
        updated: servicesResult.totalUpdated,
        hasNewData: !!servicesResult.runId,
        errors: servicesResult.errors.length,
      },
      fanOut: {
        spawned: fanOutResult.spawned,
        totalCandidates: fanOutResult.totalCandidates,
        skipped: fanOutResult.skipped ?? 0,
      },
    }),
  );

  return {
    structures: structuresResult,
    services: servicesResult,
    fanOut: {
      spawned: fanOutResult.spawned,
      totalCandidates: fanOutResult.totalCandidates,
    },
  };
}
