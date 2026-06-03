import { describe, expect, it } from "vitest";
import { normalizeSourceEntries } from "./helpers";

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
