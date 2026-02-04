/**
 * Random Ingestion Records Extractor
 *
 * Official script to produce a random extract of ingestion records as individual markdown files.
 *
 * Usage:
 *   pnpm di:extract [options]
 *
 * Examples:
 *   pnpm di:extract                          # Extract 20 random records to extracts/
 *   pnpm di:extract --count 50 --out samples  # Extract 50 random records to samples/
 */

import fs from "node:fs";
import path from "node:path";
import { logger } from "@playground/shared-types";
import { getSupabaseAdmin } from "@playground/supabase";
import { program } from "commander";
import dotenv from "dotenv";

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, "../.env") });

// Configure CLI
program
  .name("di:extract")
  .description("Extract random ingestion records to individual markdown files")
  .option("-c, --count <number>", "Number of records to extract", "20")
  .option("-o, --out <directory>", "Output directory", "extracts")
  .option("-s, --origin <origin>", "Filter by origin (DI or RCO)")
  .parse(process.argv);

const opts = program.opts<{
  count: string;
  out: string;
  origin?: string;
}>();

interface IngestionRecord {
  markdown: string;
}

async function main() {
  const count = parseInt(opts.count, 10);
  const outputDir = path.resolve(process.cwd(), opts.out);

  logger.info(
    { count, outputDir, origin: opts.origin ?? "any" },
    "=== Starting Random Extraction ===",
  );

  try {
    const supabase = getSupabaseAdmin();

    // Strategy: Fetch a pool of records and shuffle in JS since Supabase JS client
    // doesn't support ORDER BY random() and we want to avoid complex RPC setup for a simple extract.
    let query = supabase.from("ingestion_records").select("markdown");

    if (opts.origin) {
      query = query.eq("origin", opts.origin.toUpperCase());
    }

    // Fetch up to 1000 records to sample from
    const { data: allRecords, error: fetchError } = await query.limit(1000);

    if (fetchError) throw fetchError;

    if (!allRecords || allRecords.length === 0) {
      logger.warn("No records found in ingestion_records table.");
      return;
    }

    // Shuffle and slice
    const shuffled = (allRecords as IngestionRecord[]).sort(
      () => 0.5 - Math.random(),
    );
    const selected = shuffled.slice(0, count);

    processRecords(selected, outputDir);
  } catch (error) {
    logger.error(
      { error: error instanceof Error ? error.message : String(error) },
      "Extraction failed",
    );
    process.exit(1);
  }
}

function processRecords(records: IngestionRecord[], outputDir: string) {
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  for (const [index, row] of records.entries()) {
    // Try to extract ID from frontmatter for a nicer filename
    const idMatch = row.markdown.match(/^id:\s*(.+)$/m);
    const baseName = idMatch
      ? idMatch[1].trim().replace(/[^a-z0-9]/gi, "_")
      : `record-${index + 1}`;
    const fileName = `${baseName}.md`;
    const filePath = path.join(outputDir, fileName);

    fs.writeFileSync(filePath, row.markdown);
    logger.debug({ fileName }, "Saved record");
  }

  logger.info(
    `✅ Successfully saved ${records.length} records to ${outputDir}`,
  );
}

main();
