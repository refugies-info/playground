/**
 * MetadataView Component
 * Main view for displaying and editing metadata
 */

"use client";

import { createSupabaseBrowserClient } from "@playground/supabase";
import { Button } from "@playground/ui/primitives";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { triggerForceMetadataOnly } from "@/services/document-actions";
import { useDocument } from "../DocumentContext";
import { MetadataTable } from "./MetadataTable";
import { METADATA_FIELDS_RI } from "./publication-targets/refugies-info";

// =============================================================================
// Component
// =============================================================================

export function MetadataView() {
  const { document } = useDocument();
  const router = useRouter();
  // Initialize from DB state so the loader persists across page refreshes.
  // isMetadataGenerating is true when a "generating" report exists in letta_reports.
  const [isGenerating, setIsGenerating] = useState(
    document?.isMetadataGenerating ?? false,
  );
  const [error, setError] = useState<string | null>(null);

  // Subscribe to Realtime UPDATE events on letta_reports during generation.
  // Active only when isGenerating is true.
  // The workflow inserts a "generating" sentinel, then updates it to
  // "complete" or "error" when done — triggering this subscription.
  // Requires REPLICA IDENTITY FULL on letta_reports (migration 20260318130000)
  // for the workflow_id filter to work on UPDATE events.
  useEffect(() => {
    if (!document?.id || !isGenerating) return;

    const supabase = createSupabaseBrowserClient();

    const channel = supabase
      .channel(`metadata-report-${document.id}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "letta_reports",
          filter: `workflow_id=eq.${document.id}`,
        },
        (payload) => {
          const newReport = payload.new as {
            report_type: string;
            status: string;
          };
          // React only when the report transitions from "generating" to a terminal status.
          if (
            newReport.report_type === "metadata" &&
            newReport.status !== "generating"
          ) {
            router.refresh();
            setIsGenerating(false);
            if (newReport.status !== "complete") {
              setError(
                "La régénération a échoué. Vérifiez les logs et réessayez.",
              );
            }
          }
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [document?.id, isGenerating, router]);

  // Generate or regenerate metadata report (same action in both cases)
  const handleGenerate = async () => {
    if (!document?.id) return;
    setIsGenerating(true);
    setError(null);
    try {
      const result = await triggerForceMetadataOnly(document.id);
      if (!result.success) {
        setError(result.error ?? "Erreur lors du démarrage de la génération");
        setIsGenerating(false);
      }
      // Don't set isGenerating to false on success - wait for realtime update
    } catch {
      setError("Erreur inattendue");
      setIsGenerating(false);
    }
  };

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
            {document.metadataReport
              ? "Régénération en cours..."
              : "Génération en cours..."}
          </h3>
          <p className="text-sm text-gray-500">
            L&apos;IA analyse les données pour pré-remplir les métadonnées.
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
          {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
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
          {error && <p className="text-sm text-red-600">{error}</p>}
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
