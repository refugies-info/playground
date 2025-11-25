import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import {
  extractMarkdownContent,
  lheoXmlToMarkdownWithFrontmatter,
} from "../src/markdown";

const sampleXmlPath = path.join(__dirname, "../samples/rco.xml");
const sampleXml = fs.readFileSync(sampleXmlPath, "utf-8");

describe("Markdown Module", () => {
  it("should extract Markdown content", async () => {
    const markdown = await extractMarkdownContent(sampleXml);
    expect(markdown).toContain("# Cours de français langue d'intégration");
    expect(markdown).toContain("## Objectifs");
    expect(markdown).toContain(
      "L'objectif du cours de Français Langue d'Intégration est d'apporter de l'aide dans les processus de socialisation des populations migrantes par l'apprentissage du français.",
    );
    expect(markdown).toContain("## Contenu");
    expect(markdown).toContain(
      "Proposition de cours de niveau A1, A2, B1, de cours de conversation, de cours d'alphabétisation.",
    );
  });

  it("should convert XML to Markdown with Frontmatter", async () => {
    const result = await lheoXmlToMarkdownWithFrontmatter(sampleXml);
    expect(result).toContain("---");
    expect(result).toContain("lheo:");
    expect(result).toContain("# Cours de français langue d'intégration");
  });
});
