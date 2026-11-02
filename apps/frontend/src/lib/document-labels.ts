import { LANGUAGE_NAMES, LANGUAGE_TO_COUNTRY } from "@playground/shared-types";

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

export function getLanguageName(lang: string): string {
  return LANGUAGE_NAMES[lang] || lang;
}
