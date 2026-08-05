"use client";

import { useCallback } from "react";
import { EditableTextareaCell } from "@/components/common/EditableTextareaCell";
import { useMetadata } from "../MetadataContext";

/**
 * TextareaField — An editable textarea field for metadata.
 *
 * Branche {@link EditableTextareaCell} sur MetadataContext ; le rendu et
 * l'édition sont partagés avec la traduction (RI-1379).
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

  const value = getFieldValue(fieldKey) as string | undefined;

  const handleSave = useCallback(
    (newValue: string | undefined) => updateField(fieldKey, newValue),
    [fieldKey, updateField],
  );

  return (
    <EditableTextareaCell
      value={value}
      onSave={handleSave}
      label={label}
      placeholder={placeholder}
      disabled={disabled}
      maxLength={maxLength}
    />
  );
}
