/** biome-ignore-all lint/suspicious/noConsole: It's fine for a script */
import fs from "node:fs";
import path from "node:path";
import dotenv from "dotenv";
import matter from "gray-matter";


// Load env vars from root
const envPath = path.resolve(__dirname, "../../../.env");
console.log("Loading .env from:", envPath);
console.log("File exists:", fs.existsSync(envPath));
dotenv.config({ path: envPath });



async function main() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "http://127.0.0.1:54321";

  // Note: We need to import ingestRcoData. Since we are in scripts/, we recall that this package's src exports it.
  // However, running ts-node on scripts might not resolve ".." correctly if not compiled.
  // But previously it imported `getSupabaseAdmin` from "../src/index". So we can do the same.
  const { getSupabaseAdmin, ingestRcoData } = require("../src/index");

  const supabase = getSupabaseAdmin(url, key);
  console.log("Seeding ingestion tables...");

  // Paths
  const rcoXmlPath = path.resolve(__dirname, "../../rco/samples/rco.xml");
  const rcoMdPath = path.resolve(__dirname, "../../rco/output/rco.md");
  const complianceMdPath = path.resolve(
    __dirname,
    "../../agents/output/rco-compliance.md"
  );
  const duplicatesMdPath = path.resolve(
    __dirname,
    "../../agents/output/rco-duplicates.md"
  );

  // 1. Load Data
  if (!fs.existsSync(rcoXmlPath)) {
    console.error(`RCO XML not found at ${rcoXmlPath}`);
    return;
  }
  if (!fs.existsSync(rcoMdPath)) {
    console.error(
      `RCO Markdown not found at ${rcoMdPath}. Please run 'pnpm generate:md' in packages/rco.`
    );
    return;
  }

  const rcoXml = fs.readFileSync(rcoXmlPath, "utf-8");
  const rcoMdContent = fs.readFileSync(rcoMdPath, "utf-8");
  const { data: rcoMetadata } = matter(rcoMdContent);

  // 2. Load Reports (Optional)
  let complianceReport;
  if (fs.existsSync(complianceMdPath)) {
      const content = fs.readFileSync(complianceMdPath, "utf-8");
      const { data: metadata, content: markdown } = matter(content);
      complianceReport = { markdown, metadata };
  }

  let duplicatesReport;
  if (fs.existsSync(duplicatesMdPath)) {
      const content = fs.readFileSync(duplicatesMdPath, "utf-8");
      const { data: metadata, content: markdown } = matter(content);
      duplicatesReport = { markdown, metadata };
  }

  // 3. Call Ingestion Function
  console.log("Calling ingestRcoData...");
  const result = await ingestRcoData(supabase, {
      xmlContent: rcoXml,
      markdownContent: rcoMdContent,
      metadata: rcoMetadata,
      complianceReport,
      duplicatesReport
  });

  if (result.status === "success") {
      console.log(`Ingestion successful! Record ID: ${result.recordId}`);
      if (result.reportResults) {
          result.reportResults.forEach((r: any) => {
              console.log(`Report (${r.type}): ${r.status}`);
          });
      }
  } else {
      console.error("Ingestion failed:", result.error);
  }

  console.log("Done.");
}

main().catch(console.error);
