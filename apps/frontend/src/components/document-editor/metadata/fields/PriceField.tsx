"use client";

import { EditableField, NumberInput, SelectRow, Switch } from "@playground/ui";
import { useCallback, useState } from "react";
import { useMetadata } from "../MetadataContext";
import { PRICE_DETAILS_OPTIONS } from "../publication-targets/refugies-info";

// =============================================================================
// Constants
// =============================================================================

const PAID_TYPE_OPTIONS = [
  { value: "fixed", label: "Fixe" },
  { value: "range", label: "Fourchette" },
  { value: "flexible", label: "Libre" },
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
        <div className="flex w-full flex-col gap-2 rounded-[2px] border border-[var(--border-default-grey)] bg-white p-2 shadow-md">
          {/* Niveau 1 : Gratuit / Payant */}
          <div className="flex items-center justify-between px-2 py-1.5">
            <span className="text-[14px] leading-[24px] text-[var(--text-default-grey)]">
              Payant ?
            </span>
            <Switch
              checked={localMode === "paid"}
              onChange={(checked) => setLocalMode(checked ? "paid" : "free")}
              aria-label="Payant ?"
            />
          </div>

          {/* Niveau 2 : sous-choix si Payant */}
          {localMode === "paid" && (
            <>
              <SelectRow
                label="Format du prix"
                options={PAID_TYPE_OPTIONS}
                value={localPaidType}
                onChange={(val) => setLocalPaidType(val as PaidType)}
              />

              <div className="border-t border-[var(--border-default-grey)]" />

              {/* Montant fixe */}
              {localPaidType === "fixed" && (
                <div className="px-2">
                  <NumberInput
                    variant="dsfr"
                    value={localAmount}
                    onChange={setLocalAmount}
                    min={0}
                    className="w-full"
                    aria-label={`${label} - montant`}
                  />
                </div>
              )}

              {/* Fourchette */}
              {localPaidType === "range" && (
                <div className="flex items-center gap-2 px-2">
                  <div className="flex-1">
                    <NumberInput
                      variant="dsfr"
                      value={localMin}
                      onChange={setLocalMin}
                      min={0}
                      className="w-full"
                      aria-label={`${label} - montant min`}
                    />
                  </div>
                  <span className="text-[14px] leading-[24px] text-[var(--text-default-grey)]">
                    et
                  </span>
                  <div className="flex-1">
                    <NumberInput
                      variant="dsfr"
                      value={localMax}
                      onChange={setLocalMax}
                      min={0}
                      className="w-full"
                      aria-label={`${label} - montant max`}
                    />
                  </div>
                </div>
              )}

              {/* Récurrence — sauf pour un montant libre */}
              {localPaidType !== "flexible" && (
                <SelectRow
                  label="Récurrence"
                  options={PRICE_DETAILS_OPTIONS}
                  value={localPeriod}
                  onChange={setLocalPeriod}
                />
              )}
            </>
          )}
        </div>
      )}
    >
      {buildDisplayValue(value)}
    </EditableField>
  );
}
