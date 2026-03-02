/**
 * @file ingest-di.ts
 *
 * Workflow: DI (Data Inclusion) Ingestion Pipeline
 *
 * Orchestrates the full ingestion of Data Inclusion records from the
 * CARIF-OREF API, followed by parallel audit and metadata generation.
 *
 * Flow:
 *
 *   diIngestionWorkflow
 *         │
 *         ├── [1] ingestStructuresStep
 *         │         └── Fetches structures from CARIF-OREF → di_structures
 *         │
 *         ├── [2] ingestServicesStep
 *         │         └── Fetches services from CARIF-OREF → di_services
 *         │             Returns a runId for downstream steps
 *         │
 *         ├── [3] processRecordsStep  (only if runId exists)
 *         │         └── Creates/updates ingestion_records + workflows
 *         │             from new/changed di_services
 *         │
 *         ├── [4] fanOutDiRecordsStep (fan-out)
 *         │         └── Spawns diSingleRecordWorkflow for each record
 *         │
 *         └── [5] generateDiMetadataReportsStep → metadata-di-step.ts
 *                   └── Letta agent metadata → letta_reports (type: 'metadata')
 *                       Only processes records with ingestion_report_id (audited)
 *
 * Key decisions:
 * - Steps 1 & 2 always run (they are idempotent, content_hash dedup)
 * - Step 3 only runs if step 2 produced a runId (new data ingested)
 * - Step 4 spawns parallel workflows for audit/metadata generation (fan-out)
 */

import { logger } from "@playground/shared-types";
import {
  ingestCarifOrefServices,
  ingestCarifOrefStructures,
  processIngestionRecords,
} from "@refugies-info/di";
import { getSupabaseClient } from "./utils";

/**
 * Step 1: Ingest structures from the CARIF-OREF API.
 *
 * Fetches all structures and upserts them into `di_structures`.
 * Idempotent via content_hash deduplication.
 *
 * @returns Ingestion result with counts (fetched, inserted, updated, unchanged).
 */
export async function ingestStructuresStep() {
  "use step";
  const supabase = getSupabaseClient();
  logger.info("▶ [1/4] Ingesting DI structures from CARIF-OREF...");
  const result = await ingestCarifOrefStructures(supabase);
  logger.info(
    {
      runId: result.runId,
      fetched: result.totalFetched,
      inserted: result.totalInserted,
      updated: result.totalUpdated,
      unchanged: result.totalUnchanged,
      errors: result.errors.length,
    },
    `✔ [1/4] Structures ingested — ${result.totalInserted} new, ${result.totalUpdated} updated, ${result.totalUnchanged} unchanged`,
  );
  return result;
}

/**
 * Step 2: Ingest services from the CARIF-OREF API.
 *
 * Fetches all services and upserts them into `di_services`.
 * Returns a `runId` that downstream steps use to scope their processing.
 * Idempotent via content_hash deduplication.
 *
 * @returns Ingestion result with counts and a `runId` for downstream steps.
 */
export async function ingestServicesStep() {
  "use step";
  const supabase = getSupabaseClient();
  logger.info("▶ [2/4] Ingesting DI services from CARIF-OREF...");
  const result = await ingestCarifOrefServices(supabase);
  logger.info(
    {
      runId: result.runId,
      fetched: result.totalFetched,
      inserted: result.totalInserted,
      updated: result.totalUpdated,
      unchanged: result.totalUnchanged,
      errors: result.errors.length,
    },
    `✔ [2/4] Services ingested — ${result.totalInserted} new, ${result.totalUpdated} updated, ${result.totalUnchanged} unchanged${result.runId ? ` (runId: ${result.runId})` : " — no new data"}`,
  );
  return result;
}

/**
 * Step 3: Process ingested services into ingestion records.
 *
 * Creates or updates `ingestion_records` and their associated `workflows`
 * entries from the services ingested during the given run.
 *
 * @param runId - The ingestion run ID from {@link ingestServicesStep}.
 */
export async function processRecordsStep(runId: string) {
  "use step";
  if (!runId) {
    logger.warn("No runId provided to processRecordsStep, skipping.");
    return;
  }
  const supabase = getSupabaseClient();
  logger.info({ runId }, "▶ [3/4] Processing ingestion records...");
  await processIngestionRecords(supabase, runId);
  logger.info({ runId }, "✔ [3/4] Ingestion records processed");
}
