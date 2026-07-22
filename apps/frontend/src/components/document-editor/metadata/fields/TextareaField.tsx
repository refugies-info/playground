"use client";

import { cn, EditableField, TextArea } from "@playground/ui";
import { useCallback, useLayoutEffect, useRef, useState } from "react";
import { useMetadata } from "../MetadataContext";

/**
 * TextareaField — An editable textarea field for metadata.
 */
export function TextareaField({
  fieldKey,
  label,
  placeholder = "Cliquer pour modifier",
  disabled = false,
  maxLength,
}: {
  fieldKey: string;
  label: string;
  placeholder?: string;
  disabled?: boolean;
  maxLength?: number;
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
      if (maxLength && newValue.length > maxLength) return;
      setLocalValue(newValue);
      autoResize();
    },
    [maxLength, autoResize],
  );

  const charCount = isEditing ? localValue.length : (value?.length ?? 0);
  const isNearLimit = maxLength ? charCount >= maxLength * 0.9 : false;
  const isAtLimit = maxLength ? charCount >= maxLength : false;

  return (
    <EditableField
      isEditing={isEditing}
      onEdit={handleEdit}
      onExit={handleExit}
      disabled={disabled}
      placeholder={placeholder}
      renderEdit={({ onBlur, onKeyDown }) => (
        <div className="w-full">
          <TextArea
            ref={textareaRef}
            variant="inline"
            value={localValue}
            onChange={handleChange}
            onBlur={onBlur}
            onKeyDown={onKeyDown}
            maxLength={maxLength}
            rows={1}
            autoFocus
            aria-label={label}
            className="block resize-none overflow-hidden px-0 py-0"
          />
          {maxLength && (
            <div
              className={cn(
                "mt-1 text-right text-xs",
                isAtLimit
                  ? "text-red-500"
                  : isNearLimit
                    ? "text-amber-500"
                    : "text-gray-400",
              )}
              aria-live="polite"
            >
              {charCount}/{maxLength}
            </div>
          )}
        </div>
      )}
    >
      <div>
        {value}
        {maxLength && value && value.length > maxLength && (
          <div className="mt-1 text-xs text-red-500">
            Dépasse la limite de {maxLength} caractères
          </div>
        )}
      </div>
    </EditableField>
  );
}
