"use client";

import { ComboboxInput } from "@playground/ui";
import { useCallback, useMemo } from "react";
import { useDocument } from "../../DocumentContext";
import { useMetadata } from "../MetadataContext";

/**
 * NeedSelectField — An editable needs field with RI API lookup.
 * Filters needs based on the currently selected themes (primary + secondary).
 */
export function NeedSelectField({ fieldKey }: { fieldKey: string }) {
  const { document } = useDocument();
  const { getFieldValue, updateField } = useMetadata();

  // Get reference data from document
  const needsLookup = document?.referenceData?.needs ?? {};
  const needsByTheme = document?.referenceData?.needsByTheme ?? {};
  const themeColors = document?.referenceData?.themeColors ?? {};

  // Color each need with its parent theme's color (needId → color)
  const needColors = useMemo(() => {
    const map: Record<string, string> = {};
    for (const [themeId, needIds] of Object.entries(needsByTheme)) {
      const color = themeColors[themeId];
      if (!color) continue;
      for (const needId of needIds) {
        map[needId] = color;
      }
    }
    return map;
  }, [needsByTheme, themeColors]);

  // Get selected themes (primary + secondary)
  const primaryTheme = getFieldValue("theme");
  const secondaryThemes = getFieldValue("secondaryThemes");
  const selectedThemeIds = useMemo(() => {
    const ids: string[] = [];
    if (typeof primaryTheme === "string" && primaryTheme)
      ids.push(primaryTheme);
    if (Array.isArray(secondaryThemes)) ids.push(...secondaryThemes);
    return ids;
  }, [primaryTheme, secondaryThemes]);

  // Get current value (array of need IDs)
  // Filter out IDs that don't exist in RI reference data — the AI may hallucinate
  // arbitrary values instead of valid MongoDB ObjectIds (RI-1211)
  const rawValue = getFieldValue(fieldKey);
  const value = useMemo(() => {
    const raw = Array.isArray(rawValue) ? rawValue : [];
    return raw.filter(
      (id) => typeof id === "string" && Object.hasOwn(needsLookup, id),
    );
  }, [rawValue, needsLookup]);

  // Filter needs by selected themes — if no theme selected, show all needs.
  // Always include currently selected values so their labels resolve correctly
  // (the AI may pick needs from a different theme than the one currently selected).
  const needOptions = useMemo(() => {
    const selectedSet = new Set(value);

    if (selectedThemeIds.length === 0) {
      return Object.entries(needsLookup).map(([id, name]) => ({
        value: id,
        label: name as string,
      }));
    }
    // Collect need IDs allowed by selected themes
    const allowedNeedIds = new Set<string>();
    for (const themeId of selectedThemeIds) {
      for (const needId of needsByTheme[themeId] ?? []) {
        allowedNeedIds.add(needId);
      }
    }
    return Object.entries(needsLookup)
      .filter(([id]) => allowedNeedIds.has(id) || selectedSet.has(id))
      .map(([id, name]) => ({
        value: id,
        label: name as string,
      }));
  }, [needsLookup, needsByTheme, selectedThemeIds, value]);

  const handleChange = useCallback(
    (newValue: string[]) => {
      updateField(fieldKey, newValue.length > 0 ? newValue : null);
    },
    [fieldKey, updateField],
  );

  return (
    <ComboboxInput
      variant="inline"
      options={needOptions}
      value={value}
      onChange={handleChange}
      placeholder="Ajouter un besoin"
      optionVariant="pill"
      optionLayout="list"
      optionColors={needColors}
    />
  );
}
