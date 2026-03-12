import { describe, expect, it } from "vitest";
import { computeContentHash } from "../../src/ingest/shared";

describe("computeContentHash", () => {
  it("should generate the same hash for the same object", () => {
    const obj = { start: "2024-01-01", end: "2024-12-31", id: 123 };
    const hash1 = computeContentHash(obj);
    const hash2 = computeContentHash(obj);
    expect(hash1).toBe(hash2);
  });

  it("should generate the same hash for objects with different key orders", () => {
    const obj1 = { a: 1, b: 2, c: [3, 4] };
    const obj2 = { c: [3, 4], b: 2, a: 1 };

    expect(JSON.stringify(obj1)).not.toBe(JSON.stringify(obj2)); // sanity check

    const hash1 = computeContentHash(obj1);
    const hash2 = computeContentHash(obj2);

    expect(hash1).toBe(hash2);
  });

  it("should generate different hashes for different content", () => {
    const obj1 = { a: 1, b: 2 };
    const obj2 = { a: 1, b: 3 };

    const hash1 = computeContentHash(obj1);
    const hash2 = computeContentHash(obj2);

    expect(hash1).not.toBe(hash2);
  });

  it("should handle nested objects deterministically", () => {
    const obj1 = { meta: { version: 1, author: "me" }, data: [1, 2] };
    const obj2 = { data: [1, 2], meta: { author: "me", version: 1 } };

    const hash1 = computeContentHash(obj1);
    const hash2 = computeContentHash(obj2);

    expect(hash1).toBe(hash2);
  });

  it("should generate the same hash for arrays with values in different order", () => {
    // DI API may return the same array values in different order between runs
    // e.g. modes_mobilisation: ["envoyer-un-courriel", "telephoner"] vs ["telephoner", "envoyer-un-courriel"]
    const obj1 = { modes_mobilisation: ["envoyer-un-courriel", "telephoner"] };
    const obj2 = { modes_mobilisation: ["telephoner", "envoyer-un-courriel"] };

    const hash1 = computeContentHash(obj1);
    const hash2 = computeContentHash(obj2);

    expect(hash1).toBe(hash2);
  });

  it("should generate the same hash for nested arrays with values in different order", () => {
    const obj1 = { a: 1, tags: ["z", "a", "m"], meta: { codes: ["21", "58", "70"] } };
    const obj2 = { a: 1, tags: ["m", "z", "a"], meta: { codes: ["70", "21", "58"] } };

    const hash1 = computeContentHash(obj1);
    const hash2 = computeContentHash(obj2);

    expect(hash1).toBe(hash2);
  });

  it("should work with strings (legacy support)", () => {
    const str = '{"a":1}';
    const hash = computeContentHash(str);
    expect(hash).toBeDefined();
    expect(hash.length).toBe(40); // SHA-1 hex
  });
});
