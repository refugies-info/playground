import { describe, expect, it } from "vitest";
import { extractEditorialNotes, removeEditorialNotes } from "./editorial-notes";

const markdown = [
  "# Titre",
  "Description",
  "## Comment faire ?",
  "Étapes",
  "### Autres informations",
  "Niveau A1",
  "### Pour aller plus loin",
  "- Source 1",
  "### Journal des Avertissements",
  "| Règle | Détail |\n| --- | --- |\n| R1 | trop long |",
  "### Lexique",
  "**CIR** : contrat",
].join("\n\n");

describe("extractEditorialNotes", () => {
  it("keeps only the editor-facing sections", () => {
    expect(extractEditorialNotes(markdown)).toBe(
      [
        "### Autres informations",
        "Niveau A1",
        "### Pour aller plus loin",
        "- Source 1",
        "### Journal des Avertissements",
        "| Règle | Détail |\n| --- | --- |\n| R1 | trop long |",
      ].join("\n\n"),
    );
  });

  it("returns an empty string without such sections", () => {
    expect(extractEditorialNotes("# Titre\n\nTexte")).toBe("");
  });
});

describe("removeEditorialNotes", () => {
  it("drops the editor-facing sections and keeps the rest intact", () => {
    expect(removeEditorialNotes(`---\n---\n\n${markdown}\n`)).toBe(
      "---\n---\n\n# Titre\n\nDescription\n\n## Comment faire ?\n\nÉtapes\n\n### Lexique\n\n**CIR** : contrat\n",
    );
  });
});
