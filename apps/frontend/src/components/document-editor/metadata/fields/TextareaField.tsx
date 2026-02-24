"use client";

import { EditableField, TextArea } from "@playground/ui";
import { useCallback, useState } from "react";
import { useMetadata } from "../MetadataContext";

/**
 * Props for the TextareaField component.
 */
interface TextareaFieldProps {
  /** Metadata field key */
  fieldKey: string;

  /** Display label */
  label: string;

  /** Placeholder text when empty */
  placeholder?: string;

  /** Whether the field is disabled */
  disabled?: boolean;

  /** Number of rows for the textarea */
  rows?: number;
}

/**
 * TextareaField — An editable textarea for metadata.
 *
 * @description
 * Displays a multi-line text value that can be edited inline.
 * Uses EditableField for the read/edit toggle and TextArea for editing.
 *
 * @example
 * ```tsx
 * <TextareaField fieldKey="abstract" label="En bref" rows={3} />
 * ```
 */
export function TextareaField({
  fieldKey,
  label,
  placeholder = "Cliquer pour modifier",
  disabled = false,
  rows = 3,
}: TextareaFieldProps) {
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

  // Display truncated text in read mode
  const displayValue =
    value && value.length > 100 ? `${value.substring(0, 100)}…` : value;

  return (
    <EditableField
      isEditing={isEditing}
      onEdit={handleEdit}
      onExit={handleExit}
      disabled={disabled}
      placeholder={placeholder}
      renderEdit={({ onBlur, onKeyDown }) => (
        <TextArea
          variant="inline"
          value={value ?? ""}
          onChange={handleChange}
          onBlur={onBlur}
          onKeyDown={onKeyDown}
          rows={rows}
          autoFocus
          aria-label={label}
        />
      )}
    >
      {displayValue}
    </EditableField>
  );
}
