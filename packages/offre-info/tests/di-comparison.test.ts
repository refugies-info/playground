import { describe, expect, it } from "vitest";
import { compareWithDiVersion } from "../src/di-comparison";
import { buildActionDocument } from "../src/document";
import { normalizeSession } from "../src/normalize";
import { rawSession } from "./fixtures";

const rcoDocument = buildActionDocument(
  [normalizeSession(rawSession())],
  "carif-oref--01_999",
);

const diService = (overrides: Record<string, unknown> = {}) => ({
  id: "carif-oref--01_AL1954732",
  nom: "Ouvrir l'école aux parents",
  structure_id: "carif-oref--01_999",
  commune: "Mulhouse",
  extra: {
    action: {
      "nombre-heures-total": "120",
      session: [
        {
          "@numero": "GE1954732",
          periode: { debut: "20250901", fin: "20270131" },
          "etat-recrutement": "1",
        },
      ],
    },
  },
  ...overrides,
});

describe("compareWithDiVersion", () => {
  it("matches DI and RCO values once formats are aligned", () => {
    expect(compareWithDiVersion(diService(), rcoDocument)).toEqual([
      {
        field: "Titre",
        di: "Ouvrir l'école aux parents",
        rco: "Ouvrir l'école aux parents",
        same: true,
      },
      {
        field: "Structure",
        di: "carif-oref--01_999",
        rco: "carif-oref--01_999",
        same: true,
      },
      { field: "Commune", di: "Mulhouse", rco: "Mulhouse", same: true },
      { field: "Heures totales", di: "120", rco: "120", same: true },
      {
        field: "Sessions",
        di: "GE1954732 2025-09-01 → 2027-01-31 (recrutement 1)",
        rco: "GE1954732 2025-09-01 → 2027-01-31 (recrutement 1)",
        same: true,
      },
    ]);
  });

  it("flags differing values", () => {
    const comparison = compareWithDiVersion(
      diService({ nom: "Ancien titre", commune: "Colmar" }),
      rcoDocument,
    );
    expect(
      comparison.filter(({ same }) => !same).map(({ field }) => field),
    ).toEqual(["Titre", "Commune"]);
  });

  it("lists sessions in a stable order and tolerates a missing DI extra", () => {
    const comparison = compareWithDiVersion(
      diService({ extra: undefined }),
      rcoDocument,
    );
    expect(comparison.find(({ field }) => field === "Sessions")).toEqual({
      field: "Sessions",
      di: null,
      rco: "GE1954732 2025-09-01 → 2027-01-31 (recrutement 1)",
      same: false,
    });
  });
});
