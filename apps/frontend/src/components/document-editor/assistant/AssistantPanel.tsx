"use client";

import { cn } from "@playground/ui";
import { Button } from "@playground/ui/primitives";
import {
  ChevronLeft,
  ChevronRight,
  Hourglass,
  WandSparkles,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { triggerEditorialRewrite } from "@/services/document-actions";
import { useDocument } from "../DocumentContext";
import { useEditorialRealtime } from "./hooks/useEditorialRealtime";

export function AssistantPanel() {
  const {
    document,
    setAiSuggestion,
    isProcessing,
    setIsProcessing,
    isComparisonMode,
  } = useDocument();

  const [isCollapsed, setIsCollapsed] = useState(false);

  // Auto-collapse when comparison mode is active
  useEffect(() => {
    if (isComparisonMode) {
      setIsCollapsed(true);
    }
  }, [isComparisonMode]);

  // Supabase Realtime subscription for editorial rewrite results.
  // Same pattern as usePublicationRealtime — Realtime + polling fallback.
  const { isWaiting, error, setError, setIsWaiting, startListening } =
    useEditorialRealtime({
      workflowId: document?.id,
      onComplete: (content) => {
        setAiSuggestion(content);
        setIsProcessing(false);
      },
      onError: (message) => {
        setError(message);
        setIsProcessing(false);
      },
    });

  const handleImproveContent = async () => {
    if (!document?.editorialContent || !document?.id) {
      setError("Pas de contenu à améliorer.");
      return;
    }

    setIsProcessing(true);
    setError(null);

    // Start listening BEFORE triggering the workflow to avoid race conditions.
    // Same pattern as publication: subscribe → then start workflow.
    startListening();

    const result = await triggerEditorialRewrite(document.id);

    if (!result.success) {
      setError(result.error || "Erreur lors du démarrage de l'amélioration.");
      setIsProcessing(false);
      setIsWaiting(false);
      return;
    }

    // Workflow started — the Realtime subscription (or polling fallback)
    // will pick up the result when the workflow completes.
  };

  const handleCancel = () => {
    setIsProcessing(false);
    setIsWaiting(false);
    setError(null);
  };

  return (
    <div
      className={cn(
        "flex flex-col h-full border-l bg-white transition-all duration-300 ease-in-out relative",
        isCollapsed ? "w-12" : "w-80",
      )}
    >
      <div className="flex items-center p-2 border-b">
        <Button
          variant="quatrieme"
          size="sm"
          className="h-8 w-8 px-0"
          onClick={() => setIsCollapsed(!isCollapsed)}
          disabled={isComparisonMode}
        >
          {isCollapsed ? (
            <ChevronLeft className="w-4 h-4" />
          ) : (
            <ChevronRight className="w-4 h-4" />
          )}
        </Button>
        {!isCollapsed && (
          <span className="font-semibold text-sm ml-2">IA Chat</span>
        )}
      </div>

      {/* Status / Error display */}
      {!isCollapsed && (
        <div className="flex-1 overflow-y-auto p-4">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-xs">
              {error}
            </div>
          )}

          {isProcessing || isWaiting ? (
            <div className="flex flex-col items-center justify-center gap-3 py-8">
              <Hourglass className="w-8 h-8 text-blue-600 animate-pulse" />
              <p className="text-sm text-gray-600 text-center">
                L'IA réécrit votre document...
                <br />
                <span className="text-xs text-gray-400">
                  Cela peut prendre 2 à 5 minutes.
                </span>
              </p>
            </div>
          ) : (
            <p className="text-sm text-gray-500">
              Cliquez sur le bouton ci-dessous pour améliorer votre document
              avec l'IA.
            </p>
          )}
        </div>
      )}

      {/* Action Buttons */}
      {!isCollapsed && (
        <div className="p-4 border-t space-y-2">
          <button
            type="button"
            onClick={handleImproveContent}
            disabled={
              isProcessing ||
              isWaiting ||
              !document?.editorialContent ||
              document?.complianceStatus !== "compliant"
            }
            className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
          >
            {isProcessing || isWaiting ? (
              <>
                <Hourglass className="w-4 h-4 animate-pulse" />
                Je réfléchis...
              </>
            ) : (
              <>
                <WandSparkles className="w-4 h-4" /> Améliorer avec l'IA
              </>
            )}
          </button>

          {(isProcessing || isWaiting) && (
            <button
              type="button"
              onClick={handleCancel}
              className="w-full px-4 py-2 bg-red-100 text-red-700 rounded-lg font-medium hover:bg-red-200 transition-colors flex items-center justify-center gap-2 text-sm"
            >
              <X className="w-4 h-4" />
              Annuler
            </button>
          )}
        </div>
      )}
    </div>
  );
}
