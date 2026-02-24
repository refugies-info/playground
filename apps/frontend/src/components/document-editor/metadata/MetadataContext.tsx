"use client";

import { extractDiff, logger, mergeMetadata } from "@playground/shared-types";
import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useState,
} from "react";
import { useDocument } from "../DocumentContext";

/**
 * Status of a metadata field.
 */
export type MetadataFieldStatus = "pristine" | "modified" | "invalid";

/**
 * Context value for metadata editing.
 */
interface MetadataContextValue {
  /** Merged metadata (letta_report + editorial overrides) */
  mergedMetadata: Record<string, unknown>;

  /** Original metadata from letta_report (immutable) */
  baseMetadata: Record<string, unknown>;

  /** Current editorial overrides (local changes) */
  overrides: Record<string, unknown>;

  /** Set of modified field keys */
  dirtyFields: Set<string>;

  /** Map of validation errors by field key */
  validationErrors: Map<string, string>;

  /** Whether there are unsaved changes */
  isDirty: boolean;

  /** Whether a save is in progress */
  isSaving: boolean;

  /** Update a field value */
  updateField: (key: string, value: unknown) => void;

  /** Reset a field to its original value */
  resetField: (key: string) => void;

  /** Save all changes to the server */
  saveChanges: () => Promise<{ success: boolean; error?: string }>;

  /** Get the status of a field */
  getFieldStatus: (key: string) => MetadataFieldStatus;

  /** Get the original value of a field */
  getOriginalValue: (key: string) => unknown;

  /** Get the current value of a field (merged) */
  getFieldValue: (key: string) => unknown;
}

const MetadataContext = createContext<MetadataContextValue | undefined>(
  undefined,
);

/**
 * MetadataProvider — Provides metadata editing state and actions.
 *
 * @description
 * This context manages:
 * - Merging letta_report metadata with editorial overrides
 * - Tracking dirty fields
 * - Saving changes to editorial_records
 *
 * Must be used within a DocumentProvider.
 */
export function MetadataProvider({ children }: { children: ReactNode }) {
  const { document } = useDocument();

  // Get base metadata from letta_report
  const baseMetadata = document?.metadataReport?.metadata_ri ?? {};

  // Get existing editorial overrides from document.metadata
  const existingOverrides =
    (document?.metadata as Record<string, unknown>) ?? {};

  // Local state for current overrides (edits in progress)
  const [overrides, setOverrides] =
    useState<Record<string, unknown>>(existingOverrides);
  const [isSaving, setIsSaving] = useState(false);

  // Compute merged metadata
  const mergedMetadata = mergeMetadata(baseMetadata, overrides);

  // Compute dirty fields by comparing merged with base
  const dirtyFields = new Set<string>();
  const diff = extractDiff(baseMetadata, mergedMetadata);
  for (const key of Object.keys(diff)) {
    dirtyFields.add(key);
  }

  // Check if there are unsaved changes
  const isDirty = dirtyFields.size > 0;

  /**
   * Update a field value in overrides.
   */
  const updateField = useCallback((key: string, value: unknown) => {
    setOverrides((prev) => {
      const newOverrides = { ...prev };
      if (value === undefined) {
        delete newOverrides[key];
      } else {
        newOverrides[key] = value;
      }
      return newOverrides;
    });
  }, []);

  /**
   * Reset a field to its original value (remove from overrides).
   */
  const resetField = useCallback((key: string) => {
    setOverrides((prev) => {
      const newOverrides = { ...prev };
      delete newOverrides[key];
      return newOverrides;
    });
  }, []);

  /**
   * Save changes to the server.
   *
   * TODO: Implement server action to save metadata to editorial_records.metadata
   * - Create saveMetadataAction in @/services/document-actions.ts
   * - Update editorial_records.metadata with the overrides
   * - Return success/error status
   */
  const saveChanges = useCallback(async (): Promise<{
    success: boolean;
    error?: string;
  }> => {
    if (!document?.id) {
      return { success: false, error: "No document to save" };
    }

    if (!isDirty) {
      return { success: true };
    }

    setIsSaving(true);
    try {
      // TODO: Implement server action to save metadata
      // For now, we just log and return success
      logger.info(
        { documentId: document.id, overrides },
        "Saving metadata changes (NOT IMPLEMENTED)",
      );

      // In a real implementation, we would call a server action here:
      // const result = await saveMetadataAction(document.id, overrides);

      return { success: true };
    } catch (error) {
      logger.error(error, "Error saving metadata");
      return { success: false, error: "Erreur lors de la sauvegarde" };
    } finally {
      setIsSaving(false);
    }
  }, [document?.id, isDirty, overrides]);

  /**
   * Get the status of a field.
   */
  const getFieldStatus = useCallback(
    (key: string): MetadataFieldStatus => {
      if (dirtyFields.has(key)) {
        return "modified";
      }
      return "pristine";
    },
    [dirtyFields],
  );

  /**
   * Get the original value of a field (from letta_report).
   */
  const getOriginalValue = useCallback(
    (key: string): unknown => {
      return baseMetadata[key];
    },
    [baseMetadata],
  );

  /**
   * Get the current value of a field (merged).
   */
  const getFieldValue = useCallback(
    (key: string): unknown => {
      return mergedMetadata[key];
    },
    [mergedMetadata],
  );

  // Validation errors (placeholder for future validation logic)
  const validationErrors = new Map<string, string>();

  return (
    <MetadataContext.Provider
      value={{
        mergedMetadata,
        baseMetadata,
        overrides,
        dirtyFields,
        validationErrors,
        isDirty,
        isSaving,
        updateField,
        resetField,
        saveChanges,
        getFieldStatus,
        getOriginalValue,
        getFieldValue,
      }}
    >
      {children}
    </MetadataContext.Provider>
  );
}

/**
 * useMetadata — Hook to access metadata editing context.
 *
 * @throws Error if used outside of MetadataProvider
 */
export function useMetadata() {
  const context = useContext(MetadataContext);
  if (context === undefined) {
    throw new Error("useMetadata must be used within a MetadataProvider");
  }
  return context;
}
