"use client";

import { Badge, Button } from "@playground/ui/primitives";
import { FileText, Hourglass } from "lucide-react";
import { useMemo, useState } from "react";
import { getStatusLabel, getStatusVariant } from "@/lib/document-labels";
import { toggleWorkflowStatus } from "@/services/document-actions";
import { useDocument } from "./DocumentContext";
import { MarkdownViewer } from "./MarkdownViewer";

export function ArbitrationView() {
  const {
    document,
    setDocument,
    isGeneratingMetadataReport,
    setIsGeneratingMetadataReport,
    setMetadataReport,
  } = useDocument();
  const [isUpdating, setIsUpdating] = useState(false);
  const [metadataError, setMetadataError] = useState<string | null>(null);

  // Get compliance report content
  const reportContent = useMemo(() => {
    return document?.complianceReport ?? "";
  }, [document?.complianceReport]);

  // Get metadata report content
  const metadataReportContent = useMemo(() => {
    return document?.metadataReport ?? "";
  }, [document?.metadataReport]);

  // Simplified status logic
  const isCompliant = document?.status === "compliant";

  const handleToggleStatus = async () => {
    if (!document) return;
    setIsUpdating(true);
    try {
      const result = await toggleWorkflowStatus(document.id, document.status);

      if (result.success && result.newStatus) {
        setDocument({
          ...document,
          status: result.newStatus,
          state: result.newProgress || document.state,
        });
      }
    } catch (error) {
      console.error("Failed to toggle status", error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleGenerateMetadataReport = async () => {
    if (!document?.editorialContent) {
      setMetadataError("Aucun contenu à analyser");
      return;
    }

    setIsGeneratingMetadataReport(true);
    setMetadataError(null);

    try {
      const response = await fetch("/api/agents/metadata/stream", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: document.editorialContent,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error("No reader available");
      }

      let finalContent = "";
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();

        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = line.slice(6);

            if (data === "[DONE]") {
              continue;
            }

            try {
              const parsed = JSON.parse(data);

              // Handle error messages from the backend
              if (parsed.type === "error") {
                setMetadataError(parsed.message);
                continue;
              }

              // Capture assistant messages as the report content
              if (parsed.message_type === "assistant_message") {
                const content =
                  typeof parsed.content === "string"
                    ? parsed.content
                    : JSON.stringify(parsed.content);
                finalContent = content;
              }
            } catch {
              // Ignore parse errors for incomplete chunks
            }
          }
        }
      }

      // Update document with final content
      if (finalContent) {
        setMetadataReport(finalContent);
      }
    } catch (err) {
      setMetadataError(err instanceof Error ? err.message : "Erreur inconnue");
    } finally {
      setIsGeneratingMetadataReport(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-white overflow-hidden">
      <div className="flex-1 overflow-auto ">
        <div className="mx-auto space-y-6">
          {/* Header with status and toggle */}
          <div className="sticky top-0 z-10 bg-white">
            <div className="p-4 border-b grid grid-cols-2 items-center  shadow">
              <p className="flex items-center gap-2">
                Etat de la fiche :{" "}
                <Badge variant={getStatusVariant(document?.status || "")}>
                  {getStatusLabel(document?.status || "")}
                </Badge>
              </p>

              <Button
                variant={isCompliant ? "danger" : "primary"}
                className="w-fit flex gap-2 items-center justify-center cursor-pointer ml-auto"
                onClick={handleToggleStatus}
                disabled={isUpdating}
              >
                <b className="uppercase">Je ne suis pas d'accord</b>{" "}
                <span>
                  {isCompliant
                    ? "(passer en non conforme)"
                    : "(passer en conforme)"}
                </span>
              </Button>
            </div>
          </div>

          {/* Compliance Report Section */}
          <div className="p-6">
            <h2 className="text-lg font-semibold mb-4">
              Rapport de conformité
            </h2>
            <MarkdownViewer
              content={reportContent}
              loadingMessage="Chargement du rapport..."
              emptyMessage="Aucun rapport disponible"
            />
          </div>

          {/* Metadata Report Section */}
          <div className="p-6 border-t">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Rapport de métadonnées</h2>
              <Button
                variant="secondary"
                onClick={handleGenerateMetadataReport}
                disabled={
                  isGeneratingMetadataReport || !document?.editorialContent
                }
                className="flex items-center gap-2"
              >
                {isGeneratingMetadataReport ? (
                  <>
                    <Hourglass className="w-4 h-4 animate-pulse" />
                    Génération en cours...
                  </>
                ) : (
                  <>
                    <FileText className="w-4 h-4" />
                    Générer le rapport
                  </>
                )}
              </Button>
            </div>

            {metadataError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">
                {metadataError}
              </div>
            )}

            <MarkdownViewer
              content={metadataReportContent}
              loadingMessage="Génération du rapport..."
              emptyMessage="Cliquez sur le bouton ci-dessus pour générer le rapport de métadonnées"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
