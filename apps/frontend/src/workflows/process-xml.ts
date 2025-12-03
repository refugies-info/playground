import { lheoXmlToMarkdownWithFrontmatter, lheoXmlToJson } from "@playground/rco";
import { createLettaClient, checkCompliance, checkDuplicates } from "@playground/agents";
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
  return mdPath;
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
    return compliancePath;
  } catch (error) {
    // biome-ignore lint/suspicious/noConsole: Log error for debugging
    console.error("Error generating compliance report:", error);
    return `Error: ${error instanceof Error ? error.message : String(error)}`;
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
    return duplicatesPath;
  } catch (error) {
    // biome-ignore lint/suspicious/noConsole: Log error for debugging
    console.error("Error generating duplicates report:", error);
    return `Error: ${error instanceof Error ? error.message : String(error)}`;
  }
}

// Define workflow
export async function processXmlWorkflow(xmlContent: string) {
  "use workflow";

  // Parallel execution for independent tasks
  const [mdPath, jsonPath, compliancePath, duplicatesPath] = await Promise.all([
    generateMarkdownStep(xmlContent),
    generateJsonStep(xmlContent),
    checkComplianceStep(xmlContent),
    checkDuplicatesStep(xmlContent),
  ]);

  return {
    "rco.md": mdPath,
    "rco.json": jsonPath,
    "rco_compliance.md": compliancePath,
    "rco_duplicates.md": duplicatesPath,
  };
}
