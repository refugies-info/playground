import { describe, expect, it } from "vitest";
import {
  applyAiDecisions,
  checkCompliance,
  overallVerdict,
} from "../src/arbitrage/compliance-rules";
import {
  createDispositifIndex,
  findDuplicateCandidates,
} from "../src/arbitrage/duplicate-candidates";
import { buildActionDocument } from "../src/document";
import { normalizeSession } from "../src/normalize";
import { rawSession } from "./fixtures";

const TODAY = "2026-10-19";

const actionWith = (overrides: Record<string, unknown> = {}) =>
  buildActionDocument(
    [normalizeSession(rawSession(overrides))],
    "carif-oref--01_999",
  );

const verdicts = (overrides: Record<string, unknown> = {}) =>
  Object.fromEntries(
    checkCompliance(actionWith(overrides), TODAY).map((c) => [
      c.criterion,
      c.verdict,
    ]),
  );

describe("checkCompliance", () => {
  it("decides every criterion it can and leaves the scheme type to the AI", () => {
    expect(verdicts()).toEqual({
      agreement: "accepted",
      funder: "accepted",
      audience: "accepted",
      sessions: "accepted",
      hours: "accepted",
      scheme_type: "ai",
    });
  });

  it("refuses on deterministic data", () => {
    expect(
      verdicts({
        conventionnement: false,
        organisme_financeur: [{ code_financeur: "10" }],
        nombre_heures_total: 12,
        date_fin: "2026-01-01",
      }),
    ).toMatchObject({
      agreement: "refused",
      funder: "refused",
      sessions: "refused",
      hours: "refused",
    });
  });

  it("closes fixed-entry sessions once started", () => {
    expect(verdicts({ modalites_entrees_sorties: false }).sessions).toBe(
      "refused",
    );
    expect(verdicts({ modalites_entrees_sorties: true }).sessions).toBe(
      "accepted",
    );
  });

  it("sends texts to the AI only when codes and numbers are not enough", () => {
    expect(verdicts({ code_public_vise: ["80006"] }).audience).toBe("ai");
    expect(
      verdicts({ nombre_heures_total: null, duree_indicative: "100 heures" })
        .hours,
    ).toBe("accepted");
    expect(
      verdicts({ nombre_heures_total: null, duree_indicative: "6 mois" }).hours,
    ).toBe("ai");
  });

  it("lets the AI settle open criteria", () => {
    const results = checkCompliance(actionWith(), TODAY);
    expect(overallVerdict(results)).toBe("ai");
    const settled = applyAiDecisions(results, [
      { criterion: "scheme_type", verdict: "refused", reason: "OEPRE" },
    ]);
    expect(overallVerdict(settled)).toBe("refused");
  });
});

describe("findDuplicateCandidates", () => {
  it("shortlists dispositifs by title and sponsor in the same area", async () => {
    const index = await createDispositifIndex([
      {
        id: "a",
        titreInformatif: "Ouvrir l'école aux parents pour la réussite",
        location: ["68 - Haut-Rhin"],
        mainSponsorNom: "Ecole Test",
      },
      {
        id: "b",
        titreInformatif: "Ouvrir l'école aux parents",
        location: ["75 - Paris"],
      },
      { id: "c", titreInformatif: "Passer le permis", location: "france" },
    ]);
    const candidates = await findDuplicateCandidates(index, actionWith());
    const ids = candidates.map((c) => c.id);
    expect(ids[0]).toBe("a");
    expect(ids).not.toContain("b");
  });
});
