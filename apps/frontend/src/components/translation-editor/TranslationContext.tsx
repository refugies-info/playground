"use client";

import type { OnlineStatus, WorkStatus } from "@playground/shared-types";
import {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { createClient } from "@/lib/supabase/client";
import {
  publishTranslation,
  saveTranslation,
} from "@/services/translation-actions";

interface TranslationData {
  id: string;
  language: string;
  status: string;
  onlineStatus?: OnlineStatus | null;
  workStatus?: WorkStatus | null;
  translationMarkdown: string;
  sourceMarkdown: string;
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
  previewTranslation: () => void;
  publicationUrl?: string;
  publicationUrlError?: string | null;
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
  const [publicationUrlError, setPublicationUrlError] = useState<string | null>(
    null,
  );

  // Set up Realtime subscription to sync status changes from workflow
  useEffect(() => {
    if (!initialData?.id) return;

    const supabase = createClient();
    const channel = supabase
      .channel(`translation-${initialData.id}`)
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
          // Stop publishing spinner when status is updated
          if (updatedRecord.online_status === "published") {
            setIsPublishing(false);
          }
        },
      )
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "publication_records",
          filter: `translation_record_id=eq.${initialData.id}`,
        },
        async (payload) => {
          // A publication_record was created (success or failure)
          const pubRecord = payload.new;
          setIsPublishing(false);

          if (pubRecord.status === "failed" && pubRecord.error_message) {
            // Workflow failed - show the error
            setPublicationUrlError(pubRecord.error_message);
          } else if (
            pubRecord.status === "published" &&
            pubRecord.remote_id &&
            pubRecord.target
          ) {
            // Success - build the URL using target from the record
            setPublicationUrlError(null);
            const cleanBaseUrl = pubRecord.target.replace(/\/$/, "");
            const languageCode =
              initialData.language === "fr" ? "" : initialData.language;
            let url: string;
            if (languageCode) {
              url = `${cleanBaseUrl}/${languageCode}/program/${pubRecord.remote_id}`;
            } else {
              url = `${cleanBaseUrl}/dispositif/${pubRecord.remote_id}`;
            }
            setTranslation((prev) => {
              if (!prev) return prev;
              return { ...prev, publicationUrl: url };
            });
          } else {
            // Unexpected status or missing data
            setPublicationUrlError(
              "État de publication inattendu. Rechargez la page.",
            );
          }
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [initialData.id, initialData.language]);

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
    setPublicationUrlError(null); // Clear any previous errors
    try {
      const result = await publishTranslation(
        translation.id,
        translation.translationMarkdown,
      );
      if (!result.success) {
        // Immediate failure (before workflow starts) - stop spinner
        setIsPublishing(false);
        // biome-ignore lint/suspicious/noConsole: Error logging
        console.error(result.error);
        return result;
      }
      // Success - workflow started. Keep spinner running until Realtime receives result.
      // setIsPublishing(false) will be called by Realtime subscription when publication_records INSERT fires
      return result;
    } catch (e) {
      // Immediate failure
      setIsPublishing(false);
      // biome-ignore lint/suspicious/noConsole: Error logging
      console.error(e);
      return { success: false, error: "Erreur inconnue" };
    }
  };

  const previewTranslation = () => {
    // TODO: Implement preview logic if needed, maybe similar to document preview
    // toast.info("Prévisualisation non implémentée pour l'instant");
    alert("Prévisualisation non implémentée pour l'instant");
  };

  const handleSetTranslation: typeof setTranslation = (value) => {
    setTranslation(value);
  };

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
        publicationUrl: translation?.publicationUrl,
        publicationUrlError,
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
