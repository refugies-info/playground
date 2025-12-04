"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";

interface DocumentData {
  id: string;
  title: string;
  content: string; // Current content (can be original or rewritten)
  originalContent?: string; // Original content before any AI modifications
  rewrittenContent?: string; // AI-rewritten content
}

interface DocumentContextType {
  document: DocumentData | null;
  setDocument: (doc: DocumentData) => void;
  setRewrittenContent: (rewrittenContent: string) => void;
  rollbackToOriginal: () => void;
  isComparisonMode: boolean;
  setIsComparisonMode: (mode: boolean) => void;
  isProcessing: boolean;
  setIsProcessing: (processing: boolean) => void;
  isLoading: boolean;
  isRawMarkdownMode: boolean;
  setIsRawMarkdownMode: (mode: boolean) => void;
}

const DocumentContext = createContext<DocumentContextType | undefined>(
  undefined
);

export function DocumentProvider({
  children,
  initialData,
}: {
  children: ReactNode;
  initialData?: DocumentData;
}) {
  const [document, setDocument] = useState<DocumentData | null>(
    initialData || null
  );
  const [isLoading] = useState(false);
  const [isComparisonMode, setIsComparisonMode] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isRawMarkdownMode, setIsRawMarkdownMode] = useState(false);

  const setRewrittenContent = (rewrittenContent: string) => {
    if (!document) return;

    setDocument({
      ...document,
      // Store original content if not already stored
      originalContent: document.originalContent || document.content,
      rewrittenContent,
      // Update current content to the rewritten version
      content: rewrittenContent,
    });
  };

  const rollbackToOriginal = () => {
    if (!document || !document.originalContent) return;

    setDocument({
      ...document,
      content: document.originalContent,
      rewrittenContent: undefined,
      originalContent: undefined,
    });
    setIsComparisonMode(false);
  };

  return (
    <DocumentContext.Provider
      value={{
        document,
        setDocument,
        setRewrittenContent,
        rollbackToOriginal,
        isComparisonMode,
        setIsComparisonMode,
        isProcessing,
        setIsProcessing,
        isLoading,
        isRawMarkdownMode,
        setIsRawMarkdownMode,
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
