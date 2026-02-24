"use client";

import { EditableField, NumberInput, SelectInput } from "@playground/ui";
import { useCallback, useState } from "react";
import { PRICE_DETAILS_OPTIONS } from "../config/metadata-config";
import { useMetadata } from "../MetadataContext";

/** Price type options */
const PRICE_TYPE_OPTIONS = [
  { value: "free", label: "Gratuit" },
  { value: "paid", label: "Payant" },
];

/**
 * Props for the PriceField component.
 */
interface PriceFieldProps {
  /** Metadata field key */
  fieldKey: string;

  /** Display label */
  label: string;
}

/**
 * PriceField — An editable price field for metadata.
 *
 * @description
 * Displays price with:
 * - Free/Paid selector
 * - Amount input (when paid)
 * - Period selector (per month, per year, etc.)
 *
 * Read mode shows formatted text, click to edit.
 */
export function PriceField({ fieldKey, label }: PriceFieldProps) {
  const { getFieldValue, updateField } = useMetadata();
  const [isEditing, setIsEditing] = useState(false);

  const value = getFieldValue(fieldKey) as
    | { values?: number[]; details?: string }
    | undefined;

  const isFree = !value?.values?.[0] || value.values[0] === 0;
  const amount = value?.values?.[0] ?? 0;
  const period = value?.details ?? "month";

  const handleTypeChange = useCallback(
    (newType: string) => {
      if (newType === "free") {
        updateField(fieldKey, { values: [0] });
      } else {
        updateField(fieldKey, { values: [50], details: "month" });
      }
    },
    [fieldKey, updateField],
  );

  const handleAmountChange = useCallback(
    (newAmount: number | null) => {
      updateField(fieldKey, {
        ...value,
        values: [newAmount ?? 0],
      });
    },
    [fieldKey, value, updateField],
  );

  const handlePeriodChange = useCallback(
    (newPeriod: string) => {
      updateField(fieldKey, {
        ...value,
        details: newPeriod,
      });
    },
    [fieldKey, value, updateField],
  );

  // Format display value
  const displayValue = isFree
    ? "Gratuit"
    : `${amount} € par ${PRICE_DETAILS_OPTIONS.find((o) => o.value === period)?.label ?? period}`;

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
            options={PRICE_TYPE_OPTIONS}
            value={isFree ? "free" : "paid"}
            onChange={handleTypeChange}
            className="w-24"
            aria-label={`${label} - type`}
          />

          {!isFree && (
            <>
              <NumberInput
                variant="inline"
                value={amount}
                onChange={handleAmountChange}
                min={0}
                className="w-16"
                aria-label={`${label} - montant`}
              />
              <span className="text-xs text-gray-500">€ </span>
              <SelectInput
                variant="inline"
                options={PRICE_DETAILS_OPTIONS}
                value={period}
                onChange={handlePeriodChange}
                className="w-24"
                aria-label={`${label} - période`}
              />
            </>
          )}
        </div>
      )}
    >
      {displayValue}
    </EditableField>
  );
}
