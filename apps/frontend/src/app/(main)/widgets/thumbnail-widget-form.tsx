"use client";

import type { RiDispositifSummary } from "@playground/shared-types";
import { useEffect, useState } from "react";
import { ThumbnailPicker } from "@/components/widget-editor/ThumbnailPicker";
import { WidgetConfigurationSection } from "@/components/widget-editor/WidgetConfigurationSection";
import { WidgetEditorLayout } from "@/components/widget-editor/WidgetEditorLayout";
import {
  buildThumbnailUpdate,
  hasThumbnailChanges,
  isDispositifId,
  type ThumbnailFormValues,
} from "@/lib/widget-form";
import { WIDGET_TYPE_LABELS } from "@/lib/widget-list";
import { buildPreviewUrl } from "@/lib/widget-preview";
import {
  getDispositifsByIdsAction,
  searchDispositifsAction,
  updateWidgetConfigAction,
} from "@/services/widget-config-actions";

interface SaveError {
  message: string;
  fieldErrors: Record<string, string>;
}

const AUTOSAVE_DELAY_IN_MS = 800;

const REQUIRED_MESSAGES = {
  internalTitle: "Le titre est obligatoire",
  structureName: "Le partenaire est obligatoire",
  dispositif: "Choisir la fiche affichée dans le widget",
};

const searchDispositifs = async (text: string) => {
  const result = isDispositifId(text)
    ? await getDispositifsByIdsAction([text.trim()])
    : await searchDispositifsAction(text);
  if (!result.success) throw new Error(result.error);
  return result.data;
};

interface ThumbnailWidgetFormProps {
  widgetId: string;
  publicId: string;
  widgetBaseUrl?: string;
  initialValues: ThumbnailFormValues;
  initialDispositif: RiDispositifSummary | null;
}

export function ThumbnailWidgetForm({
  widgetId,
  publicId,
  widgetBaseUrl,
  initialValues,
  initialDispositif,
}: ThumbnailWidgetFormProps) {
  const [values, setValues] = useState(initialValues);
  const [dispositif, setDispositif] = useState(initialDispositif);
  const [savedState, setSavedState] = useState({
    values: initialValues,
    dispositifId: initialDispositif?.id ?? null,
  });
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<SaveError | null>(null);
  const [hasEdited, setHasEdited] = useState(false);
  const [showRequired, setShowRequired] = useState(false);
  const [previewVersion, setPreviewVersion] = useState(0);

  const currentState = { values, dispositifId: dispositif?.id ?? null };
  const isDirty = hasThumbnailChanges(savedState, currentState);
  const saveStatus = isSaving
    ? "saving"
    : saveError
      ? "error"
      : isDirty
        ? "unsaved"
        : "saved";

  const requiredErrors = {
    internalTitle:
      values.internalTitle.trim() === ""
        ? REQUIRED_MESSAGES.internalTitle
        : undefined,
    structureName:
      values.structureName.trim() === ""
        ? REQUIRED_MESSAGES.structureName
        : undefined,
  };
  const isComplete = Object.values(requiredErrors).every((error) => !error);
  const shown = (field: keyof typeof requiredErrors) =>
    (showRequired ? requiredErrors[field] : undefined) ??
    saveError?.fieldErrors[field];

  useEffect(() => {
    if (!hasEdited || !isDirty || isSaving || saveError) return;

    const save = async () => {
      if (!isComplete) {
        setShowRequired(true);
        return;
      }
      setIsSaving(true);
      const state = { values, dispositifId: dispositif?.id ?? null };
      const result = await updateWidgetConfigAction(
        widgetId,
        buildThumbnailUpdate(values, dispositif),
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
      setPreviewVersion((version) => version + 1);
    };

    const timer = setTimeout(save, AUTOSAVE_DELAY_IN_MS);
    return () => clearTimeout(timer);
  }, [
    hasEdited,
    isDirty,
    isSaving,
    saveError,
    isComplete,
    values,
    dispositif,
    widgetId,
  ]);

  const handleEdit = () => {
    setHasEdited(true);
    setSaveError(null);
  };

  return (
    <WidgetEditorLayout
      title={values.internalTitle.trim() || "Widget sans titre"}
      typeLabel={WIDGET_TYPE_LABELS.thumbnail}
      widgetHref={`/widgets/${widgetId}`}
      saveStatus={saveStatus}
      onSave={handleEdit}
      previewSrc={
        widgetBaseUrl
          ? buildPreviewUrl(widgetBaseUrl, publicId, previewVersion)
          : undefined
      }
    >
      {saveError && (
        <p
          role="alert"
          className="bg-white p-4 text-sm text-(--text-default-error)"
        >
          {saveError.message}
        </p>
      )}
      <WidgetConfigurationSection
        values={values}
        onChange={(changes) => {
          setValues((current) => ({ ...current, ...changes }));
          handleEdit();
        }}
        errors={{
          internalTitle: shown("internalTitle"),
          structureName: shown("structureName"),
          authorizedDomains: saveError?.fieldErrors.authorizedDomains,
        }}
      />
      <ThumbnailPicker
        selected={dispositif}
        onSelect={(next) => {
          setDispositif(next);
          handleEdit();
        }}
        onSearch={searchDispositifs}
        error={
          saveError?.fieldErrors.dispositifId ??
          (dispositif ? undefined : REQUIRED_MESSAGES.dispositif)
        }
      />
    </WidgetEditorLayout>
  );
}
