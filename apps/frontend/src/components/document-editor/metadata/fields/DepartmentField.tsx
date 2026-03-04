"use client";

import { ComboboxInput, EditableField, RadioGroup } from "@playground/ui";
import { useCallback, useMemo, useState } from "react";
import { useMetadata } from "../MetadataContext";
import { DEPARTMENT_OPTIONS } from "../publication-targets/refugies-info";

// =============================================================================
// Types & Constants
// =============================================================================

type LocationMode = "france" | "online" | "departments";

const LOCATION_MODE_OPTIONS = [
  { value: "france", label: "France entière" },
  { value: "online", label: "Ressources en ligne" },
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
export function DepartmentField({
  fieldKey,
  label,
}: {
  fieldKey: string;
  label: string;
}) {
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
  const handleModeChange = useCallback((val: string | null) => {
    if (!val) return;
    setLocalMode(val as LocationMode);
    if (val !== "departments") setLocalDepartments([]);
  }, []);

  // Display value (read mode)
  const displayValue = useMemo(() => {
    if (mode === "france") return "France entière";
    if (mode === "online") return "Ressources en ligne";
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
        <div className="flex flex-col gap-3 p-1">
          <RadioGroup
            name={`${fieldKey}-location-mode`}
            options={LOCATION_MODE_OPTIONS}
            value={localMode}
            onChange={handleModeChange}
            aria-label={label}
          />

          {localMode === "departments" && (
            <ComboboxInput
              variant="inline"
              options={DEPARTMENT_OPTIONS}
              value={localDepartments}
              onChange={setLocalDepartments}
              placeholder="Rechercher un département..."
            />
          )}
        </div>
      )}
    >
      {displayValue}
    </EditableField>
  );
}
