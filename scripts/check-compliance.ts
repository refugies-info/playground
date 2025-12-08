import * as fs from "node:fs";
import * as path from "node:path";
import { parseLheoXml } from "@playground/rco";
import { logger } from "@playground/shared-types";
import {
  checkCompliance,
  createLettaClient,
} from "../packages/agents/src/index";

async function main() {
  const xmlPath = path.resolve(__dirname, "../packages/rco/samples/rco.xml");

  logger.info({ xmlPath }, "Reading XML file");
  const xmlContent = fs.readFileSync(xmlPath, "utf-8");

  logger.info("Validating LHEO XML...");
  await parseLheoXml(xmlContent); // Validate XML structure

  logger.info("Initializing Letta client...");
  const client = createLettaClient();

  logger.info("Calling checkCompliance agent...");
  try {
    const contentFlowId = "test-flow-id";
    const markdown = await checkCompliance(client, xmlContent, contentFlowId);

    // Write output to file
    const outputDir = path.resolve(__dirname, "../packages/agents/output");
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const outputPath = path.join(outputDir, "rco-compliance.md");
    fs.writeFileSync(outputPath, markdown, "utf-8");
    logger.info({ outputPath }, "Output written to file");
  } catch (error) {
    logger.error(error, "Error calling checkCompliance");
  }
}

main();
