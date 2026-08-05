/**
 * MetadataRow Component
 * Renders a single row in the metadata table
 */

import {
  Avatar,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@playground/ui";
import type { LucideIcon } from "lucide-react";
import {
  AlignLeft,
  Building2,
  Cake,
  CalendarClock,
  CalendarDays,
  Clock,
  Euro,
  HelpCircle,
  Image,
  Languages,
  ListChecks,
  Map as MapIcon,
  MapPin,
  Repeat,
  RotateCcw,
  Tag,
  Target,
  Trash2,
  Type,
  User,
  Users,
} from "lucide-react";
import { useCallback } from "react";
import { ValueActionButton } from "@/components/common/ValueActionButton";
import { useMetadata } from "./MetadataContext";
import { getDisplayComponent } from "./publication-targets/refugies-info";
import { SourceDisplay } from "./SourceDisplay";
import { isEmptyValue } from "./shared";
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

  const isModified = [field.riKey, ...(field.relatedKeys ?? [])].some((key) =>
    dirtyFields.has(key),
  );

  const isEmpty = isEmptyValue(mergedValue);

  // Rouge uniquement si vide ET non modifié par l'user → l'IA n'a rien trouvé.
  // Un champ vidé par l'user est "dirty" (override null → isModified) : pas de rouge.
  const showEmptyWarning = isEmpty && !isModified;

  const showActions = isModified || !isEmpty;

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
    <tr
      className="border-b border-[var(--border-default-grey)] text-sm"
      data-empty-warning={showEmptyWarning ? "" : undefined}
    >
      <td className="align-top">
        <div className="flex items-center gap-2 px-4 py-3">
          <FieldIcon riKey={field.riKey} />
          <span
            id={field.riKey}
            className="text-sm font-medium text-[var(--text-label-grey)]"
          >
            {field.label}
          </span>

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
          ) : null}
        </div>
      </td>
      <td className="group relative h-px align-top" data-metadata-value>
        <div
          data-empty-cell={showEmptyWarning ? "" : undefined}
          className={`flex h-full flex-col px-4 py-3 transition-colors focus-within:!bg-[var(--background-default-grey)] ${
            showEmptyWarning
              ? "border border-dashed border-red-400/70 bg-(--background-contrast-warning) hover:bg-(--background-contrast-warning-hover)"
              : "hover:bg-[var(--background-alt-blue-france)]"
          }`}
        >
          {getDisplayComponent(field, mergedValue)}
        </div>

        {showActions && (
          <div className="absolute right-2 top-2 hidden overflow-hidden border border-[var(--border-default-grey)] bg-white group-hover:flex">
            {isModified && (
              <ValueActionButton
                icon={RotateCcw}
                onClick={handleReset}
                title="Réinitialiser (revenir à la version IA)"
              />
            )}
            {!isEmpty && (
              <ValueActionButton
                icon={Trash2}
                onClick={handleClear}
                title="Vider la donnée"
                className={
                  isModified
                    ? "border-l border-[var(--border-default-grey)]"
                    : ""
                }
              />
            )}
          </div>
        )}
      </td>
      <td className="align-top">
        <SourceDisplay source={prov?.source} diMetadata={diMetadata} />
      </td>
      <td className="w-[80px] align-middle">
        <div className="flex justify-center px-4 py-3">
          {!isModified && <Avatar isAI title="Rempli par l'IA" />}
        </div>
      </td>
    </tr>
  );
}

// =============================================================================
// Field icon (leading icon in the "Métadonnée" column)
// =============================================================================

const FIELD_ICONS: Record<string, LucideIcon> = {
  titreMarque: Type,
  mainSponsor: Building2,
  logo: Image,
  abstract: AlignLeft,
  theme: Tag,
  needs: Target,
  publicStatus: Users,
  public: User,
  frequency: Repeat,
  frenchLevel: Languages,
  age: Cake,
  price: Euro,
  commitment: Clock,
  periode: CalendarDays,
  timeSlots: CalendarClock,
  location: MapPin,
  conditions: ListChecks,
  map: MapIcon,
};

function FieldIcon({ riKey }: { riKey: string }) {
  const Icon = FIELD_ICONS[riKey] ?? Tag;
  return (
    <Icon
      className="h-4 w-4 shrink-0 text-[var(--text-label-grey)]"
      aria-hidden
    />
  );
}
