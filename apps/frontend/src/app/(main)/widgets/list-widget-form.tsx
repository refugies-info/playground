"use client";

import { useState } from "react";
import { WidgetConfigurationSection } from "@/components/widget-editor/WidgetConfigurationSection";
import { WidgetContentSection } from "@/components/widget-editor/WidgetContentSection";
import { WidgetEditorLayout } from "@/components/widget-editor/WidgetEditorLayout";
import { WidgetOptionsSection } from "@/components/widget-editor/WidgetOptionsSection";
import { WidgetTitleSection } from "@/components/widget-editor/WidgetTitleSection";
import { useWidgetAutosave } from "@/hooks/useWidgetAutosave";
import {
  buildListUpdate,
  hasListChanges,
  type ListFormValues,
} from "@/lib/widget-form";
import {
  WIDGET_TYPE_LABELS,
  type WidgetDisplayedStatus,
} from "@/lib/widget-list";
import { buildPreviewUrl } from "@/lib/widget-preview";

const REQUIRED_MESSAGES = {
  internalTitle: "Le titre est obligatoire",
  structureName: "Le partenaire est obligatoire",
  externalTitle: "Le titre affiché est obligatoire",
  description: "La description est obligatoire quand elle est affichée",
};

interface ListWidgetFormProps {
  widgetId: string;
  publicId: string;
  displayedStatus: WidgetDisplayedStatus;
  widgetBaseUrl?: string;
  initialValues: ListFormValues;
  themes: { value: string; label: string }[];
}

export function ListWidgetForm({
  widgetId,
  publicId,
  displayedStatus,
  widgetBaseUrl,
  initialValues,
  themes,
}: ListWidgetFormProps) {
  const [values, setValues] = useState(initialValues);
  const [previewVersion, setPreviewVersion] = useState(0);

  const requiredErrors = {
    internalTitle:
      values.internalTitle.trim() === ""
        ? REQUIRED_MESSAGES.internalTitle
        : undefined,
    structureName:
      values.structureName.trim() === ""
        ? REQUIRED_MESSAGES.structureName
        : undefined,
    externalTitle:
      values.externalTitle.trim() === ""
        ? REQUIRED_MESSAGES.externalTitle
        : undefined,
    description:
      values.displayDescription && values.description.trim() === ""
        ? REQUIRED_MESSAGES.description
        : undefined,
  };

  const { saveStatus, saveError, showRequired, markEdited } = useWidgetAutosave(
    {
      widgetId,
      state: values,
      initialState: initialValues,
      hasChanges: hasListChanges,
      isComplete: Object.values(requiredErrors).every((error) => !error),
      toUpdate: buildListUpdate,
      onSaved: () => setPreviewVersion((version) => version + 1),
    },
  );

  const shown = (field: keyof typeof requiredErrors) =>
    (showRequired ? requiredErrors[field] : undefined) ??
    saveError?.fieldErrors[field];

  const handleChange = (changes: Partial<ListFormValues>) => {
    setValues((current) => ({ ...current, ...changes }));
    markEdited();
  };

  return (
    <WidgetEditorLayout
      widgetId={widgetId}
      displayedStatus={displayedStatus}
      title={values.internalTitle.trim() || "Widget sans titre"}
      typeLabel={WIDGET_TYPE_LABELS.list}
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
        onChange={handleChange}
        errors={{
          internalTitle: shown("internalTitle"),
          structureName: shown("structureName"),
          authorizedDomains: saveError?.fieldErrors.authorizedDomains,
        }}
      />
      <WidgetTitleSection
        values={values}
        onChange={handleChange}
        errors={{
          externalTitle: shown("externalTitle"),
          description: shown("description"),
        }}
      />
      <WidgetContentSection
        values={values}
        onChange={handleChange}
        themes={themes}
      />
      <WidgetOptionsSection values={values} onChange={handleChange} />
    </WidgetEditorLayout>
  );
}
