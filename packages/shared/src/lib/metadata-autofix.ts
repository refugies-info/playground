/**
 * Metadata Auto-Fix Utilities
 *
 * Automatically detects and fixes common metadata format issues
 * from Letta API responses (e.g., arrays instead of objects).
 */

import { logger } from "../logger";

/**
 * Result of an auto-fix operation
 */
export interface AutoFixResult {
  /** The fixed value (or original if no fix needed) */
  value: unknown;
  /** Whether a fix was applied */
  wasFixed: boolean;
  /** Description of the fix applied */
  fixDescription?: string;
  /** Original value before fix */
  originalValue?: unknown;
}

/**
 * Auto-fix rules for common metadata issues
 */
const arrayFields = new Set([
  "secondaryThemes",
  "needs",
  "publicStatus",
  "public",
  "frenchLevel",
  "periode",
  "timeSlots",
  "location",
  "conditions",
  "map",
]);

const autoFixRules: Array<{
  name: string;
  description: string;
  detect: (value: unknown, fieldKey: string) => boolean;
  fix: (value: unknown) => unknown;
}> = [
  {
    name: "fix_price_gratuit",
    description: 'Le prix "gratuit" a été converti en 0 EUR.',
    detect: (value) => {
      const obj = Array.isArray(value) ? value[0] : value;
      if (!obj || typeof obj !== "object") return false;
      const values = (obj as { values?: unknown }).values;
      return (
        Array.isArray(values) &&
        values.length === 1 &&
        typeof values[0] === "string" &&
        values[0].toLowerCase() === "gratuit"
      );
    },
    fix: (value) => {
      const obj = Array.isArray(value) ? value[0] : value;
      const {
        details: _details,
        values: _values,
        ...rest
      } = (obj ?? {}) as {
        values?: unknown[];
        details?: unknown;
        [key: string]: unknown;
      };
      void _details;
      void _values;
      return { ...rest, values: [0] };
    },
  },
  {
    name: "fix_price_string_numbers",
    description: "Les prix ont été convertis en nombres.",
    detect: (value) => {
      const obj = Array.isArray(value) ? value[0] : value;
      if (!obj || typeof obj !== "object") return false;
      const values = (obj as { values?: unknown }).values;
      return (
        Array.isArray(values) &&
        values.length > 0 &&
        values.every(
          (v) =>
            typeof v === "string" &&
            v.trim() !== "" &&
            !Number.isNaN(Number(v)),
        )
      );
    },
    fix: (value) => {
      const obj = Array.isArray(value) ? value[0] : value;
      const base = (obj ?? {}) as {
        values?: unknown[];
        [key: string]: unknown;
      };
      const rawValues = Array.isArray(base.values) ? base.values : [];
      const numericValues = rawValues.map((v) => Number(v));
      return { ...base, values: numericValues };
    },
  },
  {
    name: "fix_price_empty_details",
    description: 'Le champ "détail" vide a été supprimé du prix.',
    detect: (value) => {
      const obj = Array.isArray(value) ? value[0] : value;
      if (!obj || typeof obj !== "object") return false;
      return (
        "details" in (obj as object) &&
        (obj as { details?: unknown }).details === ""
      );
    },
    fix: (value) => {
      const obj = Array.isArray(value) ? value[0] : value;
      const { details: _details, ...rest } = (obj ?? {}) as {
        details?: unknown;
        [key: string]: unknown;
      };
      void _details;
      return rest;
    },
  },
  {
    name: "unwrap_single_element_array",
    description: "Le format a été harmonisé (objet unique).",
    detect: (value, fieldKey) =>
      !arrayFields.has(fieldKey) &&
      Array.isArray(value) &&
      value.length === 1 &&
      typeof value[0] === "object" &&
      value[0] !== null,
    fix: (value) => (value as unknown[])[0],
  },
  {
    name: "unwrap_empty_array_to_null",
    description: 'La valeur vide a été convertie en "aucune valeur".',
    detect: (value) => Array.isArray(value) && value.length === 0,
    fix: () => null,
  },
  {
    name: "fix_age_format",
    description: "Le format de l'age a été corrigé automatiquement.",
    detect: (value) => {
      if (!Array.isArray(value) || value.length !== 1) return false;
      const item = value[0];
      return (
        typeof item === "object" &&
        item !== null &&
        ("ages" in item || "type" in item)
      );
    },
    fix: (value) => (value as unknown[])[0],
  },
  {
    name: "fix_price_format",
    description: "Le format du prix a été corrigé automatiquement.",
    detect: (value) => {
      if (!Array.isArray(value) || value.length !== 1) return false;
      const item = value[0];
      return (
        typeof item === "object" &&
        item !== null &&
        ("values" in item || "details" in item)
      );
    },
    fix: (value) => (value as unknown[])[0],
  },
  {
    name: "fix_commitment_format",
    description: "Le format de la durée a été corrigé automatiquement.",
    detect: (value) => {
      if (!Array.isArray(value) || value.length !== 1) return false;
      const item = value[0];
      return (
        typeof item === "object" &&
        item !== null &&
        ("hours" in item || "timeUnit" in item || "amountDetails" in item)
      );
    },
    fix: (value) => (value as unknown[])[0],
  },
  {
    name: "fix_frequency_format",
    description: "Le format de la fréquence a été corrigé automatiquement.",
    detect: (value) => {
      if (!Array.isArray(value) || value.length !== 1) return false;
      const item = value[0];
      return (
        typeof item === "object" &&
        item !== null &&
        ("frequencyUnit" in item || "hours" in item)
      );
    },
    fix: (value) => (value as unknown[])[0],
  },
];

/**
 * Attempts to auto-fix a metadata value
 *
 * @param value - The original value from Letta/API
 * @param fieldKey - The field key (for logging)
 * @returns AutoFixResult with fixed value and status
 *
 * @example
 * autoFixMetadataValue([{ ages: [16], type: "moreThan" }], "age")
 * // Returns: { value: { ages: [16], type: "moreThan" }, wasFixed: true, fixDescription: "..." }
 */
export function autoFixMetadataValue(
  value: unknown,
  fieldKey: string,
): AutoFixResult {
  // Skip null/undefined
  if (value === null || value === undefined) {
    return { value, wasFixed: false };
  }

  // Try each fix rule
  for (const rule of autoFixRules) {
    try {
      if (rule.detect(value, fieldKey)) {
        const fixedValue = rule.fix(value);
        logger.info(
          {
            field: fieldKey,
            rule: rule.name,
            original: value,
            fixed: fixedValue,
          },
          `Auto-fixed metadata field: ${fieldKey}`,
        );
        return {
          value: fixedValue,
          wasFixed: true,
          fixDescription: rule.description,
          originalValue: value,
        };
      }
    } catch (error) {
      logger.warn(
        { field: fieldKey, rule: rule.name, error },
        `Auto-fix rule failed for ${fieldKey}`,
      );
    }
  }

  // No fix needed
  return { value, wasFixed: false };
}

/**
 * Apply auto-fix to all metadata fields
 *
 * @param metadata - The full metadata object
 * @returns Object with fixed values and list of applied fixes
 */
export function autoFixAllMetadata(metadata: Record<string, unknown>): {
  fixedMetadata: Record<string, unknown>;
  fixes: Array<{
    key: string;
    description: string;
    originalValue: unknown;
    fixedValue: unknown;
  }>;
} {
  const fixedMetadata: Record<string, unknown> = {};
  const fixes: Array<{
    key: string;
    description: string;
    originalValue: unknown;
    fixedValue: unknown;
  }> = [];

  for (const [key, value] of Object.entries(metadata)) {
    const result = autoFixMetadataValue(value, key);
    fixedMetadata[key] = result.value;

    if (result.wasFixed && result.fixDescription) {
      fixes.push({
        key,
        description: result.fixDescription,
        originalValue: result.originalValue,
        fixedValue: result.value,
      });
    }
  }

  if (fixes.length > 0) {
    logger.info(
      { fixCount: fixes.length, fixes },
      "Applied auto-fixes to metadata",
    );
  }

  return { fixedMetadata, fixes };
}
