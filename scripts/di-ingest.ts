/**
 * DI Ingestion CLI
 *
 * Official command for ingesting data from the Data Inclusion API into Supabase.
 * Supports incremental updates with version tracking.
 *
 * Usage:
 *   pnpm di:ingest [--type TYPE] [--limit N] [--all]
 *
 * Options:
 *   --type TYPE  Type to ingest: structures|services (default: structures)
 *   --limit N    Fetch only N items (default: 5)
 *   --all        Fetch all items (no limit)
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
import dotenv from "dotenv";

// Load env vars from root .env (includes DI_BASE_URL and DI_API_KEY)
dotenv.config({ path: path.resolve(__dirname, "../.env") });

// Parse CLI args
const args = process.argv.slice(2);
const typeIndex = args.indexOf("--type");
const type = typeIndex !== -1 ? args[typeIndex + 1] : "structures";
const limitIndex = args.indexOf("--limit");
const fetchAll = args.includes("--all");
const limit = fetchAll
  ? undefined
  : limitIndex !== -1
    ? parseInt(args[limitIndex + 1], 10)
    : 5;

// Validate type
if (type !== "structures" && type !== "services") {
  logger.error(`Invalid type: ${type}. Must be 'structures' or 'services'`);
  process.exit(1);
}

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
  const isStructures = type === "structures";
  const ingestFn = isStructures
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
