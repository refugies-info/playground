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
      "titreMarque",
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

describe("mapPlaces contacts", () => {
  it("takes each value from the closest contact that has it", () => {
    const [place] = valuesOf({
      lieu_formation: [{ ville: "Mulhouse", telfixe1: "0300" }],
      contact_session: [{ courriel: "session@b.fr", telfixe: "0200" }],
      contact_formation: [{ courriel: "formation@b.fr" }],
    }).values.map as Record<string, unknown>[];
    expect(place).toMatchObject({ phone: "0300", email: "session@b.fr" });
  });

  it("falls back to the organisme", () => {
    const [place] = valuesOf({
      organisme_responsable: {
        nom: "Ecole Test",
        coordonnees: { telfixe1: "0100", courriel: "orga@b.fr" },
      },
    }).values.map as Record<string, unknown>[];
    expect(place).toMatchObject({ phone: "0100", email: "orga@b.fr" });
  });
});

describe("periode", () => {
  it("keeps a started session while registration is open (Q21)", () => {
    const started = {
      modalites_entrees_sorties: false,
      date_debut: "2026-10-01",
      date_fin: "2026-12-10",
    };
    expect(valuesOf(started).values.periode).toMatchObject({ items: null });
    expect(
      valuesOf({ ...started, periode_inscription_fin: "2026-11-17" }).values
        .periode,
    ).toMatchObject({ items: [{ startDate: "2026-10-01T00:00:00.000Z" }] });
  });
});
