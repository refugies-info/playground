"use client";

import {
  EditableField,
  NumberInput,
  RadioGroup,
  SelectInput,
} from "@playground/ui";
import { useCallback, useState } from "react";
import { useMetadata } from "../MetadataContext";
import { PRICE_DETAILS_OPTIONS } from "../publication-targets/refugies-info";

// =============================================================================
// Constants
// =============================================================================

const PRICE_MODE_OPTIONS = [
  { value: "free", label: "Gratuit" },
  { value: "paid", label: "Payant" },
] as const;

const PAID_TYPE_OPTIONS = [
  { value: "fixed", label: "Montant fixe" },
  { value: "range", label: "Fourchette" },
  { value: "flexible", label: "Montant libre" },
] as const;

type PriceMode = "free" | "paid";
type PaidType = "fixed" | "range" | "flexible";

// =============================================================================
// Helpers
// =============================================================================

/** Derive the mode and paid type from a stored RiPrice value */
function deriveState(
  value: { values?: number[]; details?: string } | undefined,
): {
  mode: PriceMode;
  paidType: PaidType;
  amount: number | null;
  min: number | null;
  max: number | null;
  period: string;
} {
  const values = value?.values ?? [];
  const details = value?.details ?? "month";

  if (!value || (values.length === 1 && values[0] === 0)) {
    return {
      mode: "free",
      paidType: "fixed",
      amount: null,
      min: null,
      max: null,
      period: details,
    };
  }
  if (values.length === 0) {
    return {
      mode: "paid",
      paidType: "flexible",
      amount: null,
      min: null,
      max: null,
      period: details,
    };
  }
  if (values.length >= 2) {
    return {
      mode: "paid",
      paidType: "range",
      amount: null,
      min: values[0] ?? null,
      max: values[1] ?? null,
      period: details,
    };
  }
  // Single positive amount → fixed
  return {
    mode: "paid",
    paidType: "fixed",
    amount: values[0] ?? null,
    min: null,
    max: null,
    period: details,
  };
}

/** Build the display string for read mode */
function buildDisplayValue(
  value: { values?: number[]; details?: string } | undefined,
): string | null {
  if (!value) return null;
  const { mode, paidType, amount, min, max, period } = deriveState(value);

  if (mode === "free") return "Gratuit";

  const periodLabel =
    PRICE_DETAILS_OPTIONS.find((o) => o.value === period)?.label ?? period;

  if (paidType === "flexible") return "Montant libre";
  if (paidType === "range" && min !== null && max !== null) {
    return `Entre ${min} € et ${max} € ${periodLabel}`;
  }
  if (paidType === "fixed" && amount !== null) {
    return `${amount} € ${periodLabel}`;
  }
  return null;
}

// =============================================================================
// Component
// =============================================================================

/**
 * PriceField — An editable price field with 4 modes:
 * - Gratuit
 * - Payant > Montant fixe
 * - Payant > Fourchette
 * - Payant > Montant libre
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

  const derived = deriveState(value);

  // Local state for editing
  const [localMode, setLocalMode] = useState<PriceMode>(derived.mode);
  const [localPaidType, setLocalPaidType] = useState<PaidType>(
    derived.paidType,
  );
  const [localAmount, setLocalAmount] = useState<number | null>(derived.amount);
  const [localMin, setLocalMin] = useState<number | null>(derived.min);
  const [localMax, setLocalMax] = useState<number | null>(derived.max);
  const [localPeriod, setLocalPeriod] = useState(derived.period);

  // Sync local state when entering edit mode
  const handleEdit = useCallback(() => {
    const d = deriveState(value);
    setLocalMode(d.mode);
    setLocalPaidType(d.paidType);
    setLocalAmount(d.amount);
    setLocalMin(d.min);
    setLocalMax(d.max);
    setLocalPeriod(d.period);
    setIsEditing(true);
  }, [value]);

  // Save on exit
  const handleExit = useCallback(() => {
    setIsEditing(false);
    if (localMode === "free") {
      updateField(fieldKey, { values: [0] });
    } else if (localPaidType === "flexible") {
      updateField(fieldKey, { values: [] });
    } else if (localPaidType === "range") {
      if (localMin !== null && localMax !== null) {
        updateField(fieldKey, {
          values: [Math.min(localMin, localMax), Math.max(localMin, localMax)],
          details: localPeriod,
        });
      }
    } else {
      // fixed
      if (localAmount !== null) {
        updateField(fieldKey, { values: [localAmount], details: localPeriod });
      }
    }
  }, [
    fieldKey,
    updateField,
    localMode,
    localPaidType,
    localAmount,
    localMin,
    localMax,
    localPeriod,
  ]);

  return (
    <EditableField
      isEditing={isEditing}
      onEdit={handleEdit}
      onExit={handleExit}
      placeholder="Cliquer pour modifier"
      renderEdit={() => (
        <div className="flex flex-col gap-3 p-1">
          {/* Niveau 1 : Gratuit / Payant */}
          <RadioGroup
            name={`${fieldKey}-mode`}
            options={PRICE_MODE_OPTIONS}
            value={localMode}
            onChange={(val) => val && setLocalMode(val as PriceMode)}
          />

          {/* Niveau 2 : sous-choix si Payant */}
          {localMode === "paid" && (
            <div className="flex flex-col gap-3">
              <RadioGroup
                name={`${fieldKey}-paid-type`}
                options={PAID_TYPE_OPTIONS}
                value={localPaidType}
                onChange={(val) => val && setLocalPaidType(val as PaidType)}
              />

              {/* Montant fixe */}
              {localPaidType === "fixed" && (
                <div className="flex items-center gap-2">
                  <NumberInput
                    value={localAmount}
                    onChange={setLocalAmount}
                    min={0}
                    className="w-16"
                    aria-label={`${label} - montant`}
                  />
                  <span className="text-xs text-gray-500">€</span>
                  <SelectInput
                    options={PRICE_DETAILS_OPTIONS}
                    value={localPeriod}
                    onChange={setLocalPeriod}
                    className="w-34"
                    aria-label={`${label} - récurrence`}
                  />
                </div>
              )}

              {/* Fourchette */}
              {localPaidType === "range" && (
                <div className="flex items-center gap-2">
                  <NumberInput
                    value={localMin}
                    onChange={setLocalMin}
                    min={0}
                    className="w-16"
                    aria-label={`${label} - montant min`}
                  />
                  <span className="text-xs text-gray-500">€ à</span>
                  <NumberInput
                    value={localMax}
                    onChange={setLocalMax}
                    min={0}
                    className="w-16"
                    aria-label={`${label} - montant max`}
                  />
                  <span className="text-xs text-gray-500">€</span>
                  <SelectInput
                    options={PRICE_DETAILS_OPTIONS}
                    value={localPeriod}
                    onChange={setLocalPeriod}
                    className="w-34"
                    aria-label={`${label} - récurrence`}
                  />
                </div>
              )}
            </div>
          )}
        </div>
      )}
    >
      {buildDisplayValue(value)}
    </EditableField>
  );
}
