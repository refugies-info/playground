"use client";

import { EditableField, NumberInput, SelectInput } from "@playground/ui";
import { useCallback, useMemo, useState } from "react";
import { useMetadata } from "../MetadataContext";

/**
 * Props for the CommitmentField component.
 */
interface CommitmentFieldProps {
  /** Metadata field key */
  fieldKey: string;

  /** Display label */
  label: string;
}

/** Commitment details options */
const COMMITMENT_DETAILS_OPTIONS = [
  { value: "minimum", label: "Minimum" },
  { value: "maximum", label: "Maximum" },
  { value: "approximately", label: "Environ" },
  { value: "exactly", label: "Exactement" },
  { value: "between", label: "Entre" },
];

/** Time unit options (French labels) */
const TIME_UNIT_OPTIONS = [
  { value: "hours", label: "heures" },
  { value: "days", label: "jours" },
  { value: "weeks", label: "semaines" },
  { value: "months", label: "mois" },
  { value: "years", label: "ans" },
  { value: "sessions", label: "sessions" },
];

/**
 * CommitmentField — An editable commitment/duration field for metadata.
 */
export function CommitmentField({ fieldKey, label }: CommitmentFieldProps) {
  const { getFieldValue, updateField } = useMetadata();
  const [isEditing, setIsEditing] = useState(false);

  const value = getFieldValue(fieldKey) as
    | { amountDetails?: string; hours?: number[]; timeUnit?: string }
    | undefined;

  // Memoize values to avoid infinite loops
  const amountDetails = value?.amountDetails;
  const hours = useMemo(() => value?.hours ?? [], [value?.hours]);
  const timeUnit = value?.timeUnit;

  // Local state for editing - initialized on first render
  const [localAmountDetails, setLocalAmountDetails] = useState(
    amountDetails ?? "exactly",
  );
  const [localHours, setLocalHours] = useState<number[]>(
    hours.length > 0 ? hours : [0],
  );
  const [localTimeUnit, setLocalTimeUnit] = useState(timeUnit ?? "hours");

  // Sync local state when entering edit mode
  const handleEdit = useCallback(() => {
    setLocalAmountDetails(amountDetails ?? "exactly");
    setLocalHours(hours.length > 0 ? hours : [0]);
    setLocalTimeUnit(timeUnit ?? "hours");
    setIsEditing(true);
  }, [amountDetails, hours, timeUnit]);

  // Format display value
  const detailsLabel =
    COMMITMENT_DETAILS_OPTIONS.find((o) => o.value === amountDetails)?.label ??
    amountDetails;
  const unitLabel =
    TIME_UNIT_OPTIONS.find((o) => o.value === timeUnit)?.label ?? timeUnit;
  const displayValue =
    hours.length === 0
      ? null
      : amountDetails === "between" && hours.length >= 2
        ? `${detailsLabel} ${hours[0]} et ${hours[1]} ${unitLabel}`
        : `${detailsLabel} ${hours[0]} ${unitLabel}`;

  // Handle local hours change
  const handleHoursChange = useCallback(
    (index: number, newHours: number | null) => {
      setLocalHours((prev) => {
        const newHoursArr = [...prev];
        newHoursArr[index] = newHours ?? 0;
        if (localAmountDetails === "between" && newHoursArr.length < 2) {
          newHoursArr.push(0);
        }
        return newHoursArr;
      });
    },
    [localAmountDetails],
  );

  // Handle type change
  const handleDetailsChange = useCallback((newDetails: string) => {
    setLocalAmountDetails(newDetails);
    setLocalHours((prev) => {
      if (newDetails === "between" && prev.length < 2) {
        return [...prev, 0];
      } else if (newDetails !== "between" && prev.length > 1) {
        return [prev[0] ?? 0];
      }
      return prev;
    });
  }, []);

  // Save on exit
  const handleExit = useCallback(() => {
    setIsEditing(false);
    if (localHours.length > 0 && localHours[0] !== undefined) {
      updateField(fieldKey, {
        amountDetails: localAmountDetails,
        hours: localHours,
        timeUnit: localTimeUnit,
      });
    }
  }, [fieldKey, updateField, localAmountDetails, localHours, localTimeUnit]);

  return (
    <EditableField
      isEditing={isEditing}
      onEdit={handleEdit}
      onExit={handleExit}
      placeholder="Cliquer pour modifier"
      renderEdit={() => (
        <div className="flex flex-wrap items-center gap-2 p-1">
          <SelectInput
            variant="inline"
            options={COMMITMENT_DETAILS_OPTIONS}
            value={localAmountDetails}
            onChange={handleDetailsChange}
            className="w-24"
            aria-label={`${label} - type`}
          />

          <NumberInput
            variant="inline"
            value={localHours[0] ?? null}
            onChange={(val) => handleHoursChange(0, val)}
            min={0}
            className="w-14"
            aria-label={`${label} - quantité`}
          />

          {localAmountDetails === "between" && (
            <>
              <span className="text-xs text-gray-500">et</span>
              <NumberInput
                variant="inline"
                value={localHours[1] ?? null}
                onChange={(val) => handleHoursChange(1, val)}
                min={0}
                className="w-14"
                aria-label={`${label} - quantité max`}
              />
            </>
          )}

          <SelectInput
            variant="inline"
            options={TIME_UNIT_OPTIONS}
            value={localTimeUnit}
            onChange={setLocalTimeUnit}
            className="w-24"
            aria-label={`${label} - unité`}
          />
        </div>
      )}
    >
      {displayValue}
    </EditableField>
  );
}
