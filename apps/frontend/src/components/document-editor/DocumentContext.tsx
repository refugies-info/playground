"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";

interface DocumentData {
  id: string;
  title: string;
  content: string; // Initial markdown content
}

interface DocumentContextType {
  document: DocumentData | null;
  setDocument: (doc: DocumentData) => void;
  isLoading: boolean;
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

  return (
    <DocumentContext.Provider value={{ document, setDocument, isLoading }}>
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
