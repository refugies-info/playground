import { describe, expect, it } from "vitest";
import {
  applyAiDecisions,
  checkCompliance,
  criteriaForAi,
  overallVerdict,
  toArbitrationDocument,
} from "../src/arbitrage/compliance-rules";
import {
  actionCities,
  actionDepartments,
  actionPostalCodes,
  hasCertainDuplicate,
  toCandidate,
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
        date_fin: "2026-01-01",
      }),
    ).toMatchObject({
      agreement: "refused",
      funder: "refused",
      sessions: "refused",
    });
  });

  it("sends missing or low hours to the AI instead of refusing", () => {
    expect(verdicts({ nombre_heures_total: 12 }).hours).toBe("ai");
    expect(
      verdicts({ nombre_heures_total: null, duree_indicative: null }).hours,
    ).toBe("ai");
    expect(
      toArbitrationDocument(actionWith({ nombre_heures_total: 12 }))
        .nombre_heures_total,
    ).toBe(12);
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

  it("explains codes and entry mode in the reasons", () => {
    const reasons = Object.fromEntries(
      checkCompliance(
        actionWith({
          organisme_financeur: [{ code_financeur: "19" }],
          code_public_vise: ["83056"],
          modalites_entrees_sorties: false,
          date_debut: "2026-09-21",
        }),
        TODAY,
      ).map((c) => [c.criterion, c.reason]),
    );
    expect(reasons.funder).toContain("19 (État - Ministère de l'intérieur)");
    expect(reasons.audience).toContain("83056 (Tout public)");
    expect(
      checkCompliance(
        actionWith({ code_public_vise: ["80006", "81024"] }),
        TODAY,
      ).find((c) => c.criterion === "audience")?.reason,
    ).toContain("80006 (Demandeur d'emploi), 81024 (Jeunes)");
    expect(reasons.sessions).toBe(
      "entrées à dates fixes : aucune session ouverte, déjà commencée le 21/09/2026",
    );
  });

  it("still sends open criteria to the AI when a rule refuses the record", () => {
    const results = checkCompliance(
      actionWith({ conventionnement: false }),
      TODAY,
    );
    expect(overallVerdict(results)).toBe("refused");
    expect(criteriaForAi(results).map((c) => c.criterion)).toEqual([
      "scheme_type",
    ]);
    expect(results.map((c) => c.reason).join()).not.toContain("Non vérifié");
  });

  it("lets the AI settle open criteria", () => {
    const results = checkCompliance(actionWith(), TODAY);
    expect(overallVerdict(results)).toBe("ai");
    const settled = applyAiDecisions(results, [
      { criterion: "scheme_type", verdict: "refused", reason: "OEPRE" },
    ]);
    expect(overallVerdict(settled)).toBe("refused");
    expect(settled.find((c) => c.criterion === "scheme_type")?.reason).toBe(
      "IA : OEPRE",
    );
  });
});

describe("toCandidate", () => {
  it("links RI dispositifs to refugies.info and playground documents to BOMO", () => {
    const dispositif = {
      id: "a",
      titreInformatif: "Cours de FLE",
      location: ["68 - Haut-Rhin"],
      mainSponsorNom: "France Terre d'Asile",
      mainSponsorAcronyme: "FTDA",
      status: "Supprimé",
    };
    expect(toCandidate(dispositif, "refugies-info")).toMatchObject({
      url: "https://refugies.info/dispositif/a",
      sponsor: "France Terre d'Asile - FTDA",
      departments: ["68"],
      status: "Supprimé",
    });
    expect(toCandidate(dispositif, "playground").url).toBe("/documents/a");
  });
});

describe("action places", () => {
  it("lists every distinct city and postal code for the duplicate search", () => {
    const action = buildActionDocument(
      [
        normalizeSession(
          rawSession({
            lieu_formation: [
              { ville: "Paris", codepostal: "75018", departement: "75" },
              { ville: "Paris", codepostal: "75019", departement: "75" },
            ],
          }),
        ),
      ],
      "carif-oref--01_999",
    );
    expect(actionCities(action)).toEqual(["Paris"]);
    expect(actionPostalCodes(action)).toEqual(["75018", "75019"]);
    expect(actionDepartments(action)).toEqual(["75"]);
  });
});

describe("stored sessions without lieu_formation", () => {
  it("does not crash the arbitration", () => {
    const stored = actionWith();
    const action = {
      ...stored,
      sessions: stored.sessions.map(
        ({ lieu_formation: _omitted, ...session }) => session,
      ),
    } as typeof stored;
    expect(toArbitrationDocument(action).villes).toEqual([]);
    expect(actionDepartments(action)).toEqual([]);
  });
});

describe("hasCertainDuplicate", () => {
  it("ignores ambiguous matches", () => {
    expect(hasCertainDuplicate([])).toBe(false);
    expect(hasCertainDuplicate([{ verdict: "ambiguous" }])).toBe(false);
    expect(
      hasCertainDuplicate([{ verdict: "ambiguous" }, { verdict: "duplicate" }]),
    ).toBe(true);
  });
});
