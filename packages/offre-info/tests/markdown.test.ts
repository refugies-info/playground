import { describe, expect, it } from "vitest";
import { buildActionDocument } from "../src/document";
import { actionToMarkdown } from "../src/markdown";
import { normalizeSession } from "../src/normalize";
import { buildStructureDocument } from "../src/structure";
import { rawSession } from "./fixtures";

describe("actionToMarkdown", () => {
  it("renders frontmatter, title and plain-text sections", () => {
    const action = buildActionDocument([normalizeSession(rawSession())], "s");
    const markdown = actionToMarkdown(
      action,
      buildStructureDocument({ nom: "Ecole" }, "s"),
    );
    expect(markdown.startsWith("---\n")).toBe(true);
    expect(markdown).toContain("# Ouvrir l'école aux parents");
    expect(markdown).toContain("Améliorer le français");
    expect(markdown).toContain("## Contenu\n\nTrois axes\nLangue");
    const body = markdown.split("\n---\n\n")[1] ?? "";
    expect(body).not.toContain("<p>");
  });
});
