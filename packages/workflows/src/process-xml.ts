import fs from "node:fs/promises";
import path from "node:path";
import { createLettaClient, generateIngestionReport } from "@playground/agents";
import {
  lheoXmlToJson,
  lheoXmlToMarkdownWithFrontmatter,
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

export async function generateMarkdownStep(xmlContent: string) {
  "use step";
  const markdown = await lheoXmlToMarkdownWithFrontmatter(xmlContent);
  const outputDir = path.join(process.cwd(), "output");
  await fs.mkdir(outputDir, { recursive: true });
  const mdPath = path.join(outputDir, "rco.md");
  await fs.writeFile(mdPath, markdown);
  return { path: mdPath, content: markdown }; // Return content for ingestion
}

export async function generateJsonStep(xmlContent: string) {
  "use step";
  const json = await lheoXmlToJson(xmlContent);
  const outputDir = path.join(process.cwd(), "output");
  await fs.mkdir(outputDir, { recursive: true });
  const jsonPath = path.join(outputDir, "rco.json");
  await fs.writeFile(jsonPath, JSON.stringify(json, null, 2));
  return jsonPath;
}

export async function generateIngestionReportStep(xmlContent: string) {
  "use step";
  const lettaClient = createLettaClient();
  try {
    const report = await generateIngestionReport(lettaClient, xmlContent);
    const outputDir = path.join(process.cwd(), "output");
    await fs.mkdir(outputDir, { recursive: true });
    const reportPath = path.join(outputDir, "rco_report.md");
    await fs.writeFile(reportPath, report);
    return { path: reportPath, content: report };
  } catch (error) {
    logger.error(error, "Error generating ingestion report");
    return { error: error instanceof Error ? error.message : String(error) };
  }
}

export async function ingestDataStep(
  rcoRecordId: string,
  markdownResult: { path: string; content: string },
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

// Save workflow hook token
export async function saveWorkflowHookTokenStep(
  flowId: string,
  hookToken: string,
) {
  "use step";
  const supabase = getSupabaseClient();
  const { error } = await supabase
    .from("workflows")
    .update({ vercel_hook_token: hookToken })
    .eq("id", flowId);

  if (error) {
    throw new Error(`Failed to save workflow hook token: ${error.message}`);
  }
}

// Define workflow
export async function processXmlWorkflow(rcoRecordId: string) {
  "use workflow";

  const xmlContent = await fetchRcoXmlStep(rcoRecordId);

  // Parallel execution for files generation
  const [mdResult, jsonPath, ingestionReportResult] = await Promise.all([
    generateMarkdownStep(xmlContent),
    generateJsonStep(xmlContent),
    generateIngestionReportStep(xmlContent),
  ]);

  // Ingest Step (run after generation)
  const ingestionResult = await ingestDataStep(
    rcoRecordId,
    mdResult,
    ingestionReportResult,
  );

  return {
    files: {
      "rco.md": mdResult.path,
      "rco.json": jsonPath,
      "rco_report.md":
        ingestionReportResult.path || ingestionReportResult.error,
    },
    ingestion: ingestionResult,
  };
}
