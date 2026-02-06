/**
 * Test DI Ingestion Records Creation
 *
 * This script tests the creation of ingestion_records from di_services data.
 * It processes services from a specific ingestion run and creates markdown records.
 *
 * Usage:
 *   pnpm tsx scripts/test-di-ingestion-records.ts [runId]
 *
 * Examples:
 *   pnpm tsx scripts/test-di-ingestion-records.ts                    # Use latest run
 *   pnpm tsx scripts/test-di-ingestion-records.ts <specific-run-id>  # Use specific run
 */

import path from "node:path";
import { logger } from "@playground/shared-types";
import { getSupabaseAdmin } from "@playground/supabase";
import { processIngestionRecords } from "@refugies-info/di";
import dotenv from "dotenv";

// Load env vars from root .env
dotenv.config({ path: path.resolve(__dirname, "../.env") });

async function main() {
  logger.info("=== DI Ingestion Records Test ===");

  const supabase = getSupabaseAdmin();

  // Get run ID from args or use latest
  let runId = process.argv[2];

  if (!runId) {
    logger.info("No runId provided, fetching latest ingestion run...");

    const { data: latestRun, error: runError } = await supabase
      .from("ingestion_runs")
      .select("id, type, status, created_at, total_fetched, total_inserted")
      .eq("source", "di")
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (runError || !latestRun) {
      logger.error("Failed to fetch latest ingestion run");
      process.exit(1);
    }

    runId = latestRun.id;
    logger.info(
      {
        runId,
        type: latestRun.type,
        status: latestRun.status,
        totalFetched: latestRun.total_fetched,
        totalInserted: latestRun.total_inserted,
        createdAt: latestRun.created_at,
      },
      "Using latest ingestion run",
    );
  } else {
    logger.info({ runId }, "Using provided runId");
  }

  // Count services in this run
  const { count: serviceCount, error: countError } = await supabase
    .from("di_services")
    .select("*", { count: "exact", head: true })
    .eq("ingestion_run_id", runId);

  if (countError) {
    logger.error({ error: countError.message }, "Failed to count services");
    process.exit(1);
  }

  logger.info({ serviceCount }, "Services in this run");

  if (!serviceCount || serviceCount === 0) {
    logger.warn("No services found in this run. Nothing to process.");
    process.exit(0);
  }

  // Process ingestion records
  logger.info("Processing ingestion records...");

  try {
    await processIngestionRecords(supabase, runId);
    logger.info("✅ Successfully processed ingestion records");
  } catch (error) {
    logger.error(
      { error: error instanceof Error ? error.message : String(error) },
      "Failed to process ingestion records",
    );
    process.exit(1);
  }

  // Verify results
  const { count: recordCount, error: recordCountError } = await supabase
    .from("ingestion_records")
    .select("*", { count: "exact", head: true })
    .eq("di_service_id", runId);

  if (recordCountError) {
    logger.warn(
      { error: recordCountError.message },
      "Could not verify record count",
    );
  } else {
    logger.info({ recordCount }, "Ingestion records created");
  }

  // Fetch a sample record
  const { data: sampleRecords, error: sampleError } = await supabase
    .from("ingestion_records")
    .select("id, markdown, metadata, di_service_id, di_structure_id, version")
    .not("di_service_id", "is", null)
    .limit(1);

  if (!sampleError && sampleRecords && sampleRecords.length > 0) {
    const sample = sampleRecords[0];
    logger.info(
      {
        id: sample.id,
        version: sample.version,
        di_service_id: sample.di_service_id,
        di_structure_id: sample.di_structure_id,
        markdownPreview: `${sample.markdown?.substring(0, 200)}...`,
      },
      "Sample ingestion record",
    );
  }

  logger.info("=== Test completed ===");
}

main().catch((err) => {
  logger.error({ error: err.message, stack: err.stack }, "Test failed");
  process.exit(1);
});
