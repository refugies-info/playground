"use client";

import { EditableField, TextArea } from "@playground/ui";
import { useCallback, useLayoutEffect, useRef, useState } from "react";
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
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const value = getFieldValue(fieldKey) as string | undefined;

  // Auto-grow the textarea so the edit box fills the cell like the read view
  const autoResize = useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }, []);

  // Resize once the textarea is mounted in edit mode
  useLayoutEffect(() => {
    if (isEditing) autoResize();
  }, [isEditing, autoResize]);

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
  const handleChange = useCallback(
    (newValue: string) => {
      setLocalValue(newValue);
      autoResize();
    },
    [autoResize],
  );

  return (
    <EditableField
      isEditing={isEditing}
      onEdit={handleEdit}
      onExit={handleExit}
      disabled={disabled}
      placeholder={placeholder}
      fillHeight
      renderEdit={({ onBlur, onKeyDown }) => (
        <TextArea
          ref={textareaRef}
          variant="inline"
          value={localValue}
          onChange={handleChange}
          onBlur={onBlur}
          // Single-line semantics: Enter commits instead of inserting a newline
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              textareaRef.current?.blur();
              return;
            }
            onKeyDown(e);
          }}
          rows={1}
          autoFocus
          aria-label={label}
          className="block min-h-full resize-none overflow-hidden px-0 py-0"
        />
      )}
    >
      {value}
    </EditableField>
  );
}
