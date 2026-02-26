"use client";

import {
  extractDiff,
  logger,
  mergeMetadata,
  validateAllFields,
  validateField,
} from "@playground/shared-types";
import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
} from "react";
import { saveMetadataFieldAction } from "@/services/metadata-actions";
import { useDocument } from "../DocumentContext";

/**
 * Status of a metadata field.
 */
export type MetadataFieldStatus =
  | "pristine"
  | "modified"
  | "saving"
  | "saved"
  | "error";

// =============================================================================
// Reducer State & Actions
// =============================================================================

interface MetadataState {
  overrides: Record<string, unknown>;
  savingFields: Set<string>;
  fieldErrors: Map<string, string>;
}

type MetadataAction =
  | { type: "SET_FIELD"; key: string; value: unknown }
  | { type: "DELETE_FIELD"; key: string }
  | { type: "START_SAVING"; key: string }
  | { type: "END_SAVING"; key: string }
  | { type: "SET_ERROR"; key: string; error: string }
  | { type: "CLEAR_ERROR"; key: string }
  | { type: "REVERT_FIELD"; key: string }
  | { type: "CLEAR_FIELD"; key: string }
  | { type: "SET_OVERRIDES"; overrides: Record<string, unknown> };

const initialState: MetadataState = {
  overrides: {},
  savingFields: new Set(),
  fieldErrors: new Map(),
};

function metadataReducer(
  state: MetadataState,
  action: MetadataAction,
): MetadataState {
  switch (action.type) {
    case "SET_FIELD":
      return {
        ...state,
        overrides: { ...state.overrides, [action.key]: action.value },
      };

    case "DELETE_FIELD": {
      const newOverrides = { ...state.overrides };
      delete newOverrides[action.key];
      return { ...state, overrides: newOverrides };
    }

    case "START_SAVING": {
      const newSavingFields = new Set(state.savingFields);
      newSavingFields.add(action.key);
      return { ...state, savingFields: newSavingFields };
    }

    case "END_SAVING": {
      const newSavingFields = new Set(state.savingFields);
      newSavingFields.delete(action.key);
      return { ...state, savingFields: newSavingFields };
    }

    case "SET_ERROR": {
      const newFieldErrors = new Map(state.fieldErrors);
      newFieldErrors.set(action.key, action.error);
      return { ...state, fieldErrors: newFieldErrors };
    }

    case "CLEAR_ERROR": {
      const newFieldErrors = new Map(state.fieldErrors);
      newFieldErrors.delete(action.key);
      return { ...state, fieldErrors: newFieldErrors };
    }

    case "REVERT_FIELD": {
      const newOverrides = { ...state.overrides };
      delete newOverrides[action.key];
      const newFieldErrors = new Map(state.fieldErrors);
      newFieldErrors.delete(action.key);
      return { ...state, overrides: newOverrides, fieldErrors: newFieldErrors };
    }

    case "CLEAR_FIELD": {
      // Mark field as explicitly cleared (null override)
      const newOverrides = { ...state.overrides };
      newOverrides[action.key] = null;
      return { ...state, overrides: newOverrides };
    }

    case "SET_OVERRIDES": {
      // Replace all overrides (used when document loads)
      return {
        ...state,
        overrides: action.overrides,
        fieldErrors: new Map(), // Clear errors on reset
      };
    }

    default:
      return state;
  }
}

// =============================================================================
// Context
// =============================================================================

interface MetadataContextValue {
  /** Merged metadata (letta_report + editorial overrides) */
  mergedMetadata: Record<string, unknown>;

  /** Original metadata from letta_report (immutable) */
  baseMetadata: Record<string, unknown>;

  /** Current editorial overrides (local changes) */
  overrides: Record<string, unknown>;

  /** Set of modified field keys */
  dirtyFields: Set<string>;

  /** Whether there are unsaved changes */
  isDirty: boolean;

  /** Update and save a field value */
  updateField: (key: string, value: unknown) => Promise<void>;

  /** Reset a field to its original value (remove override) */
  resetField: (key: string) => Promise<void>;

  /** Clear a field (save null to editorial_record) */
  clearField: (key: string) => Promise<void>;

  /** Save all changes to the server */
  saveChanges: () => Promise<{ success: boolean; error?: string }>;

  /** Get the status of a field */
  getFieldStatus: (key: string) => MetadataFieldStatus;

  /** Get the original value of a field */
  getOriginalValue: (key: string) => unknown;

  /** Get the current value of a field (merged) */
  getFieldValue: (key: string) => unknown;

  /** Get the error for a field */
  getFieldError: (key: string) => string | undefined;

  /** Clear the error for a field */
  clearFieldError: (key: string) => void;
}

const MetadataContext = createContext<MetadataContextValue | undefined>(
  undefined,
);

/**
 * MetadataProvider — Provides metadata editing state and actions.
 */
export function MetadataProvider({ children }: { children: ReactNode }) {
  const { document } = useDocument();

  // Get base metadata from letta_report (memoized)
  const baseMetadata = useMemo(
    () => document?.metadataReport?.metadata_ri ?? {},
    [document?.metadataReport?.metadata_ri],
  );

  // Get existing editorial overrides from document.editorialMetadata (memoized)
  const existingOverrides = useMemo(
    () => (document?.editorialMetadata as Record<string, unknown>) ?? {},
    [document?.editorialMetadata],
  );

  // Initialize state with existing overrides
  const [state, dispatch] = useReducer(metadataReducer, {
    ...initialState,
    overrides: existingOverrides,
  });

  // Sync state when document editorialMetadata changes (e.g., after async load)
  useEffect(() => {
    if (
      document?.editorialMetadata &&
      Object.keys(document.editorialMetadata).length > 0
    ) {
      // Reset state with new overrides
      dispatch({
        type: "SET_OVERRIDES",
        overrides: document.editorialMetadata as Record<string, unknown>,
      });
    }
  }, [document?.editorialMetadata]);

  // Compute merged metadata
  const mergedMetadata = useMemo(
    () => mergeMetadata(baseMetadata, state.overrides),
    [baseMetadata, state.overrides],
  );

  // Compute dirty fields
  const dirtyFields = useMemo(() => {
    const fields = new Set<string>();
    const diff = extractDiff(baseMetadata, mergedMetadata);
    for (const key of Object.keys(diff)) {
      fields.add(key);
    }
    // Include fields that are explicitly set to null in overrides
    for (const [key, value] of Object.entries(state.overrides)) {
      if (value === null) {
        fields.add(key);
      }
    }
    return fields;
  }, [baseMetadata, mergedMetadata, state.overrides]);

  const isDirty = dirtyFields.size > 0;

  // Validate all fields on initial load (detect AI errors)
  useEffect(() => {
    if (Object.keys(baseMetadata).length === 0) return;

    const validationErrors = validateAllFields(baseMetadata);

    // Dispatch errors for invalid fields
    for (const [key, error] of validationErrors) {
      dispatch({ type: "SET_ERROR", key, error });
    }

    if (validationErrors.size > 0) {
      logger.info(
        { count: validationErrors.size },
        "Validation errors found at load time",
      );
    }
  }, [baseMetadata]);

  /**
   * Update and save a field value.
   */
  const updateField = useCallback(
    async (key: string, value: unknown) => {
      if (!document?.id) {
        logger.error("No document ID for metadata save");
        return;
      }

      // 1. Validate with Zod
      const validation = validateField(key, value);
      if (!validation.success) {
        dispatch({ type: "SET_ERROR", key, error: validation.error });
        return;
      }

      // 2. Clear any previous error
      dispatch({ type: "CLEAR_ERROR", key });

      // 3. Mark as saving
      dispatch({ type: "START_SAVING", key });

      // 4. Optimistic update
      if (value === undefined) {
        // undefined = delete override (revert to AI value)
        dispatch({ type: "DELETE_FIELD", key });
      } else if (value === null) {
        // null = explicitly clear field (override with null)
        dispatch({ type: "CLEAR_FIELD", key });
      } else {
        // other value = set override
        dispatch({ type: "SET_FIELD", key, value });
      }

      // 5. Save to server
      try {
        const result = await saveMetadataFieldAction(document.id, key, value);

        if (!result.success) {
          // Revert on error
          dispatch({ type: "REVERT_FIELD", key });
          dispatch({
            type: "SET_ERROR",
            key,
            error: result.error ?? "Erreur de sauvegarde",
          });
        }
      } catch (error) {
        logger.error(error, "Error saving metadata field");
        dispatch({ type: "REVERT_FIELD", key });
        dispatch({ type: "SET_ERROR", key, error: "Erreur de sauvegarde" });
      } finally {
        // 6. Clear saving state
        dispatch({ type: "END_SAVING", key });
      }
    },
    [document?.id],
  );

  /**
   * Reset a field to its original value (remove override).
   */
  const resetField = useCallback(
    async (key: string) => {
      if (!document?.id) return;

      dispatch({ type: "START_SAVING", key });
      dispatch({ type: "REVERT_FIELD", key });

      try {
        // Save undefined to remove the override
        await saveMetadataFieldAction(document.id, key, undefined);
      } catch (error) {
        logger.error(error, "Error resetting field");
        dispatch({
          type: "SET_ERROR",
          key,
          error: "Erreur lors de la réinitialisation",
        });
      } finally {
        dispatch({ type: "END_SAVING", key });
      }
    },
    [document?.id],
  );

  /**
   * Clear a field (save null to editorial_record).
   */
  const clearField = useCallback(
    async (key: string) => {
      if (!document?.id) return;

      dispatch({ type: "START_SAVING", key });
      dispatch({ type: "CLEAR_FIELD", key });

      try {
        // Save null to explicitly clear the field
        await saveMetadataFieldAction(document.id, key, null);
      } catch (error) {
        logger.error(error, "Error clearing field");
        dispatch({
          type: "SET_ERROR",
          key,
          error: "Erreur lors de la suppression",
        });
      } finally {
        dispatch({ type: "END_SAVING", key });
      }
    },
    [document?.id],
  );

  /**
   * Save all changes to the server.
   */
  const saveChanges = useCallback(async () => {
    if (!document?.id || !isDirty) {
      return { success: true };
    }

    // Save each dirty field
    const results = await Promise.all(
      Array.from(dirtyFields).map((key) => {
        if (!document?.id) {
          return Promise.resolve({
            success: false,
            error: "Document ID manquant",
          });
        }
        return saveMetadataFieldAction(document.id, key, mergedMetadata[key]);
      }),
    );

    const errors = results.filter((r) => !r.success);
    if (errors.length > 0) {
      return { success: false, error: errors[0].error };
    }

    return { success: true };
  }, [document?.id, isDirty, dirtyFields, mergedMetadata]);

  /**
   * Get the status of a field.
   */
  const getFieldStatus = useCallback(
    (key: string): MetadataFieldStatus => {
      if (state.savingFields.has(key)) return "saving";
      if (state.fieldErrors.has(key)) return "error";
      if (dirtyFields.has(key)) return "modified";
      return "pristine";
    },
    [state.savingFields, state.fieldErrors, dirtyFields],
  );

  /**
   * Get the original value of a field.
   */
  const getOriginalValue = useCallback(
    (key: string): unknown => {
      return baseMetadata[key];
    },
    [baseMetadata],
  );

  /**
   * Get the current value of a field.
   */
  const getFieldValue = useCallback(
    (key: string): unknown => {
      return mergedMetadata[key];
    },
    [mergedMetadata],
  );

  /**
   * Get the error for a field.
   */
  const getFieldError = useCallback(
    (key: string): string | undefined => {
      return state.fieldErrors.get(key);
    },
    [state.fieldErrors],
  );

  /**
   * Clear the error for a field.
   */
  const clearFieldError = useCallback((key: string) => {
    dispatch({ type: "CLEAR_ERROR", key });
  }, []);

  // Memoize context value to prevent unnecessary re-renders
  const contextValue = useMemo(
    () => ({
      mergedMetadata,
      baseMetadata,
      overrides: state.overrides,
      dirtyFields,
      isDirty,
      updateField,
      resetField,
      clearField,
      saveChanges,
      getFieldStatus,
      getOriginalValue,
      getFieldValue,
      getFieldError,
      clearFieldError,
    }),
    [
      mergedMetadata,
      baseMetadata,
      state.overrides,
      dirtyFields,
      isDirty,
      updateField,
      resetField,
      clearField,
      saveChanges,
      getFieldStatus,
      getOriginalValue,
      getFieldValue,
      getFieldError,
      clearFieldError,
    ],
  );

  return (
    <MetadataContext.Provider value={contextValue}>
      {children}
    </MetadataContext.Provider>
  );
}

/**
 * Hook to access the metadata context.
 */
export function useMetadata(): MetadataContextValue {
  const context = useContext(MetadataContext);
  if (!context) {
    throw new Error("useMetadata must be used within a MetadataProvider");
  }
  return context;
}
