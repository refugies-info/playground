import { describe, it, expect } from "vitest";
import {
  parseLheoXml,
  convertXmlToJson,
  convertXmlToYaml,
  extractMarkdownContent,
  convertXmlToMarkdownWithFrontmatter,
} from "../src/index";
import fs from "fs";
import path from "path";

const sampleXmlPath = path.join(__dirname, "sample.xml");
const sampleXml = fs.readFileSync(sampleXmlPath, "utf-8");

describe("RCO Package", () => {
  it("should parse Lhéo XML", () => {
    const result = parseLheoXml(sampleXml);
    expect(result).toBeDefined();
    expect(result.lheo).toBeDefined();
  });

  it("should convert XML to JSON", () => {
    const json = convertXmlToJson(sampleXml) as any;
    expect(json.lheo).toBeDefined();
    expect(json.lheo["offre-formation"]).toBeDefined();
  });

  it("should convert XML to YAML", () => {
    const yaml = convertXmlToYaml(sampleXml);
    expect(yaml).toContain("lheo:");
    expect(yaml).toContain("offre-formation:");
  });

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
