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

// =============================================================================
// Compliance Status
// =============================================================================

const COMPLIANCE_STATUS_LABELS: Record<ComplianceStatus, string> = {
  compliant: "Conforme",
  non_compliant: "Non conforme",
  pending: "En cours d'arbitrage",
  error: "Erreur",
};

const COMPLIANCE_STATUS_VARIANTS: Record<ComplianceStatus, BadgeVariant> = {
  compliant: "success",
  non_compliant: "danger",
  pending: "warning",
  error: "danger",
};

export function getComplianceStatusLabel(
  status: ComplianceStatus | null | undefined,
): string {
  if (!status) return "À traiter";
  return COMPLIANCE_STATUS_LABELS[status];
}

export function getComplianceStatusVariant(
  status: ComplianceStatus | null | undefined,
): BadgeVariant {
  if (!status) return "info";
  return COMPLIANCE_STATUS_VARIANTS[status];
}

// =============================================================================
// Work Status
// =============================================================================

const WORK_STATUS_LABELS: Record<WorkStatus, string> = {
  draft: "Brouillon",
  to_process: "À traiter",
};

// Draft = bleu (badge "draft"), to_process = blue (info)
const WORK_STATUS_VARIANTS: Record<WorkStatus, BadgeVariant> = {
  draft: "draft",
  to_process: "info",
};

export function getWorkStatusLabel(
  status: WorkStatus | null | undefined,
): string {
  if (!status) return "—";
  return WORK_STATUS_LABELS[status];
}

export function getWorkStatusVariant(
  status: WorkStatus | null | undefined,
): BadgeVariant {
  if (!status) return "neutral";
  return WORK_STATUS_VARIANTS[status];
}

// =============================================================================
// Online Status
// =============================================================================

const ONLINE_STATUS_LABELS: Record<OnlineStatus, string> = {
  published: "Publié",
  unpublished: "Non publié",
  archived: "Archivé",
};

const ONLINE_STATUS_VARIANTS: Record<OnlineStatus, BadgeVariant> = {
  published: "success",
  unpublished: "warning",
  archived: "warning", // Requested "yellow"
};

export function getOnlineStatusLabel(
  status: OnlineStatus | undefined,
): string | undefined {
  if (!status) return undefined;
  return ONLINE_STATUS_LABELS[status];
}

export function getOnlineStatusVariant(
  status: OnlineStatus | undefined,
): BadgeVariant {
  if (!status) return "neutral";
  return ONLINE_STATUS_VARIANTS[status];
}

// =============================================================================
// Quality Score
// =============================================================================

/**
 * Returns a badge variant based on quality score thresholds.
 */
export function getQualityScoreVariant(score: number | null): BadgeVariant {
  if (score === null) return "warning";
  const percentage = Math.round(score * 100);
  if (percentage >= 80) return "success";
  if (percentage >= 50) return "warning";
  if (percentage > 0) return "danger";
  return "neutral";
}

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
