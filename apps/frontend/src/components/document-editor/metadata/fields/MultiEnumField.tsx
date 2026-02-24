"use client";

import { ComboboxInput } from "@playground/ui";
import { useCallback } from "react";
import { useMetadata } from "../MetadataContext";

/**
 * Props for the MultiEnumField component.
 */
interface MultiEnumFieldProps {
  /** Metadata field key */
  fieldKey: string;

  /** Display label (for aria-label) */
  label: string;

  /** Available options */
  options: readonly { value: string; label: string }[];

  /** Placeholder text */
  placeholder?: string;

  /** Whether the field is disabled */
  disabled?: boolean;
}

/**
 * MultiEnumField — A multi-select field for metadata.
 *
 * @description
 * Displays a searchable multi-select with selected values shown as tags.
 * No wrapper EditableField — the ComboboxInput is always interactive.
 *
 * @example
 * ```tsx
 * <MultiEnumField
 *   fieldKey="frenchLevel"
 *   label="Niveau de français"
 *   options={FRENCH_LEVEL_OPTIONS}
 * />
 * ```
 */
export function MultiEnumField({
  fieldKey,
  label,
  options,
  placeholder = "",
  disabled = false,
}: MultiEnumFieldProps) {
  const { getFieldValue, updateField, saveChanges } = useMetadata();

  const value = (getFieldValue(fieldKey) as string[] | undefined) ?? [];

  const handleChange = useCallback(
    (newValue: string[]) => {
      updateField(fieldKey, newValue.length > 0 ? newValue : undefined);
      // Auto-save on change
      saveChanges();
    },
    [fieldKey, updateField, saveChanges],
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
