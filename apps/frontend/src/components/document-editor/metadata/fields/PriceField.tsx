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
 * PriceField — An editable price field for metadata.
 */
export function PriceField({
  fieldKey,
  label,
}: {
  fieldKey: string;
  label: string;
}) {
  const { getFieldValue, updateField } = useMetadata();
  const [isEditing, setIsEditing] = useState(false);

  const value = getFieldValue(fieldKey) as
    | { values?: number[]; details?: string }
    | undefined;

  const isFree = !value?.values?.[0] || value.values[0] === 0;
  const amount = value?.values?.[0];
  const period = value?.details;

  // Local state for editing
  const [localIsFree, setLocalIsFree] = useState(isFree);
  const [localAmount, setLocalAmount] = useState<number | null>(amount ?? null);
  const [localPeriod, setLocalPeriod] = useState(period ?? "month");

  // Sync local state when entering edit mode
  const handleEdit = useCallback(() => {
    setLocalIsFree(isFree);
    setLocalAmount(amount ?? null);
    setLocalPeriod(period ?? "month");
    setIsEditing(true);
  }, [isFree, amount, period]);

  // Save on exit
  const handleExit = useCallback(() => {
    setIsEditing(false);
    if (localIsFree) {
      updateField(fieldKey, { values: [0] });
    } else if (localAmount !== null) {
      updateField(fieldKey, { values: [localAmount], details: localPeriod });
    }
  }, [fieldKey, updateField, localIsFree, localAmount, localPeriod]);

  // Format display value
  const displayValue = !value
    ? null
    : isFree
      ? "Gratuit"
      : amount !== undefined
        ? `${amount} € par ${PRICE_DETAILS_OPTIONS.find((o) => o.value === period)?.label ?? period}`
        : null;

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
            options={PRICE_TYPE_OPTIONS}
            value={localIsFree ? "free" : "paid"}
            onChange={(val) => setLocalIsFree(val === "free")}
            className="w-24"
            aria-label={`${label} - type`}
          />

          {!localIsFree && (
            <>
              <NumberInput
                variant="inline"
                value={localAmount}
                onChange={setLocalAmount}
                min={0}
                className="w-16"
                aria-label={`${label} - montant`}
              />
              <span className="text-xs text-gray-500">€ par</span>
              <SelectInput
                variant="inline"
                options={PRICE_DETAILS_OPTIONS}
                value={localPeriod}
                onChange={setLocalPeriod}
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
