import type { WorkStatus } from "@playground/shared-types";
import type { TagStatus } from "@playground/ui/primitives";

/**
 * Work-status shared config — single source of truth for the manual
 * "État de traitement" dropdown (list des fiches + header d'une fiche).
 *
 * Chaque statut mappe vers un variant du composant <Tag /> (couleurs DSFR) :
 *   to_process → a-traiter  (bleu France clair  #E3E3FD)
 *   draft      → en-cours   (jaune tournesol    #FEECC2)
 *   to_review  → a-relire   (violet glycine     #FDDBFA)
 */
export const WORK_STATUS_TO_TAG: Record<WorkStatus, TagStatus> = {
  to_process: "a-traiter",
  draft: "en-cours",
  to_review: "a-relire",
};

/** Statuts sélectionnables manuellement, dans l'ordre d'affichage du popup. */
export const SELECTABLE_WORK_STATUSES: WorkStatus[] = [
  "to_process",
  "draft",
  "to_review",
];
