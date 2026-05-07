"use client";

import type {
  ComplianceStatus,
  OnlineStatus,
  WorkStatus,
} from "@playground/shared-types";
import { EmptyDash } from "@playground/ui/composites";
import { Badge, Button, Conformite } from "@playground/ui/primitives";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { toggleWorkflowStatus } from "@/services/document-actions";
import { useDocument } from "../DocumentContext";
import { MarkdownViewer } from "../shared/MarkdownViewer";

export function ArbitrationView() {
  const router = useRouter();
  const { document, setDocument } = useDocument();
  const [isUpdating, setIsUpdating] = useState(false);

  // Get compliance report content
  const reportContent = useMemo(() => {
    return document?.complianceReport ?? "";
  }, [document?.complianceReport]);

  // Check for error state (agent failed to produce valid output)
  const isError = document?.complianceStatus === "error";

  // Simplified status logic
  const isCompliant = document?.complianceStatus === "compliant";

  const handleToggleStatus = async () => {
    if (!document) return;
    setIsUpdating(true);
    try {
      const result = await toggleWorkflowStatus(
        document.id,
        document.complianceStatus || "pending",
      );

      if (result.success && result.newComplianceStatus) {
        setDocument({
          ...document,
          complianceStatus:
            (result.newComplianceStatus as ComplianceStatus) ||
            document.complianceStatus,
          workStatus:
            (result.newWorkStatus as WorkStatus) || document.workStatus,
          onlineStatus:
            (result.newOnlineStatus as OnlineStatus) || document.onlineStatus,
        });
        router.refresh();
      }
    } catch (error) {
      // biome-ignore lint/suspicious/noConsole: For quick debugging
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
                {!document?.complianceStatus && <EmptyDash />}
                {document?.complianceStatus === "compliant" && (
                  <Conformite value="conforme" />
                )}
                {document?.complianceStatus === "non_compliant" && (
                  <Conformite value="non-conforme" />
                )}
                {document?.complianceStatus === "pending" && (
                  <Badge variant="neutral">En cours d&apos;arbitrage</Badge>
                )}
                {document?.complianceStatus === "error" && (
                  <Badge variant="danger">Erreur</Badge>
                )}
              </p>

              {!isError && (
                <div className="flex flex-col items-end gap-2 ml-auto">
                  {!(
                    document?.workStatus === "draft" ||
                    document?.onlineStatus === "published"
                  ) ? (
                    <Button
                      variant="primaire"
                      className="w-fit flex gap-2 items-center justify-center cursor-pointer"
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
                  ) : (
                    <p className="text-xs font-medium ">
                      L'arbitrage ne peut plus être modifié (fiche en cours de
                      traitement).
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Error alert when agent failed to produce valid output */}
          {isError && (
            <div className="mx-6 border border-[#FCC639] flex bg-white">
              <div className="w-10 bg-[#FCC639] shrink-0 flex items-start justify-center pt-4">
                <svg
                  className="w-6 h-6 text-white"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z" />
                </svg>
              </div>
              <div className="p-4">
                <p className="font-bold text-gray-900">Erreur</p>
                <p className="text-gray-600">
                  L'arbitrage de cette fiche n'a pas pu être réalisé.
                </p>
              </div>
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
