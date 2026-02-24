"use client";

import { EditableField, NumberInput, SelectInput } from "@playground/ui";
import { useCallback, useState } from "react";
import { useMetadata } from "../MetadataContext";

/**
 * Props for the AgeField component.
 */
interface AgeFieldProps {
  /** Metadata field key */
  fieldKey: string;

  /** Display label */
  label: string;
}

/** Age type options */
const AGE_TYPE_OPTIONS = [
  { value: "lessThan", label: "Moins de" },
  { value: "moreThan", label: "Plus de" },
  { value: "between", label: "Entre" },
];

/**
 * AgeField — An editable age range field for metadata.
 *
 * @description
 * Displays age with type selector and one or two age inputs.
 * Read mode shows formatted text, click to edit.
 */
export function AgeField({ fieldKey, label }: AgeFieldProps) {
  const { getFieldValue, updateField } = useMetadata();
  const [isEditing, setIsEditing] = useState(false);

  const value = getFieldValue(fieldKey) as
    | { type?: string; ages?: number[] }
    | undefined;

  const type = value?.type ?? "between";
  const ages = value?.ages ?? [18, 65];

  const handleTypeChange = useCallback(
    (newType: string) => {
      let newAges = ages;
      if (newType === "between" && ages.length < 2) {
        newAges = [ages[0] ?? 18, 65];
      } else if (newType !== "between" && ages.length > 1) {
        newAges = [ages[0] ?? 18];
      }
      updateField(fieldKey, { type: newType, ages: newAges });
    },
    [fieldKey, ages, updateField],
  );

  const handleAgeChange = useCallback(
    (index: number, newAge: number | null) => {
      const newAges = [...ages];
      newAges[index] = newAge ?? 0;
      updateField(fieldKey, { type, ages: newAges });
    },
    [fieldKey, type, ages, updateField],
  );

  // Format display value
  const typeLabel =
    AGE_TYPE_OPTIONS.find((o) => o.value === type)?.label ?? type;
  const displayValue =
    type === "between"
      ? `${typeLabel} ${ages[0] ?? 18} et ${ages[1] ?? 65} ans`
      : `${typeLabel} ${ages[0] ?? 18} ans`;

  return (
    <EditableField
      isEditing={isEditing}
      onEdit={() => setIsEditing(true)}
      onExit={() => setIsEditing(false)}
      placeholder="Cliquer pour modifier"
      renderEdit={() => (
        <div className="flex flex-wrap items-center gap-2 p-1">
          <SelectInput
            variant="inline"
            options={AGE_TYPE_OPTIONS}
            value={type}
            onChange={handleTypeChange}
            className="w-24"
            aria-label={`${label} - type`}
          />

          <NumberInput
            variant="inline"
            value={ages[0] ?? 18}
            onChange={(val) => handleAgeChange(0, val)}
            min={0}
            max={150}
            className="w-14"
            aria-label={`${label} - âge`}
          />

          {type === "between" && (
            <>
              <span className="text-xs text-gray-500">et</span>
              <NumberInput
                variant="inline"
                value={ages[1] ?? 65}
                onChange={(val) => handleAgeChange(1, val)}
                min={0}
                max={150}
                className="w-14"
                aria-label={`${label} - âge max`}
              />
            </>
          )}

          <span className="text-xs text-gray-500">ans</span>
        </div>
      )}
    >
      {displayValue}
    </EditableField>
  );
}
