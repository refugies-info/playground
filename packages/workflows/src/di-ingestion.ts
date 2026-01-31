import { logger } from "@playground/shared-types";
import { getSupabaseAdmin } from "@playground/supabase";
import {
  ingestCarifOrefItems,
  listServicesEndpointApiV1ServicesGet,
  listStructuresEndpointApiV1StructuresGet,
  processIngestionRecords,
} from "@refugies-info/di";

function getSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "http://127.0.0.1:54321";
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!key) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY is not defined");
  }

  return getSupabaseAdmin(url, key);
}

export async function ingestStructuresStep() {
  "use step";
  const supabase = getSupabaseClient();
  logger.info("Starting DI Structures Ingestion Step...");
  const result = await ingestCarifOrefItems(
    supabase,
    listStructuresEndpointApiV1StructuresGet,
    "di_structures",
    "structures",
  );
  logger.info({ result }, "DI Structures Ingestion Step Completed");
  return result;
}

export async function ingestServicesStep() {
  "use step";
  const supabase = getSupabaseClient();
  logger.info("Starting DI Services Ingestion Step...");
  const result = await ingestCarifOrefItems(
    supabase,
    listServicesEndpointApiV1ServicesGet,
    "di_services",
    "services",
  );
  logger.info({ result }, "DI Services Ingestion Step Completed");
  return result;
}

export async function processRecordsStep(runId: string) {
  "use step";
  if (!runId) {
    logger.warn("No runId provided to processRecordsStep, skipping.");
    return;
  }
  const supabase = getSupabaseClient();
  logger.info({ runId }, "Starting Ingestion Records Processing Step...");
  await processIngestionRecords(supabase, runId);
  logger.info("Ingestion Records Processing Step Completed");
}

export async function diIngestionWorkflow() {
  "use workflow";

  // 1. Ingest Structures
  const structuresResult = await ingestStructuresStep();

  // 2. Ingest Services
  const servicesResult = await ingestServicesStep();

  // 3. Process new/updated services to create ingestion records
  if (servicesResult.runId) {
    await processRecordsStep(servicesResult.runId);
  }

  return {
    structures: structuresResult,
    services: servicesResult,
  };
}
