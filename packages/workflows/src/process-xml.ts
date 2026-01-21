import { APIError } from "@letta-ai/letta-client/error";
import {
  createLettaClient,
  generateIngestionReport,
  type IngestionReportResult,
  type LettaApiErrorInfo,
  parseIngestionResponse,
} from "@playground/agents";
import {
  type LheoDocument,
  lheoJsonToMarkdownWithFrontmatter,
  splitLheoXmlIntoActions,
} from "@playground/rco";
import { logger } from "@playground/shared-types";
import { getSupabaseAdmin, ingestProcessedData } from "@playground/supabase";
import matter from "gray-matter";

// Define steps

function getSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "http://127.0.0.1:54321";
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!key) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY is not defined");
  }

  return getSupabaseAdmin(url, key);
}

export async function fetchRcoXmlStep(rcoRecordId: string) {
  "use step";
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("rco_records")
    .select("source_raw")
    .eq("id", rcoRecordId)
    .single();

  if (error || !data) {
    throw new Error(`Failed to fetch RCO record: ${error?.message}`);
  }

  return data.source_raw;
}

export async function parseXmlStep(xmlContent: string) {
  "use step";
  // For this POC, we'll just return the content as is, but in a real scenario
  // we might parse it into an object here if needed for subsequent steps.
  // The existing functions expect the raw XML string.
  return xmlContent;
}

export async function generateMarkdownStep(doc: LheoDocument) {
  "use step";
  // Convert JSON to YAML for frontmatter
  const yaml = await import("@playground/rco").then((m) => m.jsonToYaml(doc));
  const markdown = lheoJsonToMarkdownWithFrontmatter(doc, yaml);

  // Return content directly for memory-based processing
  return { content: markdown };
}

export async function generateJsonStep(doc: LheoDocument) {
  "use step";
  return { content: doc };
}

/**
 * Generates an ingestion (audit) report from markdown content.
 * Uses the /audit slash command via streaming API.
 *
 * @param markdownContent - Markdown with frontmatter from RCO
 * @param conversationId - The conversation ID to use
 */
export async function generateIngestionReportStep(
  markdownContent: string,
  conversationId: string,
) {
  "use step";
  const lettaClient = createLettaClient();
  const agentId = process.env.PLAYGROUND_AGENT_ID;

  if (!agentId) {
    throw new Error("PLAYGROUND_AGENT_ID is not defined");
  }

  try {
    // Collect streaming response into final content
    let finalContent = "";

    for await (const chunk of generateIngestionReport(
      lettaClient,
      markdownContent,
      conversationId,
    )) {
      // Extract assistant message content from stream
      if (chunk.message_type === "assistant_message") {
        if (typeof chunk.content !== "string") {
          throw new Error(
            `Expected assistant message content to be a string, but got ${typeof chunk.content}`,
          );
        }
        finalContent = chunk.content; // Last assistant message is the final response
      }
    }

    // Parse the final response into structured result
    const result = parseIngestionResponse(finalContent, agentId);
    return { result };
  } catch (error) {
    // Handle Letta API errors (e.g., llm_api_error) with structured info
    if (error instanceof APIError) {
      const apiErrorInfo: LettaApiErrorInfo = {
        type: "api_error",
        status: error.status,
        message: error.message,
        details: error.error, // Contains the JSON body with detailed error info
      };
      logger.error(
        { status: error.status, body: error.error },
        "Letta API error generating ingestion report",
      );
      return { error: apiErrorInfo.message, apiError: apiErrorInfo };
    }

    logger.error(error, "Error generating ingestion report");
    return { error: error instanceof Error ? error.message : String(error) };
  }
}

export async function ingestDataStep(
  rcoRecordId: string,
  markdownResult: { content: string },
  conversationId: string,
  // jsonResult: any, // We can use the json output for metadata if structurally compatible,
  // but `seed-ingestion` used `matter(markdown)`.
  // `matter` is robust.
  ingestionResult: {
    error?: unknown;
    result?: IngestionReportResult;
    apiError?: LettaApiErrorInfo;
  },
) {
  "use step";

  // Initialize Supabase
  const supabase = getSupabaseClient();

  // Parse Metadata from markdown content
  const { data: metadata } = matter(markdownResult.content);

  // Prepare Report with status information
  let ingestionReport:
    | {
        markdown: string;
        metadata: Record<string, unknown>;
        status?: "complete" | "incomplete";
        rawResponse?: string;
      }
    | undefined;

  if (ingestionResult?.result) {
    const report = ingestionResult.result;
    ingestionReport = {
      markdown: report.content,
      metadata: report.metadata,
      status: report.status,
      rawResponse: report.rawResponse,
    };
  }

  const result = await ingestProcessedData(supabase, {
    rcoRecordId,
    markdownContent: markdownResult.content,
    metadata, // This metadata comes from the markdown frontmatter
    conversationId,
    ingestionReport,
  });

  return result;
}

// Define workflow
export async function processXmlWorkflow(
  _flowId: string,
  rcoRecordId: string,
  conversationId: string,
) {
  "use workflow";

  if (!conversationId) {
    throw new Error("Conversation ID is required for processXmlWorkflow");
  }

  const xmlContent = await fetchRcoXmlStep(rcoRecordId);
  const actionDocs = await splitLheoXmlIntoActions(xmlContent);

  // We must run sequentially to avoid race conditions in the conversation state
  const results = [];
  for (let i = 0; i < actionDocs.length; i++) {
    const actionDoc = actionDocs[i];

    // Step 1: Generate Markdown from RCO XML
    const mdResult = await generateMarkdownStep(actionDoc);
    const jsonResult = await generateJsonStep(actionDoc);

    // Step 2: Run audit report on the markdown content
    // Note: mdResult.content is markdown with frontmatter, not XML
    const ingestionReportResult = await generateIngestionReportStep(
      mdResult.content,
      conversationId,
    );

    // Step 3: Ingest into database
    const ingestionResult = await ingestDataStep(
      rcoRecordId,
      mdResult,
      conversationId,
      ingestionReportResult,
    );

    results.push({
      index: i,
      content: {
        "rco.md": mdResult.content,
        "rco.json": jsonResult.content,
        "report.md":
          ingestionReportResult.result?.content ?? ingestionReportResult.error,
      },
      ingestion: ingestionResult,
    });
  }

  return {
    processedActions: results.length,
    details: results,
  };
}
