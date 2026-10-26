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

  it("splits glued headings and sentences, and lists the contact", () => {
    const action = buildActionDocument(
      [
        normalizeSession(
          rawSession({
            contenu_formation: "OBJECTIFSLe projet aide.Pour les parents.",
            contact_formation: [
              {
                ligne1: "Afpa Créteil",
                adresse: {
                  ligne1: "9 Rue Marc Seguin",
                  codepostal: "94000",
                  ville: "Créteil",
                },
                telfixe: "0972723936",
                courriel: "contact@afpa.fr",
              },
            ],
          }),
        ),
      ],
      "s",
    );
    const markdown = actionToMarkdown(
      action,
      buildStructureDocument({ nom: "Afpa" }, "s"),
    );
    expect(markdown).toContain(
      "## Contenu\n\n**OBJECTIFS**\n\nLe projet aide.\n\nPour les parents.",
    );
    expect(markdown).toContain(
      "## Coordonnées\n\n- Afpa Créteil\n- 9 Rue Marc Seguin, 94000 Créteil\n- Téléphone : 0972723936\n- Courriel : contact@afpa.fr",
    );
  });
});
