"use client";

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
  onlineStatus?: string;
  workStatus?: string;
  translationMarkdown: string;
  sourceMarkdown: string;
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

  // Set up Realtime subscription to sync status changes from workflow
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
          // If it just became published, we stop the local "isPublishing" state
          if (updatedRecord.online_status === "published") {
            setIsPublishing(false);
          }
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

    if (isDirty) {
      const confirmSave = confirm(
        "Vous avez des modifications non enregistrées. Voulez-vous les enregistrer et publier ?",
      );
      if (confirmSave) {
        const saveResult = await activeSaveTranslation();
        if (!saveResult.success) return saveResult;
      } else {
        return { success: false, error: "Publication annulée" };
      }
    }

    setIsPublishing(true);
    try {
      const result = await publishTranslation(
        translation.id,
        translation.translationMarkdown,
      );
      if (!result.success) {
        // biome-ignore lint/suspicious/noConsole: Error logging
        console.error(result.error);
      }
      // Status update is handled by Realtime subscription
      return result;
    } catch (e) {
      // biome-ignore lint/suspicious/noConsole: Error logging
      console.error(e);
      return { success: false, error: "Erreur inconnue" };
    } finally {
      setIsPublishing(false);
    }
  };

  const previewTranslation = () => {
    // TODO: Implement preview logic if needed, maybe similar to document preview
    // toast.info("Prévisualisation non implémentée pour l'instant");
    alert("Prévisualisation non implémentée pour l'instant");
  };

  return (
    <TranslationContext.Provider
      value={{
        translation,
        setTranslation,
        updateContent,
        saveTranslation: activeSaveTranslation,
        publishTranslation: activePublishTranslation,
        isDirty,
        isSaving,
        isPublishing,
        previewTranslation,
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
