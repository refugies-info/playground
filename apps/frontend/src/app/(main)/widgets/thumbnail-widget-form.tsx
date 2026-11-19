"use client";

import type { RiDispositifSummary } from "@playground/shared-types";
import { useState } from "react";
import { ThumbnailPicker } from "@/components/widget-editor/ThumbnailPicker";
import { WidgetConfigurationSection } from "@/components/widget-editor/WidgetConfigurationSection";
import { WidgetEditorLayout } from "@/components/widget-editor/WidgetEditorLayout";
import { useWidgetAutosave } from "@/hooks/useWidgetAutosave";
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
} from "@/services/widget-config-actions";

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
  const [previewVersion, setPreviewVersion] = useState(0);

  const { saveStatus, saveError, showRequired, markEdited } = useWidgetAutosave(
    {
      widgetId,
      state: { values, dispositif },
      initialState: { values: initialValues, dispositif: initialDispositif },
      hasChanges: (saved, current) =>
        hasThumbnailChanges(
          { values: saved.values, dispositifId: saved.dispositif?.id ?? null },
          {
            values: current.values,
            dispositifId: current.dispositif?.id ?? null,
          },
        ),
      isComplete:
        values.internalTitle.trim() !== "" &&
        values.structureName.trim() !== "",
      toUpdate: (state) => buildThumbnailUpdate(state.values, state.dispositif),
      onSaved: () => setPreviewVersion((version) => version + 1),
    },
  );

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
  const shown = (field: keyof typeof requiredErrors) =>
    (showRequired ? requiredErrors[field] : undefined) ??
    saveError?.fieldErrors[field];

  return (
    <WidgetEditorLayout
      title={values.internalTitle.trim() || "Widget sans titre"}
      typeLabel={WIDGET_TYPE_LABELS.thumbnail}
      widgetHref={`/widgets/${widgetId}`}
      saveStatus={saveStatus}
      onSave={markEdited}
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
          markEdited();
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
          markEdited();
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
