/**
 * Search scope for the "Rechercher par" dropdown (RI-1183).
 *
 * Values are the columns matched on `workflows_enriched` for documents/workflow.
 * Translations map the same values onto their own (cross-table) search — see
 * getTranslations. `undefined`/absent scope = search across all sources.
 */
export type SearchField = "title" | "structure_name" | "commune";

/** Options shown in the dropdown, in display order. Shared by all three pages. */
export const SEARCH_SCOPE_OPTIONS: { label: string; value: SearchField }[] = [
  { label: "Ville", value: "commune" },
  { label: "Structure", value: "structure_name" },
  { label: "Titre", value: "title" },
];

const SEARCH_FIELDS = SEARCH_SCOPE_OPTIONS.map((o) => o.value);

/** Narrow an untrusted query-param string to a valid SearchField (or undefined). */
export function parseSearchField(
  value: string | undefined,
): SearchField | undefined {
  return value && (SEARCH_FIELDS as string[]).includes(value)
    ? (value as SearchField)
    : undefined;
}
