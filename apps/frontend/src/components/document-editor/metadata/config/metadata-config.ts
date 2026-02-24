/**
 * Metadata Field Configuration
 *
 * Defines all metadata fields with their:
 * - Display label (French)
 * - Field type (text, textarea, select, etc.)
 * - Validation rules
 * - UI component mapping
 */

import type {
  RiConditionType,
  RiFrenchLevelType,
  RiPriceDetails,
  RiPublicStatusType,
  RiPublicType,
  RiTimeSlotType,
} from "@playground/shared-types";

// =============================================================================
// Field Types
// =============================================================================

/** Types of metadata fields */
export type MetadataFieldType =
  | "text"
  | "textarea"
  | "select"
  | "multiselect"
  | "theme-select"
  | "need-select"
  | "price"
  | "age"
  | "commitment"
  | "frequency"
  | "sessions"
  | "poi";

/** Status of a metadata field */
export type MetadataFieldStatus =
  | "pristine" // Not modified from Letta Report
  | "modified" // Modified by user
  | "invalid"; // Validation failed

/** Definition of a metadata field */
export interface MetadataFieldDefinition {
  /** Unique key matching metadata_ri property */
  key: string;

  /** Display label in French */
  label: string;

  /** Field type for UI rendering */
  type: MetadataFieldType;

  /** Whether the field is required for publication */
  required?: boolean;

  /** Help text shown on hover */
  description?: string;

  /** Options for select/multiselect fields */
  options?: readonly { value: string; label: string }[];

  /** Validation function */
  validate?: (value: unknown) => boolean | string;
}

// =============================================================================
// Option Definitions
// =============================================================================

/** French level options */
export const FRENCH_LEVEL_OPTIONS: readonly {
  value: RiFrenchLevelType;
  label: string;
}[] = [
  { value: "alpha", label: "Alphabétisation" },
  { value: "A1", label: "A1 - Débutant" },
  { value: "A2", label: "A2 - Élémentaire" },
  { value: "B1", label: "B1 - Intermédiaire" },
  { value: "B2", label: "B2 - Intermédiaire supérieur" },
  { value: "C1", label: "C1 - Avancé" },
  { value: "C2", label: "C2 - Maîtrise" },
];

/** Public status options */
export const PUBLIC_STATUS_OPTIONS: readonly {
  value: RiPublicStatusType;
  label: string;
}[] = [
  { value: "asile", label: "Demandeurs d'asile" },
  { value: "refugie", label: "Réfugiés statutaires" },
  { value: "subsidiaire", label: "Protection subsidiaire" },
  { value: "temporaire", label: "Protection temporaire" },
  { value: "apatride", label: "Apatrides" },
  { value: "french", label: "Citoyens français" },
];

/** Public type options */
export const PUBLIC_TYPE_OPTIONS: readonly {
  value: RiPublicType;
  label: string;
}[] = [
  { value: "family", label: "Familles et enfants" },
  { value: "women", label: "Femmes" },
  { value: "youths", label: "Jeunes" },
  { value: "senior", label: "Séniors" },
  { value: "gender", label: "Minorités de genre" },
];

/** Condition options */
export const CONDITION_OPTIONS: readonly {
  value: RiConditionType;
  label: string;
}[] = [
  { value: "acte naissance", label: "Acte de naissance (OFPRA)" },
  { value: "titre sejour", label: "Titre de séjour ou récépissé" },
  { value: "cir", label: "CIR signé (cours OFII terminés)" },
  { value: "bank account", label: "Compte bancaire" },
  { value: "pole emploi", label: "Inscription Pôle emploi" },
  { value: "driver license", label: "Permis B" },
  { value: "school", label: "Niveau fin de lycée" },
];

/** Time slot options */
export const TIME_SLOT_OPTIONS: readonly {
  value: RiTimeSlotType;
  label: string;
}[] = [
  { value: "monday", label: "Lundi" },
  { value: "tuesday", label: "Mardi" },
  { value: "wednesday", label: "Mercredi" },
  { value: "thursday", label: "Jeudi" },
  { value: "friday", label: "Vendredi" },
  { value: "saturday", label: "Samedi" },
  { value: "sunday", label: "Dimanche" },
];

/** Price details options */
export const PRICE_DETAILS_OPTIONS: readonly {
  value: RiPriceDetails;
  label: string;
}[] = [
  { value: "once", label: "une fois" },
  { value: "eachTime", label: "à chaque fois" },
  { value: "hour", label: "par heure" },
  { value: "day", label: "par jour" },
  { value: "week", label: "par semaine" },
  { value: "month", label: "par mois" },
  { value: "trimester", label: "par trimestre" },
  { value: "semester", label: "par semestre" },
  { value: "year", label: "par an" },
];

// =============================================================================
// Field Definitions
// =============================================================================

/**
 * All metadata fields configuration.
 * Order defines display order in the UI.
 */
export const METADATA_FIELDS: readonly MetadataFieldDefinition[] = [
  // ── Identity ──────────────────────────────────────────────────────────────
  {
    key: "titreMarque",
    label: "Titre marque",
    type: "text",
    description: "Nom de la marque ou du programme",
  },
  {
    key: "mainSponsor",
    label: "Structure",
    type: "text",
    description: "Nom de la structure porteuse",
  },
  {
    key: "logo",
    label: "Logo",
    type: "text",
    description: "URL du logo de la structure",
  },
  {
    key: "abstract",
    label: "En bref",
    type: "textarea",
    description: "Description courte du dispositif",
  },

  // ── Classification ────────────────────────────────────────────────────────
  {
    key: "theme",
    label: "Thème principal",
    type: "theme-select",
    description: "Thème principal du dispositif",
  },
  {
    key: "secondaryThemes",
    label: "Thèmes secondaires",
    type: "theme-select",
    description: "Thèmes secondaires associés",
  },
  {
    key: "needs",
    label: "Besoins",
    type: "need-select",
    description: "Besoins couverts par le dispositif",
  },

  // ── Public ────────────────────────────────────────────────────────────────
  {
    key: "publicStatus",
    label: "Public visé (statut)",
    type: "multiselect",
    options: PUBLIC_STATUS_OPTIONS,
    description: "Statut légal du public cible",
  },
  {
    key: "public",
    label: "Public (démographique)",
    type: "multiselect",
    options: PUBLIC_TYPE_OPTIONS,
    description: "Type de public cible",
  },
  {
    key: "frenchLevel",
    label: "Niveau de français",
    type: "multiselect",
    options: FRENCH_LEVEL_OPTIONS,
    description: "Niveau de français requis",
  },
  {
    key: "age",
    label: "Tranche d'âge",
    type: "age",
    description: "Tranche d'âge du public cible",
  },

  // ── Modalities ─────────────────────────────────────────────────────────────
  {
    key: "price",
    label: "Prix",
    type: "price",
    description: "Coût et modalités de paiement",
  },
  {
    key: "commitment",
    label: "Durée totale",
    type: "commitment",
    description: "Durée totale d'engagement",
  },
  {
    key: "frequency",
    label: "Fréquence",
    type: "frequency",
    description: "Fréquence de participation",
  },
  {
    key: "timeSlots",
    label: "Jours de présence",
    type: "multiselect",
    options: TIME_SLOT_OPTIONS,
    description: "Jours où le dispositif est accessible",
  },

  // ── Sessions ───────────────────────────────────────────────────────────────
  {
    key: "periode",
    label: "Sessions",
    type: "sessions",
    description: "Dates des sessions de formation",
  },

  // ── Geography ──────────────────────────────────────────────────────────────
  {
    key: "location",
    label: "Départements",
    type: "text",
    description: "Zones géographiques couvertes",
  },
  {
    key: "conditions",
    label: "Conditions",
    type: "multiselect",
    options: CONDITION_OPTIONS,
    description: "Conditions requises pour participer",
  },
  {
    key: "map",
    label: "Points d'intérêt",
    type: "poi",
    description: "Adresses et lieux d'accueil",
  },
];

// =============================================================================
// Helpers
// =============================================================================

/**
 * Get a field definition by key.
 */
export function getFieldDefinition(
  key: string,
): MetadataFieldDefinition | undefined {
  return METADATA_FIELDS.find((field) => field.key === key);
}

/**
 * Get all field keys.
 */
export function getFieldKeys(): string[] {
  return METADATA_FIELDS.map((field) => field.key);
}

/**
 * Get fields by type.
 */
export function getFieldsByType(
  type: MetadataFieldType,
): MetadataFieldDefinition[] {
  return METADATA_FIELDS.filter((field) => field.type === type);
}

/**
 * Check if a field is required.
 */
export function isFieldRequired(key: string): boolean {
  const field = getFieldDefinition(key);
  return field?.required ?? false;
}

/**
 * Get the label for a field.
 */
export function getFieldLabel(key: string): string {
  const field = getFieldDefinition(key);
  return field?.label ?? key;
}

/**
 * Get the label for a select option value.
 */
export function getOptionLabel(key: string, value: string): string | undefined {
  const field = getFieldDefinition(key);
  if (!field?.options) return undefined;

  const option = field.options.find((opt) => opt.value === value);
  return option?.label;
}
