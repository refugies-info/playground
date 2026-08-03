"use client";

import { EditableField, NumberInput, SelectRow } from "@playground/ui";
import { useCallback, useState } from "react";
import { useMetadata } from "../MetadataContext";
import { TIME_UNIT_OPTIONS } from "../publication-targets/refugies-info";

/** Frequency details options */
const FREQUENCY_DETAILS_OPTIONS = [
  { value: "minimum", label: "Minimum" },
  { value: "maximum", label: "Maximum" },
  { value: "approximately", label: "Environ" },
  { value: "exactly", label: "Exactement" },
];

/** Frequency unit options (French labels) */
const FREQUENCY_UNIT_OPTIONS = [
  { value: "session", label: "séance" },
  { value: "day", label: "jour" },
  { value: "week", label: "semaine" },
  { value: "month", label: "mois" },
  { value: "trimester", label: "trimestre" },
  { value: "semester", label: "semestre" },
  { value: "year", label: "an" },
];

/**
 * FrequencyField — An editable frequency field for metadata.
 */
export function FrequencyField({
  fieldKey,
  label,
}: {
  fieldKey: string;
  label: string;
}) {
  const { getFieldValue, updateField } = useMetadata();
  const [isEditing, setIsEditing] = useState(false);

  const rawValue = getFieldValue(fieldKey);
  const value = Array.isArray(rawValue) ? rawValue[0] : rawValue;

  const amountDetails = value?.amountDetails;
  // Handle both array and single number for hours
  const hours = Array.isArray(value?.hours)
    ? value.hours[0]
    : typeof value?.hours === "number"
      ? value.hours
      : undefined;
  const timeUnit = value?.timeUnit;
  const frequencyUnit = value?.frequencyUnit;

  // Local state for editing
  const [localAmountDetails, setLocalAmountDetails] = useState(
    amountDetails ?? "exactly",
  );
  const [localHours, setLocalHours] = useState<number | null>(hours ?? null);
  const [localTimeUnit, setLocalTimeUnit] = useState(timeUnit ?? "hours");
  const [localFrequencyUnit, setLocalFrequencyUnit] = useState(
    frequencyUnit ?? "week",
  );

  // Sync local state when entering edit mode
  const handleEdit = useCallback(() => {
    setLocalAmountDetails(amountDetails ?? "exactly");
    setLocalHours(hours ?? null);
    setLocalTimeUnit(timeUnit ?? "hours");
    setLocalFrequencyUnit(frequencyUnit ?? "week");
    setIsEditing(true);
  }, [amountDetails, hours, timeUnit, frequencyUnit]);

  // Save on exit
  const handleExit = useCallback(() => {
    setIsEditing(false);
    if (localHours !== null) {
      updateField(fieldKey, {
        amountDetails: localAmountDetails,
        hours: localHours,
        timeUnit: localTimeUnit,
        frequencyUnit: localFrequencyUnit,
      });
    }
  }, [
    fieldKey,
    updateField,
    localAmountDetails,
    localHours,
    localTimeUnit,
    localFrequencyUnit,
  ]);

  // Format display value
  const detailsLabel =
    FREQUENCY_DETAILS_OPTIONS.find((o) => o.value === amountDetails)?.label ??
    amountDetails;
  const unitLabel =
    TIME_UNIT_OPTIONS.find((o) => o.value === timeUnit)?.label ?? timeUnit;
  const freqLabel =
    FREQUENCY_UNIT_OPTIONS.find((o) => o.value === frequencyUnit)?.label ??
    frequencyUnit;
  const displayValue =
    hours !== undefined
      ? `${detailsLabel} ${hours} ${unitLabel} par ${freqLabel}`
      : null;

  return (
    <EditableField
      isEditing={isEditing}
      onEdit={handleEdit}
      onExit={handleExit}
      placeholder="Cliquer pour modifier"
      renderEdit={() => (
        <div className="flex w-full flex-col gap-2 rounded-[2px] border border-[var(--border-default-grey)] bg-white p-2 shadow-md">
          <SelectRow
            label="Condition"
            options={FREQUENCY_DETAILS_OPTIONS}
            value={localAmountDetails}
            onChange={setLocalAmountDetails}
          />

          <div className="px-2">
            <NumberInput
              variant="dsfr"
              value={localHours}
              onChange={setLocalHours}
              min={0}
              autoFocus
              aria-label={`${label} - quantité`}
            />
          </div>

          <SelectRow
            label="Durée"
            options={TIME_UNIT_OPTIONS}
            value={localTimeUnit}
            onChange={setLocalTimeUnit}
          />

          <SelectRow
            label="Par"
            options={FREQUENCY_UNIT_OPTIONS}
            value={localFrequencyUnit}
            onChange={setLocalFrequencyUnit}
          />
        </div>
      )}
    >
      {displayValue}
    </EditableField>
  );
}
