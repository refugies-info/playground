"use client";

import { ComboboxInput, EditableField, SelectRow } from "@playground/ui";
import { useCallback, useMemo, useState } from "react";
import { useMetadata } from "../MetadataContext";
import { DEPARTMENT_OPTIONS } from "../publication-targets/refugies-info";

// =============================================================================
// Types & Constants
// =============================================================================

type LocationMode = "france" | "online" | "departments";

const LOCATION_MODE_OPTIONS = [
  { value: "france", label: "France entière" },
  { value: "online", label: "En ligne" },
  { value: "departments", label: "Département" },
] as const;

// =============================================================================
// Helpers
// =============================================================================

/** Derive the current mode and department list from the stored value */
function deriveMode(value: unknown): {
  mode: LocationMode;
  departments: string[];
} {
  if (value === "france") return { mode: "france", departments: [] };
  if (value === "online") return { mode: "online", departments: [] };
  if (Array.isArray(value))
    return { mode: "departments", departments: value as string[] };
  return { mode: "departments", departments: [] };
}

// =============================================================================
// Component
// =============================================================================

/**
 * DepartmentField — An editable location field with 3 modes:
 * - France entière → saves "france"
 * - En ligne       → saves "online"
 * - Départements spécifiques → saves string[]
 */
export function DepartmentField({ fieldKey }: { fieldKey: string }) {
  const { getFieldValue, updateField } = useMetadata();
  const [isEditing, setIsEditing] = useState(false);

  const rawValue = getFieldValue(fieldKey);
  const { mode, departments } = useMemo(() => deriveMode(rawValue), [rawValue]);

  const [localMode, setLocalMode] = useState<LocationMode>(mode);
  const [localDepartments, setLocalDepartments] =
    useState<string[]>(departments);

  // Sync local state when entering edit mode
  const handleEdit = useCallback(() => {
    const derived = deriveMode(rawValue);
    setLocalMode(derived.mode);
    setLocalDepartments(derived.departments);
    setIsEditing(true);
  }, [rawValue]);

  // Save on exit
  const handleExit = useCallback(() => {
    setIsEditing(false);
    if (localMode === "france") {
      updateField(fieldKey, "france");
    } else if (localMode === "online") {
      updateField(fieldKey, "online");
    } else {
      updateField(
        fieldKey,
        localDepartments.length > 0 ? localDepartments : undefined,
      );
    }
  }, [fieldKey, updateField, localMode, localDepartments]);

  // Handle mode change — reset departments when switching away
  const handleModeChange = useCallback((val: string) => {
    setLocalMode(val as LocationMode);
    if (val !== "departments") setLocalDepartments([]);
  }, []);

  // Display value (read mode)
  const displayValue = useMemo(() => {
    if (mode === "france") return "France entière";
    if (mode === "online") return "En ligne";
    if (departments.length > 0) return departments.join(", ");
    return null;
  }, [mode, departments]);

  return (
    <EditableField
      isEditing={isEditing}
      onEdit={handleEdit}
      onExit={handleExit}
      placeholder="Cliquer pour modifier"
      renderEdit={() => (
        <div className="flex w-full flex-col gap-2 rounded-[2px] border border-[var(--border-default-grey)] bg-white p-2 shadow-md">
          <SelectRow
            label="Lieu"
            options={LOCATION_MODE_OPTIONS}
            value={localMode}
            onChange={handleModeChange}
          />

          <div className="border-t border-[var(--border-default-grey)]" />

          {localMode === "departments" && (
            <ComboboxInput
              variant="inline"
              options={DEPARTMENT_OPTIONS}
              value={localDepartments}
              onChange={setLocalDepartments}
              placeholder="Rechercher un département..."
              optionVariant="pill"
              optionLayout="wrap"
              searchField
            />
          )}
        </div>
      )}
    >
      {displayValue}
    </EditableField>
  );
}
