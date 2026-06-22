/**
 * Activity Log Types
 * Describes the kinds of activity recorded in a document's activity journal.
 */

/**
 * Metadata for a single activity-log type.
 * `display` is the text template rendered for an entry (%s = dynamic value).
 */
export interface ActivityLogTypeMeta {
  value: string;
  label: string;
  display: string;
}

export const ACTIVITY_LOG_TYPES = [
  {
    value: "compliance_ia",
    label: "Arbitrage de PapaIA",
    display: "PapaIA a jugé cette fiche %s",
  },
  {
    value: "compliance_human",
    label: "Changement de conformité",
    display: "%s a changé la conformité de cette fiche en %s",
  },
  {
    value: "publication",
    label: "Publication",
    display: "%s a publié la fiche",
  },
  {
    value: "publication_langue",
    label: "Publication en Langue",
    display: "%s a publié la fiche en %s",
  },
  { value: "archivage", label: "Archivage", display: "%s a archivé la fiche" },
  {
    value: "update",
    label: "Mise à jour",
    display: "%s a récupéré une nouvelle version pour cette fiche",
  },
  {
    value: "update_compliance",
    label: "Mise à jour avec conformité",
    display:
      "%s a récupéré une nouvelle version pour cette fiche et a jugé cette fiche %s",
  },
  {
    value: "clear_language",
    label: "Langage clair",
    display: "%s a rédigé la fiche en langage clair",
  },
  {
    value: "translation",
    label: "Traduction",
    display: "%s a traduit cette fiche",
  },
  {
    value: "translation_error",
    label: "Erreur de traduction",
    display: "La traduction en %s n'a pas fonctionné",
  },
  {
    value: "translation_priority",
    label: "Priorité de traduction urgente",
    display: "%s a définit une priorité de traduction urgente",
  },
  { value: "assignment", label: "Assignation", display: "%s a assigné %s" },
  { value: "note", label: "Note", display: "%s : %s" },
] as const satisfies readonly ActivityLogTypeMeta[];

/** Union of all valid activity-log type values. */
export type ActivityLogType = (typeof ACTIVITY_LOG_TYPES)[number]["value"];
