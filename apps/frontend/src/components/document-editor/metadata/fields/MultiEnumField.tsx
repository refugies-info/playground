"use client";

import { ComboboxInput } from "@playground/ui";
import { useCallback } from "react";
import { useMetadata } from "../MetadataContext";

/**
 * MultiEnumField — A multi-select field for metadata.
 * Direct save on change (no EditableField wrapper).
 */
export function MultiEnumField({
  fieldKey,
  label,
  options,
  placeholder = "",
  disabled = false,
}: {
  fieldKey: string;
  label: string;
  options: readonly { value: string; label: string }[];
  placeholder?: string;
  disabled?: boolean;
}) {
  const { getFieldValue, updateField } = useMetadata();

  const value = (getFieldValue(fieldKey) as string[] | undefined) ?? [];

  // Direct save on change (updateField handles save automatically)
  const handleChange = useCallback(
    (newValue: string[]) => {
      updateField(fieldKey, newValue.length > 0 ? newValue : null);
    },
    [fieldKey, updateField],
  );

  return (
    <ComboboxInput
      variant="inline"
      options={options}
      value={value}
      onChange={handleChange}
      placeholder={placeholder}
      disabled={disabled}
      aria-label={label}
    />
  );
}
