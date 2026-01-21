import fs from "node:fs";
import path from "node:path";
import { logger } from "@playground/shared-types";
import dotenv from "dotenv";
import matter from "gray-matter";

// Load env vars from root
const envPath = path.resolve(__dirname, "../.env");
logger.info({ envPath, exists: fs.existsSync(envPath) }, "Loading .env");
dotenv.config({ path: envPath });

// Imports from workspace packages
import {
  createLettaClient,
  generateIngestionReport,
  parseIngestionResponse,
} from "@playground/agents";
import { getSupabaseAdmin, ingestRcoData } from "@playground/supabase";

async function main() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "http://127.0.0.1:54321";

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

  // Initialize client and conversation regardless of report existence
  // because we might need conversationId for ingestion linkage
  const lettaClient = createLettaClient();
  const agentId = process.env.PLAYGROUND_AGENT_ID;

  if (!agentId) {
    throw new Error("PLAYGROUND_AGENT_ID is not defined");
  }

  logger.info("Creating Letta conversation...");
  const conversation = await lettaClient.conversations.create({
    agent_id: agentId,
  });
  const conversationId = conversation.id;

  if (fs.existsSync(ingestionMdPath)) {
    const content = fs.readFileSync(ingestionMdPath, "utf-8");
    const { data: metadata, content: markdown } = matter(content);
    ingestionReport = { markdown, metadata };
  } else {
    logger.info(
      "Report file not found. Generating ingestion report with Letta...",
    );
    try {
      // Collect streaming response
      let finalContent = "";

      // Accumulate tool arguments if tool call occurs
      let toolCallArgs = "";
      let isToolCall = false;

      for await (const chunk of generateIngestionReport(
        lettaClient,
        rcoMdContent, // Pass markdown content instead of XML
        conversationId,
      )) {
        logger.debug(
          { type: chunk.message_type },
          "Received Letta stream chunk",
        );

        if (chunk.message_type === "assistant_message") {
          if (typeof chunk.content === "string") {
            // Stream yields deltas, so we accumulate
            finalContent += chunk.content;
          }
        } else if (chunk.message_type === "tool_call_message") {
          logger.info({ tool_call: chunk.tool_call }, "Received tool call");
          isToolCall = true;
          if (chunk.tool_call?.function?.arguments) {
            toolCallArgs += chunk.tool_call.function.arguments;
          }
        }
      }

      // If we had a tool call, we prioritize its output if it contains the report
      if (isToolCall && toolCallArgs) {
        logger.info({ toolCallArgs }, "Raw tool call arguments");
        try {
          const args = JSON.parse(toolCallArgs);
          if (args.report) {
            finalContent = args.report;
            logger.info("Extracted report from tool call arguments");
          } else if (typeof args === "string") {
            finalContent = args;
          }
        } catch (e) {
          logger.error(
            { error: e, toolCallArgs },
            "Failed to parse tool call arguments",
          );
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
    conversationId,
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
