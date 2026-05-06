"use client";

import { logger } from "@playground/shared-types";
import {
  Popover,
  PopoverAnchor,
  PopoverContent,
} from "@playground/ui/overlays";
import { Button, PapaIA } from "@playground/ui/primitives";
import { RiCheckLine, RiCloseLine } from "@remixicon/react";
import { useEffect, useRef, useState } from "react";
import { useDocumentActions } from "../actions";
import { useDocument } from "../DocumentContext";

/**
 * Appel GET /api/editorial-rewrite/[runId] — attend le résultat du workflow.
 * Hoisted hors du composant (fonction pure, aucune dépendance au state).
 */
async function awaitResult(
  runId: string,
  signal: AbortSignal,
): Promise<string> {
  const res = await fetch(`/api/editorial-rewrite/${runId}`, { signal });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error ?? `Erreur HTTP ${res.status}`);
  }
  const { content } = await res.json();
  return content as string;
}

/**
 * AIFloatingButton — Bouton flottant PapaIA + popover de confirmation.
 *
 * Orchestre le cycle complet de réécriture IA côté client :
 * démarrage, attente, confirmation, annulation, et reprise après interruption.
 *
 * ## Cycle de vie (états du bouton)
 *
 * ```
 * ┌─────────┐   click    ┌────────────┐  résultat   ┌────────────┐
 * │  Repos  │ ─────────→ │ Génération │ ──────────→ │ Suggestion │
 * │ default │            │  loading   │             │  popover   │
 * └─────────┘            └────────────┘             └────────────┘
 *                          │    ↑                     │         │
 *                    click │    │ Relancer        Annuler   Remplacer
 *                          ↓    │                     │         │
 *                        ┌──────────┐                 ↓         ↓
 *                        │  Erreur  │            ┌─────────┐ ┌──────────┐
 *                        │ popover  │            │  Repos  │ │  Repos   │
 *                        └──────────┘            │         │ │ + save() │
 *                                                └─────────┘ └──────────┘
 * ```
 *
 * ## Persistance serveur (active_run_id)
 *
 * Le runId est stocké dans `editorial_records.active_run_id` en base.
 * Cela permet la reprise transparente après refresh, fermeture d'onglet,
 * ou changement de navigateur.
 *
 * ```
 * Premier chargement (document.activeRunId présent)
 *   │
 *   ├─ aiSuggestion déjà présente ? → skip (état déjà résolu)
 *   │
 *   └─ Sinon → useEffect démarre GET /api/editorial-rewrite/[runId]
 *        ├─ Workflow encore en cours → loading (run.returnValue bloque)
 *        └─ Workflow terminé        → popover (run.returnValue résout immédiat)
 * ```
 *
 * ## API utilisée
 *
 * | Méthode | Endpoint                           | Usage                              |
 * |---------|------------------------------------|------------------------------------|
 * | POST    | `/api/editorial-rewrite`           | Démarrer le workflow                |
 * | GET     | `/api/editorial-rewrite/[runId]`   | Attendre le résultat (≤5min)       |
 * | DELETE  | `/api/editorial-rewrite/[runId]`   | Annuler / nettoyer active_run_id   |
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
  const abortControllerRef = useRef<AbortController | null>(null);
  const runIdRef = useRef<string | null>(null);

  const hasSuggestion = !!document?.aiSuggestion;

  // ─── handleGenerate ────────────────────────────────────────────────────
  const handleGenerate = async () => {
    if (!document?.editorialContent || !document?.id) return;

    setError(null);
    setIsProcessing(true);

    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      // Étape 0 — sauvegarder pour que l'IA travaille sur la version courante
      // de l'éditeur (et pas sur une version périmée en DB).
      // saveDocument valide la présence d'un H1 et bloque sinon (alert).
      const saveResult = await saveDocument();
      if (!saveResult.success) {
        // saveDocument a déjà alerté l'utilisateur (titre manquant, etc.)
        // ou retourné l'erreur. On annule sans faire de bruit supplémentaire.
        setIsProcessing(false);
        abortControllerRef.current = null;
        return;
      }

      // Étape 1 — démarrer le workflow (rapide, retourne { runId })
      const startRes = await fetch("/api/editorial-rewrite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ workflowId: document.id }),
        signal: controller.signal,
      });

      if (!startRes.ok) {
        const data = await startRes.json().catch(() => ({}));
        throw new Error(data.error ?? `Erreur HTTP ${startRes.status}`);
      }

      const { runId } = await startRes.json();
      runIdRef.current = runId;

      // Étape 2 — attendre le résultat (long, maxDuration=300s)
      const content = await awaitResult(runId, controller.signal);
      setAiSuggestion(content);
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") {
        logger.info(
          { workflowId: document.id },
          "[AIFloatingButton] Cancelled",
        );
        // En cas d'abort, le runId est déjà nettoyé par handleCancel (DELETE).
        runIdRef.current = null;
        return;
      }
      const message =
        err instanceof Error
          ? err.message
          : "Une erreur est survenue. Réessayez.";
      logger.warn(
        { workflowId: document.id, message },
        "[AIFloatingButton] Failed",
      );
      setError(message);
      // Erreur côté GET → server-side a déjà fait clearActiveRunId.
      runIdRef.current = null;
    } finally {
      setIsProcessing(false);
      abortControllerRef.current = null;
      // ⚠️ NE PAS reset runIdRef.current ici : il doit rester set tant que
      // l'utilisateur n'a pas pris sa décision (Accept/Reject/Cancel) sur la
      // popover. Le DocumentContext n'est pas synchronisé après le POST, donc
      // sans cette ref, clearActiveRunId() ne saurait pas quel runId nettoyer.
    }
  };

  // ─── handleCancel ──────────────────────────────────────────────────────
  const handleCancel = () => {
    abortControllerRef.current?.abort();

    const runId = runIdRef.current;
    if (runId) {
      fetch(`/api/editorial-rewrite/${runId}`, { method: "DELETE" }).catch(
        () => {},
      );
    }

    setIsProcessing(false);
    // Cleanup post-DELETE : on a envoyé l'ordre, on libère la ref pour la
    // prochaine génération (le DELETE part en fire-and-forget en arrière-plan).
    runIdRef.current = null;
  };

  // ─── Cleanup active_run_id en base ────────────────────────────────────────
  // Retourne une Promise pour pouvoir l'awaiter avant tout side-effect
  // (save, navigation) qui pourrait déclencher un revalidate côté serveur.
  // Sans await, un refresh rapide après accept/reject ferait réapparaître
  // la popover car active_run_id serait encore présent en DB.
  const clearActiveRunId = async () => {
    const runId = runIdRef.current ?? document?.activeRunId;
    if (!runId) return;
    try {
      await fetch(`/api/editorial-rewrite/${runId}`, { method: "DELETE" });
    } catch {
      // Best effort — l'utilisateur peut retomber sur la popover au refresh
      // mais elle proposera la même suggestion (idempotent).
    } finally {
      // Ref libérée APRÈS le DELETE (success ou échec).
      runIdRef.current = null;
    }
  };

  // ─── handleReject / handleAccept ───────────────────────────────────────
  const handleReject = async () => {
    rejectAiSuggestion();
    setIsProcessing(false);
    setError(null);
    // Awaité : sinon refresh rapide après reject → popover réapparaît
    // car active_run_id encore en DB et run.returnValue cache encore le résultat.
    await clearActiveRunId();
  };

  const handleAccept = async () => {
    const content = document?.aiSuggestion;
    acceptAiSuggestion();
    await clearActiveRunId(); // ← awaité : active_run_id nettoyé avant le reload
    await saveDocument(content);
  };

  // ─── Reprise après refresh / fermeture d'onglet / changement de navigateur ─
  // Si activeRunId est présent, on reprend via GET /api/editorial-rewrite/[runId].
  // - Workflow en cours → run.returnValue bloque → bouton en loading
  // - Workflow terminé → run.returnValue résout immédiatement → popover s'ouvre
  //
  // Dépendances volontairement limitées à activeRunId : l'effect ne doit se
  // déclencher qu'à l'apparition d'un runId à reprendre, pas à chaque changement
  // de aiSuggestion ou des setters (stables via useCallback dans DocumentContext).
  // biome-ignore lint/correctness/useExhaustiveDependencies: intentional — activeRunId is the only intended trigger
  useEffect(() => {
    if (!document?.activeRunId || document?.aiSuggestion) return;

    logger.info(
      { runId: document.activeRunId },
      "[AIFloatingButton] Resuming in-progress generation",
    );
    setIsProcessing(true);
    runIdRef.current = document.activeRunId;

    const controller = new AbortController();
    abortControllerRef.current = controller;

    awaitResult(document.activeRunId, controller.signal)
      .then((content) => setAiSuggestion(content))
      .catch((err) => {
        if (err instanceof DOMException && err.name === "AbortError") {
          // Abort → ref nettoyée par le bloc qui a déclenché l'abort.
          runIdRef.current = null;
          return;
        }
        const message =
          err instanceof Error ? err.message : "Erreur lors de la reprise.";
        logger.warn({ message }, "[AIFloatingButton] Resume failed");
        setError(message);
        // Erreur → server a déjà nettoyé active_run_id côté GET.
        runIdRef.current = null;
      })
      .finally(() => {
        setIsProcessing(false);
        abortControllerRef.current = null;
        // ⚠️ NE PAS reset runIdRef.current ici : il doit rester set jusqu'à
        // ce que l'utilisateur prenne sa décision (Accept/Reject/Cancel).
      });

    return () => {
      abortControllerRef.current?.abort();
    };
  }, [document?.activeRunId]);

  // ─── Render ────────────────────────────────────────────────────────────
  const isDisabled =
    !document?.editorialContent || document?.complianceStatus !== "compliant";

  return (
    <div className="fixed bottom-6 right-6 z-20">
      <Popover
        open={hasSuggestion || !!error}
        onOpenChange={(open) => {
          if (!open) {
            if (hasSuggestion) handleReject();
            else setError(null);
          }
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
          {error ? (
            <>
              <p className="text-sm text-[var(--text-default-error,#ce0500)] mb-4 leading-6 whitespace-pre-line">
                {error}
              </p>
              <div className="flex gap-4">
                <Button
                  variant="tertiaire"
                  size="sm"
                  onClick={() => {
                    navigator.clipboard.writeText(error).catch(() => {});
                  }}
                >
                  Copier
                </Button>
                <Button
                  variant="primaire"
                  size="sm"
                  onClick={() => {
                    setError(null);
                    handleGenerate();
                  }}
                >
                  Relancer
                </Button>
              </div>
            </>
          ) : (
            <>
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
            </>
          )}
        </PopoverContent>
      </Popover>
    </div>
  );
}
