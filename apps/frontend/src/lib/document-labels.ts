import { LANGUAGE_NAMES, LANGUAGE_TO_COUNTRY } from "@playground/shared-types";
import type { BadgeProps } from "@playground/ui/primitives";

/**
 * Badge variant type from UI primitives
 */
type BadgeVariant = NonNullable<BadgeProps["variant"]>;

// =============================================================================
// Translation Status (untyped — string union not exported from shared-types)
// =============================================================================

const TRANSLATION_STATUS_LABELS: Record<string, string> = {
  to_process: "À traiter",
  processing: "En cours",
  done: "Terminé",
  error: "Erreur",
};

const TRANSLATION_STATUS_VARIANTS: Record<string, BadgeVariant> = {
  to_process: "neutral",
  processing: "warning",
  done: "success",
  error: "danger",
};

export function getTranslationStatusLabel(status: string | undefined): string {
  if (!status) return "Inconnu";
  return TRANSLATION_STATUS_LABELS[status] ?? status;
}

export function getTranslationStatusVariant(
  status: string | undefined,
): BadgeVariant {
  if (!status) return "neutral";
  return TRANSLATION_STATUS_VARIANTS[status] ?? "neutral";
}

// =============================================================================
// Language Helpers
// =============================================================================

/**
 * Get the CSS class for the flag icon.
 * Requires 'flag-icons' to be imported.
 */
export function getFlagClass(lang: string): string {
  const countryCode = LANGUAGE_TO_COUNTRY[lang] || "xx"; // xx is placeholder
  return `fi fi-${countryCode}`;
}

/** @deprecated Use getFlagClass instead */
export function getLanguageFlag(lang: string): string {
  return getFlagClass(lang);
}

export function getLanguageName(lang: string): string {
  return LANGUAGE_NAMES[lang] || lang;
}
