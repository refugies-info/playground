"use client";

import { TextInput } from "@playground/ui/forms";
import {
  MAX_WIDGET_FIELD_LENGTH,
  type WidgetConfigurationValues,
} from "@/lib/widget-form";
import { DomainsInput } from "./DomainsInput";
import { WidgetEditorSection } from "./WidgetEditorSection";

interface WidgetConfigurationSectionProps {
  values: WidgetConfigurationValues;
  onChange: (changes: Partial<WidgetConfigurationValues>) => void;
  errors?: Partial<Record<keyof WidgetConfigurationValues, string>>;
}

export function WidgetConfigurationSection({
  values,
  onChange,
  errors = {},
}: WidgetConfigurationSectionProps) {
  return (
    <WidgetEditorSection
      title="Configuration et accès"
      description="Informations de gestion, visibles uniquement par l’équipe."
    >
      <div className="flex flex-col gap-4">
        <TextInput
          label="Titre *"
          variant="dsfr"
          value={values.internalTitle}
          onChange={(internalTitle) => onChange({ internalTitle })}
          maxLength={MAX_WIDGET_FIELD_LENGTH}
          error={errors.internalTitle}
          required
        />
        <TextInput
          label="Partenaire *"
          variant="dsfr"
          value={values.structureName}
          onChange={(structureName) => onChange({ structureName })}
          maxLength={MAX_WIDGET_FIELD_LENGTH}
          error={errors.structureName}
          required
        />
        <DomainsInput
          value={values.authorizedDomains}
          onChange={(authorizedDomains) => onChange({ authorizedDomains })}
          error={errors.authorizedDomains}
        />
      </div>
    </WidgetEditorSection>
  );
}
