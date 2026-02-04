/**
 * Test DI Ingestion Workflow
 *
 * This script tests the complete DI ingestion workflow including:
 * 1. Ingesting structures from Data Inclusion API
 * 2. Ingesting services from Data Inclusion API
 * 3. Creating ingestion_records from the ingested services
 *
 * Usage:
 *   pnpm tsx scripts/test-di-workflow.ts
 */

import { logger } from "@playground/shared-types";
import { diIngestionWorkflow } from "@playground/workflows";

async function main() {
  logger.info("=== Testing DI Ingestion Workflow ===");

  try {
    const result = await diIngestionWorkflow();

    logger.info(
      {
        structures: {
          runId: result.structures.runId,
          fetched: result.structures.totalFetched,
          inserted: result.structures.totalInserted,
          updated: result.structures.totalUpdated,
          unchanged: result.structures.totalUnchanged,
          errors: result.structures.errors.length,
        },
        services: {
          runId: result.services.runId,
          fetched: result.services.totalFetched,
          inserted: result.services.totalInserted,
          updated: result.services.totalUpdated,
          unchanged: result.services.totalUnchanged,
          errors: result.services.errors.length,
        },
      },
      "=== DI Workflow Completed ===",
    );

    logger.info("✅ Workflow executed successfully!");
    logger.info("Check Supabase Studio for ingestion_records with source='DI'");
  } catch (error) {
    logger.error(
      { error: error instanceof Error ? error.message : String(error) },
      "Workflow failed",
    );
    process.exit(1);
  }
}

main();
