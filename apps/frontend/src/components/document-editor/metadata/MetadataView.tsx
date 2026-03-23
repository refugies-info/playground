/**
 * MetadataView Component
 * Pure rendering component — all state and logic lives in MetadataContext.
 */

"use client";

import { Button } from "@playground/ui/primitives";
import { Loader2 } from "lucide-react";
import { useDocument } from "../DocumentContext";
import { useMetadata } from "./MetadataContext";
import { MetadataTable } from "./MetadataTable";
import { METADATA_FIELDS_RI } from "./publication-targets/refugies-info";

// =============================================================================
// Component
// =============================================================================

export function MetadataView() {
  const { document } = useDocument();
  const { isGenerating, isGeneratingOnLoad, generationError, handleGenerate } =
    useMetadata();

  if (!document) {
    return <div className="p-4">Document non trouvé</div>;
  }

  // Full-page loader during generation (first-time or regeneration)
  if (isGenerating) {
    return (
      <div className="flex-1 bg-white flex items-center justify-center p-8">
        <div className="text-center max-w-md">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {isGeneratingOnLoad
              ? "Génération des métadonnées en cours..."
              : document.metadataReport
                ? "Régénération en cours..."
                : "Génération en cours..."}
          </h3>
          <p className="text-sm text-gray-500">
            {isGeneratingOnLoad
              ? "Une génération est déjà en cours. La page se mettra à jour automatiquement une fois le travail de l'IA terminé."
              : "L'IA analyse les données pour pré-remplir les métadonnées."}
          </p>
        </div>
      </div>
    );
  }

  // No metadata report → show generate prompt
  if (!document.metadataReport) {
    return (
      <div className="flex-1 bg-white flex items-center justify-center p-8">
        <div className="text-center max-w-md">
          <div className="text-4xl mb-4">📋</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Aucun rapport de métadonnées
          </h3>
          <p className="text-sm text-gray-500 mb-6">
            Le rapport de métadonnées IA n&apos;a pas encore été généré ou a
            rencontré une erreur. Relancez la génération pour pré-remplir les
            métadonnées.
          </p>
          <Button onClick={handleGenerate} className="w-full">
            Générer les métadonnées
          </Button>
          {generationError && (
            <p className="mt-4 text-sm text-red-600">{generationError}</p>
          )}
        </div>
      </div>
    );
  }

  // Metadata report exists → show table + regenerate button
  return (
    <div className="flex-1 bg-white overflow-y-auto">
      <MetadataTable
        report={document.metadataReport}
        diMetadata={document.metadata ?? {}}
        ref={
          document.referenceData ?? { themes: {}, needs: {}, needsByTheme: {} }
        }
        fields={METADATA_FIELDS_RI}
      />

      {/* Regenerate button — visible only when a report already exists */}
      <div className="px-6 py-3 border-t flex items-center gap-3 bg-gray-50">
        <div className="flex items-center gap-3">
          {generationError && (
            <p className="text-sm text-red-600">{generationError}</p>
          )}
          <Button size="sm" onClick={handleGenerate}>
            Régénérer les métadonnées
          </Button>
        </div>
        <p className="text-xs text-gray-600">
          Relancer un rapport pour mettre à jour les métadonnées.
        </p>
      </div>
    </div>
  );
}
