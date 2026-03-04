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

  // Convert lookup to options for ComboboxInput
  const themeOptions = useMemo(() => {
    return Object.entries(themesLookup).map(([id, name]) => ({
      value: id,
      label: name,
    }));
  }, [themesLookup]);

  // Get current value (can be a string or array of theme IDs)
  const rawValue = getFieldValue(fieldKey);
  const primaryThemes = useMemo(() => {
    if (typeof rawValue === "string") return [rawValue];
    if (Array.isArray(rawValue)) return rawValue;
    return [];
  }, [rawValue]);

  // Get secondary themes
  const rawSecondary = getFieldValue("secondaryThemes");
  const secondaryThemes = useMemo(() => {
    if (Array.isArray(rawSecondary)) return rawSecondary;
    return [];
  }, [rawSecondary]);

  // All themes (primary + secondary) — deduplicated to avoid React key conflicts
  const allThemes = useMemo(
    () => [...new Set([...primaryThemes, ...secondaryThemes])],
    [primaryThemes, secondaryThemes],
  );

  // Handle change
  const handleChange = useCallback(
    (newValue: string[]) => {
      if (newValue.length === 0) {
        updateField(fieldKey, undefined);
        updateField("secondaryThemes", undefined);
      } else {
        // First theme is primary, rest are secondary
        updateField(fieldKey, newValue[0]);
        updateField(
          "secondaryThemes",
          newValue.length > 1 ? newValue.slice(1) : undefined,
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
    />
  );
}
