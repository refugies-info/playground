"use client";

import { EditableField, NumberInput, SelectInput } from "@playground/ui";
import { useCallback, useState } from "react";
import { useMetadata } from "../MetadataContext";

/** Frequency details options */
const FREQUENCY_DETAILS_OPTIONS = [
  { value: "minimum", label: "Minimum" },
  { value: "maximum", label: "Maximum" },
  { value: "approximately", label: "Environ" },
  { value: "exactly", label: "Exactement" },
];

/** Time unit options (French labels) */
const TIME_UNIT_OPTIONS = [
  { value: "hours", label: "heures" },
  { value: "days", label: "jours" },
  { value: "weeks", label: "semaines" },
  { value: "months", label: "mois" },
  { value: "sessions", label: "sessions" },
];

/** Frequency unit options (French labels) */
const FREQUENCY_UNIT_OPTIONS = [
  { value: "day", label: "jour" },
  { value: "week", label: "semaine" },
  { value: "month", label: "mois" },
  { value: "year", label: "an" },
  { value: "session", label: "session" },
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
        <>
          <div className="flex flex-wrap items-center gap-2 p-1">
            <SelectInput
              options={FREQUENCY_DETAILS_OPTIONS}
              value={localAmountDetails}
              onChange={setLocalAmountDetails}
              className="w-32"
              aria-label={`${label} - type`}
            />

            <NumberInput
              value={localHours}
              onChange={setLocalHours}
              min={0}
              className="w-14"
              aria-label={`${label} - quantité`}
            />

            <SelectInput
              options={TIME_UNIT_OPTIONS}
              value={localTimeUnit}
              onChange={setLocalTimeUnit}
              className="w-24"
              aria-label={`${label} - unité de temps`}
            />
          </div>
          <div className="flex flex-wrap items-center gap-2 p-1">
            <span className="text-xs text-gray-500">par</span>

            <SelectInput
              options={FREQUENCY_UNIT_OPTIONS}
              value={localFrequencyUnit}
              onChange={setLocalFrequencyUnit}
              className="w-32"
              aria-label={`${label} - fréquence`}
            />
          </div>
        </>
      )}
    >
      {displayValue}
    </EditableField>
  );
}
