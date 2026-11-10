import { describe, expect, it } from "vitest";
import { buildActionDocument } from "../src/document";
import { mapMetadata, metadataKeysForAi } from "../src/metadata/metadata-rules";
import { normalizeSession } from "../src/normalize";
import { rawSession } from "./fixtures";

const TODAY = "2026-10-19";

const valuesOf = (overrides: Record<string, unknown> = {}) => {
  const action = buildActionDocument(
    [normalizeSession(rawSession(overrides))],
    "carif-oref--01_999",
  );
  const fields = mapMetadata(action, TODAY);
  return {
    values: Object.fromEntries(fields.map((f) => [f.key, f.value])),
    forAi: metadataKeysForAi(fields),
  };
};

describe("mapMetadata", () => {
  it("maps the API codes and figures without AI", () => {
    const { values, forAi } = valuesOf({
      contact_formation: [{ courriel: "a@b.fr", telfixe: "0102" }],
    });
    expect(values).toMatchObject({
      mainSponsor: "Ecole Test",
      location: ["68 - Haut-Rhin"],
      commitment: { amountDetails: "exactly", hours: [120], timeUnit: "hours" },
      price: { values: [0] },
      publicStatus: [
        "asile",
        "refugie",
        "subsidiaire",
        "temporaire",
        "apatride",
      ],
      periode: {
        modalitesEntreesSorties: null,
        items: [
          {
            startDate: "2025-09-01T00:00:00.000Z",
            endDate: "2027-01-31T00:00:00.000Z",
          },
        ],
      },
      map: [
        {
          city: "Mulhouse",
          lat: 47.757,
          lng: 7.32342,
          email: "a@b.fr",
          phone: "0102",
        },
      ],
    });
    expect(forAi).toEqual([
      "abstract",
      "theme",
      "secondaryThemes",
      "needs",
      "public",
      "frequency",
      "frenchLevel",
      "age",
      "timeSlots",
      "conditions",
    ]);
  });

  it("covers the whole Île-de-France and distance learning", () => {
    const paris = valuesOf({ lieu_formation: [{ departement: "93" }] });
    expect(paris.values.location).toHaveLength(8);
    expect(valuesOf({ modalites_enseignement: 2 }).values.location).toBe(
      "online",
    );
  });

  it("leaves to the AI what the data does not settle", () => {
    const { forAi } = valuesOf({
      nombre_heures_total: null,
      frais_restants: "selon financement",
      code_public_vise: ["83056"],
    });
    expect(forAi).toEqual(
      expect.arrayContaining(["commitment", "price", "publicStatus"]),
    );
    expect(valuesOf({ frais_restants: "1 200,50 €" }).values.price).toEqual({
      values: [1200.5],
    });
  });
});
