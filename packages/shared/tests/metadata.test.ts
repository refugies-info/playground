import { describe, expect, it } from "vitest";
import { extractDiff, mergeMetadata } from "../src/lib/metadata";

describe("mergeMetadata", () => {
  it("should return base when no overrides", () => {
    const base = { theme: "abc", price: 0 };
    const result = mergeMetadata(base, null);

    expect(result).toEqual(base);
    // Should be a copy, not the same reference
    expect(result).not.toBe(base);
  });

  it("should return base when overrides is empty", () => {
    const base = { theme: "abc" };
    const result = mergeMetadata(base, {});

    expect(result).toEqual(base);
  });

  it("should override primitive values", () => {
    const base = { theme: "abc", titreMarque: "Old" };
    const overrides = { titreMarque: "New" };
    const result = mergeMetadata(base, overrides);

    expect(result).toEqual({ theme: "abc", titreMarque: "New" });
  });

  it("should add new fields", () => {
    const base = { theme: "abc" };
    const overrides = { newField: "value" };
    const result = mergeMetadata(base, overrides);

    expect(result).toEqual({ theme: "abc", newField: "value" });
  });

  it("should clear field when override is null", () => {
    const base = { theme: "abc", price: 50 };
    const overrides = { price: null };
    const result = mergeMetadata(base, overrides);

    expect(result).toEqual({ theme: "abc" });
    expect("price" in result).toBe(false);
  });

  it("should ignore undefined values in overrides", () => {
    const base = { theme: "abc", price: 50 };
    const overrides = { price: undefined };
    const result = mergeMetadata(base, overrides);

    // price should remain 50 (undefined doesn't override)
    expect(result).toEqual({ theme: "abc", price: 50 });
  });

  it("should deep merge nested objects", () => {
    const base = {
      price: { values: [0], details: "once" },
      theme: "abc",
    };
    const overrides = {
      price: { values: [50] },
    };
    const result = mergeMetadata(base, overrides);

    expect(result).toEqual({
      price: { values: [50], details: "once" },
      theme: "abc",
    });
  });

  it("should replace arrays (not merge)", () => {
    const base = {
      frenchLevel: ["A1", "A2"],
    };
    const overrides = {
      frenchLevel: ["B1", "B2"],
    };
    const result = mergeMetadata(base, overrides);

    expect(result).toEqual({
      frenchLevel: ["B1", "B2"],
    });
  });

  it("should handle complex nested merge", () => {
    const base = {
      titreMarque: "Formation",
      price: {
        values: [0],
        details: "once",
      },
      age: {
        type: "between",
        ages: [18, 65],
      },
    };
    const overrides = {
      titreMarque: "Nouvelle Formation",
      price: {
        values: [50],
      },
    };
    const result = mergeMetadata(base, overrides);

    expect(result).toEqual({
      titreMarque: "Nouvelle Formation",
      price: {
        values: [50],
        details: "once",
      },
      age: {
        type: "between",
        ages: [18, 65],
      },
    });
  });
});

describe("extractDiff", () => {
  it("should return empty object when no changes", () => {
    const original = { theme: "abc", price: 50 };
    const edited = { theme: "abc", price: 50 };
    const diff = extractDiff(original, edited);

    expect(diff).toEqual({});
  });

  it("should return changed primitive values", () => {
    const original = { theme: "abc", titreMarque: "Old" };
    const edited = { theme: "abc", titreMarque: "New" };
    const diff = extractDiff(original, edited);

    expect(diff).toEqual({ titreMarque: "New" });
  });

  it("should return new fields", () => {
    const original = { theme: "abc" };
    const edited = { theme: "abc", newField: "value" };
    const diff = extractDiff(original, edited);

    expect(diff).toEqual({ newField: "value" });
  });

  it("should detect changes in nested objects", () => {
    const original = {
      price: { values: [0], details: "once" },
    };
    const edited = {
      price: { values: [50], details: "once" },
    };
    const diff = extractDiff(original, edited);

    expect(diff).toEqual({
      price: { values: [50] },
    });
  });

  it("should detect array changes", () => {
    const original = {
      frenchLevel: ["A1", "A2"],
    };
    const edited = {
      frenchLevel: ["A1", "A2", "B1"],
    };
    const diff = extractDiff(original, edited);

    expect(diff).toEqual({
      frenchLevel: ["A1", "A2", "B1"],
    });
  });

  it("should return empty diff for identical nested objects", () => {
    const original = {
      price: { values: [0], details: "once" },
      theme: "abc",
    };
    const edited = {
      price: { values: [0], details: "once" },
      theme: "abc",
    };
    const diff = extractDiff(original, edited);

    expect(diff).toEqual({});
  });

  it("should handle complex diff", () => {
    const original = {
      titreMarque: "Formation",
      price: {
        values: [0],
        details: "once",
      },
      age: {
        type: "between",
        ages: [18, 65],
      },
    };
    const edited = {
      titreMarque: "Nouvelle Formation",
      price: {
        values: [50],
        details: "once",
      },
      age: {
        type: "between",
        ages: [18, 65],
      },
    };
    const diff = extractDiff(original, edited);

    expect(diff).toEqual({
      titreMarque: "Nouvelle Formation",
      price: {
        values: [50],
      },
    });
  });
});

describe("mergeMetadata + extractDiff integration", () => {
  it("should merge and extract diff correctly", () => {
    const base = {
      theme: "abc",
      price: { values: [0], details: "once" },
    };
    const overrides = {
      titreMarque: "New",
      price: { values: [50] },
    };

    // Merge
    const merged = mergeMetadata(base, overrides);
    expect(merged).toEqual({
      theme: "abc",
      titreMarque: "New",
      price: { values: [50], details: "once" },
    });

    // Diff (comparing merged to base to get what changed)
    const diff = extractDiff(base, merged);
    expect(diff).toEqual({
      titreMarque: "New",
      price: { values: [50] },
    });
  });

  it("should handle real-world metadata scenario", () => {
    // Simulating letta_report.metadata_ri
    const lettaMetadata = {
      titreMarque: "Formation Français Langue Étrangère",
      abstract: "Apprendre le français",
      theme: "theme-id-123",
      publicStatus: ["asile", "refugie"],
      frenchLevel: ["A1", "A2"],
      price: {
        values: [0],
        details: "once",
      },
    };

    // Simulating editorial_record.metadata (user modifications)
    const editorialOverrides = {
      titreMarque: "Formation FLE - Niveau Débutant",
      price: {
        values: [50],
        details: "month",
      },
    };

    // Merge for display/publication
    const merged = mergeMetadata(lettaMetadata, editorialOverrides);
    expect(merged.titreMarque).toBe("Formation FLE - Niveau Débutant");
    expect(merged.price).toEqual({ values: [50], details: "month" });
    expect(merged.publicStatus).toEqual(["asile", "refugie"]); // Preserved from base

    // Diff for saving back to editorial_record
    const diff = extractDiff(lettaMetadata, merged);
    expect(diff).toEqual({
      titreMarque: "Formation FLE - Niveau Débutant",
      price: {
        values: [50],
        details: "month",
      },
    });
  });
});
