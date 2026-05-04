"use client";

import { Button } from "@playground/ui/primitives";
import { Hourglass, WandSparkles, X } from "lucide-react";
import { triggerEditorialRewrite } from "@/services/document-actions";
import { useEditorialRealtime } from "../assistant/hooks/useEditorialRealtime";
import { useDocument } from "../DocumentContext";

/** Bouton flottant "Améliorer avec l'IA" — déclenche la réécriture Letta du document. */
export function AIFloatingButton() {
  const { document, setAiSuggestion, isProcessing, setIsProcessing } =
    useDocument();

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
    startListening();

    const result = await triggerEditorialRewrite(document.id);

    if (!result.success) {
      setError(result.error || "Erreur lors du démarrage de l'amélioration.");
      setIsProcessing(false);
      setIsWaiting(false);
    }
  };

  const handleCancel = () => {
    setIsProcessing(false);
    setIsWaiting(false);
    setError(null);
  };

  const isActive = isProcessing || isWaiting;
  const isDisabled =
    isActive ||
    !document?.editorialContent ||
    document?.complianceStatus !== "compliant";

  return (
    <div className="absolute bottom-6 right-6 z-20 flex flex-col items-end gap-2">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg px-3 py-2 text-red-700 text-xs max-w-48 text-right">
          {error}
        </div>
      )}

      {isActive && (
        <Button
          variant="tertiaire"
          size="sm"
          onClick={handleCancel}
          className="shadow-md"
        >
          <X className="w-4 h-4 mr-1" />
          Annuler
        </Button>
      )}

      <Button
        variant="primaire"
        size="sm"
        onClick={handleImproveContent}
        disabled={isDisabled}
        className="shadow-lg"
      >
        {isActive ? (
          <>
            <Hourglass className="w-4 h-4 mr-1 animate-pulse" />
            IA en cours...
          </>
        ) : (
          <>
            <WandSparkles className="w-4 h-4 mr-1" />
            Améliorer avec l'IA
          </>
        )}
      </Button>
    </div>
  );
}
