/**
 * Types for Réfugiés.info Metadata
 *
 * These types match the Metadatas interface expected by Réfugiés.info.
 * All fields are optional - a dispositif may have no metadata at all.
 *
 * @see https://refugies.info for documentation
 */

// =============================================================================
// Base Types (Enums)
// =============================================================================

/** Location type - can be "france", "online", or an array of department codes */
export type RiLocationType = "france" | "online" | string[];

/** French language proficiency levels */
export type RiFrenchLevelType =
  | "alpha"
  | "A1"
  | "A2"
  | "B1"
  | "B2"
  | "C1"
  | "C2";

/** Age range type */
export type RiAgeType = "lessThan" | "moreThan" | "between";

/** Price period details */
export type RiPriceDetails =
  | "once"
  | "eachTime"
  | "hour"
  | "day"
  | "week"
  | "month"
  | "trimester"
  | "semester"
  | "year";

/** Public status (legal status) */
export type RiPublicStatusType =
  | "asile"
  | "refugie"
  | "subsidiaire"
  | "temporaire"
  | "apatride"
  | "french";

/** Public type (demographic) */
export type RiPublicType = "family" | "women" | "youths" | "senior" | "gender";

/** Required conditions */
export type RiConditionType =
  | "acte naissance"
  | "titre sejour"
  | "cir"
  | "bank account"
  | "pole emploi"
  | "driver license"
  | "school";

/** Commitment details type */
export type RiCommitmentDetailsType =
  | "minimum"
  | "maximum"
  | "approximately"
  | "exactly"
  | "between";

/** Frequency details type */
export type RiFrequencyDetailsType =
  | "minimum"
  | "maximum"
  | "approximately"
  | "exactly";

/** Time unit for commitment */
export type RiTimeUnitType =
  | "sessions"
  | "hours"
  | "half-days"
  | "days"
  | "weeks"
  | "months"
  | "trimesters"
  | "semesters"
  | "years";

/** Frequency unit */
export type RiFrequencyUnitType =
  | "session"
  | "day"
  | "week"
  | "month"
  | "trimester"
  | "semester"
  | "year";

/** Days of the week */
export type RiTimeSlotType =
  | "monday"
  | "tuesday"
  | "wednesday"
  | "thursday"
  | "friday"
  | "saturday"
  | "sunday";

// =============================================================================
// Complex Types (Objects)
// =============================================================================

/** Session for training programs with dates */
export interface RiSession {
  startDate: Date | string;
  endDate: Date | string;
  registrationStartDate?: Date | string;
  registrationEndDate?: Date | string;
  externalRef?: string;
  url?: string;
}

/**
 * Sessions field structure (Karfur webhook v2).
 *
 * - `modalitesEntreesSorties`: `0` = dates fixes, `1` = a tout moment, `null` = non défini
 * - `items`: list of sessions (same structure as before)
 *
 * The two fields are independent: `modalitesEntreesSorties` can be set without `items`
 * (e.g., "a tout moment" with no fixed dates).
 */
export interface RiSessionsField {
  modalitesEntreesSorties?: 0 | 1 | null;
  items?: RiSession[] | null;
}

/** Age range definition */
export interface RiAge {
  type: RiAgeType;
  ages: number[];
}

/** Price definition */
export interface RiPrice {
  values: number[]; // [0] = free, [] = flexible amount
  details?: RiPriceDetails | null;
}

/** Commitment (total duration for volunteering) */
export interface RiCommitment {
  amountDetails: RiCommitmentDetailsType;
  hours: number[];
  timeUnit: RiTimeUnitType;
}

/** Frequency */
export interface RiFrequency {
  amountDetails: RiFrequencyDetailsType;
  hours: number;
  timeUnit: RiTimeUnitType;
  frequencyUnit: RiFrequencyUnitType;
}

/** Point of interest (location) */
export interface RiPoi {
  title?: string;
  address?: string;
  city?: string;
  /** Latitude — stored as string in UI, coerced to number for RI payload */
  lat?: number | string;
  /** Longitude — stored as string in UI, coerced to number for RI payload */
  lng?: number | string;
  email?: string;
  phone?: string;
}

// =============================================================================
// Main Metadata Interface
// =============================================================================

/**
 * Complete metadata structure for a Réfugiés.info dispositif.
 * All fields are optional.
 */
export interface RiMetadatas {
  /** Location: "france", "online", or array of department codes */
  location?: RiLocationType | null;

  /** Required French proficiency levels */
  frenchLevel?: RiFrenchLevelType[] | null;

  /** Legal status of target public */
  publicStatus?: RiPublicStatusType[] | null;

  /** Demographic type of target public */
  public?: RiPublicType[] | null;

  /** Required conditions */
  conditions?: RiConditionType[] | null;

  /** Days of presence */
  timeSlots?: RiTimeSlotType[] | null;

  /** Age range */
  age?: RiAge | null;

  /** Price */
  price?: RiPrice | null;

  /** Commitment (total duration) */
  commitment?: RiCommitment | null;

  /** Frequency */
  frequency?: RiFrequency | null;

  /** Training sessions */
  sessions?: RiSession[] | null;
}

// =============================================================================
// Extended Metadata (with additional fields from Letta Report)
// =============================================================================

/**
 * Extended metadata structure as generated by the Letta metadata agent.
 * Includes additional fields beyond the standard RI schema.
 */
export interface RiMetadataExtended extends RiMetadatas {
  /** Brand title */
  titreMarque?: string;

  /** Main sponsor/structure name */
  mainSponsor?: string;

  /** Logo URL or ID */
  logo?: string;

  /** Short description */
  abstract?: string;

  /** Primary theme ID (MongoDB ObjectId) */
  theme?: string;

  /** Secondary theme IDs (MongoDB ObjectId[]) */
  secondaryThemes?: string[];

  /** Need IDs (MongoDB ObjectId[]) */
  needs?: string[];

  /** Sessions (canonical format v2 — legacy arrays are normalized via autofix) */
  periode?: RiSessionsField | null;

  /** Points of interest (map) */
  map?: RiPoi[];
}

// =============================================================================
// Validation Helpers
// =============================================================================

/** Valid French level values */
export const RI_FRENCH_LEVELS: readonly RiFrenchLevelType[] = [
  "alpha",
  "A1",
  "A2",
  "B1",
  "B2",
  "C1",
  "C2",
] as const;

/** Valid public status values */
export const RI_PUBLIC_STATUSES: readonly RiPublicStatusType[] = [
  "asile",
  "refugie",
  "subsidiaire",
  "temporaire",
  "apatride",
  "french",
] as const;

/** Valid public type values */
export const RI_PUBLIC_TYPES: readonly RiPublicType[] = [
  "family",
  "women",
  "youths",
  "senior",
  "gender",
] as const;

/** Valid condition values */
export const RI_CONDITIONS: readonly RiConditionType[] = [
  "acte naissance",
  "titre sejour",
  "cir",
  "bank account",
  "pole emploi",
  "driver license",
  "school",
] as const;

/** Valid time slot values */
export const RI_TIME_SLOTS: readonly RiTimeSlotType[] = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
] as const;

/** Valid price details values */
export const RI_PRICE_DETAILS: readonly RiPriceDetails[] = [
  "once",
  "eachTime",
  "hour",
  "day",
  "week",
  "month",
  "trimester",
  "semester",
  "year",
] as const;

/** Valid time unit values */
export const RI_TIME_UNITS: readonly RiTimeUnitType[] = [
  "sessions",
  "hours",
  "half-days",
  "days",
  "weeks",
  "months",
  "trimesters",
  "semesters",
  "years",
] as const;

/** Valid frequency unit values */
export const RI_FREQUENCY_UNITS: readonly RiFrequencyUnitType[] = [
  "session",
  "day",
  "week",
  "month",
  "trimester",
  "semester",
  "year",
] as const;

/** Valid age type values */
export const RI_AGE_TYPES: readonly RiAgeType[] = [
  "lessThan",
  "moreThan",
  "between",
] as const;

/** Valid commitment details values */
export const RI_COMMITMENT_DETAILS: readonly RiCommitmentDetailsType[] = [
  "minimum",
  "maximum",
  "approximately",
  "exactly",
  "between",
] as const;

/** Valid frequency details values */
export const RI_FREQUENCY_DETAILS: readonly RiFrequencyDetailsType[] = [
  "minimum",
  "maximum",
  "approximately",
  "exactly",
] as const;

// =============================================================================
// Type Guards
// =============================================================================

/**
 * Type guard to check if a value is a valid French level
 */
export function isRiFrenchLevel(value: unknown): value is RiFrenchLevelType {
  return (
    typeof value === "string" &&
    RI_FRENCH_LEVELS.includes(value as RiFrenchLevelType)
  );
}

/**
 * Type guard to check if a value is a valid public status
 */
export function isRiPublicStatus(value: unknown): value is RiPublicStatusType {
  return (
    typeof value === "string" &&
    RI_PUBLIC_STATUSES.includes(value as RiPublicStatusType)
  );
}

/**
 * Type guard to check if a value is a valid public type
 */
export function isRiPublicType(value: unknown): value is RiPublicType {
  return (
    typeof value === "string" && RI_PUBLIC_TYPES.includes(value as RiPublicType)
  );
}

/**
 * Type guard to check if a value is a valid condition
 */
export function isRiCondition(value: unknown): value is RiConditionType {
  return (
    typeof value === "string" &&
    RI_CONDITIONS.includes(value as RiConditionType)
  );
}

/**
 * Type guard to check if a value is a valid time slot
 */
export function isRiTimeSlot(value: unknown): value is RiTimeSlotType {
  return (
    typeof value === "string" && RI_TIME_SLOTS.includes(value as RiTimeSlotType)
  );
}
