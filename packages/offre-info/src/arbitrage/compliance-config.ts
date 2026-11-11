// Editorial thresholds of the RI compliance check. Edit these lists to tune
// the rules: the logic in compliance-rules.ts never hardcodes a value.

// LHEO dict-financeurs, shown in the report next to the raw code.
export const FUNDER_LABELS: Record<string, string> = {
  "0": "Autre",
  "2": "Conseil régional",
  "3": "Fonds européens - FSE",
  "4": "France Travail",
  "5": "Entreprise",
  "8": "Conseil départemental",
  "9": "Commune",
  "10": "Bénéficiaire de l'action",
  "11": "État - Ministère chargé de l'emploi",
  "12": "État - Ministère de l'éducation nationale",
  "13": "État - Autre",
  "15": "Collectivité territoriale - Autre",
  "16": "OPCO",
  "19": "État - Ministère de l'intérieur",
};

// Formacode public-visé codes, shown in the report next to the raw code.
// ponytail: frequent codes only, import the full Formacode table if gaps hurt.
export const AUDIENCE_LABELS: Record<string, string> = {
  "80006": "Demandeur d'emploi",
  "81019": "Illettrisme",
  "81020": "Handicapé",
  "81021": "Analphabète",
  "81022": "Immigré",
  "81023": "Primo-arrivant",
  "81024": "Jeunes",
  "81042": "Réfugié",
  "81043": "Illectronisme",
  "82044": "Salarié",
  "82058": "En emploi",
  "82060": "Travailleur étranger",
  "83056": "Tout public",
};

export const ACCEPTED_FUNDER_CODES = new Set([
  "2",
  "3",
  "8",
  "9",
  "11",
  "12",
  "13",
  "15",
  "19",
]);

export const ACCEPTED_AUDIENCE_CODES = new Set([
  "81019",
  "81021",
  "81022",
  "81023",
  "81042",
  "81043",
  "82060",
]);

export const MIN_SESSION_DAYS = 20;

export const MIN_TOTAL_HOURS = 20;
