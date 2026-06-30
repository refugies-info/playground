"use client";

import type { OnlineStatus, WorkStatus } from "@playground/shared-types";
import { extractTitleFromMarkdown, logger } from "@playground/shared-types";
import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { useAutosave } from "@/hooks/useAutosave";
import { submitTranslationPreview } from "@/lib/preview-utils";
import { createClient } from "@/lib/supabase/client";
import {
  publishTranslation,
  saveTranslation,
} from "@/services/translation-actions";
import { useTranslationPublicationRealtime } from "./hooks/useTranslationPublicationRealtime";

interface TranslationData {
  id: string;
  workflowId?: string;
  language: string;
  status: string;
  onlineStatus?: OnlineStatus | null;
  workStatus?: WorkStatus | null;
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
  previewTranslation: () => Promise<void>;
  canPreview: boolean; // Whether preview is available (source must be published)
  publicationUrl?: string;
  publicationUrlError?: string | null;
  isRawMarkdownMode: boolean;
  setIsRawMarkdownMode: (value: boolean) => void;
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

    const supabase = createClient();
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
            return {
              ...prev,
              status:
                updatedRecord.online_status === "published"
                  ? "published"
                  : updatedRecord.work_status || "to_process",
              onlineStatus: updatedRecord.online_status,
              workStatus: updatedRecord.work_status,
            };
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
  }, [initialData.id]);

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
        previewTranslation,
        canPreview,
        publicationUrl: translation?.publicationUrl,
        publicationUrlError: publicationRealtime.error,
        isRawMarkdownMode,
        setIsRawMarkdownMode,
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
