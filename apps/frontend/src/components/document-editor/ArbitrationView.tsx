"use client";

import { Badge, Button } from "@playground/ui/primitives";
import { useMemo, useState } from "react";
import { getStatusLabel, getStatusVariant } from "@/lib/document-labels";
import { toggleWorkflowStatus } from "@/services/document-actions";
import { useDocument } from "./DocumentContext";
import { MarkdownViewer } from "./MarkdownViewer";

export function ArbitrationView() {
  const { document, setDocument } = useDocument();
  const [isUpdating, setIsUpdating] = useState(false);

  // Get compliance report content
  const reportContent = useMemo(() => {
    return document?.complianceReport ?? "";
  }, [document?.complianceReport]);

  // Check for error state (agent failed to produce valid output)
  const isError = document?.status === "error";

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

  return (
    <div className="flex-1 flex flex-col h-full bg-white overflow-hidden">
      <div className="flex-1 overflow-auto ">
        <div className="mx-auto space-y-6">
          {/* Markdown viewer for compliance report */}
          <div className="sticky top-0 z-10 bg-white">
            <div className="p-4 border-b grid grid-cols-2 items-center  shadow">
              <p className="flex items-center gap-2">
                Etat de la fiche :{" "}
                <Badge variant={getStatusVariant(document?.status || "")}>
                  {getStatusLabel(document?.status || "")}
                </Badge>
              </p>

              {!isError && (
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
              )}
            </div>
          </div>

          {/* Error alert when agent failed to produce valid output */}
          {isError && (
            <div className="mx-6 p-4 bg-red-50 border border-red-200 rounded-md">
              <p className="font-bold text-red-600">Erreur</p>
              <p className="text-red-600">
                L'arbitrage de cette fiche n'a pas pu être réalisé.
              </p>
            </div>
          )}

          {/* Report content (only shown when not in error state) */}
          {!isError && (
            <div className="  p-6">
              <MarkdownViewer
                content={reportContent}
                loadingMessage="Chargement du rapport..."
                emptyMessage="Aucun rapport disponible"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
