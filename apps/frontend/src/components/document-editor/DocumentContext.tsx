"use client";

import type {
  ComplianceStatus,
  OnlineStatus,
  Document as SharedDocument,
  WorkStatus,
} from "@playground/shared-types";
import {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";

// Extend or adapt the shared Document type for the editor context
interface DocumentData
  extends Omit<
    SharedDocument,
    "content" | "metadata" | "complianceStatus" | "workStatus" | "onlineStatus"
  > {
  editorialContent: string; // Mapped from 'content' in SharedDocument
  ingestionContent?: string;
  aiSuggestion?: string;
  // Override statuses with exact shared types to be sure
  complianceStatus: ComplianceStatus | null;
  workStatus: WorkStatus | null;
  onlineStatus: OnlineStatus;
  metadata?: Record<string, unknown>;
  /** Metadata from editorial_records only (user edits) */
  editorialMetadata?: Record<string, unknown>;
  referenceData?: {
    themes: Record<string, string>;
    needs: Record<string, string>;
  };
}

interface DocumentContextType {
  document: DocumentData | null;
  setDocument: React.Dispatch<React.SetStateAction<DocumentData | null>>;
  showDebug: boolean;
  setShowDebug: (show: boolean) => void;
  updateContent: (content: string) => void;
  setAiSuggestion: (suggestion: string) => void;
  acceptAiSuggestion: () => void;
  rejectAiSuggestion: () => void;
  debugBlocks: unknown[] | null;
  setDebugBlocks: (blocks: unknown[]) => void;
  rollbackToOriginal: () => void;
  isComparisonMode: boolean;
  setIsComparisonMode: (mode: boolean) => void;
  isProcessing: boolean;
  setIsProcessing: (processing: boolean) => void;
  isLoading: boolean;
  isRawMarkdownMode: boolean;
  setIsRawMarkdownMode: (mode: boolean) => void;
  isDirty: boolean;
  setIsDirty: (dirty: boolean) => void;
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
  const [showDebug, setShowDebug] = useState(false);
  const [isLoading] = useState(false);
  const [isComparisonMode, setIsComparisonMode] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isRawMarkdownMode, setIsRawMarkdownMode] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [debugBlocks, setDebugBlocks] = useState<unknown[] | null>([]);

  // Synchronize local state only on navigation (initial load)
  // biome-ignore lint/correctness/useExhaustiveDependencies: Safe Mode - only re-initialize on navigation (ID change)
  useEffect(() => {
    if (initialData) {
      setDocument(initialData);
    }
  }, [initialData?.id]);

  // Update content and mark as dirty (only if content actually changed)
  const updateContent = (content: string) => {
    if (!document) return;
    // Don't mark dirty if content hasn't actually changed
    if (document.editorialContent === content) return;

    setDocument({
      ...document,
      editorialContent: content,
    });
    setIsDirty(true);
  };

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
    setIsDirty(true);
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
    setIsDirty(true);
  };

  return (
    <DocumentContext.Provider
      value={{
        document,
        setDocument,
        showDebug,
        setShowDebug,
        updateContent,
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
        isDirty,
        setIsDirty,
        debugBlocks,
        setDebugBlocks,
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
