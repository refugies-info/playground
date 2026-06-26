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

export const TYPE_COMPLIANCE_IA = "compliance_ia";
export const TYPE_COMPLIANCE_HUMAN = "compliance_human";
export const TYPE_PUBLICATION = "publication";
export const TYPE_PUBLICATION_LANGUE = "publication_langue";
export const TYPE_ARCHIVE = "archive";
export const TYPE_UPDATE = "update";
export const TYPE_UPDATE_COMPLIANCE = "update_compliance";
export const TYPE_CLEAR_LANGUAGE = "clear_language";
export const TYPE_TRANSLATION = "translation";
export const TYPE_TRANSLATION_ERROR = "translation_error";
export const TYPE_TRANSLATION_PRIORITY = "translation_priority";
export const TYPE_ASSIGNMENT = "assignment";
export const TYPE_NOTE = "note";

export const ACTIVITY_LOG_TYPES = [
  {
    value: TYPE_COMPLIANCE_IA,
    label: "Arbitrage de PapaIA",
    display: "PapaIA a jugé cette fiche %s",
  },
  {
    value: TYPE_COMPLIANCE_HUMAN,
    label: "Changement de conformité",
    display: "%s a changé la conformité de cette fiche en %s",
  },
  {
    value: TYPE_PUBLICATION,
    label: "Publication",
    display: "%s a publié la fiche",
  },
  {
    value: TYPE_PUBLICATION_LANGUE,
    label: "Publication en Langue",
    display: "%s a publié la fiche en %s",
  },
  {
    value: TYPE_ARCHIVE,
    label: "Archivage",
    display: "%s a archivé la fiche",
  },
  {
    value: TYPE_UPDATE,
    label: "Mise à jour",
    display: "%s a récupéré une nouvelle version pour cette fiche",
  },
  {
    value: TYPE_UPDATE_COMPLIANCE,
    label: "Mise à jour avec conformité",
    display:
      "%s a récupéré une nouvelle version pour cette fiche et a jugé cette fiche %s",
  },
  {
    value: TYPE_CLEAR_LANGUAGE,
    label: "Langage clair",
    display: "%s a rédigé la fiche en langage clair",
  },
  {
    value: TYPE_TRANSLATION,
    label: "Traduction",
    display: "%s a traduit cette fiche",
  },
  {
    value: TYPE_TRANSLATION_ERROR,
    label: "Erreur de traduction",
    display: "La traduction en %s n'a pas fonctionné",
  },
  {
    value: TYPE_TRANSLATION_PRIORITY,
    label: "Priorité de traduction urgente",
    display: "%s a défini une priorité de traduction urgente",
  },
  { value: TYPE_ASSIGNMENT, label: "Assignation", display: "%s a assigné %s" },
  { value: TYPE_NOTE, label: "Note", display: "%s : %s" },
] as const satisfies readonly ActivityLogTypeMeta[];

/** Union of all valid activity-log type values. */
export type ActivityLogType = (typeof ACTIVITY_LOG_TYPES)[number]["value"];
