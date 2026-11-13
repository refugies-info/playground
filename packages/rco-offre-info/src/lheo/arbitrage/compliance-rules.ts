import { type CriterionVerdict, describeCodes } from "@playground/shared-types";
import type { RcoActionDocument, RcoSession } from "../document";
import {
  ACCEPTED_AUDIENCE_CODES,
  ACCEPTED_FUNDER_CODES,
  AUDIENCE_LABELS,
  FUNDER_LABELS,
  MIN_SESSION_DAYS,
  MIN_TOTAL_HOURS,
} from "./compliance-config";

// "ai" means the code cannot decide: the criterion goes to the compliance agent.
export type Verdict = CriterionVerdict;

export type ComplianceCriterion =
  | "agreement"
  | "funder"
  | "audience"
  | "sessions"
  | "hours"
  | "scheme_type";

// Questions of the "Étape" column on the arbitration page.
export const CRITERION_LABELS: Record<ComplianceCriterion, string> = {
  agreement: "Dispositif conventionné ?",
  funder: "Financeur dans périmètre RI ?",
  audience: "Public visé conforme ?",
  scheme_type: "Dispositif conforme au périmètre ?",
  sessions: `Durée ≥ ${MIN_SESSION_DAYS} jours ?`,
  hours: `Volume horaire ≥ ${MIN_TOTAL_HOURS}h ?`,
};

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

const formatDate = (isoDate: string) =>
  isoDate.slice(0, 10).split("-").reverse().join("/");

export function checkAgreement(action: RcoActionDocument): CriterionResult {
  if (action.conventionnement === true) {
    return result("agreement", "accepted", "fiche conventionnée");
  }
  return result("agreement", "refused", "fiche non conventionnée");
}

export function checkFunder(action: RcoActionDocument): CriterionResult {
  const codes = (action.organisme_financeur as { code_financeur?: string }[])
    .map((funder) => String(funder.code_financeur))
    .filter(Boolean);
  const accepted = codes.filter((code) => ACCEPTED_FUNDER_CODES.has(code));
  if (accepted.length > 0) {
    return result(
      "funder",
      "accepted",
      `financeur accepté : ${describeCodes(accepted, FUNDER_LABELS)}`,
    );
  }
  return result(
    "funder",
    "refused",
    codes.length
      ? `aucun financeur accepté parmi ${describeCodes(codes, FUNDER_LABELS)}`
      : "aucun financeur",
  );
}

export function checkAudience(action: RcoActionDocument): CriterionResult {
  const codes = (action.code_public_vise as unknown[]).map(String);
  const accepted = codes.filter((code) => ACCEPTED_AUDIENCE_CODES.has(code));
  if (accepted.length > 0) {
    return result(
      "audience",
      "accepted",
      `public visé accepté : ${describeCodes(accepted, AUDIENCE_LABELS)}`,
    );
  }
  return result(
    "audience",
    "ai",
    `aucun public visé accepté parmi [${describeCodes(codes, AUDIENCE_LABELS)}], lecture des textes nécessaire`,
  );
}

// A registration period (Q21) keeps a session open until it ends, even once
// started. Without one, fixed entries (false) close once the session has
// started; permanent (true) or unknown entries stay open until it ends.
const closingDate = (session: RcoSession, permanentEntries: unknown) =>
  String(
    session.periode_inscription_fin ??
      (permanentEntries === false ? session.date_debut : session.date_fin),
  );

export const isSessionOpen = (
  session: RcoSession,
  permanentEntries: unknown,
  today: string,
) =>
  closingDate(session, permanentEntries) >= today &&
  String(session.date_fin) >= today;

const closedReason = (session: RcoSession, permanentEntries: unknown) => {
  const date = formatDate(closingDate(session, permanentEntries));
  if (session.periode_inscription_fin) return `inscriptions closes le ${date}`;
  return permanentEntries === false
    ? `déjà commencée le ${date}`
    : `terminée le ${date}`;
};

const entryModeLabel = (permanentEntries: unknown) => {
  if (permanentEntries === false) return "entrées à dates fixes";
  if (permanentEntries === true) return "entrées permanentes";
  return "modalité d'entrée inconnue";
};

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
    return result(
      "sessions",
      "refused",
      "aucune session avec dates de début et de fin",
    );
  }
  const permanentEntries = action.modalites_entrees_sorties;
  const entryMode = entryModeLabel(permanentEntries);
  const openSessions = datedSessions.filter((session) =>
    isSessionOpen(session, permanentEntries, today),
  );
  if (openSessions.length === 0) {
    const closedReasons = datedSessions
      .map((session) => closedReason(session, permanentEntries))
      .join(", ");
    return result(
      "sessions",
      "refused",
      `${entryMode} : aucune session ouverte, ${closedReasons}`,
    );
  }
  if (!openSessions.some(isSessionLongEnough)) {
    return result(
      "sessions",
      "refused",
      `${entryMode} : les sessions ouvertes durent moins de ${MIN_SESSION_DAYS} jours`,
    );
  }
  return result(
    "sessions",
    "accepted",
    `${entryMode} : ${openSessions.length} session(s) ouverte(s) de ${MIN_SESSION_DAYS} jours ou plus`,
  );
}

const HOURS_IN_TEXT = /(\d+)\s*h/i;

// Metadata below the threshold is often badly filled in (Q8): the AI checks
// the text instead of the code refusing outright.
const hoursVerdict = (hours: number, source: string) =>
  hours >= MIN_TOTAL_HOURS
    ? result("hours", "accepted", `${hours}h (${source})`)
    : result(
        "hours",
        "ai",
        `métadonnées : ${hours}h < ${MIN_TOTAL_HOURS}h (${source}), à vérifier dans le texte`,
      );

export function checkHours(action: RcoActionDocument): CriterionResult {
  if (typeof action.nombre_heures_total === "number") {
    return hoursVerdict(action.nombre_heures_total, "nombre d'heures total");
  }
  const text = action.duree_indicative;
  if (typeof text !== "string" || !text.trim()) {
    return result(
      "hours",
      "ai",
      "métadonnées vides, lecture du texte nécessaire",
    );
  }
  const match = text.match(HOURS_IN_TEXT);
  if (match) return hoursVerdict(Number(match[1]), "durée indicative");
  return result("hours", "ai", `durée indicative illisible : « ${text} »`);
}

// The scheme type (common law, volunteering, single-nationality...) is always
// a semantic judgement, so the code never decides it.
export const checkSchemeType = (): CriterionResult =>
  result(
    "scheme_type",
    "ai",
    "l'IA vérifie que le dispositif n'est ni payant, ni ponctuel, ni réservé aux professionnels ou à une seule nationalité",
  );

export function checkCompliance(
  action: RcoActionDocument,
  today = new Date().toISOString().slice(0, 10),
): CriterionResult[] {
  return [
    checkAgreement(action),
    checkFunder(action),
    checkAudience(action),
    checkSchemeType(),
    checkSessions(action, today),
    checkHours(action),
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
      ? { ...decision, reason: `IA : ${decision.reason}` }
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
  nombre_heures_total: action.nombre_heures_total,
  duree_indicative: action.duree_indicative,
  villes: action.sessions.flatMap((session) =>
    ((session.lieu_formation as { ville?: string }[] | undefined) ?? []).map(
      (place) => place.ville,
    ),
  ),
});
