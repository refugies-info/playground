import { computeContentHash } from "@playground/supabase/ingestion-runs";
import { describe, expect, it } from "vitest";
import { buildActionDocument } from "../src/document";
import { normalizeSession } from "../src/normalize";
import { rawSession } from "./fixtures";

const first = normalizeSession(rawSession());
const second = normalizeSession(
  rawSession({
    id: "01_AL2747301_AL1954732GE2000000",
    numero_session: "GE2000000",
    date_debut: "2026-10-01",
    datemaj: "2026-09-01",
    intitule_formation: "Titre mis à jour",
  }),
);

describe("buildActionDocument", () => {
  it("builds one document per action with DI-compatible id", () => {
    const document = buildActionDocument([first], "carif-oref--01_999");
    expect(document.id).toBe("carif-oref--01_AL1954732");
    expect(document.source).toBe("carif-oref");
    expect(document.structure_id).toBe("carif-oref--01_999");
  });

  it("moves session-level fields into sorted sessions", () => {
    const document = buildActionDocument([second, first], "s");
    expect("date_debut" in document).toBe(false);
    expect(document.sessions.map((session) => session.date_debut)).toEqual([
      "2025-09-01",
      "2026-10-01",
    ]);
  });

  it("takes action fields from the most recently updated session", () => {
    const document = buildActionDocument([first, second], "s");
    expect(document.nom).toBe("Titre mis à jour");
  });

  it("hashes identically whatever the session order", () => {
    expect(computeContentHash(buildActionDocument([first, second], "s"))).toBe(
      computeContentHash(buildActionDocument([second, first], "s")),
    );
  });

  it("rejects an action without sessions", () => {
    expect(() => buildActionDocument([], "s")).toThrow();
  });
});
