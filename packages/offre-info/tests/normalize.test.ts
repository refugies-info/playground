import { describe, expect, it } from "vitest";
import { normalizeSession } from "../src/normalize";
import { rawSession } from "./fixtures";

describe("normalizeSession", () => {
  it("converts kebab-case keys to snake_case at any depth", () => {
    const session = normalizeSession(rawSession());
    expect(session.organisme_responsable?.coordonnees).toMatchObject({
      adresse_ligne1: "1 rue Test",
      code_INSEE_commune: "68224",
    });
  });

  it("parses coordinates as numbers", () => {
    const session = normalizeSession(rawSession());
    expect(session.lieu_formation).toEqual([
      {
        ville: "Mulhouse",
        departement: "68",
        latitude: 47.757,
        longitude: 7.32342,
      },
    ]);
  });

  it("fills omitted swagger fields with null and omitted lists with []", () => {
    const session = normalizeSession(rawSession());
    expect(session.prix_total_TTC).toBeNull();
    expect(session.duree_indicative).toBeNull();
    expect(session.recrutements).toEqual([]);
  });

  it("wraps a single object into an array for list fields", () => {
    const session = normalizeSession(
      rawSession({ lieu_formation: { ville: "Metz" } }),
    );
    expect(session.lieu_formation).toEqual([{ ville: "Metz" }]);
  });

  it("drops keys unknown to the swagger schema", () => {
    const session = normalizeSession(rawSession({ unexpected: 1 }));
    expect("unexpected" in session).toBe(false);
  });

  it("rejects a payload without numero_action", () => {
    expect(() => normalizeSession({ id: "x" })).toThrow();
  });
});
