import { LANGUAGE_NAMES, LANGUAGE_TO_COUNTRY } from "@playground/shared-types";
import type { BadgeProps } from "@playground/ui/primitives";

/**
 * Document Status Types
 */
export type DocumentStatus = "compliant" | "non_compliant" | "error";
export type DocumentState = "to_process" | "draft" | "published" | "archived";

/**
 * Badge variant type from UI primitives
 */
type BadgeVariant = NonNullable<BadgeProps["variant"]>;

/**
 * Status configuration for documents
 */
export const STATUS_CONFIG: Record<
  DocumentStatus,
  {
    label: string;
    variant: BadgeVariant;
  }
> = {
  compliant: {
    label: "Conforme",
    variant: "success",
  },
  non_compliant: {
    label: "Non conforme",
    variant: "danger",
  },
  error: {
    label: "Erreur",
    variant: "danger",
  },
};

/**
 * State configuration for documents
 */
export const STATE_CONFIG: Record<
  DocumentState,
  {
    label: string;
    variant: BadgeVariant;
  }
> = {
  draft: {
    label: "Brouillon",
    variant: "info",
  },
  to_process: {
    label: "À traiter",
    variant: "info",
  },
  archived: {
    label: "Archivé",
    variant: "warning",
  },
  published: {
    label: "Publié",
    variant: "success",
  },
};

/**
 * Helper function to get status label
 */
export function getStatusLabel(status: string): string {
  return STATUS_CONFIG[status as DocumentStatus]?.label || status;
}

/**
 * Helper function to get status badge variant
 */
export function getStatusVariant(status: string): BadgeVariant {
  return STATUS_CONFIG[status as DocumentStatus]?.variant || "neutral";
}

/**
 * Helper function to get state label
 */
export function getStateLabel(state: string): string {
  return STATE_CONFIG[state as DocumentState]?.label || state.replace("_", " ");
}

/**
 * Helper function to get state badge variant
 */
export function getStateVariant(state: string): BadgeVariant {
  return STATE_CONFIG[state as DocumentState]?.variant || "neutral";
}

/**
 * Helper function to get quality score badge variant
 */
export function getQualityScoreVariant(score: number): BadgeVariant {
  const percentage = Math.round(score * 100);
  if (percentage >= 80) return "success";
  if (percentage >= 50) return "warning";
  if (percentage > 0) return "danger";
  return "neutral";
}

/**
 * Get the CSS class for the flag icon
 * Requires 'flag-icons' to be imported
 */
export function getFlagClass(lang: string): string {
  const countryCode = LANGUAGE_TO_COUNTRY[lang] || "xx"; // xx is placeholder
  return `fi fi-${countryCode}`;
}

export function getLanguageFlag(lang: string): string {
  // Kept for backward compatibility if needed, but we should switch to classes
  // This will now return the class name, so components need to adapt
  return getFlagClass(lang);
}

export function getLanguageName(lang: string): string {
  return LANGUAGE_NAMES[lang] || lang;
}
