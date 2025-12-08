import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { logger } from "@playground/shared-types";
import { dump } from "js-yaml";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const inputPath = path.join(
  __dirname,
  "../packages/agents/samples/dispositifs.json",
);
const outputPath = path.join(
  __dirname,
  "../packages/agents/samples/dispositifs.yaml",
);

try {
  logger.info(`Reading from ${inputPath}...`);
  const jsonContent = fs.readFileSync(inputPath, "utf8");
  const data = JSON.parse(jsonContent);

  logger.info("Converting to YAML...");
  const yamlContent = dump(data, {
    indent: 2,
    lineWidth: -1, // Don't wrap long lines
    noRefs: true, // Don't use aliases
  });

  fs.writeFileSync(outputPath, yamlContent, "utf8");
  logger.info(`Successfully converted to ${outputPath}`);
} catch (error) {
  logger.error(error, "Error converting file");
  process.exit(1);
}
