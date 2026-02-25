/**
 * MetadataRow Component
 * Renders a single row in the metadata table
 */

import type { LucideIcon } from "lucide-react";
import { RotateCcw, Trash2 } from "lucide-react";
import { FieldBadge } from "./FieldBadge";
import { useMetadata } from "./MetadataContext";
import { getDisplayComponent } from "./publication-targets/refugies-info";
import { SourceDisplay } from "./SourceDisplay";
import type { MetadataFieldDef } from "./types";

interface MetadataRowProps {
  field: MetadataFieldDef;
  metadata_ri: Record<string, unknown>;
  provenanceByKey: Map<string, { key: string; source: string[] }>;
  diMetadata: Record<string, unknown>;
}

export function MetadataRow({
  field,
  metadata_ri,
  provenanceByKey,
  diMetadata,
}: MetadataRowProps) {
  const {
    mergedMetadata,
    getFieldStatus,
    getFieldError,
    dirtyFields,
    resetField,
    clearField,
  } = useMetadata();

  const rawValue = metadata_ri[field.riKey]; // Original value from letta_report
  const mergedValue = mergedMetadata[field.riKey]; // Merged value (with overrides)
  const prov = provenanceByKey.get(field.riKey);
  const fieldStatus = getFieldStatus(field.riKey);
  const fieldError = getFieldError(field.riKey);

  const hasOriginalValue = rawValue !== undefined && rawValue !== null;
  const isModified = [field.riKey, ...(field.relatedKeys ?? [])].some((key) =>
    dirtyFields.has(key),
  );

  return (
    <tr className="hover:bg-gray-50 text-sm">
      <td className="px-6 py-4">
        <label htmlFor={field.riKey} className="text-md mb-2 block font-bold">
          {field.label}
        </label>
        <div className="flex items-center gap-2">
          <FieldBadge
            status={fieldStatus}
            error={fieldError}
            isModified={isModified}
            hasOriginalValue={hasOriginalValue}
          />
          {isModified && (
            <ActionButton
              icon={RotateCcw}
              onClick={() => resetField(field.riKey)}
              title="Réinitialiser (revenir à la version IA)"
              hoverColor="blue"
            />
          )}
          {hasOriginalValue && (
            <ActionButton
              icon={Trash2}
              onClick={() => clearField(field.riKey)}
              title="Supprimer (vider la donnée)"
              hoverColor="red"
            />
          )}
        </div>
        {fieldStatus === "error" && fieldError && (
          <div className="mt-1 text-xs text-red-600 bg-red-50 px-2 py-1 rounded">
            {fieldError}
          </div>
        )}
      </td>
      <td className="px-6 py-4">{getDisplayComponent(field, mergedValue)}</td>
      <td className="px-6 py-4">
        <SourceDisplay source={prov?.source} diMetadata={diMetadata} />
      </td>
    </tr>
  );
}

// =============================================================================
// Action Button
// =============================================================================

function ActionButton({
  icon: Icon,
  onClick,
  title,
  hoverColor,
}: {
  icon: LucideIcon;
  onClick: () => void;
  title: string;
  hoverColor: "blue" | "red";
}) {
  const hoverClasses =
    hoverColor === "blue"
      ? "hover:text-blue-600 hover:bg-blue-50"
      : "hover:text-red-600 hover:bg-red-50";

  return (
    <button
      type="button"
      onClick={onClick}
      className={`p-1 text-gray-400 ${hoverClasses} rounded`}
      title={title}
    >
      <Icon className="h-4 w-4" />
    </button>
  );
}
