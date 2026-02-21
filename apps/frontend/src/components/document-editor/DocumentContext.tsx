"use client";

import {
  type ComplianceStatus,
  extractTitleFromMarkdown,
  hasH1,
  logger,
  type OnlineStatus,
  type Document as SharedDocument,
  type WorkStatus,
} from "@playground/shared-types";
import {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { submitPreview } from "@/lib/preview-utils";
import {
  archiveDocument,
  publishDocument,
  saveDocument as saveDocumentAction,
} from "@/services/document-actions";

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
  saveDocument: () => Promise<{ success: boolean; error?: string }>;
  isSaving: boolean;
  isDirty: boolean;
  canPublish: boolean;
  previewDocument: () => void;
  publishDocument: (triggerTranslations?: boolean) => Promise<{
    success: boolean;
    remoteId?: string;
    publishedUrl?: string;
    error?: string;
  }>;
  isPublishing: boolean;
  archiveDocument: () => Promise<{ success: boolean; error?: string }>;
  isArchiving: boolean;
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
  const [isSaving, setIsSaving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isArchiving, setIsArchiving] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  // If document is already in 'draft' state (workStatus is 'in_progress' or 'finished'), it's ready to publish
  // We simplify: if it's not new, we can arguably publish, or logic depends on specific requirements.
  // For now let's say if we have content we can publish.
  const [canPublish, setCanPublish] = useState(
    initialData?.workStatus === "draft" ||
      initialData?.workStatus === "to_process",
  );
  const [debugBlocks, setDebugBlocks] = useState<unknown[] | null>([]);

  // Synchronize local state only on navigation (initial load)
  // biome-ignore lint/correctness/useExhaustiveDependencies: Safe Mode - only re-initialize on navigation (ID change)
  useEffect(() => {
    if (initialData) {
      setDocument(initialData);
    }
  }, [initialData?.id]);

  // Update publishability based on server data
  useEffect(() => {
    if (!initialData) return;
    if (!isDirty) {
      setCanPublish(
        initialData.workStatus === "draft" ||
          initialData.workStatus === "to_process" ||
          initialData.onlineStatus === "archived",
      );
    }
  }, [initialData, isDirty]);

  // Update content and mark as dirty (only if content actually changed)
  const updateContent = (content: string) => {
    if (!document) return;
    // Don't mark dirty if content hasn't actually changed
    if (document.editorialContent === content) return;

    // Synchronously extract title for immediate UI feedback if needed
    // or just let the save handle it.

    setDocument({
      ...document,
      editorialContent: content,
    });
    setIsDirty(true);
    setCanPublish(false); // Can't publish until saved
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
    setCanPublish(false);
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
    setCanPublish(false);
  };

  const ensureSaved = async (): Promise<DocumentData | null> => {
    const saveResult = await saveDocument();
    if (!saveResult.success) return null;
    return saveResult.updatedDocument || document;
  };

  const saveDocument = async (): Promise<{
    success: boolean;
    error?: string;
    updatedDocument?: DocumentData;
  }> => {
    if (!document) {
      return { success: false, error: "No document to save" };
    }

    const h1Exists = await hasH1(document.editorialContent);
    if (!h1Exists) {
      alert(
        "Votre document doit contenir un titre principal (ex: # Mon Titre).\nCelui-ci est nécessaire pour identifier la fiche.",
      );
      return { success: false, error: "Titre principal manquant" };
    }

    setIsSaving(true);
    try {
      const result = await saveDocumentAction(
        document.id,
        document.editorialContent,
      );
      if (result.success) {
        setIsDirty(false);
        setCanPublish(true); // Now can publish

        // Optimistically update local title and metadata from content
        const newTitle = await extractTitleFromMarkdown(
          document.editorialContent,
        );
        const updatedDoc = {
          ...document,
          title: newTitle,
          workStatus: "draft" as WorkStatus, // Explicitly set to draft on save
          metadata: {
            ...document.metadata,
            title: newTitle,
            "intitule-formation": newTitle,
          },
        };

        setDocument(updatedDoc);
        return { ...result, updatedDocument: updatedDoc };
      }
      return result;
    } catch (error) {
      logger.error(error, "Error saving document");
      return { success: false, error: "Network error" };
    } finally {
      setIsSaving(false);
    }
  };

  const previewDocument = async () => {
    if (!document) return;

    try {
      const documentToPreview = await ensureSaved();
      if (!documentToPreview) return;

      // Use the utility function to handle the secure form submission
      // documentToPreview is now guaranteed to be the latest saved version
      await submitPreview(documentToPreview);
    } catch (e) {
      logger.error(e, "Error previewing document");
      alert(
        `Erreur lors de la prévisualisation: ${
          e instanceof Error ? e.message : e
        }`,
      );
    }
  };

  const publishDocumentAction = async (
    triggerTranslations = false,
  ): Promise<{
    success: boolean;
    remoteId?: string;
    publishedUrl?: string;
    error?: string;
  }> => {
    if (!document) {
      return { success: false, error: "No document to publish" };
    }

    setIsPublishing(true);
    try {
      const documentToPublish = await ensureSaved();
      if (!documentToPublish) {
        return {
          success: false,
          error: "Échec de l'enregistrement avant publication",
        };
      }

      const result = await publishDocument(
        documentToPublish.id,
        documentToPublish.title,
        documentToPublish.editorialContent,
        undefined, // metadata
        triggerTranslations,
      );

      if (result.success) {
        // Update local state to reflect published status
        // Note: publishedUrl will be available after workflow completes
        setDocument({
          ...documentToPublish,
          onlineStatus: "published",
          workStatus: null, // Clear Draft status on publish
        });
        // Disable publish button until next modification + save
        setCanPublish(false);
      }

      return result;
    } catch (error) {
      logger.error(error, "Error publishing document");
      return { success: false, error: "Erreur réseau" };
    } finally {
      setIsPublishing(false);
    }
  };

  const archiveDocumentWrapper = async (): Promise<{
    success: boolean;
    error?: string;
  }> => {
    if (!document) {
      return { success: false, error: "No document to archive" };
    }

    setIsArchiving(true);
    try {
      const documentToArchive = await ensureSaved();
      if (!documentToArchive) {
        return {
          success: false,
          error: "Échec de l'enregistrement avant archivage",
        };
      }

      const result = await archiveDocument(
        documentToArchive.id,
        documentToArchive.title,
        documentToArchive.editorialContent,
      );

      if (result.success) {
        // Update local state to reflect archived status
        setDocument({
          ...documentToArchive,
          onlineStatus: "archived",
          workStatus: null, // Clear Draft status on archive
        });
        setCanPublish(false);
      }

      return result;
    } catch (error) {
      logger.error(error, "Error archiving document");
      return { success: false, error: "Erreur réseau" };
    } finally {
      setIsArchiving(false);
    }
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
        saveDocument,
        isSaving,
        isDirty,
        canPublish,
        previewDocument,
        publishDocument: publishDocumentAction,
        isPublishing,
        archiveDocument: archiveDocumentWrapper,
        isArchiving,
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
