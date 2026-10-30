import { describe, expect, it } from "vitest";
import {
  isEmptyValue,
  normalizeSourceEntries,
  withoutRepeatedSources,
} from "./helpers";

describe("isEmptyValue", () => {
  it("treats nullish and empty string as empty", () => {
    expect(isEmptyValue(undefined)).toBe(true);
    expect(isEmptyValue(null)).toBe(true);
    expect(isEmptyValue("")).toBe(true);
  });

  it("treats empty arrays and objects as empty", () => {
    expect(isEmptyValue([])).toBe(true);
    expect(isEmptyValue({})).toBe(true);
  });

  it("treats non-empty values as filled", () => {
    expect(isEmptyValue("text")).toBe(false);
    expect(isEmptyValue(0)).toBe(false);
    expect(isEmptyValue(false)).toBe(false);
    expect(isEmptyValue([0])).toBe(false);
    expect(isEmptyValue({ a: 1 })).toBe(false);
  });
});

describe("normalizeSourceEntries", () => {
  it("resolves legacy string paths against DI metadata", () => {
    expect(
      normalizeSourceEntries(["structure.nom"], {
        structure: { nom: "ALF - Apprendre le français" },
      }),
    ).toEqual([{ key: "structure.nom", value: "ALF - Apprendre le français" }]);
  });

  it("uses raw values from object-shaped AI provenance", () => {
    expect(
      normalizeSourceEntries(
        [
          {
            field: "description",
            rawValue: "Le DELF B1 repose sur des savoirs, des savoir-faire...",
          },
        ],
        { description: "Should not be used" },
      ),
    ).toEqual([
      {
        key: "description",
        value: "Le DELF B1 repose sur des savoirs, des savoir-faire...",
      },
    ]);
  });

  it("drops malformed provenance entries", () => {
    expect(
      normalizeSourceEntries(
        [null, 42, { rawValue: "missing field" }, { field: 123 }],
        {},
      ),
    ).toEqual([]);
  });
});

describe("withoutRepeatedSources", () => {
  it("shows a cited text once, in display order", () => {
    const objectif = { field: "objectif_formation", rawValue: "Apprendre" };
    const rows = withoutRepeatedSources([
      { key: "abstract", source: [objectif] },
      { key: "theme", source: [objectif] },
    ]);
    expect(rows[0].source).toEqual([objectif]);
    expect(rows[1].source).toEqual([
      { field: "objectif_formation", rawValue: "voir plus haut" },
    ]);
  });
});

describe("normalizeSourceEntries code labels", () => {
  it("labels the RCO codes", () => {
    expect(
      normalizeSourceEntries(
        [{ field: "code_public_vise", rawValue: ["81023", "99999"] }],
        {},
      ),
    ).toEqual([
      { key: "code_public_vise", value: "81023 (Primo-arrivant), 99999" },
    ]);
  });
});
