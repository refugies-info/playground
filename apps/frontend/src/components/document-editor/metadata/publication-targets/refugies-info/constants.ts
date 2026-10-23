/**
 * Réfugiés.info - Constants
 * All constants specific to the Réfugiés.info publication target
 */

import type {
  RiConditionType,
  RiFrenchLevelType,
  RiPriceDetails,
  RiPublicStatusType,
  RiPublicType,
  RiTimeSlotType,
} from "@playground/shared-types";
import { RI_DEPARTMENTS } from "@playground/shared-types";

// =============================================================================
// Field limits
// =============================================================================

/** Maximum characters for the "En bref" (abstract) field */
export const ABSTRACT_MAX_LENGTH = 200;

// =============================================================================
// Time Units
// =============================================================================

/**
 * Time unit translations (English → French).
 */
export const TIME_UNIT_LABELS: Record<string, string> = {
  hour: "heure",
  hours: "heures",
  day: "jour",
  days: "jours",
  week: "semaine",
  weeks: "semaines",
  month: "mois",
  months: "mois",
  year: "an",
  years: "ans",
};

/**
 * Translates a raw unit to French.
 */
export function translateUnit(raw: string, fallback = "heures"): string {
  return TIME_UNIT_LABELS[raw.toLowerCase()] ?? fallback;
}

/** Time unit options for SelectInput (French labels) */
export const TIME_UNIT_OPTIONS: readonly { value: string; label: string }[] = [
  { value: "sessions", label: "séances" },
  { value: "hours", label: "heures" },
  { value: "half-days", label: "demi-journées" },
  { value: "days", label: "jours" },
  { value: "weeks", label: "semaines" },
  { value: "months", label: "mois" },
  { value: "trimesters", label: "trimestres" },
  { value: "semesters", label: "semestres" },
  { value: "years", label: "ans" },
];

// =============================================================================
// Field Options
// =============================================================================

/** French level options */
export const FRENCH_LEVEL_OPTIONS: readonly {
  value: RiFrenchLevelType;
  label: string;
}[] = [
  { value: "alpha", label: "Alphabétisation : en cours d’alphabétisation " },
  { value: "A1", label: "A1.1 et A1 : découverte du français" },
  { value: "A2", label: "A2 : communication de manière simple" },
  { value: "B1", label: "B1 : communication en français intermédiaire" },
  { value: "B2", label: "B2 : communication avec aisance" },
  { value: "C1", label: "C1 : communication avec grande aisance" },
  { value: "C2", label: "C2 : communication en français courant" },
];

/** Public status options */
export const PUBLIC_STATUS_OPTIONS: readonly {
  value: RiPublicStatusType;
  label: string;
}[] = [
  { value: "asile", label: "Demandeurs d'asile" },
  { value: "refugie", label: "Réfugiés statutaires" },
  { value: "subsidiaire", label: "Bénéficiaires de la protection subsidiaire" },
  { value: "temporaire", label: "Bénéficiaires de la protection temporaire" },
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
  { value: "acte naissance", label: "Acte de naissance OFPRA" },
  { value: "titre sejour", label: "Titre de séjour" },
  { value: "cir", label: "CIR" },
  { value: "bank account", label: "Compte bancaire" },
  { value: "pole emploi", label: "France Travail" },
  { value: "driver license", label: "Permis B" },
  { value: "school", label: "Niveau d'études" },
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
  { value: "once", label: "Une seule fois" },
  { value: "eachTime", label: "A chaque fois" },
  { value: "hour", label: "Par heure" },
  { value: "day", label: "Par jour" },
  { value: "week", label: "Par semaine" },
  { value: "month", label: "Par mois" },
  { value: "trimester", label: "Par trimestre" },
  { value: "semester", label: "Par semestre" },
  { value: "year", label: "Par an" },
];

/** Multi-enum field options mapping */
export const MULTI_ENUM_OPTIONS: Record<
  string,
  readonly { value: string; label: string }[]
> = {
  publicStatus: PUBLIC_STATUS_OPTIONS,
  public: PUBLIC_TYPE_OPTIONS,
  frenchLevel: FRENCH_LEVEL_OPTIONS,
  timeSlots: TIME_SLOT_OPTIONS,
  conditions: CONDITION_OPTIONS,
};

// =============================================================================
// Geography
// =============================================================================

export const DEPARTMENT_OPTIONS: readonly { value: string; label: string }[] =
  RI_DEPARTMENTS.map((department) => ({
    value: department,
    label: department,
  }));
