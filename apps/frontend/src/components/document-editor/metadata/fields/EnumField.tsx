"use client";

import { EditableField, SelectInput } from "@playground/ui";
import { useCallback, useState } from "react";
import { useMetadata } from "../MetadataContext";

/**
 * EnumField — An editable single-select field for metadata.
 */
export function EnumField({
  fieldKey,
  label,
  options,
  placeholder = "Sélectionner...",
  disabled = false,
}: {
  fieldKey: string;
  label: string;
  options: readonly { value: string; label: string }[];
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
          value={localValue}
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
