import { describe, expect, it } from "vitest";
import { buildRefugiesInfoPayload } from "../src/lib/publication/refugies-info";

const build = (metadata: Record<string, unknown>) =>
  buildRefugiesInfoPayload({
    title: "Titre informatif",
    markdown: "# Titre informatif\n\nContenu",
    metadata,
  });

describe("buildRefugiesInfoPayload titreMarque", () => {
  it("passes through an editorial titreMarque string", async () => {
    const { dispositif } = await build({ titreMarque: "Ma marque" });
    expect(dispositif.translations.fr.content.titreMarque).toBe("Ma marque");
  });

  it("maps an explicit null to an empty string so RI clears the field", async () => {
    const { dispositif } = await build({ titreMarque: null });
    // "" is a string => RI's `isString(body.titreMarque)` check overwrites the value.
    expect(dispositif.translations.fr.content.titreMarque).toBe("");
  });

  it("leaves titreMarque undefined when absent (RI keeps its current value)", async () => {
    const { dispositif } = await build({});
    expect(dispositif.translations.fr.content.titreMarque).toBeUndefined();
  });
});
