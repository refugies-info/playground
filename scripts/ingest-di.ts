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
 *   pnpm di:ingest                          # Ingest ALL structures and services
 *   pnpm di:ingest --type services          # Ingest ALL services only
 *   pnpm di:ingest --type structures        # Ingest ALL structures only
 *   pnpm di:ingest --limit 20               # Ingest 20 structures and 20 services (for testing)
 *   pnpm di:ingest --type services --limit 10  # Ingest 10 services only (for testing)
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
    "Type to ingest: structures, services, or both (default: both)",
    "both",
  )
  .option(
    "-l, --limit <number>",
    "Fetch only N items per type (for testing, default: fetch all)",
  )
  .parse(process.argv);

const opts = program.opts<{
  type: string;
  limit?: string;
}>();

// Validate type
const validTypes = ["structures", "services", "both"] as const;
type IngestType = (typeof validTypes)[number];

if (!validTypes.includes(opts.type as IngestType)) {
  logger.error(
    `Invalid type: "${opts.type}". Must be one of: ${validTypes.join(", ")}`,
  );
  process.exit(1);
}

const type = opts.type as IngestType;

// Parse and validate limit (undefined = fetch all)
const limit = (() => {
  if (!opts.limit) {
    return undefined; // Default: fetch all
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

async function ingestType(
  diModule: typeof import("@refugies-info/di"),
  supabase: ReturnType<typeof getSupabaseAdmin>,
  ingestType: "structures" | "services",
  limit: number | undefined,
) {
  const ingestFn =
    ingestType === "structures"
      ? diModule.ingestCarifOrefStructures
      : diModule.ingestCarifOrefServices;

  logger.info(`Starting ${ingestType} ingestion...`);
  const result = await ingestFn(supabase, { limit });

  // Log results
  logger.info(
    {
      type: ingestType,
      runId: result.runId,
      totalFetched: result.totalFetched,
      totalInserted: result.totalInserted,
      totalUpdated: result.totalUpdated,
      totalUnchanged: result.totalUnchanged,
      errorCount: result.errors.length,
    },
    `=== ${ingestType.charAt(0).toUpperCase() + ingestType.slice(1)} Ingestion Complete ===`,
  );

  if (result.errors.length > 0) {
    logger.warn(
      { errors: result.errors.slice(0, 5) },
      `${result.errors.length} ${ingestType} failed to insert`,
    );
  }

  return result;
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

  // 3. Run ingestion(s)
  const results: {
    type: string;
    result: Awaited<ReturnType<typeof ingestType>>;
  }[] = [];

  if (type === "both") {
    // Ingest structures first (services have FK to structures)
    const structuresResult = await ingestType(
      diModule,
      supabase,
      "structures",
      limit,
    );
    results.push({ type: "structures", result: structuresResult });

    // Then ingest services
    const servicesResult = await ingestType(
      diModule,
      supabase,
      "services",
      limit,
    );
    results.push({ type: "services", result: servicesResult });
  } else {
    // Ingest single type
    const result = await ingestType(
      diModule,
      supabase,
      type as "structures" | "services",
      limit,
    );
    results.push({ type, result });
  }

  // 4. Overall summary
  logger.info("=== Overall Summary ===");
  for (const { type: resultType, result } of results) {
    logger.info(
      {
        type: resultType,
        runId: result.runId,
        fetched: result.totalFetched,
        inserted: result.totalInserted,
        updated: result.totalUpdated,
        unchanged: result.totalUnchanged,
        errors: result.errors.length,
      },
      `📊 ${resultType.charAt(0).toUpperCase() + resultType.slice(1)}`,
    );
  }
}

main().catch((err) => {
  logger.error({ error: err.message, stack: err.stack }, "Ingestion failed");
  process.exit(1);
});
