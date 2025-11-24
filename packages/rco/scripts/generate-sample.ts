import fs from "fs";
import path from "path";
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
console.log(`Generated ${outputPath}`);
