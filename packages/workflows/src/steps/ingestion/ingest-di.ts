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
 *         ├── [4] generateDiAuditReportsStep    → audit-di-step.ts
 *         │         └── Letta agent audit → letta_reports (type: 'ingestion')
 *         │             Sets ingestion_report_id on processed records
 *         │
 *         └── [5] generateDiMetadataReportsStep → metadata-di-step.ts
 *                   └── Letta agent metadata → letta_reports (type: 'metadata')
 *                       Only processes records with ingestion_report_id (audited)
 *
 * Key decisions:
 * - Steps 1 & 2 always run (they are idempotent, content_hash dedup)
 * - Steps 3 & 4 only run if step 2 produced a runId (new data ingested)
 * - Audit and metadata generation run in parallel (independent Letta agents)
 */

import { logger } from "@playground/shared-types";
import {
  ingestCarifOrefServices,
  ingestCarifOrefStructures,
  processIngestionRecords,
} from "@refugies-info/di";
import { generateDiAuditReportsStep } from "./audit-di-step";
import { generateDiMetadataReportsStep } from "./metadata-di-step";
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
  logger.info("Starting DI Structures Ingestion Step...");
  const result = await ingestCarifOrefStructures(supabase);
  logger.info({ result }, "DI Structures Ingestion Step Completed");
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
  logger.info("Starting DI Services Ingestion Step...");
  const result = await ingestCarifOrefServices(supabase);
  logger.info({ result }, "DI Services Ingestion Step Completed");
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
  logger.info({ runId }, "Starting Ingestion Records Processing Step...");
  await processIngestionRecords(supabase, runId);
  logger.info("Ingestion Records Processing Step Completed");
}

/**
 * Main DI ingestion workflow.
 *
 * Orchestrates the full pipeline: structure ingestion → service ingestion →
 * record processing → audit → metadata report generation (sequential).
 *
 * Audit runs before metadata to ensure metadata only processes records
 * that have already been audited (both reports target the same workflows).
 *
 * @returns Summary of all step results.
 */
export async function diIngestionWorkflow() {
  "use workflow";

  // 1. Ingest Structures
  const structuresResult = await ingestStructuresStep();

  // 2. Ingest Services
  const servicesResult = await ingestServicesStep();

  // 3. Process new/updated services to create ingestion records
  let auditResult:
    | Awaited<ReturnType<typeof generateDiAuditReportsStep>>
    | undefined;
  let metadataResult:
    | Awaited<ReturnType<typeof generateDiMetadataReportsStep>>
    | undefined;

  if (servicesResult.runId) {
    await processRecordsStep(servicesResult.runId);

    // 4. Audit first — sets ingestion_report_id on processed records
    auditResult = await generateDiAuditReportsStep(servicesResult.runId);

    // 5. Metadata — only targets records that have been audited (ingestion_report_id IS NOT NULL)
    metadataResult = await generateDiMetadataReportsStep(servicesResult.runId);
  }

  return {
    structures: structuresResult,
    services: servicesResult,
    audit: auditResult,
    metadata: metadataResult,
  };
}
