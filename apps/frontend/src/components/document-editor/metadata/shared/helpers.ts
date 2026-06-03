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

export interface SourceDisplayEntry {
  key: string;
  value: string;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/**
 * Normalizes AI-generated provenance sources for display.
 *
 * The expected format is an array of dot-notation paths. Some reports contain
 * objects with a `field` and `rawValue`; in that case we keep the declared field
 * and display the raw value directly instead of trying to resolve it again.
 */
export function normalizeSourceEntries(
  source: unknown,
  diMetadata: Record<string, unknown>,
): SourceDisplayEntry[] {
  if (!Array.isArray(source)) return [];

  return source.flatMap((entry): SourceDisplayEntry[] => {
    if (typeof entry === "string") {
      return [
        {
          key: entry,
          value: formatSourceValue(resolvePath(diMetadata, entry)),
        },
      ];
    }

    if (!isRecord(entry) || typeof entry.field !== "string") return [];

    const hasRawValue = Object.hasOwn(entry, "rawValue");
    return [
      {
        key: entry.field,
        value: formatSourceValue(
          hasRawValue ? entry.rawValue : resolvePath(diMetadata, entry.field),
        ),
      },
    ];
  });
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
