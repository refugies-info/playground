"use client";

import { SwitchField, TextArea, TextInput } from "@playground/ui/forms";
import { useId } from "react";
import {
  type ListFormValues,
  MAX_DESCRIPTION_LENGTH,
  MAX_EXTERNAL_TITLE_LENGTH,
} from "@/lib/widget-form";
import { WidgetEditorSection } from "./WidgetEditorSection";

type TitleValues = Pick<
  ListFormValues,
  "externalTitle" | "displayDescription" | "description"
>;

interface WidgetTitleSectionProps {
  values: TitleValues;
  onChange: (changes: Partial<TitleValues>) => void;
  errors?: Partial<Record<"externalTitle" | "description", string>>;
}

export function WidgetTitleSection({
  values,
  onChange,
  errors = {},
}: WidgetTitleSectionProps) {
  const descriptionId = useId();

  return (
    <WidgetEditorSection
      title="Titre du widget"
      description="Titre et phrase d’introduction affichés en haut du widget, visibles par les usagers."
    >
      <div className="flex flex-col gap-4">
        <TextInput
          label="Titre affiché *"
          variant="dsfr"
          value={values.externalTitle}
          onChange={(externalTitle) => onChange({ externalTitle })}
          maxLength={MAX_EXTERNAL_TITLE_LENGTH}
          error={errors.externalTitle}
          required
        />
        <SwitchField
          label="Afficher la description"
          checked={values.displayDescription}
          onChange={(displayDescription) => onChange({ displayDescription })}
        />
        {values.displayDescription && (
          <div className="space-y-1">
            <label className="text-sm font-medium" htmlFor={descriptionId}>
              Description *
            </label>
            <TextArea
              id={descriptionId}
              variant="dsfr"
              rows={4}
              value={values.description}
              onChange={(description) => onChange({ description })}
              maxLength={MAX_DESCRIPTION_LENGTH}
              error={errors.description}
              required
            />
            {errors.description && (
              <p className="text-[12px] leading-[20px] text-(--text-default-error)">
                {errors.description}
              </p>
            )}
          </div>
        )}
      </div>
    </WidgetEditorSection>
  );
}
