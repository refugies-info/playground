import type { BadgeProps } from "@playground/ui/primitives";

/**
 * Document Status Types
 */
export type DocumentStatus = "compliant" | "non_compliant" | "error";
export type DocumentState =
  | "rco"
  | "ingestion"
  | "draft"
  | "editorial"
  | "to_process"
  | "archived"
  | "published";

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
  rco: {
    label: "Nouveau",
    variant: "neutral",
  },
  ingestion: {
    label: "Ingestion terminée",
    variant: "warning",
  },
  draft: {
    label: "Brouillon",
    variant: "info",
  },
  editorial: {
    label: "Brouillon",
    variant: "info",
  },
  to_process: {
    label: "En attente",
    variant: "warning",
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
