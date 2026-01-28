/**
 * Smoke test for DI ingestion module
 *
 * Usage:
 *   pnpm tsx scripts/test-di-ingestion.ts [--limit N] [--all] [--cleanup]
 *
 * Options:
 *   --limit N    Fetch only N structures (default: 5)
 *   --all        Fetch all structures (no limit)
 *   --cleanup    Delete inserted records after test
 *
 * Examples:
 *   pnpm tsx scripts/test-di-ingestion.ts                  # Fetch 5, keep in DB
 *   pnpm tsx scripts/test-di-ingestion.ts --limit 10       # Fetch 10, keep in DB
 *   pnpm tsx scripts/test-di-ingestion.ts --all            # Fetch ALL structures
 *   pnpm tsx scripts/test-di-ingestion.ts --cleanup        # Fetch 5, then delete
 */

import path from "node:path";
import { logger } from "@playground/shared-types";
import { getSupabaseAdmin } from "@playground/supabase";
import dotenv from "dotenv";

// Load env vars from root .env (includes DI_BASE_URL and DI_API_KEY)
dotenv.config({ path: path.resolve(__dirname, "../.env") });

// Parse CLI args
const args = process.argv.slice(2);
const limitIndex = args.indexOf("--limit");
const fetchAll = args.includes("--all");
const limit = fetchAll
  ? undefined
  : limitIndex !== -1
    ? parseInt(args[limitIndex + 1], 10)
    : 5;
const cleanup = args.includes("--cleanup");

async function main() {
  logger.info(
    { limit: limit ?? "all", cleanup },
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
  const { fetchCarifOrefStructures } = await import("@refugies-info/di");
  const supabase = getSupabaseAdmin();

  // 3. Fetch structures from DI API (with limit)
  const testStructures = await fetchCarifOrefStructures({ limit });

  if (testStructures.length === 0) {
    logger.error("No structures fetched. Check DI API connection.");
    process.exit(1);
  }

  // Log sample structure
  logger.info(
    {
      sample: {
        id: testStructures[0].id,
        nom: testStructures[0].nom,
        source: testStructures[0].source,
        commune: testStructures[0].commune,
      },
    },
    "Sample structure",
  );

  // 4. Insert into Supabase
  logger.info("Inserting structures into di_structures table...");

  const records = testStructures.map((structure) => ({
    raw_data: JSON.stringify(structure),
    data: structure,
  }));

  const { data: inserted, error: insertError } = await supabase
    .from("di_structures")
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
    "Structures inserted successfully",
  );

  // 5. Verify by reading back (sample of inserted records)
  logger.info("Verifying insertion...");

  const verifyLimit = Math.min(inserted?.length ?? 10, 10); // Show at most 10
  const { data: verified, error: verifyError } = await supabase
    .from("di_structures")
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

    const idsToDelete = inserted.map((r) => r.id);
    const { error: deleteError } = await supabase
      .from("di_structures")
      .delete()
      .in("id", idsToDelete);

    if (deleteError) {
      logger.error({ error: deleteError.message }, "Cleanup failed");
    } else {
      logger.info({ deletedIds: idsToDelete }, "Test data cleaned up");
    }
  }

  logger.info("=== Smoke test completed ===");
}

main().catch((err) => {
  logger.error({ error: err.message, stack: err.stack }, "Smoke test failed");
  process.exit(1);
});
