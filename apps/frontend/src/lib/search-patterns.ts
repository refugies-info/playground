// Accent folding happens on the pattern side so search needs no unaccent migration.
// Upper-case variants are listed because ~* only folds ASCII case under some DB locales.
const ACCENT_CLASSES: Record<string, string> = {
  a: "[aàâäAÀÂÄ]",
  c: "[cçCÇ]",
  e: "[eéèêëEÉÈÊË]",
  i: "[iîïIÎÏ]",
  o: "[oôöOÔÖ]",
  u: "[uùûüUÙÛÜ]",
  y: "[yÿYŸ]",
};

const toWordPattern = (word: string): string =>
  [...word.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase()]
    .map((char) =>
      char === "'" || char === "’" ? "['’]" : (ACCENT_CLASSES[char] ?? char),
    )
    .join("");

/**
 * Splits a free-text search into accent-insensitive regex patterns (one per word),
 * so word order, punctuation and dashes ("-" vs "–") no longer break matching.
 */
export const toSearchPatterns = (search: string): string[] =>
  search
    .split(/[^\p{L}\p{N}_'’-]+/u)
    .map((word) => word.replace(/^['’-]+|['’-]+$/g, ""))
    .filter(Boolean)
    .map(toWordPattern);

/**
 * One PostgREST `.or()` filter per word: each word must match at least one column.
 * Chain them with `.or()` to AND the words together.
 */
export const toSearchOrFilters = (
  columns: readonly string[],
  search: string,
): string[] =>
  toSearchPatterns(search).map((pattern) =>
    columns.map((column) => `${column}.imatch."${pattern}"`).join(","),
  );
