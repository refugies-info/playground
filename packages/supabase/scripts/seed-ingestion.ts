/** biome-ignore-all lint/suspicious/noConsole: It's fine for a script */
import fs from "node:fs";
import path from "node:path";
import dotenv from "dotenv";
import matter from "gray-matter";
import { getSupabaseAdmin } from "../src/index";

// Load env vars from root
const envPath = path.resolve(__dirname, "../../../.env");
console.log("Loading .env from:", envPath);
console.log("File exists:", fs.existsSync(envPath));
dotenv.config({ path: envPath });

async function main() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "http://127.0.0.1:54321";

  const supabase = getSupabaseAdmin(url, key);
  console.log("Seeding ingestion tables...");

  // Paths
  const rcoXmlPath = path.resolve(__dirname, "../../rco/samples/rco.xml");
  const rcoMdPath = path.resolve(__dirname, "../../rco/output/rco.md");
  const complianceMdPath = path.resolve(
    __dirname,
    "../../agents/output/rco-compliance.md",
  );
  const duplicatesMdPath = path.resolve(
    __dirname,
    "../../agents/output/rco-duplicates.md",
  );

  // 1. Insert Ingestion Record
  if (!fs.existsSync(rcoXmlPath)) {
    console.error(`RCO XML not found at ${rcoXmlPath}`);
    return;
  }
  if (!fs.existsSync(rcoMdPath)) {
    console.error(
      `RCO Markdown not found at ${rcoMdPath}. Please run 'pnpm generate:md' in packages/rco.`,
    );
    return;
  }

  const rcoXml = fs.readFileSync(rcoXmlPath, "utf-8");
  const rcoMdContent = fs.readFileSync(rcoMdPath, "utf-8");
  const { data: rcoMetadata } = matter(rcoMdContent);

  // Extract source_id from metadata or generate one
  // We use a fallback if not present, but typically RCO data should have an ID.
  const sourceId =
    rcoMetadata.id || rcoMetadata["numero-session"] || "rco-sample-1";

  console.log(`Inserting ingestion record for source_id: ${sourceId}`);

  const { data: record, error: recordError } = await supabase
    .from("ingestion_records")
    .upsert(
      {
        source_id: sourceId,
        source_created_at: new Date().toISOString(),
        source_updated_at: new Date().toISOString(),
        source_raw: rcoXml,
        markdown: rcoMdContent,
        metadata: rcoMetadata,
        is_current_version: true,
      },
      { onConflict: "source_id" },
    )
    .select()
    .single();

  if (recordError) {
    console.error(
      "Error inserting ingestion record:",
      JSON.stringify(recordError, null, 2),
    );
    return;
  }

  console.log(`Inserted/Updated record ID: ${record.id}`);

  // 2. Insert Ingestion Reports
  const reports = [
    { path: complianceMdPath, type: "compliance" },
    { path: duplicatesMdPath, type: "duplicates" },
  ];

  for (const report of reports) {
    if (fs.existsSync(report.path)) {
      const content = fs.readFileSync(report.path, "utf-8");
      const { data: metadata, content: markdown } = matter(content);

      console.log(`Inserting ${report.type} report...`);

      const { error: reportError } = await supabase
        .from("ingestion_reports")
        .insert({
          raw_record_id: record.id,
          report_type: report.type,
          markdown: markdown,
          metadata: metadata,
        });

      if (reportError) {
        console.error(`Error inserting ${report.type} report:`, reportError);
      } else {
        console.log(`Inserted ${report.type} report.`);
      }
    } else {
      console.warn(
        `Report file not found: ${report.path}. Run agents scripts to generate it.`,
      );
    }
  }

  console.log("Done.");
}

main().catch(console.error);
