import { lheoXmlToMarkdownWithFrontmatter, lheoXmlToJson } from "@playground/rco";
import { createLettaClient, checkCompliance, checkDuplicates } from "@playground/agents";
import { ingestRcoData, getSupabaseAdmin, type IngestionResult } from "@playground/supabase";
import fs from "node:fs/promises";
import path from "node:path";

// Define steps
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

export async function checkComplianceStep(xmlContent: string) {
  "use step";
  const lettaClient = createLettaClient();
  try {
    const complianceReport = await checkCompliance(lettaClient, xmlContent);
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

export async function checkDuplicatesStep(xmlContent: string) {
  "use step";
  const lettaClient = createLettaClient();
  try {
    const duplicatesReport = await checkDuplicates(lettaClient, xmlContent);
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

export async function ingestStep(
  xmlContent: string,
  markdownResult: { path: string, content: string },
  complianceResult: any,
  duplicatesResult: any
) {
  "use step";

  // We need metadata from markdown.
  // Since we don't have gray-matter here, we will hack it or add the dependency.
  // Actually, `lheoXmlToMarkdownWithFrontmatter` returns the string with frontmatter.
  // `ingestRcoData` takes `metadata` object.
  // I should probably move the metadata parsing into `ingestRcoData` or export a helper.
  // BUT `ingestRcoData` expects `metadata` as an object.
  // I will add `gray-matter` to this package or just import `matter` from it if I add it.
  // For now, I will optimistically assuming I can add `gray-matter` to this package too,
  // OR I can use `lheoXmlToJson` result which HAS the data structure!
  // `ingestion.ts` uses `metadata` to extract `formation` and `action`.
  // `lheoXmlToJson` returns exactly that structure (I assume).
  // Let's use the JSON result for metadata!

  // We need to pass the JSON result to this step too.

  return { status: "skipped_needs_json_and_client" };
}


// RE-WRITING THE FILE completely to include ingestion properly.

import matter from "gray-matter";

// ... (imports)

export async function ingestDataStep(
    xmlContent: string,
    markdownResult: { path: string; content: string },
    // jsonResult: any, // We can use the json output for metadata if structurally compatible,
    // but `seed-ingestion` used `matter(markdown)`.
    // `matter` is robust.
    complianceResult: any,
    duplicatesResult: any
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
    let complianceReport;
    if (complianceResult && !complianceResult.error && complianceResult.content) {
        const { data: cMeta, content: cMd } = matter(complianceResult.content);
        complianceReport = { markdown: cMd, metadata: cMeta };
    }

    let duplicatesReport;
    if (duplicatesResult && !duplicatesResult.error && duplicatesResult.content) {
         const { data: dMeta, content: dMd } = matter(duplicatesResult.content);
         duplicatesReport = { markdown: dMd, metadata: dMeta };
    }

    const result = await ingestRcoData(supabase, {
        xmlContent,
        markdownContent: markdownResult.content,
        metadata, // This metadata comes from the markdown frontmatter
        complianceReport,
        duplicatesReport
    });

    return result;
}


// Define workflow
export async function processXmlWorkflow(xmlContent: string) {
  "use workflow";

  // Parallel execution for files generation
  const [mdResult, jsonPath, complianceResult, duplicatesResult] = await Promise.all([
    generateMarkdownStep(xmlContent),
    generateJsonStep(xmlContent),
    checkComplianceStep(xmlContent),
    checkDuplicatesStep(xmlContent),
  ]);

  // Ingest Step (run after generation)
  const ingestionResult = await ingestDataStep(
      xmlContent,
      mdResult,
      complianceResult,
      duplicatesResult
  );

  return {
    files: {
        "rco.md": mdResult.path,
        "rco.json": jsonPath,
        "rco_compliance.md": complianceResult.path || complianceResult.error,
        "rco_duplicates.md": duplicatesResult.path || duplicatesResult.error,
    },
    ingestion: ingestionResult
  };
}
