/**
 * DI Ingestion CLI
 *
 * Official command for ingesting data from the Data Inclusion API into Supabase.
 * Supports incremental updates with version tracking.
 *
 * Usage:
 *   pnpm di:ingest [options]
 *
 * Examples:
 *   pnpm di:ingest                          # Ingest 5 structures (for testing)
 *   pnpm di:ingest --type services          # Ingest 5 services
 *   pnpm di:ingest --limit 100              # Ingest 100 structures
 *   pnpm di:ingest --all                    # Ingest ALL structures
 *   pnpm di:ingest --type services --all    # Ingest ALL services
 */

import path from "node:path";
import { logger } from "@playground/shared-types";
import { getSupabaseAdmin } from "@playground/supabase";
import { program } from "commander";
import dotenv from "dotenv";

// Load env vars from root .env (includes DI_BASE_URL and DI_API_KEY)
dotenv.config({ path: path.resolve(__dirname, "../.env") });

// Configure CLI with commander
program
  .name("di:ingest")
  .description("Ingest data from Data Inclusion API into Supabase")
  .option(
    "-t, --type <type>",
    "Type to ingest: structures or services",
    "structures",
  )
  .option("-l, --limit <number>", "Fetch only N items (default: 5)", "5")
  .option("-a, --all", "Fetch all items (no limit)")
  .parse(process.argv);

const opts = program.opts<{
  type: string;
  limit: string;
  all?: boolean;
}>();

// Validate type
const validTypes = ["structures", "services"] as const;
type IngestType = (typeof validTypes)[number];

if (!validTypes.includes(opts.type as IngestType)) {
  logger.error(
    `Invalid type: "${opts.type}". Must be one of: ${validTypes.join(", ")}`,
  );
  process.exit(1);
}

const type = opts.type as IngestType;

// Parse and validate limit
const limit = (() => {
  if (opts.all) {
    return undefined;
  }
  const parsed = Number.parseInt(opts.limit, 10);
  if (Number.isNaN(parsed) || parsed <= 0) {
    logger.error(
      `Invalid --limit value: "${opts.limit}". Must be a positive number.`,
    );
    process.exit(1);
  }
  return parsed;
})();

async function main() {
  logger.info({ type, limit: limit ?? "all" }, "=== DI Ingestion ===");

  // 1. Check environment
  const diApiKey = process.env.DI_API_KEY;
  const diBaseUrl = process.env.DI_BASE_URL;
  const supabaseUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!diApiKey) {
    logger.error("DI_API_KEY not set in root .env");
    process.exit(1);
  }

  if (!supabaseUrl) {
    logger.error(
      "SUPABASE_URL or NEXT_PUBLIC_SUPABASE_URL not set in root .env. For local dev, use: SUPABASE_URL=http://127.0.0.1:54321",
    );
    process.exit(1);
  }

  if (!supabaseKey) {
    logger.error("SUPABASE_SERVICE_ROLE_KEY not set in root .env");
    process.exit(1);
  }

  logger.info(
    {
      diBaseUrl: diBaseUrl || "(default staging)",
      supabaseUrl,
    },
    "Environment loaded",
  );

  // 2. Initialize clients
  const diModule = await import("@refugies-info/di");
  const supabase = getSupabaseAdmin();

  // 3. Run ingestion
  const ingestFn =
    type === "structures"
      ? diModule.ingestCarifOrefStructures
      : diModule.ingestCarifOrefServices;

  logger.info(`Starting ${type} ingestion...`);
  const result = await ingestFn(supabase, { limit });

  // 4. Log results
  logger.info(
    {
      runId: result.runId,
      totalFetched: result.totalFetched,
      totalInserted: result.totalInserted,
      totalUpdated: result.totalUpdated,
      totalUnchanged: result.totalUnchanged,
      errorCount: result.errors.length,
    },
    "=== Ingestion Complete ===",
  );

  if (result.errors.length > 0) {
    logger.warn(
      { errors: result.errors.slice(0, 5) },
      `${result.errors.length} records failed to insert`,
    );
  }

  // Summary for quick glance
  logger.info(
    {
      runId: result.runId,
      fetched: result.totalFetched,
      inserted: result.totalInserted,
      updated: result.totalUpdated,
      unchanged: result.totalUnchanged,
      errors: result.errors.length,
    },
    "📊 Summary",
  );
}

main().catch((err) => {
  logger.error({ error: err.message, stack: err.stack }, "Ingestion failed");
  process.exit(1);
});
