"use client";

import { isRtlLanguage } from "@playground/shared-types";
import { AlignLeft, type LucideIcon, Trash2 } from "lucide-react";
import { useCallback, useState } from "react";
import { EditableTextareaCell } from "@/components/common/EditableTextareaCell";
import { ValueActionButton } from "@/components/common/ValueActionButton";
import { ABSTRACT_MAX_LENGTH } from "@/components/document-editor/metadata/publication-targets/refugies-info";
import { getLanguageName } from "@/lib/document-labels";
import { useTranslation } from "../TranslationContext";

/**
 * TranslationMetadataTable — Tableau des métadonnées à traduire (RI-1379).
 *
 * @figma https://www.figma.com/design/mVdElBMCLe9RLRJF9ayP5Z/BOMO?node-id=3747-23975
 *
 * Même tableau qu'en FR réduit à trois colonnes : nom de la métadonnée, version
 * française (lecture seule) et traduction éditable. Une seule métadonnée est
 * traduisible aujourd'hui, « En bref » — la liste reste néanmoins tabulaire pour
 * absorber les suivantes sans réécriture.
 */

interface TranslatableField {
  riKey: string;
  label: string;
  icon: LucideIcon;
  maxLength?: number;
}

const TRANSLATABLE_FIELDS: TranslatableField[] = [
  {
    riKey: "abstract",
    label: "En bref",
    icon: AlignLeft,
    maxLength: ABSTRACT_MAX_LENGTH,
  },
];

export function TranslationMetadataTable() {
  const { translation } = useTranslation();

  if (!translation) return null;

  const languageName = getLanguageName(translation.language);

  return (
    <div className="border border-[var(--border-default-grey)] bg-white">
      <table className="w-full table-fixed border-collapse">
        <thead>
          <tr className="bg-[var(--background-action-low-blue-france)]">
            <th className="w-[180px] px-4 py-3 text-left text-xs font-bold text-[#000091]">
              Métadonnée
            </th>
            <th className="px-4 py-3 text-left text-xs font-bold text-[#000091]">
              Version française
            </th>
            <th className="px-4 py-3 text-left text-xs font-bold text-[#000091]">
              Traduction en {languageName}
            </th>
          </tr>
        </thead>
        <tbody className="bg-white">
          {TRANSLATABLE_FIELDS.map((field) => (
            <TranslationMetadataRow key={field.riKey} field={field} />
          ))}
        </tbody>
      </table>
    </div>
  );
}

function TranslationMetadataRow({ field }: { field: TranslatableField }) {
  const { translation, updateMetadataField, isArchived } = useTranslation();

  const sourceValue = translation?.sourceMetadata?.[field.riKey];
  const rawValue = translation?.metadata?.[field.riKey];
  const value = typeof rawValue === "string" ? rawValue : undefined;

  // Une sauvegarde ratée annule la saisie : sans ce message, le texte
  // disparaîtrait de la cellule sans rien dire à l'utilisateur.
  const [error, setError] = useState<string | null>(null);

  const handleSave = useCallback(
    async (newValue: string | undefined) => {
      const result = await updateMetadataField(field.riKey, newValue);
      setError(
        result.success ? null : (result.error ?? "Erreur de sauvegarde"),
      );
    },
    [field.riKey, updateMetadataField],
  );

  // Pas de bouton « réinitialiser » ici (RI-1379) : la traduction est saisie de
  // zéro, il n'existe aucune version IA vers laquelle revenir.
  const handleClear = useCallback(async () => {
    const result = await updateMetadataField(field.riKey, undefined);
    setError(result.success ? null : (result.error ?? "Erreur de sauvegarde"));
  }, [field.riKey, updateMetadataField]);

  const Icon = field.icon;

  return (
    <tr className="border-b border-[var(--border-default-grey)] text-sm">
      <td className="align-top">
        <div className="flex items-center gap-2 px-4 py-3">
          <Icon
            className="h-4 w-4 shrink-0 text-[var(--text-label-grey)]"
            aria-hidden
          />
          <span className="text-sm font-medium text-[var(--text-label-grey)]">
            {field.label}
          </span>
        </div>
      </td>

      <td className="align-top">
        <div className="px-4 py-3 text-[var(--text-default-grey)]">
          {typeof sourceValue === "string" ? sourceValue : null}
        </div>
      </td>

      <td className="group relative h-px align-top" data-metadata-value>
        {/* Même bascule RTL que l'éditeur de contenu (arabe, persan). */}
        <div
          dir={isRtlLanguage(translation?.language) ? "rtl" : "ltr"}
          className="flex h-full flex-col px-4 py-3 transition-colors focus-within:!bg-[var(--background-default-grey)] hover:bg-[var(--background-alt-blue-france)]"
        >
          <EditableTextareaCell
            value={value}
            onSave={handleSave}
            label={`${field.label} en ${getLanguageName(translation?.language ?? "")}`}
            disabled={isArchived}
            maxLength={field.maxLength}
          />
          {error && (
            <p className="mt-1 text-xs text-red-500" role="alert">
              {error}
            </p>
          )}
        </div>

        {value && !isArchived && (
          <div className="absolute right-2 top-2 hidden overflow-hidden border border-[var(--border-default-grey)] bg-white group-hover:flex">
            <ValueActionButton
              icon={Trash2}
              onClick={handleClear}
              title="Vider la donnée"
            />
          </div>
        )}
      </td>
    </tr>
  );
}
