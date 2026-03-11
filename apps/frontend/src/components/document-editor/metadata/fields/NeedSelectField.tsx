"use client";

import { ComboboxInput } from "@playground/ui";
import { useCallback, useMemo } from "react";
import { useDocument } from "../../DocumentContext";
import { useMetadata } from "../MetadataContext";

/**
 * NeedSelectField — An editable needs field with RI API lookup.
 */
export function NeedSelectField({ fieldKey }: { fieldKey: string }) {
  const { document } = useDocument();
  const { getFieldValue, updateField } = useMetadata();

  // Get needs lookup from document reference data
  const needsLookup = document?.referenceData?.needs ?? {};

  // Convert lookup to options for ComboboxInput
  const needOptions = useMemo(() => {
    return Object.entries(needsLookup).map(([id, name]) => ({
      value: id,
      label: name,
    }));
  }, [needsLookup]);

  // Get current value (array of need IDs)
  const rawValue = getFieldValue(fieldKey);
  const value = useMemo(() => {
    if (Array.isArray(rawValue)) return rawValue;
    return [];
  }, [rawValue]);

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
    />
  );
}
