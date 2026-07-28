"use client";

import { EditableField, NumberInput, SelectRow } from "@playground/ui";
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
  { value: "between", label: "Fourchette" },
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
        <div className="flex w-full flex-col gap-2 rounded-[2px] border border-(--border-default-grey) bg-white p-2 shadow-md">
          <SelectRow
            label="Format de l'âge"
            options={AGE_TYPE_OPTIONS}
            value={localType}
            onChange={handleTypeChange}
          />

          <div className="flex items-center gap-2 px-2">
            <div className="flex-1">
              <NumberInput
                variant="dsfr"
                value={localAges[0] ?? null}
                onChange={(val) => handleAgeChange(0, val)}
                min={0}
                max={150}
                autoFocus
                className="w-full"
                aria-label={`${label} - âge`}
              />
            </div>

            {localType === "between" && (
              <>
                <span className="text-[14px] leading-[24px] text-(--text-default-grey)">
                  et
                </span>
                <div className="flex-1">
                  <NumberInput
                    variant="dsfr"
                    value={localAges[1] ?? null}
                    onChange={(val) => handleAgeChange(1, val)}
                    min={0}
                    max={150}
                    className="w-full"
                    aria-label={`${label} - âge max`}
                  />
                </div>
              </>
            )}
          </div>
        </div>
      )}
    >
      {displayValue}
    </EditableField>
  );
}
