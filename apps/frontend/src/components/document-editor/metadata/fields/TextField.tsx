"use client";

import { EditableField, TextInput } from "@playground/ui";
import { useCallback, useState } from "react";
import { useMetadata } from "../MetadataContext";

/**
 * TextField — An editable text field for metadata.
 */
export function TextField({
  fieldKey,
  label,
  placeholder = "Cliquer pour modifier",
  disabled = false,
}: {
  fieldKey: string;
  label: string;
  placeholder?: string;
  disabled?: boolean;
}) {
  const { getFieldValue, updateField } = useMetadata();
  const [isEditing, setIsEditing] = useState(false);
  const [localValue, setLocalValue] = useState<string>("");

  const value = getFieldValue(fieldKey) as string | undefined;

  // Sync local value when entering edit mode
  const handleEdit = useCallback(() => {
    setLocalValue(value ?? "");
    setIsEditing(true);
  }, [value]);

  // Save on exit
  const handleExit = useCallback(async () => {
    setIsEditing(false);
    if (localValue !== value) {
      await updateField(fieldKey, localValue || undefined);
    }
  }, [fieldKey, localValue, value, updateField]);

  // Local change (no save yet)
  const handleChange = useCallback((newValue: string) => {
    setLocalValue(newValue);
  }, []);

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
          value={localValue}
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
