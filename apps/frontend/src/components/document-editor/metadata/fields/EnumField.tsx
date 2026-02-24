"use client";

import { EditableField, SelectInput } from "@playground/ui";
import { useCallback, useState } from "react";
import { useMetadata } from "../MetadataContext";

/**
 * Props for the EnumField component.
 */
interface EnumFieldProps {
  /** Metadata field key */
  fieldKey: string;

  /** Display label */
  label: string;

  /** Available options */
  options: readonly { value: string; label: string }[];

  /** Placeholder text */
  placeholder?: string;

  /** Whether the field is disabled */
  disabled?: boolean;
}

/**
 * EnumField — An editable single-select field for metadata.
 *
 * @description
 * Displays a selected value that can be edited inline with a dropdown.
 * Uses EditableField for the read/edit toggle and SelectInput for editing.
 *
 * @example
 * ```tsx
 * <EnumField
 *   fieldKey="publicStatus"
 *   label="Public visé"
 *   options={PUBLIC_STATUS_OPTIONS}
 * />
 * ```
 */
export function EnumField({
  fieldKey,
  label,
  options,
  placeholder = "Sélectionner...",
  disabled = false,
}: EnumFieldProps) {
  const { getFieldValue, updateField, saveChanges } = useMetadata();
  const [isEditing, setIsEditing] = useState(false);

  const value = getFieldValue(fieldKey) as string | undefined;

  const handleEdit = useCallback(() => {
    setIsEditing(true);
  }, []);

  const handleExit = useCallback(async () => {
    setIsEditing(false);
    await saveChanges();
  }, [saveChanges]);

  const handleChange = useCallback(
    (newValue: string) => {
      updateField(fieldKey, newValue);
    },
    [fieldKey, updateField],
  );

  // Get display label for current value
  const displayLabel =
    options.find((opt) => opt.value === value)?.label ?? value;

  return (
    <EditableField
      isEditing={isEditing}
      onEdit={handleEdit}
      onExit={handleExit}
      disabled={disabled}
      placeholder={placeholder}
      renderEdit={({ onBlur }) => (
        <SelectInput
          variant="inline"
          options={options}
          value={value ?? ""}
          onChange={handleChange}
          onBlur={onBlur}
          placeholder={placeholder}
          autoFocus
          aria-label={label}
        />
      )}
    >
      {displayLabel}
    </EditableField>
  );
}
