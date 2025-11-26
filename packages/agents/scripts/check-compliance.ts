/** biome-ignore-all lint/suspicious/noConsole: It's fine for a script */
import * as fs from "node:fs";
import * as path from "node:path";
import { parseLheoXml } from "rco";
import { checkCompliance, createLettaClient } from "../src/index";

async function main() {
  const xmlPath = path.resolve(__dirname, "../../rco/samples/rco.xml");

  console.log("Reading XML file:", xmlPath);
  const xmlContent = fs.readFileSync(xmlPath, "utf-8");

  console.log("Validating LHEO XML...");
  await parseLheoXml(xmlContent); // Validate XML structure

  console.log("Initializing Letta client...");
  const client = createLettaClient();

  console.log("Calling checkCompliance agent...");
  try {
    const markdown = await checkCompliance(client, xmlContent);

    // Write output to file
    const outputDir = path.resolve(__dirname, "../output");
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const outputPath = path.join(outputDir, "rco-compliance.md");
    fs.writeFileSync(outputPath, markdown, "utf-8");

    console.log(`\nOutput written to: ${outputPath}`);
    console.log("\n========== COMPLIANCE RESULT ==========\n");
    console.log(markdown);
    console.log("========================================\n");
  } catch (error) {
    console.error(
      "Error calling checkCompliance:",
      error instanceof Error ? error.message : String(error)
    );
  }
}

main();
