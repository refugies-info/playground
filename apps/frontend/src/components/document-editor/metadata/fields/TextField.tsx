"use client";

import { EditableField, TextInput } from "@playground/ui";
import { useCallback, useState } from "react";
import { useMetadata } from "../MetadataContext";

/**
 * Props for the TextField component.
 */
interface TextFieldProps {
  /** Metadata field key */
  fieldKey: string;

  /** Display label */
  label: string;

  /** Placeholder text when empty */
  placeholder?: string;

  /** Whether the field is disabled */
  disabled?: boolean;
}

/**
 * TextField — An editable text field for metadata.
 *
 * @description
 * Displays a text value that can be edited inline.
 * Uses EditableField for the read/edit toggle and TextInput for editing.
 *
 * @example
 * ```tsx
 * <TextField fieldKey="titreMarque" label="Titre marque" />
 * ```
 */
export function TextField({
  fieldKey,
  label,
  placeholder = "Cliquer pour modifier",
  disabled = false,
}: TextFieldProps) {
  const { getFieldValue, updateField, saveChanges } = useMetadata();
  const [isEditing, setIsEditing] = useState(false);

  const value = getFieldValue(fieldKey) as string | undefined;

  const handleEdit = useCallback(() => {
    setIsEditing(true);
  }, []);

  const handleExit = useCallback(async () => {
    setIsEditing(false);
    // Auto-save on blur
    await saveChanges();
  }, [saveChanges]);

  const handleChange = useCallback(
    (newValue: string) => {
      updateField(fieldKey, newValue);
    },
    [fieldKey, updateField],
  );

  return (
    <EditableField
      isEditing={isEditing}
      onEdit={handleEdit}
      onExit={handleExit}
      disabled={disabled}
      placeholder={placeholder}
      renderEdit={({ onBlur, onKeyDown }) => (
        <TextInput
          variant="inline"
          value={value ?? ""}
          onChange={handleChange}
          onBlur={onBlur}
          onKeyDown={onKeyDown}
          autoFocus
          aria-label={label}
        />
      )}
    >
      {value}
    </EditableField>
  );
}
