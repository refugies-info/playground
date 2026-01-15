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
  const ingestionMdPath = path.resolve(__dirname, "../output/rco_report.md");

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

  // 2. Load Reports (Optional or Generate)
  // biome-ignore lint/suspicious/noExplicitAny: Script convenience
  let ingestionReport: { markdown: string; metadata: any } | undefined;

  if (fs.existsSync(ingestionMdPath)) {
    const content = fs.readFileSync(ingestionMdPath, "utf-8");
    const { data: metadata, content: markdown } = matter(content);
    ingestionReport = { markdown, metadata };
  } else {
    logger.info(
      "Report file not found. Generating ingestion report with Letta...",
    );
    try {
      // Dynamic require/import to access agents package
      const {
        createLettaClient,
        generateIngestionReport,
        parseIngestionResponse,
      } = require("../packages/agents/src/index");

      const lettaClient = createLettaClient();
      const agentId = process.env.PLAYGROUND_AGENT_ID;

      if (!agentId) {
        throw new Error("PLAYGROUND_AGENT_ID is not defined");
      }

      // Collect streaming response
      let finalContent = "";
      for await (const chunk of generateIngestionReport(
        lettaClient,
        rcoMdContent, // Pass markdown content instead of XML
        agentId,
      )) {
        if (chunk.message_type === "assistant_message") {
          const content =
            typeof chunk.content === "string"
              ? chunk.content
              : JSON.stringify(chunk.content);
          finalContent = content;
        }
      }

      // Parse the response
      const reportResult = parseIngestionResponse(finalContent, agentId);

      if (reportResult.status === "complete") {
        // Save it for future use
        fs.mkdirSync(path.dirname(ingestionMdPath), { recursive: true });
        fs.writeFileSync(ingestionMdPath, reportResult.content);
        logger.info(`Generated report saved to ${ingestionMdPath}`);

        ingestionReport = {
          markdown: reportResult.content,
          metadata: reportResult.metadata,
        };
      } else {
        logger.warn(
          { rawResponse: reportResult.rawResponse },
          "Ingestion report incomplete (no frontmatter found)",
        );
      }
    } catch (error) {
      logger.error(error, "Failed to generate ingestion report");
      // Continue without report? Or fail?
      // For seeding, maybe acceptable to continue, but improved logic.
    }
  }

  // 3. Call Ingestion Function
  logger.info("Calling ingestRcoData...");
  const result = await ingestRcoData(supabase, {
    xmlContent: rcoXml,
    markdownContent: rcoMdContent,
    metadata: rcoMetadata,
    ingestionReport,
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
