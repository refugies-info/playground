"use client";

import { EditableField, NumberInput, SelectInput } from "@playground/ui";
import { useCallback, useState } from "react";
import { useMetadata } from "../MetadataContext";

/**
 * Props for the FrequencyField component.
 */
interface FrequencyFieldProps {
  /** Metadata field key */
  fieldKey: string;

  /** Display label */
  label: string;
}

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
 *
 * @description
 * Displays frequency with details type, hours amount, time unit, and frequency unit.
 * Read mode shows formatted text, click to edit.
 */
export function FrequencyField({ fieldKey, label }: FrequencyFieldProps) {
  const { getFieldValue, updateField } = useMetadata();
  const [isEditing, setIsEditing] = useState(false);

  const value = getFieldValue(fieldKey) as
    | {
        amountDetails?: string;
        hours?: number;
        timeUnit?: string;
        frequencyUnit?: string;
      }
    | undefined;

  const amountDetails = value?.amountDetails ?? "exactly";
  const hours = value?.hours ?? 12;
  const timeUnit = value?.timeUnit ?? "hours";
  const frequencyUnit = value?.frequencyUnit ?? "week";

  const handleDetailsChange = useCallback(
    (newDetails: string) => {
      updateField(fieldKey, {
        amountDetails: newDetails,
        hours,
        timeUnit,
        frequencyUnit,
      });
    },
    [fieldKey, hours, timeUnit, frequencyUnit, updateField],
  );

  const handleHoursChange = useCallback(
    (newHours: number | null) => {
      updateField(fieldKey, {
        amountDetails,
        hours: newHours ?? 0,
        timeUnit,
        frequencyUnit,
      });
    },
    [fieldKey, amountDetails, timeUnit, frequencyUnit, updateField],
  );

  const handleTimeUnitChange = useCallback(
    (newUnit: string) => {
      updateField(fieldKey, {
        amountDetails,
        hours,
        timeUnit: newUnit,
        frequencyUnit,
      });
    },
    [fieldKey, amountDetails, hours, frequencyUnit, updateField],
  );

  const handleFrequencyUnitChange = useCallback(
    (newUnit: string) => {
      updateField(fieldKey, {
        amountDetails,
        hours,
        timeUnit,
        frequencyUnit: newUnit,
      });
    },
    [fieldKey, amountDetails, hours, timeUnit, updateField],
  );

  // Format display value
  const detailsLabel =
    FREQUENCY_DETAILS_OPTIONS.find((o) => o.value === amountDetails)?.label ??
    amountDetails;
  const unitLabel =
    TIME_UNIT_OPTIONS.find((o) => o.value === timeUnit)?.label ?? timeUnit;
  const freqLabel =
    FREQUENCY_UNIT_OPTIONS.find((o) => o.value === frequencyUnit)?.label ??
    frequencyUnit;
  const displayValue = `${detailsLabel} ${hours} ${unitLabel} par ${freqLabel}`;

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
            options={FREQUENCY_DETAILS_OPTIONS}
            value={amountDetails}
            onChange={handleDetailsChange}
            className="w-24"
            aria-label={`${label} - type`}
          />

          <NumberInput
            variant="inline"
            value={hours}
            onChange={handleHoursChange}
            min={0}
            className="w-14"
            aria-label={`${label} - quantité`}
          />

          <SelectInput
            variant="inline"
            options={TIME_UNIT_OPTIONS}
            value={timeUnit}
            onChange={handleTimeUnitChange}
            className="w-24"
            aria-label={`${label} - unité de temps`}
          />

          <span className="text-xs text-gray-500">par</span>

          <SelectInput
            variant="inline"
            options={FREQUENCY_UNIT_OPTIONS}
            value={frequencyUnit}
            onChange={handleFrequencyUnitChange}
            className="w-24"
            aria-label={`${label} - fréquence`}
          />
        </div>
      )}
    >
      {displayValue}
    </EditableField>
  );
}
