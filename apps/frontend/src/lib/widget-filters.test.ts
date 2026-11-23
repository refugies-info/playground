import { describe, expect, it } from "vitest";
import {
  normalizeFilters,
  searchDepartments,
  toggleValue,
} from "./widget-filters";

describe("toggleValue", () => {
  it("adds a missing value and removes a present one", () => {
    expect(toggleValue(undefined, "a")).toEqual(["a"]);
    expect(toggleValue(["a"], "b")).toEqual(["a", "b"]);
    expect(toggleValue(["a", "b"], "a")).toEqual(["b"]);
  });
});

describe("normalizeFilters", () => {
  it("keeps the known categories only, empty ones included", () => {
    const filters = normalizeFilters({
      departments: ["Gironde"],
      _id: "x",
    } as never);
    expect(filters).not.toHaveProperty("_id");
    expect(filters).toMatchObject({ departments: ["Gironde"], themes: [] });
  });
});

describe("searchDepartments", () => {
  it("ignores case and accents", () => {
    expect(searchDepartments("cote")).toEqual(
      expect.arrayContaining(["Côte-d'Or", "Côtes-d'Armor"]),
    );
    expect(searchDepartments("GIRONDE")).toEqual(["Gironde"]);
  });

  it("returns nothing when no department matches", () => {
    expect(searchDepartments("zzz")).toEqual([]);
  });
});
