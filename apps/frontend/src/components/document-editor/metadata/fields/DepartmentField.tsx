"use client";

import { ComboboxInput, EditableField } from "@playground/ui";
import { useCallback, useState } from "react";
import { DEPARTMENT_OPTIONS } from "../config/departments";
import { useMetadata } from "../MetadataContext";

/**
 * Props for the DepartmentField component.
 */
interface DepartmentFieldProps {
  /** Metadata field key */
  fieldKey: string;

  /** Display label */
  label: string;
}

/**
 * DepartmentField — An editable departments field for metadata.
 *
 * @description
 * Displays a comma-separated list of departments in read mode.
 * Click to open a searchable multi-select combobox.
 */
export function DepartmentField({ fieldKey }: DepartmentFieldProps) {
  const { getFieldValue, updateField } = useMetadata();
  const [isEditing, setIsEditing] = useState(false);

  const value = (getFieldValue(fieldKey) as string[] | undefined) ?? [];

  const handleChange = useCallback(
    (newValue: string[]) => {
      updateField(fieldKey, newValue.length > 0 ? newValue : undefined);
    },
    [fieldKey, updateField],
  );

  // Display value: comma-separated list
  const displayValue = value.length > 0 ? value.join(", ") : null;

  return (
    <EditableField
      isEditing={isEditing}
      onEdit={() => setIsEditing(true)}
      onExit={() => setIsEditing(false)}
      placeholder="Aucun département"
      renderEdit={() => (
        <ComboboxInput
          variant="inline"
          options={DEPARTMENT_OPTIONS}
          value={value}
          onChange={handleChange}
          placeholder="Rechercher un département..."
        />
      )}
    >
      {displayValue}
    </EditableField>
  );
}
