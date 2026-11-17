import { describe, expect, it } from "vitest";
import { injectFrontmatterContent } from "../src/lib/markdown";

describe("injectFrontmatterContent", () => {
  it("rebuilds DI content from the frontmatter", () => {
    const markdown =
      "---\nnom: Cours\ndescription: Texte DI\nconditions_acces: Aucune\n---\n\n# Cours\n";
    expect(injectFrontmatterContent(markdown)).toBe(
      "# Cours\n\nTexte DI\n\n## Conditions d'accès\n\nAucune",
    );
  });

  it("keeps the RCO body, which holds the text", () => {
    const markdown =
      "---\nnom: Cours\nobjectif_formation: Objectif\n---\n\n# Cours\n\nObjectif\n\n## Contenu\n\nTrois axes\n";
    expect(injectFrontmatterContent(markdown)).toBe(
      "# Cours\n\nObjectif\n\n## Contenu\n\nTrois axes",
    );
  });
});
