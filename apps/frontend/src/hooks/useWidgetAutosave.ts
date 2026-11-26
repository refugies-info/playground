"use client";

import type { WidgetConfigUpdateInput } from "@playground/shared-types";
import { useEffect, useRef, useState } from "react";
import { updateWidgetConfigAction } from "@/services/widget-config-actions";

const AUTOSAVE_DELAY_IN_MS = 800;

export type WidgetSaveStatus = "saving" | "error" | "unsaved" | "saved";

export interface WidgetSaveError {
  message: string;
  fieldErrors: Record<string, string>;
}

interface UseWidgetAutosaveOptions<State> {
  widgetId: string;
  state: State;
  initialState: State;
  hasChanges: (saved: State, current: State) => boolean;
  isComplete: boolean;
  toUpdate: (state: State) => WidgetConfigUpdateInput;
  onSaved?: () => void;
}

export function useWidgetAutosave<State>({
  widgetId,
  state,
  initialState,
  hasChanges,
  isComplete,
  toUpdate,
  onSaved,
}: UseWidgetAutosaveOptions<State>) {
  const [savedState, setSavedState] = useState(initialState);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<WidgetSaveError | null>(null);
  const [hasEdited, setHasEdited] = useState(false);
  const [showRequired, setShowRequired] = useState(false);

  // Callers pass fresh functions at each render: read the latest ones without restarting the timer.
  const callbacks = useRef({ toUpdate, onSaved });
  useEffect(() => {
    callbacks.current = { toUpdate, onSaved };
  });

  const isDirty = hasChanges(savedState, state);
  const saveStatus: WidgetSaveStatus = isSaving
    ? "saving"
    : saveError
      ? "error"
      : isDirty
        ? "unsaved"
        : "saved";

  useEffect(() => {
    if (!hasEdited || !isDirty || isSaving || saveError) return;

    const save = async () => {
      if (!isComplete) {
        setShowRequired(true);
        return;
      }
      setIsSaving(true);
      const result = await updateWidgetConfigAction(
        widgetId,
        callbacks.current.toUpdate(state),
      );

      if (!result.success) {
        setIsSaving(false);
        setSaveError({
          message: result.error,
          fieldErrors: Object.fromEntries(
            (result.fieldErrors ?? []).map(({ key, message }) => [
              key,
              message,
            ]),
          ),
        });
        return;
      }
      setSavedState(state);
      setIsSaving(false);
      callbacks.current.onSaved?.();
    };

    const timer = setTimeout(save, AUTOSAVE_DELAY_IN_MS);
    return () => clearTimeout(timer);
  }, [hasEdited, isDirty, isSaving, saveError, isComplete, state, widgetId]);

  const markEdited = () => {
    setHasEdited(true);
    setSaveError(null);
  };

  return { saveStatus, saveError, showRequired, markEdited };
}
