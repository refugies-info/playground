import fs from "node:fs";
import path from "node:path";
import { logger } from "@playground/shared-types";
import dotenv from "dotenv";
import matter from "gray-matter";

// Load env vars from root
const envPath = path.resolve(__dirname, "../.env");
logger.info({ envPath, exists: fs.existsSync(envPath) }, "Loading .env");
dotenv.config({ path: envPath });

async function main() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "http://127.0.0.1:54321";

  // Note: We need to import ingestRcoData. Since we are in scripts/, we recall that this package's src exports it.
  // However, running ts-node on scripts might not resolve ".." correctly if not compiled.
  // But previously it imported `getSupabaseAdmin` from "../src/index". So we can do the same.
  const {
    getSupabaseAdmin,
    ingestRcoData,
  } = require("../packages/supabase/src/index");

  const supabase = getSupabaseAdmin(url, key);
  logger.info("Seeding ingestion tables...");

  // Paths
  const rcoXmlPath = path.resolve(__dirname, "../packages/rco/samples/rco.xml");
  const rcoMdPath = path.resolve(__dirname, "../packages/rco/output/rco.md");
  const complianceMdPath = path.resolve(
    __dirname,
    "../packages/agents/output/rco-compliance.md",
  );
  const duplicatesMdPath = path.resolve(
    __dirname,
    "../packages/agents/output/rco-duplicates.md",
  );

  // 1. Load Data
  if (!fs.existsSync(rcoXmlPath)) {
    logger.error(`RCO XML not found at ${rcoXmlPath}`);
    return;
  }
  if (!fs.existsSync(rcoMdPath)) {
    logger.error(
      `RCO Markdown not found at ${rcoMdPath}. Please run 'pnpm generate:md' in packages/rco.`,
    );
    return;
  }

  const rcoXml = fs.readFileSync(rcoXmlPath, "utf-8");
  const rcoMdContent = fs.readFileSync(rcoMdPath, "utf-8");
  const { data: rcoMetadata } = matter(rcoMdContent);

  // 2. Load Reports (Optional)
  // biome-ignore lint/suspicious/noExplicitAny: Script convenience
  let complianceReport: { markdown: string; metadata: any } | undefined;
  if (fs.existsSync(complianceMdPath)) {
    const content = fs.readFileSync(complianceMdPath, "utf-8");
    const { data: metadata, content: markdown } = matter(content);
    complianceReport = { markdown, metadata };
  }

  // biome-ignore lint/suspicious/noExplicitAny: Script convenience
  let duplicatesReport: { markdown: string; metadata: any } | undefined;
  if (fs.existsSync(duplicatesMdPath)) {
    const content = fs.readFileSync(duplicatesMdPath, "utf-8");
    const { data: metadata, content: markdown } = matter(content);
    duplicatesReport = { markdown, metadata };
  }

  // 3. Call Ingestion Function
  logger.info("Calling ingestRcoData...");
  const result = await ingestRcoData(supabase, {
    xmlContent: rcoXml,
    markdownContent: rcoMdContent,
    metadata: rcoMetadata,
    complianceReport,
    duplicatesReport,
  });

  if (result.status === "success") {
    logger.info(
      {
        rcoRecordId: result.rcoRecordId,
        ingestionRecordId: result.ingestionRecordId,
      },
      "Ingestion successful",
    );
    if (result.reportResults) {
      // biome-ignore lint/suspicious/noExplicitAny: Script convenience
      result.reportResults.forEach((r: any) => {
        logger.info({ type: r.type, status: r.status }, "Report Status");
      });
    }
  } else {
    logger.error(result.error, "Ingestion failed");
  }

  logger.info("Done.");
}

main().catch((err) => logger.error(err, "Unhandled error"));
