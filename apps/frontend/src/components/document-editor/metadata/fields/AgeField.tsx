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
 */
export function AgeField({ fieldKey, label }: AgeFieldProps) {
  const { getFieldValue, updateField } = useMetadata();
  const [isEditing, setIsEditing] = useState(false);

  const value = getFieldValue(fieldKey) as
    | { type?: string; ages?: number[] }
    | undefined;

  const type = value?.type;
  const ages = value?.ages ?? [];

  // Local state for editing
  const [localType, setLocalType] = useState(type ?? "between");
  const [localAges, setLocalAges] = useState<number[]>(
    ages.length > 0 ? ages : [0],
  );

  // Sync local state when entering edit mode
  const handleEdit = useCallback(() => {
    setLocalType(type ?? "between");
    setLocalAges(ages.length > 0 ? ages : [0]);
    setIsEditing(true);
  }, [type, ages]);

  const handleExit = useCallback(() => {
    setIsEditing(false);
    if (localAges.length > 0 && localAges[0] !== undefined) {
      updateField(fieldKey, { type: localType, ages: localAges });
    }
  }, [fieldKey, updateField, localType, localAges]);

  // Format display value
  const typeLabel =
    AGE_TYPE_OPTIONS.find((o) => o.value === type)?.label ?? type;
  const displayValue =
    ages.length === 0
      ? null
      : type === "between" && ages.length >= 2
        ? `${typeLabel} ${ages[0]} et ${ages[1]} ans`
        : `${typeLabel} ${ages[0]} ans`;

  // Handle local age change
  const handleAgeChange = useCallback(
    (index: number, newAge: number | null) => {
      const newAges = [...localAges];
      newAges[index] = newAge ?? 0;
      if (localType === "between" && newAges.length < 2) {
        newAges.push(0);
      }
      setLocalAges(newAges);
    },
    [localAges, localType],
  );

  // Handle type change
  const handleTypeChange = useCallback(
    (newType: string) => {
      setLocalType(newType);
      if (newType === "between" && localAges.length < 2) {
        setLocalAges([localAges[0] ?? 0, 0]);
      } else if (newType !== "between" && localAges.length > 1) {
        setLocalAges([localAges[0] ?? 0]);
      }
    },
    [localAges],
  );

  return (
    <EditableField
      isEditing={isEditing}
      onEdit={handleEdit}
      onExit={handleExit}
      placeholder="Cliquer pour modifier"
      renderEdit={() => (
        <div className="flex flex-wrap items-center gap-2 p-1">
          <SelectInput
            options={AGE_TYPE_OPTIONS}
            value={localType}
            onChange={handleTypeChange}
            className="w-28"
            aria-label={`${label} - type`}
          />

          <NumberInput
            value={localAges[0] ?? null}
            onChange={(val) => handleAgeChange(0, val)}
            min={0}
            max={150}
            className="w-14"
            aria-label={`${label} - âge`}
          />

          {localType === "between" && (
            <>
              <span className="text-xs text-gray-500">et</span>
              <NumberInput
                value={localAges[1] ?? null}
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
