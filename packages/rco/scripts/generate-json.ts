import fs from "node:fs";
import path from "node:path";
import { lheoXmlToJson } from "../src/index";

const sampleXmlPath = path.join(__dirname, "../samples/rco.xml");
const outputDir = path.join(__dirname, "../output");
const outputPath = path.join(outputDir, "rco.json");

(async () => {
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const xml = fs.readFileSync(sampleXmlPath, "utf-8");
  const json = await lheoXmlToJson(xml);

  fs.writeFileSync(outputPath, JSON.stringify(json, null, 2));
  // biome-ignore lint/suspicious/noConsole: It's fine for a script
  console.log(`Generated ${outputPath}`);
})();
