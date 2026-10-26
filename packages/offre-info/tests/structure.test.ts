import { describe, expect, it } from "vitest";
import { buildStructureDocument, resolveStructureId } from "../src/structure";

const structureIdBySiret = new Map([["111", "carif-oref--01_999"]]);

describe("resolveStructureId", () => {
  it("keeps the structure of an already known action (DI continuity)", () => {
    expect(
      resolveStructureId({
        knownStructureId: "carif-oref--01_42",
        siret: "111",
        structureIdBySiret,
      }),
    ).toBe("carif-oref--01_42");
  });

  it("reuses an existing structure with the same siret", () => {
    expect(
      resolveStructureId({
        knownStructureId: null,
        siret: "111",
        structureIdBySiret,
      }),
    ).toBe("carif-oref--01_999");
  });

  it("derives a new id from the siret", () => {
    expect(
      resolveStructureId({
        knownStructureId: null,
        siret: "222",
        structureIdBySiret,
      }),
    ).toBe("carif-oref--siret-222");
  });

  it("returns null without siret for an unknown action", () => {
    expect(
      resolveStructureId({
        knownStructureId: null,
        siret: null,
        structureIdBySiret,
      }),
    ).toBeNull();
  });
});

describe("buildStructureDocument", () => {
  it("maps organisme_responsable onto the resolved id", () => {
    expect(
      buildStructureDocument(
        { siret: "111", nom: "Ecole", raison_sociale: "Etab" },
        "id-1",
      ),
    ).toEqual({
      id: "id-1",
      nom: "Ecole",
      source: "carif-oref",
      siret: "111",
      raison_sociale: "Etab",
      numero_activite: null,
      coordonnees: null,
      contact: [],
    });
  });
});
