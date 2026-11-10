import { describe, expect, it } from "vitest";
import { toSearchOrFilters, toSearchPatterns } from "./search-patterns";

const matchesAll = (text: string, search: string) =>
  toSearchPatterns(search).every((pattern) =>
    new RegExp(pattern, "i").test(text),
  );

describe("toSearchPatterns", () => {
  const title = "Actions socio-linguistiques complémentaires du CIR – ASL";

  it("ignores dashes, word order and accents", () => {
    expect(
      matchesAll(
        title,
        "Actions socio-linguistiques complémentaires du CIR - ASL",
      ),
    ).toBe(true);
    expect(matchesAll(title, "ASL complementaires")).toBe(true);
    expect(matchesAll("Accès à l’emploi", "acces a l'emploi")).toBe(true);
  });

  it("requires every word", () => {
    expect(matchesAll(title, "actions français")).toBe(false);
  });

  it("drops punctuation-only input", () => {
    expect(toSearchPatterns(" - – , ")).toEqual([]);
  });
});

describe("toSearchOrFilters", () => {
  it("builds one quoted imatch group per word", () => {
    expect(toSearchOrFilters(["title", "commune"], "BTP")).toEqual([
      `title.imatch."btp",commune.imatch."btp"`,
    ]);
  });
});
