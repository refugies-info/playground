import fs from "node:fs";
import path from "node:path";
import { convertXmlToMarkdownWithFrontmatter } from "../src/index";

const sampleXmlPath = path.join(__dirname, "../tests/sample.xml");
const outputDir = path.join(__dirname, "../content/formations");
const outputPath = path.join(outputDir, "sample.md");

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

const xml = fs.readFileSync(sampleXmlPath, "utf-8");
const markdown = convertXmlToMarkdownWithFrontmatter(xml);

fs.writeFileSync(outputPath, markdown);
// biome-ignore lint/suspicious/noConsole: It's fine for a script
console.log(`Generated ${outputPath}`);
