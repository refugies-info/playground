import fs from "node:fs/promises";
import path from "node:path";
import {
  checkCompliance,
  checkDuplicates,
  createLettaClient,
} from "@playground/agents";
import {
  lheoXmlToJson,
  lheoXmlToMarkdownWithFrontmatter,
} from "@playground/rco";
import { getSupabaseAdmin, ingestProcessedData } from "@playground/supabase";
import matter from "gray-matter";

// Define steps
export async function fetchRcoXmlStep(rcoRecordId: string) {
  "use step";
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "http://127.0.0.1:54321";
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!key) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY is not defined");
  }

  const supabase = getSupabaseAdmin(url, key);
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

export async function checkComplianceStep(
  contentFlowId: string,
  xmlContent: string,
) {
  "use step";
  const lettaClient = createLettaClient();
  try {
    const complianceReport = await checkCompliance(
      lettaClient,
      xmlContent,
      contentFlowId,
    );
    const outputDir = path.join(process.cwd(), "output");
    await fs.mkdir(outputDir, { recursive: true });
    const compliancePath = path.join(outputDir, "rco_compliance.md");
    await fs.writeFile(compliancePath, complianceReport);

    // We need to parse metadata from the report for ingestion
    // Simple extraction since we don't have matter here?
    // Actually we can use the same matter library or just pass the full string and let ingest parse it?
    // ingestRcoData expects { markdown, metadata }.
    // BUT we don't want to import matter here if we can avoid it (or we can adding gray-matter dep).
    // Better: let's just return the raw string and let the step handle parsing?
    // Or just pass the raw content and let ingestion handle it?
    // `ingestRcoData` takes { complianceReport: { markdown, metadata } }.
    // I'll parse it here if I can, or I'll just skip metadata parsing for now if it's too complex without deps.
    // Wait, the agent returns a string that has frontmatter.
    // I'll just return the string.
    return { path: compliancePath, content: complianceReport };
  } catch (error) {
    // biome-ignore lint/suspicious/noConsole: Log error for debugging
    console.error("Error generating compliance report:", error);
    return { error: error instanceof Error ? error.message : String(error) };
  }
}

export async function checkDuplicatesStep(
  contentFlowId: string,
  xmlContent: string,
) {
  "use step";
  const lettaClient = createLettaClient();
  try {
    const duplicatesReport = await checkDuplicates(
      lettaClient,
      xmlContent,
      contentFlowId,
    );
    const outputDir = path.join(process.cwd(), "output");
    await fs.mkdir(outputDir, { recursive: true });
    const duplicatesPath = path.join(outputDir, "rco_duplicates.md");
    await fs.writeFile(duplicatesPath, duplicatesReport);
    return { path: duplicatesPath, content: duplicatesReport };
  } catch (error) {
    // biome-ignore lint/suspicious/noConsole: Log error for debugging
    console.error("Error generating duplicates report:", error);
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
  // We assume env vars are present (NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "http://127.0.0.1:54321";
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!key) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY is not defined");
  }

  const supabase = getSupabaseAdmin(url, key);

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

// Define workflow
export async function processXmlWorkflow(
  contentFlowId: string,
  rcoRecordId: string,
) {
  "use workflow";

  const xmlContent = await fetchRcoXmlStep(rcoRecordId);

  // Parallel execution for files generation
  const [mdResult, jsonPath, complianceResult, duplicatesResult] =
    await Promise.all([
      generateMarkdownStep(xmlContent),
      generateJsonStep(xmlContent),
      checkComplianceStep(contentFlowId, xmlContent),
      checkDuplicatesStep(contentFlowId, xmlContent),
    ]);

  // Ingest Step (run after generation)
  const ingestionResult = await ingestDataStep(
    rcoRecordId,
    mdResult,
    complianceResult,
    duplicatesResult,
  );

  return {
    files: {
      "rco.md": mdResult.path,
      "rco.json": jsonPath,
      "rco_compliance.md": complianceResult.path || complianceResult.error,
      "rco_duplicates.md": duplicatesResult.path || duplicatesResult.error,
    },
    ingestion: ingestionResult,
  };
}
