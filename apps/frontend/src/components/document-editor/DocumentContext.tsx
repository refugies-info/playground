"use client";

import { logger } from "@playground/shared-types";
import { createContext, type ReactNode, useContext, useState } from "react";

interface DocumentData {
  id: string;
  title: string;
  editorialContent: string; // Current working content from editorial_records (edited by humans or accepted AI suggestions)
  ingestionContent?: string; // Immutable original content from ingestion_records (for comparison/rollback)
  aiSuggestion?: string; // Pending AI suggestion awaiting user review
  metadata?: Record<string, unknown>; // Metadata from ingestion_records
}

interface DocumentContextType {
  document: DocumentData | null;
  setDocument: React.Dispatch<React.SetStateAction<DocumentData | null>>;
  setAiSuggestion: (suggestion: string) => void;
  acceptAiSuggestion: () => void;
  rejectAiSuggestion: () => void;
  rollbackToOriginal: () => void;
  isComparisonMode: boolean;
  setIsComparisonMode: (mode: boolean) => void;
  isProcessing: boolean;
  setIsProcessing: (processing: boolean) => void;
  isLoading: boolean;
  isRawMarkdownMode: boolean;
  setIsRawMarkdownMode: (mode: boolean) => void;
  saveDocument: () => Promise<{ success: boolean; error?: string }>;
  isSaving: boolean;
}

const DocumentContext = createContext<DocumentContextType | undefined>(
  undefined,
);

export function DocumentProvider({
  children,
  initialData,
}: {
  children: ReactNode;
  initialData?: DocumentData;
}) {
  const [document, setDocument] = useState<DocumentData | null>(
    initialData || null,
  );
  const [isLoading] = useState(false);
  const [isComparisonMode, setIsComparisonMode] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isRawMarkdownMode, setIsRawMarkdownMode] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const setAiSuggestion = (suggestion: string) => {
    if (!document) return;

    setDocument({
      ...document,
      // Preserve immutable ingestionContent
      ingestionContent: document.ingestionContent,
      aiSuggestion: suggestion,
    });
  };

  const acceptAiSuggestion = () => {
    if (!document?.aiSuggestion) return;

    setDocument({
      ...document,
      editorialContent: document.aiSuggestion,
      aiSuggestion: undefined,
    });
  };

  const rejectAiSuggestion = () => {
    if (!document) return;

    setDocument({
      ...document,
      aiSuggestion: undefined,
    });
  };

  const rollbackToOriginal = () => {
    if (!document || !document.ingestionContent) return;

    setDocument({
      ...document,
      editorialContent: document.ingestionContent,
      aiSuggestion: undefined,
      // Keep ingestionContent - it's immutable and always available for comparison
    });
  };

  const saveDocument = async (): Promise<{
    success: boolean;
    error?: string;
  }> => {
    if (!document) {
      return { success: false, error: "No document to save" };
    }

    setIsSaving(true);
    try {
      // Import the server action from the dedicated actions file
      const { saveDocument: saveDocumentAction } = await import(
        "@/services/document-actions"
      );
      const result = await saveDocumentAction(
        document.id,
        document.editorialContent,
      );
      return result;
    } catch (error) {
      logger.error(error, "Error saving document");
      return { success: false, error: "Network error" };
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <DocumentContext.Provider
      value={{
        document,
        setDocument,
        setAiSuggestion,
        acceptAiSuggestion,
        rejectAiSuggestion,
        rollbackToOriginal,
        isComparisonMode,
        setIsComparisonMode,
        isProcessing,
        setIsProcessing,
        isLoading,
        isRawMarkdownMode,
        setIsRawMarkdownMode,
        saveDocument,
        isSaving,
      }}
    >
      {children}
    </DocumentContext.Provider>
  );
}

export function useDocument() {
  const context = useContext(DocumentContext);
  if (context === undefined) {
    throw new Error("useDocument must be used within a DocumentProvider");
  }
  return context;
}
