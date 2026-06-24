"use client";

import type { ReactNode } from "react";
import {
  METADATA_FIELDS_RI,
  MULTI_ENUM_OPTIONS,
} from "@/components/document-editor/metadata/publication-targets/refugies-info";
import { useTranslation } from "./TranslationContext";

const multiEnumLookup: Record<string, Map<string, string>> = {};
for (const [key, options] of Object.entries(MULTI_ENUM_OPTIONS)) {
  multiEnumLookup[key] = new Map(options.map((o) => [o.value, o.label]));
}

function formatValue(key: string, value: unknown): ReactNode {
  if (value === null || value === undefined) {
    return <span className="text-gray-400">—</span>;
  }

  const lookup = multiEnumLookup[key];
  if (lookup && Array.isArray(value)) {
    const labels = value.map((v) => lookup.get(String(v)) ?? String(v));
    return labels.length > 0 ? (
      labels.join(", ")
    ) : (
      <span className="text-gray-400">—</span>
    );
  }

  if (Array.isArray(value)) {
    return value.length > 0 ? (
      value.join(", ")
    ) : (
      <span className="text-gray-400">—</span>
    );
  }

  if (typeof value === "object") {
    return <code className="text-xs font-mono">{JSON.stringify(value)}</code>;
  }

  return String(value);
}

export function TranslationMetadataView() {
  const { translation } = useTranslation();

  if (!translation) {
    return <div className="p-4">Traduction non trouvée</div>;
  }

  const metadata = translation.sourceMetadata ?? {};

  if (Object.keys(metadata).length === 0) {
    return (
      <div className="flex-1 bg-white flex items-center justify-center p-8">
        <div className="text-center max-w-md">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Aucune métadonnée
          </h3>
          <p className="text-sm text-gray-500">
            La fiche source ne contient pas encore de métadonnées.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-white overflow-y-auto">
      <div className="bg-white">
        <table className="w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[20%]">
                Métadonnée
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[80%]">
                Valeur (fiche source FR)
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {METADATA_FIELDS_RI.map((field) => {
              const value = metadata[field.riKey];
              return (
                <tr key={field.riKey} className="hover:bg-gray-50 text-sm">
                  <td className="px-6 py-4">
                    <span className="text-md font-bold">{field.label}</span>
                  </td>
                  <td className="px-6 py-4 text-gray-700">
                    {formatValue(field.riKey, value)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
