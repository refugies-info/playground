"use client";

import type { OnlineStatus, WorkStatus } from "@playground/shared-types";
import { extractTitleFromMarkdown, logger } from "@playground/shared-types";
import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { useAutosave } from "@/hooks/useAutosave";
import { submitTranslationPreview } from "@/lib/preview-utils";
import { createClient } from "@/lib/supabase/client";
import {
  cancelTranslationGeneration,
  publishTranslation,
  retryTranslationGeneration,
  saveTranslation,
} from "@/services/translation-actions";
import { useTranslationPublicationRealtime } from "./hooks/useTranslationPublicationRealtime";

type TranslationWorkStatus = WorkStatus | "pending" | "error";

interface TranslationData {
  id: string;
  workflowId?: string;
  language: string;
  status: string;
  onlineStatus?: OnlineStatus | null;
  workStatus?: TranslationWorkStatus | null;
  translationMarkdown: string;
  sourceMarkdown: string;
  sourceMetadata?: Record<string, unknown>; // Metadata from source FR document
  publicationUrl?: string;
}

export interface TranslationContextType {
  translation: TranslationData | null;
  setTranslation: React.Dispatch<React.SetStateAction<TranslationData | null>>;
  updateContent: (content: string) => void;
  saveTranslation: () => Promise<{ success: boolean; error?: string }>;
  publishTranslation: () => Promise<{ success: boolean; error?: string }>;
  isDirty: boolean;
  isSaving: boolean;
  isPublishing: boolean;
  /** True quand une regénération IA est en cours (work_status === "pending"). */
  isRegenerating: boolean;
  /** Déclenche la regénération IA de la traduction. */
  regenerate: () => Promise<void>;
  /** Annule la regénération IA en cours (même session). */
  cancelRegenerate: () => void;
  previewTranslation: () => Promise<void>;
  canPreview: boolean; // Whether preview is available (source must be published)
  publicationUrl?: string;
  publicationUrlError?: string | null;
  isRawMarkdownMode: boolean;
  setIsRawMarkdownMode: (value: boolean) => void;
  /** True quand la fiche a été archivée par l'équipe éditoriale (lecture seule) */
  isArchived: boolean;
  /** Ouverture de la pop-up "Cette fiche a été archivée" */
  archivedModalOpen: boolean;
  closeArchivedModal: () => void;
}

const TranslationContext = createContext<TranslationContextType | undefined>(
  undefined,
);

export function TranslationProvider({
  children,
  initialData,
}: {
  children: ReactNode;
  initialData: TranslationData;
}) {
  const [translation, setTranslation] = useState<TranslationData | null>(
    initialData,
  );
  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isRawMarkdownMode, setIsRawMarkdownMode] = useState(false);
  const [archivedModalOpen, setArchivedModalOpen] = useState(false);
  // Singleton for supabase cause we have error with different stream supabase in console log
  const [supabase] = useState(() => createClient());
  // Local regeneration flag — set to true as soon as the user clicks, BEFORE the network request.
  // In development, start() blocks until the workflow finishes: this flag keeps the loader
  // visible for the entire duration. Cleared in finally, and also by the realtime completion event.
  const [isRegenLocal, setIsRegenLocal] = useState(false);

  // La fiche est archivée dès que la traduction passe en online_status "archived"
  // (cascade déclenchée par l'archivage de la fiche FR côté éditorial).
  const isArchived = translation?.onlineStatus === "archived";

  // Run ID of the current regeneration — kept in memory to support cancellation.
  // It is lost on page refresh: loading then continues to be driven by `work_status`,
  // but cancellation is no longer available until the workflow completes.
  const regenRunIdRef = useRef<string | null>(null);
  // Set by `cancelRegenerate()` while `regenerate()` is still waiting for `start()`.
  // In development, `start()` blocks until the workflow completes: the `runId` is
  // only available afterward, so cancellation cannot stop the workflow. However,
  // this flag at least allows the UI to exit the loading state and prevents the
  // refetch from overwriting the current content.
  const regenCancelledRef = useRef(false);

  // Regeneration is considered in progress if either the local flag is set
  // (from the user click until the `start()` call completes) OR the translation's
  // `work_status` is `"pending"` (the realtime handoff in production, where
  // `start()` returns immediately).
  const isRegenerating = isRegenLocal || translation?.workStatus === "pending";

  // Ouvre la pop-up dès que la fiche devient archivée. Couvre les deux scénarios :
  // - ouverture d'une traduction déjà archivée (initialData)
  // - archivage en direct pendant l'édition (UPDATE realtime sur translation_records)
  useEffect(() => {
    if (isArchived) setArchivedModalOpen(true);
  }, [isArchived]);

  const closeArchivedModal = useCallback(() => setArchivedModalOpen(false), []);

  // ── Realtime: publication result (success or failure via publication_records INSERT)
  const handlePublicationSuccess = useCallback((publishedUrl: string) => {
    setIsPublishing(false);
    setTranslation((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        publicationUrl: publishedUrl,
        // Optimistic update — Realtime UPDATE on translation_records will confirm
        onlineStatus: "published" as OnlineStatus,
        workStatus: null,
        status: "published",
      };
    });
  }, []);

  const handlePublicationError = useCallback(() => {
    setIsPublishing(false);
    // error is already stored in publicationRealtime.error
  }, []);

  const publicationRealtime = useTranslationPublicationRealtime({
    translationId: initialData.id,
    language: initialData.language,
    onSuccess: handlePublicationSuccess,
    onError: handlePublicationError,
  });

  // ── Realtime: live status sync from translation_records UPDATE
  useEffect(() => {
    if (!initialData?.id) return;

    const channel = supabase
      .channel(`translation-status-${initialData.id}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "translation_records",
          filter: `id=eq.${initialData.id}`,
        },
        (payload) => {
          const updatedRecord = payload.new;
          setTranslation((prev) => {
            if (!prev) return prev;
            const next = {
              ...prev,
              status:
                updatedRecord.online_status === "published"
                  ? "published"
                  : updatedRecord.work_status || "to_process",
              onlineStatus: updatedRecord.online_status,
              workStatus: updatedRecord.work_status,
            };
            // Regeneration completed: the workflow has written a new markdown.
            // Push it into the editor WITHOUT marking `isDirty` (already persisted).
            // A manual save writes the same markdown as the current state
            // → no swap; only a regeneration (with different content) triggers
            // the replacement.
            if (
              typeof updatedRecord.markdown === "string" &&
              updatedRecord.markdown !== prev.translationMarkdown
            ) {
              next.translationMarkdown = updatedRecord.markdown;
              regenRunIdRef.current = null;
            }
            return next;
          });
          // The publication_records Realtime hook handles setIsPublishing(false)
          // for both success and error cases. The UPDATE on translation_records
          // is kept for live status badge updates only.
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [initialData.id, supabase]);

  const updateContent = (content: string) => {
    if (!translation) return;
    if (translation.translationMarkdown === content) return;

    setTranslation({
      ...translation,
      translationMarkdown: content,
    });
    setIsDirty(true);
  };

  const activeSaveTranslation = async () => {
    if (!translation) return { success: false, error: "No translation" };
    setIsSaving(true);
    try {
      const result = await saveTranslation(
        translation.id,
        translation.translationMarkdown,
      );
      if (result.success) {
        setIsDirty(false);
        setTranslation({
          ...translation,
          status: "draft",
          // Optimistic update — topbar reflects new state immediately
          workStatus: "draft" as WorkStatus,
        });
      } else {
        // biome-ignore lint/suspicious/noConsole: Error logging
        console.error(result.error);
      }
      // La sauvegarde a bien lieu (on ne perd pas le travail du traducteur), mais
      // si la fiche est archivée on ouvre la pop-up même si le client n'a pas
      // encore reçu la cascade realtime.
      if (result.archived) setArchivedModalOpen(true);
      return result;
    } catch (e) {
      // biome-ignore lint/suspicious/noConsole: Error logging
      console.error(e);
      return { success: false, error: "Erreur inconnue" };
    } finally {
      setIsSaving(false);
    }
  };

  const activePublishTranslation = async () => {
    if (!translation) return { success: false, error: "No translation" };

    // Toujours sauvegarder avant de publier (comme pour les documents)
    setIsSaving(true);
    try {
      const saveResult = await saveTranslation(
        translation.id,
        translation.translationMarkdown,
      );
      if (!saveResult.success) {
        return {
          success: false,
          error: "Échec de l'enregistrement avant publication",
        };
      }
      setIsDirty(false);
      setTranslation({
        ...translation,
        status: "draft",
      });
    } catch (e) {
      // biome-ignore lint/suspicious/noConsole: Error logging
      console.error(e);
      return { success: false, error: "Erreur lors de la sauvegarde" };
    } finally {
      setIsSaving(false);
    }

    // Maintenant publier
    setIsPublishing(true);
    publicationRealtime.setError(null); // Clear any previous errors
    try {
      const result = await publishTranslation(
        translation.id,
        translation.translationMarkdown,
      );
      if (!result.success) {
        // Immediate failure (before workflow starts) — stop spinner, no Realtime needed
        setIsPublishing(false);
        // biome-ignore lint/suspicious/noConsole: Error logging
        console.error(result.error);
        return result;
      }
      // Workflow started — activate Realtime listener and keep spinner
      // until publication_records INSERT fires (success or failure)
      publicationRealtime.startListening();
      return result;
    } catch (e) {
      setIsPublishing(false);
      // biome-ignore lint/suspicious/noConsole: Error logging
      console.error(e);
      return { success: false, error: "Erreur inconnue" };
    }
  };

  const previewTranslation = async () => {
    if (!translation) return;

    try {
      // Auto-save before preview (like documents)
      const saveResult = await activeSaveTranslation();
      if (!saveResult.success) {
        logger.error("Failed to save translation before preview");
        return;
      }

      // Extract title from translation markdown
      const title =
        (await extractTitleFromMarkdown(translation.translationMarkdown)) ||
        "Sans titre";

      // Submit preview with both translation and source data
      await submitTranslationPreview({
        language: translation.language,
        title,
        translationMarkdown: translation.translationMarkdown,
        sourceMarkdown: translation.sourceMarkdown,
        sourceMetadata: translation.sourceMetadata || {},
      });
    } catch (error) {
      logger.error(error, "Error previewing translation");
      alert(
        `Erreur lors de la prévisualisation: ${
          error instanceof Error ? error.message : error
        }`,
      );
    }
  };

  useAutosave(isDirty, activeSaveTranslation);

  const regenerate = useCallback(async () => {
    if (!translation) return;
    // Instant loader (before the network call, which blocks in development).
    regenCancelledRef.current = false;
    setIsRegenLocal(true);
    setTranslation((prev) =>
      prev ? { ...prev, status: "pending", workStatus: "pending" } : prev,
    );
    try {
      const res = await retryTranslationGeneration(translation.id);
      if (regenCancelledRef.current) return; // Cancelled while waiting.
      if (res.success && "runId" in res && res.runId) {
        regenRunIdRef.current = res.runId;
      } else if (!res.success) {
        // Start failure → exit the loading state immediately.
        setTranslation((prev) =>
          prev
            ? { ...prev, status: "to_process", workStatus: "to_process" }
            : prev,
        );
        return;
      }

      // Deterministic refetch: in development, `start()` blocks until the workflow
      // completes → the DB already contains the new markdown. Fetch it and replace
      // the content WITHOUT marking `isDirty` (already persisted). Realtime remains
      // the handoff mechanism in production (`start()` returns immediately there).
      const { data: fresh } = await supabase
        .from("translation_records")
        .select("markdown, work_status, online_status")
        .eq("id", translation.id)
        .single();

      if (regenCancelledRef.current) return; // annulé pendant le refetch
      if (fresh) {
        regenRunIdRef.current = null;
        setTranslation((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            translationMarkdown: fresh.markdown ?? prev.translationMarkdown,
            workStatus: fresh.work_status as TranslationWorkStatus | null,
            onlineStatus: fresh.online_status as OnlineStatus | null,
            status:
              fresh.online_status === "published"
                ? "published"
                : fresh.work_status || "to_process",
          };
        });
      }
    } catch {
      if (!regenCancelledRef.current) {
        setTranslation((prev) =>
          prev
            ? { ...prev, status: "to_process", workStatus: "to_process" }
            : prev,
        );
      }
    } finally {
      if (!regenCancelledRef.current) setIsRegenLocal(false);
    }
  }, [translation, supabase]);

  const cancelRegenerate = useCallback(() => {
    // Exit the loading state immediately, regardless of the state of `start()`.    regenCancelledRef.current = true;
    setIsRegenLocal(false);
    const runId = regenRunIdRef.current;
    regenRunIdRef.current = null;
    // Best-effort backend cancellation if the runId is already known (production).
    if (translation && runId) {
      cancelTranslationGeneration(translation.id, runId).catch(() => {});
    }
    setTranslation((prev) =>
      prev ? { ...prev, status: "to_process", workStatus: "to_process" } : prev,
    );
  }, [translation]);

  const handleSetTranslation: typeof setTranslation = (value) => {
    setTranslation(value);
  };

  // Preview is always available — the preview endpoint doesn't require the source
  // document to be published; it renders the translation payload directly.
  const canPreview = true;

  return (
    <TranslationContext.Provider
      value={{
        translation,
        setTranslation: handleSetTranslation,
        updateContent,
        saveTranslation: activeSaveTranslation,
        publishTranslation: activePublishTranslation,
        isDirty,
        isSaving,
        isPublishing,
        isRegenerating,
        regenerate,
        cancelRegenerate,
        previewTranslation,
        canPreview,
        publicationUrl: translation?.publicationUrl,
        publicationUrlError: publicationRealtime.error,
        isRawMarkdownMode,
        setIsRawMarkdownMode,
        isArchived,
        archivedModalOpen,
        closeArchivedModal,
      }}
    >
      {children}
    </TranslationContext.Provider>
  );
}

export function useTranslation() {
  const context = useContext(TranslationContext);
  if (context === undefined) {
    throw new Error("useTranslation must be used within a TranslationProvider");
  }
  return context;
}
