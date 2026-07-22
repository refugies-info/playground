"use client";

import { ComboboxInput } from "@playground/ui";
import { useCallback, useMemo } from "react";
import { useDocument } from "../../DocumentContext";
import { useMetadata } from "../MetadataContext";

/**
 * ThemeSelectField — An editable themes field with primary/secondary support.
 *
 * @description
 * - First theme is marked as "thème principal"
 * - Other themes are secondary
 * - Uses ComboboxInput for selection
 */
export function ThemeSelectField({ fieldKey }: { fieldKey: string }) {
  const { document } = useDocument();
  const { getFieldValue, updateField } = useMetadata();

  // Get themes lookup from document reference data
  const themesLookup = document?.referenceData?.themes ?? {};
  const themeColors = document?.referenceData?.themeColors ?? {};

  // Convert lookup to options for ComboboxInput
  const themeOptions = useMemo(() => {
    return Object.entries(themesLookup).map(([id, name]) => ({
      value: id,
      label: name,
    }));
  }, [themesLookup]);

  // Get current value (can be a string or array of theme IDs)
  // Filter out IDs that don't exist in RI reference data — the AI may hallucinate
  // arbitrary values (e.g. "FR") instead of valid MongoDB ObjectIds (RI-1211)
  const rawValue = getFieldValue(fieldKey);
  const primaryThemes = useMemo(() => {
    const raw =
      typeof rawValue === "string"
        ? [rawValue]
        : Array.isArray(rawValue)
          ? rawValue
          : [];
    return raw.filter(
      (id) => typeof id === "string" && Object.hasOwn(themesLookup, id),
    );
  }, [rawValue, themesLookup]);

  // Get secondary themes
  const rawSecondary = getFieldValue("secondaryThemes");
  const secondaryThemes = useMemo(() => {
    const raw = Array.isArray(rawSecondary) ? rawSecondary : [];
    return raw.filter(
      (id) => typeof id === "string" && Object.hasOwn(themesLookup, id),
    );
  }, [rawSecondary, themesLookup]);

  // All themes (primary + secondary) — deduplicated to avoid React key conflicts
  const allThemes = useMemo(
    () => [...new Set([...primaryThemes, ...secondaryThemes])],
    [primaryThemes, secondaryThemes],
  );

  // Handle change
  const handleChange = useCallback(
    (newValue: string[]) => {
      if (newValue.length === 0) {
        // null = explicitly clear (vs undefined which would revert to AI value)
        updateField(fieldKey, null);
        updateField("secondaryThemes", null);
      } else {
        // First theme is primary, rest are secondary
        updateField(fieldKey, newValue[0]);
        updateField(
          "secondaryThemes",
          // null (not undefined) to avoid AI secondary themes reappearing
          newValue.length > 1 ? newValue.slice(1) : null,
        );
      }
    },
    [fieldKey, updateField],
  );

  return (
    <ComboboxInput
      variant="inline"
      options={themeOptions}
      value={allThemes}
      onChange={handleChange}
      placeholder="Rechercher un thème..."
      firstBadgeLabel="thème principal"
      maxItems={3}
      optionVariant="pill"
      optionLayout="wrap"
      optionColors={themeColors}
    />
  );
}
