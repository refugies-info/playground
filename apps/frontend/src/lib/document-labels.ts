import {
  type ComplianceStatus,
  LANGUAGE_NAMES,
  LANGUAGE_TO_COUNTRY,
  type OnlineStatus,
  type WorkStatus,
} from "@playground/shared-types";
import type { BadgeProps } from "@playground/ui/primitives";

/**
 * Badge variant type from UI primitives
 */
type BadgeVariant = NonNullable<BadgeProps["variant"]>;

// Compliance Status Helpers
export function getComplianceStatusLabel(
  status: ComplianceStatus | null | undefined,
): string {
  if (!status) return "À traiter";
  switch (status) {
    case "compliant":
      return "Conforme";
    case "non_compliant":
      return "Non conforme";
    case "pending":
      return "En cours d'arbitrage";
    case "error":
      return "Erreur";
    default:
      return status;
  }
}

export function getComplianceStatusVariant(
  status: ComplianceStatus | null | undefined,
): BadgeVariant {
  if (!status) return "info";
  switch (status) {
    case "compliant":
      return "success";
    case "non_compliant":
      return "danger";
    case "pending":
      return "warning";
    case "error":
      return "danger";
    default:
      return "neutral";
  }
}

export function getWorkStatusLabel(
  status: WorkStatus | null | undefined,
): string {
  if (!status) return "—";
  switch (status) {
    case "draft":
      return "Brouillon";
    case "to_process":
      return "À traiter";
    default:
      return status;
  }
}

export function getWorkStatusVariant(
  status: WorkStatus | null | undefined,
): BadgeVariant {
  if (!status) return "neutral";
  switch (status) {
    case "draft":
      return "info"; // Requested "blue"
    case "to_process":
      return "info"; // Requested "blue"
    default:
      return "neutral";
  }
}

// Online Status Helpers
export function getOnlineStatusLabel(
  status: OnlineStatus | undefined,
): string | undefined {
  if (!status) return undefined;
  switch (status) {
    case "published":
      return "Publié";
    case "unpublished":
      return "Non publié";
    case "archived":
      return "Archivé";
    default:
      return status;
  }
}

export function getOnlineStatusVariant(
  status: OnlineStatus | undefined,
): BadgeVariant {
  if (!status) return "neutral";
  switch (status) {
    case "published":
      return "success";
    case "unpublished":
      return "warning";
    case "archived":
      return "warning"; // Requested "yellow"
    default:
      return "neutral";
  }
}

/**
 * Helper function to get quality score badge variant
 */
export function getQualityScoreVariant(score: number | null): BadgeVariant {
  if (score === null) return "warning";
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

// Translation Status Helpers
export function getTranslationStatusLabel(status: string | undefined): string {
  if (!status) return "Inconnu";
  switch (status) {
    case "to_process":
      return "À traiter";
    case "processing":
      return "En cours";
    case "done":
      return "Terminé";
    case "error":
      return "Erreur";
    default:
      return status;
  }
}

export function getTranslationStatusVariant(
  status: string | undefined,
): BadgeVariant {
  if (!status) return "neutral";
  switch (status) {
    case "to_process":
      return "neutral";
    case "processing":
      return "warning";
    case "done":
      return "success";
    case "error":
      return "danger";
    default:
      return "neutral";
  }
}

export function getLanguageName(lang: string): string {
  return LANGUAGE_NAMES[lang] || lang;
}
