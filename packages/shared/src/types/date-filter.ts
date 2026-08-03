/**
 * Filtre de date composite de la liste des fiches (RI-1371).
 *
 * Trois éléments jouent ensemble :
 *   1. le type de date filtré  (dateType)
 *   2. la condition            (dateCondition) — pilote le nombre de champs
 *   3. une ou deux dates       (dateFrom / dateTo)
 *
 * Les deux dropdowns sont facultatifs : sans sélection, on filtre la
 * « Fin de session » « Jusqu'à » la date saisie, ce qui reproduit le
 * comportement du picker de session qu'il remplace.
 */

/** Type de date sur lequel porte le filtre. */
export type DateFilterType =
  | "session_start"
  | "session_end"
  | "import"
  | "arbitration"
  | "archive"
  | "publication";

/** Options du dropdown « Type de date », dans l'ordre d'affichage. */
export const DATE_FILTER_TYPE_OPTIONS: {
  label: string;
  value: DateFilterType;
}[] = [
  { label: "Début de session", value: "session_start" },
  { label: "Fin de session", value: "session_end" },
  { label: "Import", value: "import" },
  { label: "Arbitrage", value: "arbitration" },
  { label: "Archivage", value: "archive" },
  { label: "Publication", value: "publication" },
];

/** Type appliqué quand l'utilisatrice n'en a sélectionné aucun. */
export const DEFAULT_DATE_FILTER_TYPE: DateFilterType = "session_end";

/** Sens du filtre : borne basse, borne haute, ou intervalle. */
export type DateFilterCondition = "from" | "until" | "between";

/** Options du dropdown « Condition », dans l'ordre d'affichage. */
export const DATE_FILTER_CONDITION_OPTIONS: {
  label: string;
  value: DateFilterCondition;
}[] = [
  { label: "À partir de", value: "from" },
  { label: "Jusqu'à", value: "until" },
  { label: "Entre", value: "between" },
];

/** Condition appliquée quand l'utilisatrice n'en a sélectionné aucune. */
export const DEFAULT_DATE_FILTER_CONDITION: DateFilterCondition = "until";

/**
 * Colonne de `workflows_enriched` filtrée pour chaque type de date.
 *
 * `isTimestamp` distingue les colonnes horodatées des colonnes `date` : sur un
 * timestamp, `<= '2026-12-31'` exclurait tout ce qui suit minuit ce jour-là.
 * La borne haute y est donc traduite en `< lendemain` (cf. `nextIsoDay`).
 */
export const DATE_FILTER_COLUMNS: Record<
  DateFilterType,
  { column: string; isTimestamp: boolean }
> = {
  session_start: { column: "session_start_date", isTimestamp: false },
  session_end: { column: "session_end_date", isTimestamp: false },
  // Date d'import = date d'ajout de la fiche au BO (colonne "Date d'import" de
  // l'onglet Importer, cf. Document.date_added)
  import: { column: "created_at", isTimestamp: true },
  // Date d'arbitrage = création du rapport de conformité
  arbitration: { column: "report_created_at", isTimestamp: true },
  archive: { column: "archived_at", isTimestamp: true },
  // Pas de colonne scalaire pour la publication : on filtre le champ JSONB.
  // La comparaison est textuelle, mais toutes les valeurs sont produites par le
  // même `jsonb_build_object` sur un timestamptz — donc au format ISO-8601 avec
  // le même décalage, où l'ordre lexicographique suit l'ordre chronologique.
  publication: {
    column: "latest_publication->>created_at",
    isTimestamp: true,
  },
};

/** `YYYY-MM-DD` → jour suivant, borne haute exclusive des colonnes horodatées. */
export function nextIsoDay(value: string): string {
  const [year, month, day] = value.split("-").map(Number);
  const next = new Date(Date.UTC(year, month - 1, day + 1));
  return next.toISOString().slice(0, 10);
}

const DATE_FILTER_TYPES = DATE_FILTER_TYPE_OPTIONS.map((o) => o.value);
const DATE_FILTER_CONDITIONS = DATE_FILTER_CONDITION_OPTIONS.map(
  (o) => o.value,
);

/** Restreint une valeur de query param à un DateFilterType valide. */
export function parseDateFilterType(
  value: string | undefined,
): DateFilterType | undefined {
  return value && (DATE_FILTER_TYPES as string[]).includes(value)
    ? (value as DateFilterType)
    : undefined;
}

/** Restreint une valeur de query param à un DateFilterCondition valide. */
export function parseDateFilterCondition(
  value: string | undefined,
): DateFilterCondition | undefined {
  return value && (DATE_FILTER_CONDITIONS as string[]).includes(value)
    ? (value as DateFilterCondition)
    : undefined;
}

/** Nombre de champs date affichés pour une condition donnée. */
export function isRangeCondition(
  condition: DateFilterCondition | undefined,
): boolean {
  return (condition ?? DEFAULT_DATE_FILTER_CONDITION) === "between";
}
