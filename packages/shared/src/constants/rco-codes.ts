// Labels of the RCO codes, shown next to the raw code in the arbitration
// report and the metadata source.
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

// LHEO dict-etat-recrutement.
const RECRUITMENT_STATE_LABELS: Record<string, string> = {
  "1": "ouvert",
  "2": "fermé",
  "3": "suspendu",
};

// LHEO dict-modalites-enseignement.
const TEACHING_MODE_LABELS: Record<string, string> = {
  "0": "présentiel",
  "1": "mixte",
  "2": "à distance",
};

const ENTRY_MODE_LABELS: Record<string, string> = {
  true: "entrées permanentes",
  false: "entrées à dates fixes",
};

const CODE_LABELS_BY_FIELD: Record<string, Record<string, string>> = {
  code_financeur: FUNDER_LABELS,
  code_public_vise: AUDIENCE_LABELS,
  etat_recrutement: RECRUITMENT_STATE_LABELS,
  modalites_enseignement: TEACHING_MODE_LABELS,
  modalites_entrees_sorties: ENTRY_MODE_LABELS,
};

export const describeCodes = (
  codes: string[],
  labels: Record<string, string>,
) =>
  codes
    .map((code) => (labels[code] ? `${code} (${labels[code]})` : code))
    .join(", ");

// "81023, 81042" → "81023 (Primo-arrivant), 81042 (Réfugié)"; other fields
// are left as they are.
export const describeFieldCodes = (field: string, value: string) => {
  const labels = CODE_LABELS_BY_FIELD[field.split(".").pop() ?? field];
  return labels ? describeCodes(value.split(/,\s*/), labels) : value;
};
