import fs from "node:fs";
import path from "node:path";
import { lheoXmlToMarkdownWithFrontmatter } from "../packages/rco/src/index";

const sampleXmlPath = path.join(__dirname, "../packages/rco/samples/rco.xml");
const outputDir = path.join(__dirname, "../packages/rco/output");
const outputPath = path.join(outputDir, "rco.md");

(async () => {
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const xml = fs.readFileSync(sampleXmlPath, "utf-8");
  const markdown = await lheoXmlToMarkdownWithFrontmatter(xml);

  fs.writeFileSync(outputPath, markdown);
  // biome-ignore lint/suspicious/noConsole: It's fine for a script
  console.log(`Generated ${outputPath}`);
})();
