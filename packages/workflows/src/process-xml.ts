// import fs from "node:fs/promises";
// import path from "node:path";
import {
  checkCompliance,
  checkDuplicates,
  createLettaClient,
} from "@playground/agents";
import {
  type LheoDocument,
  lheoJsonToMarkdownWithFrontmatter,
  splitLheoXmlIntoActions,
} from "@playground/rco";
import { logger } from "@playground/shared-types";
import { getSupabaseAdmin, ingestProcessedData } from "@playground/supabase";
import matter from "gray-matter";
import { createHook } from "workflow";

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

export async function checkComplianceStep(flowId: string, content: string) {
  "use step";
  const lettaClient = createLettaClient();
  try {
    const complianceReport = await checkCompliance(
      lettaClient,
      content,
      flowId,
    );
    return { content: complianceReport };
  } catch (error) {
    logger.error(error, "Error generating compliance report");
    return { error: error instanceof Error ? error.message : String(error) };
  }
}

export async function checkDuplicatesStep(flowId: string, content: string) {
  "use step";
  const lettaClient = createLettaClient();
  try {
    const duplicatesReport = await checkDuplicates(
      lettaClient,
      content,
      flowId,
    );
    return { content: duplicatesReport };
  } catch (error) {
    logger.error(error, "Error generating duplicates report");
    return { error: error instanceof Error ? error.message : String(error) };
  }
}

export async function ingestDataStep(
  rcoRecordId: string,
  markdownResult: { content: string },
  // jsonResult: any, // We can use the json output for metadata if structurally compatible,
  // but `seed-ingestion` used `matter(markdown)`.
  // `matter` is robust.
  complianceResult: { error?: unknown; content?: string },
  duplicatesResult: { error?: unknown; content?: string },
) {
  "use step";

  // Initialize Supabase
  const supabase = getSupabaseClient();

  // Parse Metadata from markdown content
  const { data: metadata } = matter(markdownResult.content);

  // Prepare Reports
  let complianceReport:
    | { markdown: string; metadata: Record<string, unknown> }
    | undefined;
  if (complianceResult && !complianceResult.error && complianceResult.content) {
    const { data: cMeta } = matter(complianceResult.content);
    complianceReport = { markdown: complianceResult.content, metadata: cMeta };
  }

  let duplicatesReport:
    | { markdown: string; metadata: Record<string, unknown> }
    | undefined;
  if (duplicatesResult && !duplicatesResult.error && duplicatesResult.content) {
    const { data: dMeta } = matter(duplicatesResult.content);
    duplicatesReport = { markdown: duplicatesResult.content, metadata: dMeta };
  }

  const result = await ingestProcessedData(supabase, {
    rcoRecordId,
    markdownContent: markdownResult.content,
    metadata, // This metadata comes from the markdown frontmatter
    complianceReport,
    duplicatesReport,
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
export async function processXmlWorkflow(flowId: string, rcoRecordId: string) {
  "use workflow";

  const xmlContent = await fetchRcoXmlStep(rcoRecordId);
  const actionDocs = await splitLheoXmlIntoActions(xmlContent);

  const results = [];

  for (let i = 0; i < actionDocs.length; i++) {
    const actionDoc = actionDocs[i];

    // Parallel execution for files generation AND compliance/duplicates for this specific action
    // We need to generate markdown first to pass to checking steps?
    // Actually, `generateMarkdownStep` returns the content.
    // But we need `content` for `checkComplianceStep`.
    // In the previous flow, valid XML was passed. Now we have a JSON object `actionDoc`.
    // We can generate MD first, then check compliance on MD.

    // Step 1: Generate Content
    const mdResult = await generateMarkdownStep(actionDoc);
    const jsonResult = await generateJsonStep(actionDoc);

    // Step 2: Checks (dependent on MD content)
    const [complianceResult, duplicatesResult] = await Promise.all([
      checkComplianceStep(flowId, mdResult.content),
      checkDuplicatesStep(flowId, mdResult.content),
    ]);

    // Step 3: Ingest
    const ingestionResult = await ingestDataStep(
      rcoRecordId,
      mdResult,
      complianceResult,
      duplicatesResult,
    );

    results.push({
      index: i,
      files: {
        // Files are no longer generated on disk
      },
      content: {
        "rco.md": mdResult.content,
        "rco.json": jsonResult,
        "compliance.md": complianceResult.content,
        "duplicates.md": duplicatesResult.content,
      },
      ingestion: ingestionResult,
    });
  }

  const hook = createHook();
  await saveWorkflowHookTokenStep(flowId, hook.token);
  await hook;

  return {
    processedActions: results.length,
    details: results,
  };
}
