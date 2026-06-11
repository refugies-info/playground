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
  /** ID of the editorial_record — used for Realtime status subscription */
  editorialRecordId?: string;
  /** ID of the currently logged-in user — used by the edit-lock feature */
  currentUserId?: string;
  /** Display name of the user currently holding the edit lock — shown in EditLockDialog */
  currentEditorName?: string | null;
  /** True while an AI metadata generation is in progress — drives MetadataView spinner */
  isMetadataGenerating?: boolean;
  referenceData?: {
    themes: Record<string, string>;
    needs: Record<string, string>;
    needsByTheme: Record<string, string[]>;
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
  isSourceOpen: boolean;
  setIsSourceOpen: (open: boolean) => void;
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
  const [isSourceOpen, setIsSourceOpen] = useState(false);
  // Initialise isProcessing à true si une réécriture IA est déjà en cours
  // (active_run_id présent en DB) pour éviter le flash visuel default → loading
  // au premier render après refresh.
  const [isProcessing, setIsProcessing] = useState(
    () => !!initialData?.activeRunId,
  );
  const [isRawMarkdownMode, setIsRawMarkdownMode] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [debugBlocks, setDebugBlocks] = useState<unknown[] | null>([]);

  // Synchronize local state when:
  //   - navigating to a different document (id change)
  //   - a new metadata report arrives after AI generation (metadataReport?.id change)
  //     This ensures router.refresh() post-generation delivers the fresh metadataReport
  //     and cleared editorial overrides to all consumers (MetadataTable, MetadataContext).
  //   - the active AI rewrite runId changes (start, cancel, accept, reject)
  //     so the AIFloatingButton resume logic sees an up-to-date activeRunId
  //     (e.g. after revalidatePath following a DELETE, or in multi-tab scenarios).
  // biome-ignore lint/correctness/useExhaustiveDependencies: intentional — only re-sync on navigation, new metadata report, activeRunId, or onlineStatus change
  useEffect(() => {
    if (initialData) {
      // Préserver aiSuggestion : c'est un état transient client non présent dans
      // initialData. Si un revalidatePath se déclenche pendant qu'une suggestion
      // est en attente de confirmation, elle ne doit pas être écrasée.
      // ⚠️ Important : on préserve UNIQUEMENT si on reste sur le même document.
      // Sinon (navigation entre docs), la suggestion du précédent serait
      // transférée au suivant — bug visuel + risque d'écraser le mauvais contenu.
      setDocument((prev) => ({
        ...initialData,
        aiSuggestion:
          prev?.id === initialData.id ? prev?.aiSuggestion : undefined,
      }));
    }
  }, [
    initialData?.id,
    initialData?.metadataReport?.id,
    initialData?.activeRunId,
    initialData?.onlineStatus,
    initialData?.assigneeEmail,
    initialData?.activeIngestionVersion,
    initialData?.latestIngestionVersion,
    initialData?.hasPendingIngestionUpdate,
  ]);

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
        isSourceOpen,
        setIsSourceOpen,
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
