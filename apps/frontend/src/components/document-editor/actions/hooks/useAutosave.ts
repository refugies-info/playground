"use client";

import { useEffect, useRef } from "react";

const AUTOSAVE_INTERVAL_MS = 60_000;

/**
 * Triggers autosave every minute if there are unsaved changes.
 * Uses a ref to avoid stale closure issues inside the interval callback.
 */
export function useAutosave(
  isDirty: boolean,
  saveDocument: () => Promise<{ success: boolean; error?: string }>,
) {
  const isDirtyRef = useRef(isDirty);

  useEffect(() => {
    isDirtyRef.current = isDirty;
  }, [isDirty]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (isDirtyRef.current) {
        saveDocument();
      }
    }, AUTOSAVE_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [saveDocument]);
}
