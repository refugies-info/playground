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
import { triggerForceArbitration } from "@/services/document-actions";
import { useDocument } from "../DocumentContext";
import { MetadataTable } from "./MetadataTable";
import { METADATA_FIELDS_RI } from "./publication-targets/refugies-info";

// =============================================================================
// Component
// =============================================================================

export function MetadataView() {
  const { document } = useDocument();
  const router = useRouter();
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Subscribe to realtime updates for metadata report generation
  useEffect(() => {
    if (!document?.id || document.metadataReport) return;

    const supabase = createSupabaseBrowserClient();

    // Subscribe to letta_reports changes for this workflow
    const channel = supabase
      .channel(`metadata-report-${document.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "letta_reports",
          filter: `workflow_id=eq.${document.id}`,
        },
        (payload) => {
          const newReport = payload.new as { report_type: string };
          if (newReport.report_type === "metadata") {
            // Refresh the page to get the new report
            router.refresh();
            setIsGenerating(false);
          }
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [document?.id, document?.metadataReport, router]);

  const handleGenerate = async () => {
    if (!document?.id) return;
    setIsGenerating(true);
    setError(null);
    try {
      const result = await triggerForceArbitration(document.id);
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

  // No metadata report → show re-generate prompt
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
          <Button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="w-full"
          >
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Génération en cours...
              </>
            ) : (
              "Générer les métadonnées"
            )}
          </Button>
          {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
        </div>
      </div>
    );
  }

  return (
    <MetadataTable
      report={document.metadataReport}
      diMetadata={document.metadata ?? {}}
      ref={
        document.referenceData ?? { themes: {}, needs: {}, needsByTheme: {} }
      }
      fields={METADATA_FIELDS_RI}
    />
  );
}
