/**
 * @file steps/ingestion/ingest-di.ts
 *
 * Steps for DI (Data Inclusion) ingestion:
 *   - ingestStructuresStep  → fetches/upserts di_structures
 *   - ingestServicesStep    → fetches/upserts di_services
 *   - processRecordsStep    → creates ingestion_records from new services
 *
 * These steps are orchestrated by pipelines/ingestion/di-ingestion.ts.
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
