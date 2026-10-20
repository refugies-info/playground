import type { RcoActionDocument, RcoSession } from "../document";
import {
  ACCEPTED_AUDIENCE_CODES,
  ACCEPTED_FUNDER_CODES,
  MIN_SESSION_DAYS,
  MIN_TOTAL_HOURS,
} from "./compliance-config";

// "ai" means the code cannot decide: the criterion goes to the compliance agent.
export type Verdict = "accepted" | "refused" | "ai";

export type ComplianceCriterion =
  | "agreement"
  | "funder"
  | "audience"
  | "sessions"
  | "hours"
  | "scheme_type";

export type CriterionResult = {
  criterion: ComplianceCriterion;
  verdict: Verdict;
  reason: string;
};

const result = (
  criterion: ComplianceCriterion,
  verdict: Verdict,
  reason: string,
): CriterionResult => ({ criterion, verdict, reason });

const DAY_MS = 24 * 60 * 60 * 1000;

const daysBetween = (start: string, end: string) =>
  (Date.parse(end) - Date.parse(start)) / DAY_MS;

export function checkAgreement(action: RcoActionDocument): CriterionResult {
  if (action.conventionnement === true) {
    return result("agreement", "accepted", "conventionnement = true");
  }
  return result(
    "agreement",
    "refused",
    `conventionnement = ${action.conventionnement}`,
  );
}

export function checkFunder(action: RcoActionDocument): CriterionResult {
  const codes = (action.organisme_financeur as { code_financeur?: string }[])
    .map((funder) => String(funder.code_financeur))
    .filter(Boolean);
  const accepted = codes.filter((code) => ACCEPTED_FUNDER_CODES.has(code));
  if (accepted.length > 0) {
    return result("funder", "accepted", `accepted funder codes: ${accepted}`);
  }
  return result(
    "funder",
    "refused",
    codes.length ? `no accepted funder code in ${codes}` : "no funder",
  );
}

export function checkAudience(action: RcoActionDocument): CriterionResult {
  const codes = (action.code_public_vise as unknown[]).map(String);
  const accepted = codes.filter((code) => ACCEPTED_AUDIENCE_CODES.has(code));
  if (accepted.length > 0) {
    return result(
      "audience",
      "accepted",
      `accepted audience codes: ${accepted}`,
    );
  }
  return result(
    "audience",
    "ai",
    `no accepted audience code in [${codes}], needs a reading of the texts`,
  );
}

// Fixed entries (false) close once the session has started; permanent (true)
// or unknown entries stay open until the session ends.
export const isSessionOpen = (
  session: RcoSession,
  permanentEntries: unknown,
  today: string,
) =>
  permanentEntries === false
    ? String(session.date_debut) >= today
    : String(session.date_fin) >= today;

const isSessionLongEnough = (session: RcoSession) =>
  daysBetween(String(session.date_debut), String(session.date_fin)) >=
  MIN_SESSION_DAYS;

export function checkSessions(
  action: RcoActionDocument,
  today: string,
): CriterionResult {
  const datedSessions = action.sessions.filter(
    (session) => session.date_debut && session.date_fin,
  );
  if (datedSessions.length === 0) {
    return result("sessions", "refused", "no session with start and end dates");
  }
  const openSessions = datedSessions.filter((session) =>
    isSessionOpen(session, action.modalites_entrees_sorties, today),
  );
  if (openSessions.length === 0) {
    return result("sessions", "refused", "no session open to new learners");
  }
  if (!openSessions.some(isSessionLongEnough)) {
    return result(
      "sessions",
      "refused",
      `open sessions last less than ${MIN_SESSION_DAYS} days`,
    );
  }
  return result(
    "sessions",
    "accepted",
    `${openSessions.length} open session(s) of ${MIN_SESSION_DAYS}+ days`,
  );
}

const HOURS_IN_TEXT = /(\d+)\s*h/i;

const hoursVerdict = (hours: number, source: string) =>
  hours >= MIN_TOTAL_HOURS
    ? result("hours", "accepted", `${hours}h (${source})`)
    : result("hours", "refused", `${hours}h < ${MIN_TOTAL_HOURS}h (${source})`);

export function checkHours(action: RcoActionDocument): CriterionResult {
  if (typeof action.nombre_heures_total === "number") {
    return hoursVerdict(action.nombre_heures_total, "nombre_heures_total");
  }
  const text = action.duree_indicative;
  if (typeof text !== "string" || !text.trim()) {
    return result("hours", "refused", "no hour volume");
  }
  const match = text.match(HOURS_IN_TEXT);
  if (match) return hoursVerdict(Number(match[1]), "duree_indicative");
  return result("hours", "ai", `unparsable duree_indicative: "${text}"`);
}

// The scheme type (common law, volunteering, single-nationality...) is always
// a semantic judgement, so the code never decides it.
export const checkSchemeType = (): CriterionResult =>
  result("scheme_type", "ai", "semantic judgement against jurisprudence");

export function checkCompliance(
  action: RcoActionDocument,
  today = new Date().toISOString().slice(0, 10),
): CriterionResult[] {
  return [
    checkAgreement(action),
    checkFunder(action),
    checkAudience(action),
    checkSessions(action, today),
    checkHours(action),
    checkSchemeType(),
  ];
}

export const overallVerdict = (results: CriterionResult[]): Verdict => {
  if (results.some((criterion) => criterion.verdict === "refused")) {
    return "refused";
  }
  if (results.some((criterion) => criterion.verdict === "ai")) return "ai";
  return "accepted";
};

export const criteriaForAi = (results: CriterionResult[]) =>
  results.filter((criterion) => criterion.verdict === "ai");

export type AiDecision = {
  criterion: ComplianceCriterion;
  verdict: "accepted" | "refused";
  reason: string;
};

export const applyAiDecisions = (
  results: CriterionResult[],
  decisions: AiDecision[],
): CriterionResult[] =>
  results.map((criterion) => {
    const decision = decisions.find(
      (aiDecision) => aiDecision.criterion === criterion.criterion,
    );
    return criterion.verdict === "ai" && decision
      ? { ...decision, reason: `AI: ${decision.reason}` }
      : criterion;
  });

// Only what the agents need to judge: no ids, no contacts, no session noise.
export const toArbitrationDocument = (action: RcoActionDocument) => ({
  nom: action.nom,
  organisme: action.organisme_responsable?.nom,
  objectif_formation: action.objectif_formation,
  contenu_formation: action.contenu_formation,
  resultat_attendus: action.resultat_attendus,
  conditions_specifiques: action.conditions_specifiques,
  info_public_vise: action.info_public_vise,
  code_public_vise: action.code_public_vise,
  duree_indicative: action.duree_indicative,
  villes: action.sessions.flatMap((session) =>
    (session.lieu_formation as { ville?: string }[]).map(
      (place) => place.ville,
    ),
  ),
});
