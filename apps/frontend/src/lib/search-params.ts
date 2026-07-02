/**
 * Helpers for coercing Next.js `searchParams` values.
 *
 * A single query param can arrive as `string`, `string[]` (repeated key) or
 * `undefined`. This normalizes those shapes at the page boundary.
 */

/**
 * Returns the param as a string, or `""` when absent.
 * Repeated keys (`?k=a&k=b`) collapse to the first value.
 */
export const getQueryParam = (value: string | string[] | undefined): string =>
  (Array.isArray(value) ? value[0] : value) ?? "";
