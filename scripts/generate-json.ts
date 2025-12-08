import fs from "node:fs";
import path from "node:path";
import { logger } from "@playground/shared-types";
import Ajv from "ajv";
import { lheoXmlToJson } from "../packages/rco/src/index";

const sampleXmlPath = path.join(__dirname, "../packages/rco/samples/rco.xml");
const outputDir = path.join(__dirname, "../packages/rco/output");
const outputPath = path.join(outputDir, "rco.json");
const schemaPath = path.join(__dirname, "../packages/rco/json-schema.json");

(async () => {
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const xml = fs.readFileSync(sampleXmlPath, "utf-8");
  const json = await lheoXmlToJson(xml);

  const schema = JSON.parse(fs.readFileSync(schemaPath, "utf-8"));
  const ajv = new Ajv({ allErrors: true });
  const validate = ajv.compile(schema);
  const valid = validate(json);
  if (!valid) {
    throw new Error(
      `Generated JSON failed schema validation: ${JSON.stringify(
        validate.errors,
        null,
        2,
      )}`,
    );
  }

  fs.writeFileSync(outputPath, JSON.stringify(json, null, 2));

  logger.info(`Generated ${outputPath}`);
})();
