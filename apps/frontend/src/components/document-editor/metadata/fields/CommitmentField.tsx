"use client";

import { EditableField, NumberInput, SelectInput } from "@playground/ui";
import { useCallback, useState } from "react";
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
 *
 * @description
 * Displays commitment with details type, hours amount(s), and time unit.
 * Read mode shows formatted text, click to edit.
 */
export function CommitmentField({ fieldKey, label }: CommitmentFieldProps) {
  const { getFieldValue, updateField } = useMetadata();
  const [isEditing, setIsEditing] = useState(false);

  const value = getFieldValue(fieldKey) as
    | { amountDetails?: string; hours?: number[]; timeUnit?: string }
    | undefined;

  const amountDetails = value?.amountDetails ?? "exactly";
  const hours = value?.hours ?? [80];
  const timeUnit = value?.timeUnit ?? "hours";

  const handleDetailsChange = useCallback(
    (newDetails: string) => {
      let newHours = hours;
      if (newDetails === "between" && hours.length < 2) {
        newHours = [hours[0] ?? 80, 120];
      } else if (newDetails !== "between" && hours.length > 1) {
        newHours = [hours[0] ?? 80];
      }
      updateField(fieldKey, {
        amountDetails: newDetails,
        hours: newHours,
        timeUnit,
      });
    },
    [fieldKey, hours, timeUnit, updateField],
  );

  const handleHoursChange = useCallback(
    (index: number, newHours: number | null) => {
      const newHoursArr = [...hours];
      newHoursArr[index] = newHours ?? 0;
      updateField(fieldKey, {
        amountDetails,
        hours: newHoursArr,
        timeUnit,
      });
    },
    [fieldKey, amountDetails, hours, timeUnit, updateField],
  );

  const handleTimeUnitChange = useCallback(
    (newUnit: string) => {
      updateField(fieldKey, {
        amountDetails,
        hours,
        timeUnit: newUnit,
      });
    },
    [fieldKey, amountDetails, hours, updateField],
  );

  // Format display value
  const detailsLabel =
    COMMITMENT_DETAILS_OPTIONS.find((o) => o.value === amountDetails)?.label ??
    amountDetails;
  const unitLabel =
    TIME_UNIT_OPTIONS.find((o) => o.value === timeUnit)?.label ?? timeUnit;
  const displayValue =
    amountDetails === "between"
      ? `${detailsLabel} ${hours[0] ?? 80} et ${hours[1] ?? 120} ${unitLabel}`
      : `${detailsLabel} ${hours[0] ?? 80} ${unitLabel}`;

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
            options={COMMITMENT_DETAILS_OPTIONS}
            value={amountDetails}
            onChange={handleDetailsChange}
            className="w-24"
            aria-label={`${label} - type`}
          />

          <NumberInput
            variant="inline"
            value={hours[0] ?? 80}
            onChange={(val) => handleHoursChange(0, val)}
            min={0}
            className="w-14"
            aria-label={`${label} - quantité`}
          />

          {amountDetails === "between" && (
            <>
              <span className="text-xs text-gray-500">et</span>
              <NumberInput
                variant="inline"
                value={hours[1] ?? 120}
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
            value={timeUnit}
            onChange={handleTimeUnitChange}
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
