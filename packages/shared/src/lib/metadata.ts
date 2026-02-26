/**
 * Metadata can have direct title fields.
 */
export type Metadata = {
  title?: string;
  "intitule-formation"?: string;
  nom?: string;
  [key: string]: unknown;
};

/**
 * Safely extracts the title from LHEO metadata.
 * Handles the nested structure: lheo.offres.formation[0]["intitule-formation"]
 * Also checks for direct title, nom or intitule-formation fields.
 */
export function extractTitleFromMetadata(metadata: Metadata): string | null {
  // Check for direct title field
  if (metadata.title && typeof metadata.title === "string") {
    return metadata.title;
  }

  // Check for direct intitule-formation field
  if (
    metadata["intitule-formation"] &&
    typeof metadata["intitule-formation"] === "string"
  ) {
    return metadata["intitule-formation"];
  }

  // Check for direct nom field
  if (metadata.nom && typeof metadata.nom === "string") {
    return metadata.nom;
  }

  return null;
}

// =============================================================================
// Metadata Merge & Diff Functions
// =============================================================================

/**
 * Deep merge two metadata objects.
 * Values from `overrides` take precedence over values from `base`.
 * Undefined values in overrides are ignored (base value is preserved).
 *
 * @param base - The base metadata (e.g., from letta_report.metadata_ri)
 * @param overrides - The override metadata (e.g., from editorial_record.metadata)
 * @returns Merged metadata object
 *
 * @example
 * mergeMetadata(
 *   { theme: "abc", price: { values: [0] } },
 *   { price: { values: [50] } }
 * )
 * // Returns: { theme: "abc", price: { values: [50] } }
 */
export function mergeMetadata(
  base: Record<string, unknown>,
  overrides: Record<string, unknown> | null | undefined,
): Record<string, unknown> {
  // If no overrides, return base as-is
  if (!overrides || Object.keys(overrides).length === 0) {
    return { ...base };
  }

  const result: Record<string, unknown> = { ...base };

  for (const key of Object.keys(overrides)) {
    const overrideValue = overrides[key];

    // Skip undefined values - they don't override
    if (overrideValue === undefined) {
      continue;
    }

    // Null explicitly clears the field
    if (overrideValue === null) {
      delete result[key];
      continue;
    }

    const baseValue = result[key];

    // Deep merge for objects (but not arrays)
    if (
      typeof baseValue === "object" &&
      baseValue !== null &&
      !Array.isArray(baseValue) &&
      typeof overrideValue === "object" &&
      overrideValue !== null &&
      !Array.isArray(overrideValue)
    ) {
      result[key] = mergeMetadata(
        baseValue as Record<string, unknown>,
        overrideValue as Record<string, unknown>,
      );
    } else {
      // Primitive, array, or new field - direct replacement
      result[key] = overrideValue;
    }
  }

  return result;
}

/**
 * Extract the diff between original and edited metadata.
 * Returns only the fields that have been modified.
 *
 * @param original - The original metadata (e.g., from letta_report.metadata_ri)
 * @param edited - The edited metadata (merged with original)
 * @returns Object containing only the modified fields
 *
 * @example
 * extractDiff(
 *   { theme: "abc", price: { values: [0] } },
 *   { theme: "abc", price: { values: [50] } }
 * )
 * // Returns: { price: { values: [50] } }
 */
export function extractDiff(
  original: Record<string, unknown>,
  edited: Record<string, unknown>,
): Record<string, unknown> {
  const diff: Record<string, unknown> = {};

  for (const key of Object.keys(edited)) {
    const originalValue = original[key];
    const editedValue = edited[key];

    // Field is new (didn't exist in original)
    if (!(key in original)) {
      diff[key] = editedValue;
      continue;
    }

    // Both are objects - deep diff
    if (
      typeof originalValue === "object" &&
      originalValue !== null &&
      !Array.isArray(originalValue) &&
      typeof editedValue === "object" &&
      editedValue !== null &&
      !Array.isArray(editedValue)
    ) {
      const nestedDiff = extractDiff(
        originalValue as Record<string, unknown>,
        editedValue as Record<string, unknown>,
      );
      if (Object.keys(nestedDiff).length > 0) {
        diff[key] = nestedDiff;
      }
      continue;
    }

    // Different values (primitive or array)
    if (!isEqual(originalValue, editedValue)) {
      diff[key] = editedValue;
    }
  }

  return diff;
}

/**
 * Check if two values are equal (deep comparison for objects/arrays).
 */
function isEqual(a: unknown, b: unknown): boolean {
  // Same reference or primitive equality
  if (a === b) return true;

  // Both null/undefined
  if (a == null || b == null) return a === b;

  // Different types
  if (typeof a !== typeof b) return false;

  // Arrays
  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) return false;
    return a.every((item, index) => isEqual(item, b[index]));
  }

  // Objects
  if (typeof a === "object" && typeof b === "object") {
    const aObj = a as Record<string, unknown>;
    const bObj = b as Record<string, unknown>;
    const aKeys = Object.keys(aObj);
    const bKeys = Object.keys(bObj);

    if (aKeys.length !== bKeys.length) return false;
    if (!aKeys.every((key) => key in bObj)) return false;

    return aKeys.every((key) => isEqual(aObj[key], bObj[key]));
  }

  // Primitives that aren't equal
  return false;
}
