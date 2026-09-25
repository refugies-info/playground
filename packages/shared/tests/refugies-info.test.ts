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
    expect(dispositif.translations.fr.content.titreMarque).toBe(null);
  });

  it("sets titreMarque to null when absent (RI keeps its current value)", async () => {
    const { dispositif } = await build({});
    expect(dispositif.translations.fr.content.titreMarque).toBe(null);
  });
});

describe("buildRefugiesInfoPayload logo", () => {
  const logo =
    "https://res.cloudinary.com/ri/image/upload/bomo_logos/doc-1.png";

  it("attaches the metadata logo to the sponsor", async () => {
    const { dispositif } = await build({
      mainSponsor: "CPIE Centre Corse",
      logo,
    });
    expect(dispositif.sponsors).toEqual([{ name: "CPIE Centre Corse", logo }]);
  });

  it("omits the logo key when no logo is set", async () => {
    const { dispositif } = await build({ mainSponsor: "CPIE Centre Corse" });
    expect(dispositif.sponsors).toEqual([{ name: "CPIE Centre Corse" }]);
  });

  it("ignores a blank or non-string logo", async () => {
    const blank = await build({
      mainSponsor: "CPIE Centre Corse",
      logo: "   ",
    });
    expect(blank.dispositif.sponsors).toEqual([{ name: "CPIE Centre Corse" }]);

    const cleared = await build({
      mainSponsor: "CPIE Centre Corse",
      logo: null,
    });
    expect(cleared.dispositif.sponsors).toEqual([
      { name: "CPIE Centre Corse" },
    ]);
  });

  it("drops the logo when no structure is set (RI requires a sponsor name)", async () => {
    const { dispositif } = await build({ logo });
    expect(dispositif.sponsors).toEqual([]);
  });
});
