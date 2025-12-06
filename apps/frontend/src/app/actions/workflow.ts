"use server";

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

export async function runWorkflow(xmlContent: string) {
  const outputDir = path.join(process.cwd(), "output");

  try {
    await fs.mkdir(outputDir, { recursive: true });
  } catch (error) {
    // biome-ignore lint/suspicious/noConsole: Log error
    console.error("Error creating output directory:", error);
    return { success: false, error: "Failed to create output directory" };
  }

  const results: Record<string, string> = {};

  try {
    // 1. Generate Markdown
    const markdown = await lheoXmlToMarkdownWithFrontmatter(xmlContent);
    const mdPath = path.join(outputDir, "rco.md");
    await fs.writeFile(mdPath, markdown);
    results["rco.md"] = mdPath;

    // 2. Generate JSON
    const json = await lheoXmlToJson(xmlContent);
    const jsonPath = path.join(outputDir, "rco.json");
    await fs.writeFile(jsonPath, JSON.stringify(json, null, 2));
    results["rco.json"] = jsonPath;

    // Initialize Letta Client
    const lettaClient = createLettaClient();

    // 3. Compliance Report
    try {
      const complianceReport = await checkCompliance(lettaClient, xmlContent);
      const compliancePath = path.join(outputDir, "rco_compliance.md");
      await fs.writeFile(compliancePath, complianceReport);
      results["rco_compliance.md"] = compliancePath;
    } catch (error) {
      // biome-ignore lint/suspicious/noConsole: Log error
      console.error("Error generating compliance report:", error);
      results["rco_compliance.md"] =
        `Error: ${error instanceof Error ? error.message : String(error)}`;
    }

    // 4. Duplicates Report
    try {
      const duplicatesReport = await checkDuplicates(lettaClient, xmlContent);
      const duplicatesPath = path.join(outputDir, "rco_duplicates.md");
      await fs.writeFile(duplicatesPath, duplicatesReport);
      results["rco_duplicates.md"] = duplicatesPath;
    } catch (error) {
      // biome-ignore lint/suspicious/noConsole: Log error
      console.error("Error generating duplicates report:", error);
      results["rco_duplicates.md"] =
        `Error: ${error instanceof Error ? error.message : String(error)}`;
    }

    return { success: true, results };
  } catch (error) {
    // biome-ignore lint/suspicious/noConsole: Log error
    console.error("Workflow failed:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}
