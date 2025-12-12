import { createLettaClient, generateIngestionReport } from "@playground/agents";
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

export async function generateIngestionReportStep(xmlContent: string) {
  "use step";
  const lettaClient = createLettaClient();
  try {
    const report = await generateIngestionReport(lettaClient, xmlContent);
    // Return content directly
    return { content: report };
  } catch (error) {
    logger.error(error, "Error generating ingestion report");
    return { error: error instanceof Error ? error.message : String(error) };
  }
}

export async function ingestDataStep(
  rcoRecordId: string,
  markdownResult: { content: string },
  // jsonResult: any, // We can use the json output for metadata if structurally compatible,
  // but `seed-ingestion` used `matter(markdown)`.
  // `matter` is robust.
  ingestionResult: { error?: unknown; content?: string },
) {
  "use step";

  // Initialize Supabase
  const supabase = getSupabaseClient();

  // Parse Metadata from markdown content
  const { data: metadata } = matter(markdownResult.content);

  // Prepare Report
  let ingestionReport:
    | { markdown: string; metadata: Record<string, unknown> }
    | undefined;

  if (ingestionResult && !ingestionResult.error && ingestionResult.content) {
    const { data: iMeta } = matter(ingestionResult.content);
    ingestionReport = { markdown: ingestionResult.content, metadata: iMeta };
  }

  const result = await ingestProcessedData(supabase, {
    rcoRecordId,
    markdownContent: markdownResult.content,
    metadata, // This metadata comes from the markdown frontmatter
    ingestionReport,
  });

  return result;
}

// Define workflow
export async function processXmlWorkflow(_flowId: string, rcoRecordId: string) {
  "use workflow";

  const xmlContent = await fetchRcoXmlStep(rcoRecordId);
  const actionDocs = await splitLheoXmlIntoActions(xmlContent);

  const results = await Promise.all(
    actionDocs.map(async (actionDoc, i) => {
      // Step 1: Generate Content
      const mdResult = await generateMarkdownStep(actionDoc);
      const jsonResult = await generateJsonStep(actionDoc);

      // Step 2: Checks (Ingestion Report)
      // Pass the markdown content to the agent
      const ingestionReportResult = await generateIngestionReportStep(
        mdResult.content,
      );

      // Step 3: Ingest
      const ingestionResult = await ingestDataStep(
        rcoRecordId,
        mdResult,
        ingestionReportResult,
      );

      return {
        index: i,
        content: {
          "rco.md": mdResult.content,
          "rco.json": jsonResult.content,
          "report.md":
            ingestionReportResult.content ?? ingestionReportResult.error,
        },
        ingestion: ingestionResult,
      };
    }),
  );

  return {
    processedActions: results.length,
    details: results,
  };
}
