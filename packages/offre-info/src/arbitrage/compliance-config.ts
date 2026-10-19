// Editorial thresholds of the RI compliance check. Edit these lists to tune
// the rules: the logic in compliance-rules.ts never hardcodes a value.

export const ACCEPTED_FUNDER_CODES = new Set([
  "2", // Conseil régional
  "3", // FSE
  "8", // Conseil général
  "9", // Commune
  "11", // Ministère de l'Emploi
  "12", // Ministère de l'Éducation
  "13", // État, autre
  "15", // Collectivité territoriale, autre
  "19", // Ministère de l'Intérieur
]);

export const ACCEPTED_AUDIENCE_CODES = new Set([
  "81019", // Illettrisme
  "81021", // Analphabète
  "81022", // Immigré
  "81023", // Primo-arrivant
  "81042", // Réfugié
  "81043", // Illectronisme
  "82060", // Travailleur étranger
]);

export const MIN_SESSION_DAYS = 20;

export const MIN_TOTAL_HOURS = 20;
