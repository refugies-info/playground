/** biome-ignore-all lint/suspicious/noConsole: It's fine for a script */
import * as fs from "node:fs";
import * as path from "node:path";
import { parseLheoXml } from "@playground/rco";
import {
  checkDuplicates,
  createLettaClient,
} from "../packages/agents/src/index";

async function main() {
  const xmlPath = path.resolve(__dirname, "../packages/rco/samples/rco.xml");

  console.log("Reading XML file:", xmlPath);
  const xmlContent = fs.readFileSync(xmlPath, "utf-8");

  console.log("Validating LHEO XML...");
  await parseLheoXml(xmlContent); // Validate XML structure

  console.log("Initializing Letta client...");
  const client = createLettaClient();

  console.log("Calling checkDuplicates agent...");
  try {
    const markdown = await checkDuplicates(client, xmlContent);

    // Write output to file
    const outputDir = path.resolve(__dirname, "../packages/agents/output");
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const outputPath = path.join(outputDir, "rco-duplicates.md");
    fs.writeFileSync(outputPath, markdown, "utf-8");
    console.log("Output written to:", outputPath);
  } catch (error) {
    console.error(
      "Error calling checkDuplicates:",
      error instanceof Error ? error.message : String(error),
    );
  }
}

main();
