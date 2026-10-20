// Editorial tables of the RCO → RI metadata mapping. Edit these to tune the
// mapping: the logic in metadata-rules.ts never hardcodes a value.

const EXILE_STATUSES = [
  "asile",
  "refugie",
  "subsidiaire",
  "temporaire",
  "apatride",
] as const;

// Source: "Prompt Métadonnées - Base de connaissance" (code-public-vise table).
export const PUBLIC_STATUS_BY_AUDIENCE_CODE: Record<string, readonly string[]> =
  {
    "81019": [...EXILE_STATUSES, "french"], // Illettrisme
    "81021": [...EXILE_STATUSES, "french"], // Analphabète
    "81043": [...EXILE_STATUSES, "french"], // Illectronisme
    "82060": [...EXILE_STATUSES, "french"], // Travailleur étranger
    "81022": EXILE_STATUSES, // Immigré
    "81023": EXILE_STATUSES, // Primo-arrivant
    "81042": EXILE_STATUSES, // Réfugié
  };

// Learners move easily between these departments: one place covers them all.
export const ILE_DE_FRANCE_DEPARTMENTS = [
  "75",
  "77",
  "78",
  "91",
  "92",
  "93",
  "94",
  "95",
];

// LHEO dict-modalites-enseignement: 0 présentiel, 1 mixte, 2 à distance.
export const DISTANCE_LEARNING_CODE = 2;

// Labels of the metadata table, in the order of the RI editor.
export const METADATA_LABELS = {
  titreMarque: "Titre marque",
  mainSponsor: "Structure",
  abstract: "En bref",
  theme: "Thème",
  secondaryThemes: "Thèmes secondaires",
  needs: "Besoins",
  publicStatus: "Public visé",
  public: "Public",
  frequency: "Fréquence",
  frenchLevel: "Niveau de français",
  age: "Âge",
  price: "Prix",
  commitment: "Durée totale",
  periode: "Session",
  timeSlots: "Jours de présence",
  location: "Départements",
  conditions: "Conditions",
  map: "Lieux",
} as const;

export type MetadataKey = keyof typeof METADATA_LABELS;
