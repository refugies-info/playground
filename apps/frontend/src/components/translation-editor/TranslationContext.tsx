"use client";

import { createContext, type ReactNode, useContext, useState } from "react";
import {
  publishTranslation,
  saveTranslation,
} from "@/services/translation-actions";

interface TranslationData {
  id: string;
  language: string;
  status: string;
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
    setIsPublishing(true);
    try {
      const result = await publishTranslation(
        translation.id,
        translation.translationMarkdown,
      );
      if (result.success) {
        setTranslation({
          ...translation,
          status: "published",
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
