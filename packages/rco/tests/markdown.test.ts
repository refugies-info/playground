import fs from "fs";
import path from "path";
import { describe, expect, it } from "vitest";
import {
  convertXmlToMarkdownWithFrontmatter,
  extractMarkdownContent,
} from "../src/markdown";

const sampleXmlPath = path.join(__dirname, "sample.xml");
const sampleXml = fs.readFileSync(sampleXmlPath, "utf-8");

describe("Markdown Module", () => {
  it("should extract Markdown content", () => {
    const markdown = extractMarkdownContent(sampleXml);
    expect(markdown).toContain("# Formation Français Langue Étrangère");
    expect(markdown).toContain("## Objectifs");
    expect(markdown).toContain("Apprendre le français niveau A1.");
    expect(markdown).toContain("## Contenu");
    expect(markdown).toContain("Module 1 : Les bases");
  });

  it("should convert XML to Markdown with Frontmatter", () => {
    const result = convertXmlToMarkdownWithFrontmatter(sampleXml);
    expect(result).toContain("---");
    expect(result).toContain("lheo:");
    expect(result).toContain("# Formation Français Langue Étrangère");
  });
});
