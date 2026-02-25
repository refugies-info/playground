/**
 * Shared Helpers
 * Generic utilities for metadata display
 */

/**
 * Resolves a dot-notation path in an object.
 * @example resolvePath({ a: { b: 1 } }, "a.b") → 1
 */
export function resolvePath(
  obj: Record<string, unknown>,
  path: string,
): unknown {
  const parts = path.split(".");
  let current: unknown = obj;

  for (const part of parts) {
    if (current === null || current === undefined) return undefined;
    if (typeof current !== "object") return undefined;
    current = (current as Record<string, unknown>)[part];
  }

  return current;
}

/**
 * Formats a source value for display in the "Source RCO" column.
 */
export function formatSourceValue(value: unknown): string {
  if (value === null || value === undefined) return "";
  if (typeof value === "string") return value;
  if (typeof value === "number") return String(value);
  if (Array.isArray(value)) {
    return value
      .map((v) => (typeof v === "object" ? JSON.stringify(v) : String(v)))
      .join(", ");
  }
  if (typeof value === "object") {
    return JSON.stringify(value);
  }
  return String(value);
}
