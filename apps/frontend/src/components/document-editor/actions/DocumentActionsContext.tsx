/**
 * DocumentActionsContext
 *
 * Centralizes document actions (preview/save/publish/archive) and exposes
 * status flags to the UI. It stitches together DocumentContext (content)
 * and MetadataContext (merged metadata) so actions always use up-to-date data.
 */

"use client";

import {
  extractTitleFromMarkdown,
  hasH1,
  logger,
  type WorkStatus,
} from "@playground/shared-types";
import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useRef,
  useState,
} from "react";
import { buildDispositifPayload } from "@/lib/payload-builder";
import { submitPreview } from "@/lib/preview-utils";
import {
  archiveDocument as archiveDocumentAction,
  publishDocument as publishDocumentAction,
  saveDocument as saveDocumentAction,
} from "@/services/document-actions";
import { useDocument } from "../DocumentContext";
import { useMetadata } from "../metadata/MetadataContext";

// =============================================================================
// Types
// =============================================================================

interface DocumentActionsContextValue {
  // Preview
  previewDocument: () => Promise<void>;
  isPreviewing: boolean;

  // Save
  saveDocument: () => Promise<{ success: boolean; error?: string }>;
  isSaving: boolean;

  // Publish
  publishDocument: (
    triggerTranslations?: boolean,
    overrideNullFields?: string[],
  ) => Promise<{
    success: boolean;
    remoteId?: string;
    publishedUrl?: string;
    error?: string;
  }>;
  isPublishing: boolean;

  // Archive
  archiveDocument: () => Promise<{ success: boolean; error?: string }>;
  isArchiving: boolean;
}

// =============================================================================
// Context
// =============================================================================

const DocumentActionsContext = createContext<
  DocumentActionsContextValue | undefined
>(undefined);

// =============================================================================
// Provider
// =============================================================================

export function DocumentActionsProvider({ children }: { children: ReactNode }) {
  const { document, setDocument, setIsDirty } = useDocument();
  const { mergedMetadata } = useMetadata();

  const [isPreviewing, setIsPreviewing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isArchiving, setIsArchiving] = useState(false);

  // Keep latest merged metadata in a ref to avoid stale reads during preview
  const mergedMetadataRef = useRef<Record<string, unknown>>(mergedMetadata);
  // Update ref on every render (synchronous) to avoid waiting for effects
  mergedMetadataRef.current = mergedMetadata;

  // =============================================================================
  // Preview
  // Uses merged metadata (AI + overrides) to build a full payload for preview.
  // =============================================================================

  const previewDocument = useCallback(async () => {
    if (!document) return;

    setIsPreviewing(true);
    try {
      const currentMergedMetadata = mergedMetadataRef.current;

      // Build preview payload with merged metadata
      const payload = await buildDispositifPayload({
        title: document.title || "Sans titre",
        editorialContent: document.editorialContent || "",
        mergedMetadata: currentMergedMetadata,
      });

      await submitPreview({
        id: document.id,
        title: document.title || "Sans titre",
        editorialContent: document.editorialContent || "",
        mergedMetadata: currentMergedMetadata,
        payload,
      });
    } catch (error) {
      logger.error(error, "Error previewing document");
      alert(
        `Erreur lors de la prévisualisation: ${
          error instanceof Error ? error.message : error
        }`,
      );
    } finally {
      setIsPreviewing(false);
    }
  }, [document]);

  // =============================================================================
  // Save
  // Saves editorial markdown only (metadata overrides handled separately).
  // Validates H1 presence, resets dirty state, and optimistically updates title.
  // =============================================================================

  const saveDocument = useCallback(async () => {
    if (!document?.id) {
      return { success: false, error: "Document non trouvé" };
    }

    // Validate that the document has a main title (H1)
    const h1Exists = await hasH1(document.editorialContent || "");
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
        document.editorialContent || "",
      );

      if (result.success) {
        setIsDirty(false);

        // Optimistically update local title and metadata from content
        const newTitleFromMarkdown = await extractTitleFromMarkdown(
          document.editorialContent || "",
        );
        const effectiveTitle =
          newTitleFromMarkdown || document.title || "Sans titre";
        setDocument((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            title: effectiveTitle,
            workStatus: "draft" as WorkStatus,
            metadata: {
              ...prev.metadata,
              title: effectiveTitle,
              "intitule-formation": effectiveTitle,
            },
          };
        });
      }

      return result;
    } catch (error) {
      logger.error(error, "Error saving document");
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Erreur lors de la sauvegarde",
      };
    } finally {
      setIsSaving(false);
    }
  }, [document, setDocument, setIsDirty]);

  // =============================================================================
  // Publish
  // Publishes current content + merged metadata. Save-before-publish is intentional
  // to ensure the latest markdown is persisted.
  // =============================================================================

  const publishDocument = useCallback(
    async (triggerTranslations = false, overrideNullFields: string[] = []) => {
      if (!document?.id) {
        return { success: false, error: "Document non trouvé" };
      }

      setIsPublishing(true);
      try {
        // Save before publishing
        await saveDocumentAction(document.id, document.editorialContent || "");

        // Build publication metadata, nulling out any error fields
        // (avoids sending invalid values when user chose "Publier quand même")
        const publicationMetadata: Record<string, unknown> = {
          ...mergedMetadata,
        };
        for (const key of overrideNullFields) {
          if (
            key === "__proto__" ||
            key === "constructor" ||
            key === "prototype"
          ) {
            logger.warn(
              { key },
              "Blocked unsafe metadata override key during publication",
            );
            continue;
          }
          publicationMetadata[key] = null;
        }

        const result = await publishDocumentAction(
          document.id,
          document.title || "Sans titre",
          document.editorialContent || "",
          publicationMetadata,
          triggerTranslations,
        );
        return result;
      } catch (error) {
        logger.error(error, "Error publishing document");
        return {
          success: false,
          error:
            error instanceof Error
              ? error.message
              : "Erreur lors de la publication",
        };
      } finally {
        setIsPublishing(false);
      }
    },
    [document, mergedMetadata],
  );

  // =============================================================================
  // Archive
  // =============================================================================

  const archiveDocument = useCallback(async () => {
    if (!document?.id) {
      return { success: false, error: "Document non trouvé" };
    }

    setIsArchiving(true);
    try {
      const result = await archiveDocumentAction(
        document.id,
        document.title || "Sans titre",
        document.editorialContent || "",
        mergedMetadata,
      );
      return result;
    } catch (error) {
      logger.error(error, "Error archiving document");
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Erreur lors de l'archivage",
      };
    } finally {
      setIsArchiving(false);
    }
  }, [document, mergedMetadata]);

  // =============================================================================
  // Context Value
  // =============================================================================

  const contextValue: DocumentActionsContextValue = {
    previewDocument,
    isPreviewing,
    saveDocument,
    isSaving,
    publishDocument,
    isPublishing,
    archiveDocument,
    isArchiving,
  };

  return (
    <DocumentActionsContext.Provider value={contextValue}>
      {children}
    </DocumentActionsContext.Provider>
  );
}

// =============================================================================
// Hook
// =============================================================================

export function useDocumentActions(): DocumentActionsContextValue {
  const context = useContext(DocumentActionsContext);
  if (!context) {
    throw new Error(
      "useDocumentActions must be used within a DocumentActionsProvider",
    );
  }
  return context;
}
