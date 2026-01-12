"use client";

import { logger } from "@playground/shared-types";
import { createContext, type ReactNode, useContext, useState } from "react";

interface DocumentData {
  id: string;
  title: string;
  status: string; // Workflow status
  state: string; // Workflow progress state
  editorialContent: string; // Current working content from editorial_records (edited by humans or accepted AI suggestions)
  ingestionContent?: string; // Immutable original content from ingestion_records (for comparison/rollback)
  complianceReport?: string; // Markdown content of the compliance report
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
  activeView: "edit" | "compliance";
  setActiveView: (view: "edit" | "compliance") => void;
  previewDocument: () => void;
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
  const [activeView, setActiveView] = useState<"edit" | "compliance">("edit");
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

  const previewDocument = () => {
    if (!document) return;

    const previewUrl = process.env.NEXT_PUBLIC_PREVIEW_URL;
    if (!previewUrl) {
      logger.error("NEXT_PUBLIC_PREVIEW_URL is not configured");
      return;
    }

    // Create a form to submit to the new tab
    const form = window.document.createElement("form");
    form.target = "_blank";
    form.method = "POST";
    form.action = previewUrl;

    // Add markdown content as input
    const input = window.document.createElement("input");
    input.type = "hidden";
    input.name = "markdown";
    // TODO: Currently we only send the raw markdown.
    // In the future, we should send the full document structure including metadata
    // to match the expected format of Réfugiés.info (title, themes, etc.)
    input.value = document.editorialContent;
    form.appendChild(input);

    window.document.body.appendChild(form);
    form.submit();
    window.document.body.removeChild(form);
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
        activeView,
        setActiveView,
        previewDocument,
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
