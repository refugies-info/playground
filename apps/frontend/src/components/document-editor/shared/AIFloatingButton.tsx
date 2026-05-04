"use client";

import { logger } from "@playground/shared-types";
import {
  Popover,
  PopoverAnchor,
  PopoverContent,
} from "@playground/ui/overlays";
import { Button, PapaIA } from "@playground/ui/primitives";
import { RiCheckLine, RiCloseLine } from "@remixicon/react";
import { useState } from "react";
import { triggerEditorialRewrite } from "@/services/document-actions";
import { useDocumentActions } from "../actions";
import { useDocument } from "../DocumentContext";

/**
 * AIFloatingButton — Bouton flottant PapaIA + popover de confirmation.
 *
 * Cycle de vie :
 *   1. Repos      → PapaIA variant="default" (icône crayon)
 *   2. Génération → PapaIA variant="loading" (icône stop + breathe) ; click = annuler
 *   3. Suggestion → popover de confirmation au-dessus du bouton
 *      - "Annuler"   → rejectAiSuggestion()
 *      - "Remplacer" → acceptAiSuggestion() + saveDocument()
 *   4. Erreur     → message affiché au-dessus du bouton, dismissible au prochain clic
 *
 * Plus de Realtime ni de polling — `triggerEditorialRewrite` attend le résultat
 * directement via `run.returnValue` (timeout 55s côté serveur).
 */
export function AIFloatingButton() {
  const {
    document,
    setAiSuggestion,
    acceptAiSuggestion,
    rejectAiSuggestion,
    isProcessing,
    setIsProcessing,
  } = useDocument();
  const { saveDocument } = useDocumentActions();

  const [error, setError] = useState<string | null>(null);

  const hasSuggestion = !!document?.aiSuggestion;

  const handleGenerate = async () => {
    if (!document?.editorialContent || !document?.id) return;

    setError(null);
    setIsProcessing(true);

    const result = await triggerEditorialRewrite(document.id);

    setIsProcessing(false);

    if (!result.success || !result.content) {
      logger.warn(
        { workflowId: document.id, error: result.error },
        "[AIFloatingButton] Rewrite failed",
      );
      setError(result.error ?? "Une erreur est survenue. Réessayez.");
      return;
    }

    setAiSuggestion(result.content);
  };

  const handleCancel = () => {
    // Interrompt l'attente côté UI — le workflow Vercel continue mais
    // on ignore son résultat (setAiSuggestion ne sera plus appelé).
    setIsProcessing(false);
    setError(null);
  };

  const handleReject = () => {
    rejectAiSuggestion();
    setIsProcessing(false);
    setError(null);
  };

  const handleAccept = async () => {
    acceptAiSuggestion();
    await saveDocument();
  };

  const isDisabled =
    !document?.editorialContent || document?.complianceStatus !== "compliant";

  return (
    <div className="absolute bottom-6 right-6 z-20 flex flex-col items-end gap-2">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg px-3 py-2 text-red-700 text-xs max-w-64 text-right leading-5">
          {error}
        </div>
      )}

      <Popover
        open={hasSuggestion}
        onOpenChange={(open) => {
          if (!open) handleReject();
        }}
      >
        <PopoverAnchor asChild>
          <PapaIA
            variant={isProcessing ? "loading" : "default"}
            onClick={isProcessing ? handleCancel : handleGenerate}
            disabled={!isProcessing && isDisabled}
          />
        </PopoverAnchor>

        <PopoverContent
          side="top"
          align="end"
          className="w-72 p-6"
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          <p className="text-sm text-[var(--text-default-grey)] mb-7 leading-6">
            Voici la proposition d'amélioration faite par l'IA. Souhaites-tu
            remplacer et écraser l'ancienne version&nbsp;?
          </p>
          <div className="flex gap-4">
            <Button
              variant="tertiaire"
              size="sm"
              rightIcon={RiCloseLine}
              onClick={handleReject}
            >
              Annuler
            </Button>
            <Button
              variant="primaire"
              size="sm"
              rightIcon={RiCheckLine}
              onClick={handleAccept}
            >
              Remplacer
            </Button>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
