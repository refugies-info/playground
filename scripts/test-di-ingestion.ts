/**
 * Smoke test for DI ingestion module
 *
 * Usage:
 *   pnpm tsx scripts/test-di-ingestion.ts [--type TYPE] [--limit N] [--all] [--cleanup]
 *
 * Options:
 *   --type TYPE  Type to ingest: structures|services (default: structures)
 *   --limit N    Fetch only N items (default: 5)
 *   --all        Fetch all items (no limit)
 *   --cleanup    Delete inserted records after test
 *
 * Examples:
 *   pnpm tsx scripts/test-di-ingestion.ts                    # Fetch 5 structures, keep in DB
 *   pnpm tsx scripts/test-di-ingestion.ts --type services    # Fetch 5 services, keep in DB
 *   pnpm tsx scripts/test-di-ingestion.ts --limit 10         # Fetch 10 structures, keep in DB
 *   pnpm tsx scripts/test-di-ingestion.ts --type services --limit 20  # Fetch 20 services
 *   pnpm tsx scripts/test-di-ingestion.ts --all              # Fetch ALL structures
 *   pnpm tsx scripts/test-di-ingestion.ts --type services --all  # Fetch ALL services
 *   pnpm tsx scripts/test-di-ingestion.ts --cleanup          # Fetch 5, then delete
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
const cleanup = args.includes("--cleanup");

// Validate type
if (type !== "structures" && type !== "services") {
  logger.error(`Invalid type: ${type}. Must be 'structures' or 'services'`);
  process.exit(1);
}

async function main() {
  logger.info(
    { type, limit: limit ?? "all", cleanup },
    "=== DI Ingestion Smoke Test ===",
  );

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
  // Import DI module (after env is loaded so client is configured)
  const diModule = await import("@refugies-info/di");
  const supabase = getSupabaseAdmin();

  // 3. Fetch from DI API (with limit)
  const isStructures = type === "structures";
  const tableName = isStructures ? "di_structures" : "di_services";
  const fetchFn = isStructures
    ? diModule.fetchCarifOrefStructures
    : diModule.fetchCarifOrefServices;

  logger.info(`Fetching ${type} from DI API...`);
  const testData = await fetchFn({ limit });

  if (testData.length === 0) {
    logger.error(`No ${type} fetched. Check DI API connection.`);
    process.exit(1);
  }

  // Log sample item
  const sample = testData[0];
  logger.info(
    {
      sample: {
        id: sample.id,
        nom: sample.nom,
        source: sample.source,
        ...(isStructures
          ? { commune: sample.commune }
          : { structure_id: sample.structure_id }),
      },
    },
    `Sample ${type.slice(0, -1)}`, // Remove 's' for singular
  );

  // 4. Insert into Supabase
  logger.info(`Inserting ${type} into ${tableName} table...`);

  const records = testData.map((item) => ({
    raw_data: JSON.stringify(item),
    data: item,
  }));

  const { data: inserted, error: insertError } = await supabase
    .from(tableName)
    .insert(records)
    .select("id, data->id, data->nom");

  if (insertError) {
    logger.error({ error: insertError.message }, "Insert failed");
    process.exit(1);
  }

  logger.info(
    {
      insertedCount: inserted?.length,
      insertedIds: inserted?.map((r) => r.id),
    },
    `${type.slice(0, -1).charAt(0).toUpperCase() + type.slice(0, -1).slice(1)}s inserted successfully`,
  );

  // 5. Verify by reading back (sample of inserted records)
  logger.info("Verifying insertion...");

  const verifyLimit = Math.min(inserted?.length ?? 10, 10); // Show at most 10
  const { data: verified, error: verifyError } = await supabase
    .from(tableName)
    .select("id, data->id, data->nom, data->source")
    .order("id", { ascending: false })
    .limit(verifyLimit);

  if (verifyError) {
    logger.error({ error: verifyError.message }, "Verification query failed");
  } else {
    logger.info(
      { count: verified?.length, records: verified },
      "Verified records in database",
    );
  }

  // 6. Cleanup (optional)
  if (cleanup && inserted && inserted.length > 0) {
    logger.info("Cleaning up test data...");

    // Extract the DI IDs from the original test data (stored in data->>'id')
    const idsToDelete = testData.map((item) => item.id);
    const { error: deleteError } = await supabase
      .from(tableName)
      .delete()
      .in("data->>'id'", idsToDelete);

    if (deleteError) {
      logger.error({ error: deleteError.message }, "Cleanup failed");
    } else {
      logger.info({ deletedCount: idsToDelete.length }, "Test data cleaned up");
    }
  }

  logger.info("=== Smoke test completed ===");
}

main().catch((err) => {
  logger.error({ error: err.message, stack: err.stack }, "Smoke test failed");
  process.exit(1);
});
