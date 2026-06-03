/**
 * MetadataRow Component
 * Renders a single row in the metadata table
 */

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@playground/ui";
import type { LucideIcon } from "lucide-react";
import { HelpCircle, RotateCcw, Trash2 } from "lucide-react";
import { useCallback } from "react";
import { FieldBadge } from "./FieldBadge";
import { useMetadata } from "./MetadataContext";
import { getDisplayComponent } from "./publication-targets/refugies-info";
import { SourceDisplay } from "./SourceDisplay";
import type { MetadataFieldDef } from "./types";

interface MetadataRowProps {
  field: MetadataFieldDef;
  metadata_ri: Record<string, unknown>;
  provenanceByKey: Map<string, { key: string; source?: unknown }>;
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
    getFieldFixInfo,
    dirtyFields,
    resetField,
    clearField,
  } = useMetadata();

  const rawValue = metadata_ri[field.riKey]; // Original value from letta_report
  const mergedValue = mergedMetadata[field.riKey]; // Merged value (with overrides)
  const prov = provenanceByKey.get(field.riKey);
  const fieldStatus = getFieldStatus(field.riKey);
  const fieldError = getFieldError(field.riKey);
  const fieldFixInfo = getFieldFixInfo(field.riKey);

  const hasOriginalValue = rawValue !== undefined && rawValue !== null;
  const isModified = [field.riKey, ...(field.relatedKeys ?? [])].some((key) =>
    dirtyFields.has(key),
  );

  // Reset field and all related fields
  const handleReset = useCallback(() => {
    resetField(field.riKey);
    // Also reset related keys (e.g., secondaryThemes for themes)
    for (const relatedKey of field.relatedKeys ?? []) {
      resetField(relatedKey);
    }
  }, [field.riKey, field.relatedKeys, resetField]);

  // Clear field and all related fields
  const handleClear = useCallback(() => {
    clearField(field.riKey);
    // Also clear related keys
    for (const relatedKey of field.relatedKeys ?? []) {
      clearField(relatedKey);
    }
  }, [field.riKey, field.relatedKeys, clearField]);

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

          {fieldStatus === "fixed" && fieldFixInfo ? (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle
                    className="h-4 w-4 text-gray-500 cursor-pointer"
                    onClick={() =>
                      navigator.clipboard.writeText(
                        `${field.riKey}: ${fieldFixInfo.description} | Avant: ${JSON.stringify(
                          fieldFixInfo.originalValue,
                        )} | Après: ${JSON.stringify(fieldFixInfo.fixedValue)}`,
                      )
                    }
                  />
                </TooltipTrigger>
                <TooltipContent className="flex flex-col gap-1">
                  <p className="font-bold">Erreur fixée</p>
                  <p className="text-sm text-gray-600">
                    {fieldFixInfo.description}
                  </p>
                  <div className="text-xs text-gray-600">
                    <strong>Avant :</strong>{" "}
                    {JSON.stringify(fieldFixInfo.originalValue)}
                  </div>
                  <div className="text-xs text-gray-600">
                    <strong>Après :</strong>{" "}
                    {JSON.stringify(fieldFixInfo.fixedValue)}
                  </div>
                  <p className="text-xs text-gray-400">Cliquez pour copier</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ) : null}

          {fieldStatus === "error" && fieldError ? (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle
                    className="h-4 w-4 text-gray-500 cursor-pointer"
                    onClick={() =>
                      navigator.clipboard.writeText(
                        `${field.riKey}: ${fieldError} | Valeur: ${JSON.stringify(rawValue)}`,
                      )
                    }
                  />
                </TooltipTrigger>
                <TooltipContent className="flex flex-col gap-2">
                  <p className="font-bold">
                    <b>Clé du champ :</b> {field.riKey}
                  </p>
                  <b>Erreur :</b>
                  <p className="max-w-xs">{fieldError}</p>
                  <b>Valeur :</b>
                  <code className="font-mono">{JSON.stringify(rawValue)}</code>
                  <p className="text-xs text-gray-500 mt-1">
                    Cliquez pour copier
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ) : (
            <>
              {isModified && (
                <ActionButton
                  icon={RotateCcw}
                  onClick={handleReset}
                  title="Réinitialiser (revenir à la version IA)"
                  hoverColor="blue"
                />
              )}
              {!isModified && hasOriginalValue && (
                <ActionButton
                  icon={Trash2}
                  onClick={handleClear}
                  title="Supprimer (vider la donnée)"
                  hoverColor="red"
                />
              )}
            </>
          )}
        </div>
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
      className={`cursor-pointer rounded p-1 text-gray-400 ${hoverClasses}`}
      title={title}
    >
      <Icon className="h-4 w-4" />
    </button>
  );
}
