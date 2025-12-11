import fs from "node:fs/promises";
import path from "node:path";
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

export async function generateMarkdownStep(doc: LheoDocument, index: number) {
  "use step";
  // Convert JSON to YAML for frontmatter
  const yaml = await import("@playground/rco").then((m) => m.jsonToYaml(doc));
  const markdown = lheoJsonToMarkdownWithFrontmatter(doc, yaml);

  const outputDir = path.join(process.cwd(), "output");
  await fs.mkdir(outputDir, { recursive: true });
  // Use index to distinguish files if needed, but for ingestion we mostly care about the content return.
  // We can save debugging files with index.
  const mdPath = path.join(outputDir, `rco_${index}.md`);
  await fs.writeFile(mdPath, markdown);
  return { path: mdPath, content: markdown };
}

export async function generateJsonStep(doc: LheoDocument, index: number) {
  "use step";
  const outputDir = path.join(process.cwd(), "output");
  await fs.mkdir(outputDir, { recursive: true });
  const jsonPath = path.join(outputDir, `rco_${index}.json`);
  await fs.writeFile(jsonPath, JSON.stringify(doc, null, 2));
  return jsonPath;
}

export async function checkComplianceStep(
  flowId: string,
  content: string,
  index: number,
) {
  "use step";
  const lettaClient = createLettaClient();
  try {
    const complianceReport = await checkCompliance(
      lettaClient,
      content,
      flowId,
    );
    const outputDir = path.join(process.cwd(), "output");
    await fs.mkdir(outputDir, { recursive: true });
    const compliancePath = path.join(outputDir, `rco_compliance_${index}.md`);
    await fs.writeFile(compliancePath, complianceReport);
    return { path: compliancePath, content: complianceReport };
  } catch (error) {
    logger.error(error, "Error generating compliance report");
    return { error: error instanceof Error ? error.message : String(error) };
  }
}

export async function checkDuplicatesStep(
  flowId: string,
  content: string,
  index: number,
) {
  "use step";
  const lettaClient = createLettaClient();
  try {
    const duplicatesReport = await checkDuplicates(
      lettaClient,
      content,
      flowId,
    );
    const outputDir = path.join(process.cwd(), "output");
    await fs.mkdir(outputDir, { recursive: true });
    const duplicatesPath = path.join(outputDir, `rco_duplicates_${index}.md`);
    await fs.writeFile(duplicatesPath, duplicatesReport);
    return { path: duplicatesPath, content: duplicatesReport };
  } catch (error) {
    logger.error(error, "Error generating duplicates report");
    return { error: error instanceof Error ? error.message : String(error) };
  }
}

export async function ingestDataStep(
  rcoRecordId: string,
  markdownResult: { path: string; content: string },
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
    const mdResult = await generateMarkdownStep(actionDoc, i);
    const jsonPath = await generateJsonStep(actionDoc, i);

    // Step 2: Checks (dependent on MD content)
    const [complianceResult, duplicatesResult] = await Promise.all([
      checkComplianceStep(flowId, mdResult.content, i),
      checkDuplicatesStep(flowId, mdResult.content, i),
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
        "rco.md": mdResult.path,
        "rco.json": jsonPath,
        "compliance.md": complianceResult.path,
        "duplicates.md": duplicatesResult.path,
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
