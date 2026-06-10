"use client";

import { useEffect, useRef } from "react";

const AUTOSAVE_INTERVAL_MS = 20_000;

/**
 * Triggers autosave every minute if there are unsaved changes.
 * Uses a ref to avoid stale closure issues inside the interval callback.
 */
export function useAutosave(
  isDirty: boolean,
  saveDocument: () => Promise<{ success: boolean; error?: string }>,
) {
  const isDirtyRef = useRef(isDirty);
  const saveDocumentRef = useRef(saveDocument);

  useEffect(() => {
    isDirtyRef.current = isDirty;
  }, [isDirty]);

  useEffect(() => {
    saveDocumentRef.current = saveDocument;
  }, [saveDocument]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (isDirtyRef.current) {
        saveDocumentRef.current();
      }
    }, AUTOSAVE_INTERVAL_MS);

    return () => clearInterval(interval);
  }, []);
}
