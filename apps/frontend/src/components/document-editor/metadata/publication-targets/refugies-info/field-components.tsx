/**
 * Réfugiés.info - Field Components Mapping
 * Maps field keys to their React components
 */

import type { ComponentType, ReactNode } from "react";
import {
  AgeField,
  CommitmentField,
  DepartmentField,
  FrequencyField,
  ImageUploadField,
  MultiEnumField,
  NeedSelectField,
  PoiField,
  PriceField,
  SessionField,
  TextareaField,
  TextField,
  ThemeSelectField,
} from "../../fields";
import type { MetadataFieldDef } from "../../types";
import { MULTI_ENUM_OPTIONS } from "./constants";

// =============================================================================
// Constants
// =============================================================================

/** Maximum characters for the "En bref" (abstract) field */
const ABSTRACT_MAX_LENGTH = 200;

// =============================================================================
// Types
// =============================================================================

export interface FieldProps {
  fieldKey: string;
  label: string;
  placeholder?: string;
}

// =============================================================================
// Field Components Mapping
// =============================================================================

/** Abstract field with 200-char limit */
function AbstractField(props: FieldProps) {
  return <TextareaField {...props} maxLength={ABSTRACT_MAX_LENGTH} />;
}

/** Maps field keys to their components */
export const FIELD_COMPONENTS: Record<string, ComponentType<FieldProps>> = {
  // Text fields
  titreMarque: TextField,
  mainSponsor: TextField,

  // Image field — téléversement plutôt que saisie d'URL (RI-1395)
  logo: ImageUploadField,

  // Textarea fields
  abstract: AbstractField,

  // Price field
  price: PriceField,

  // Age field
  age: AgeField,

  // Commitment field
  commitment: CommitmentField,

  // Frequency field
  frequency: FrequencyField,

  // Session field
  periode: SessionField,

  // POI field
  map: PoiField,

  // Department field
  location: DepartmentField,

  // Theme field
  theme: ThemeSelectField,

  // Need field
  needs: NeedSelectField,
};

// =============================================================================
// Multi-enum fields (need options)
// =============================================================================

/** Fields that use MultiEnumField with options */
export const MULTI_ENUM_FIELDS = {
  publicStatus: MULTI_ENUM_OPTIONS.publicStatus,
  public: MULTI_ENUM_OPTIONS.public,
  frenchLevel: MULTI_ENUM_OPTIONS.frenchLevel,
  timeSlots: MULTI_ENUM_OPTIONS.timeSlots,
  conditions: MULTI_ENUM_OPTIONS.conditions,
};

// =============================================================================
// Helper
// =============================================================================

/**
 * Get the component for a field key.
 * Returns null if no specific component is defined.
 */
export function getFieldComponent(
  fieldKey: string,
): ComponentType<FieldProps> | null {
  return FIELD_COMPONENTS[fieldKey] ?? null;
}

/**
 * Check if a field is a multi-enum field and get its options.
 * Returns null if not a multi-enum field.
 */
export function getMultiEnumOptions(
  fieldKey: string,
): readonly { value: string; label: string }[] | null {
  return MULTI_ENUM_FIELDS[fieldKey as keyof typeof MULTI_ENUM_FIELDS] ?? null;
}

// Ajouter à la fin du fichier
export function getDisplayComponent(
  field: MetadataFieldDef,
  rawValue: unknown,
): ReactNode {
  // Check for multi-enum field
  const multiEnumOptions = getMultiEnumOptions(field.riKey);
  if (multiEnumOptions) {
    return (
      <MultiEnumField
        fieldKey={field.riKey}
        label={field.label}
        options={multiEnumOptions}
        placeholder=""
      />
    );
  }

  // Check for specific field component
  const FieldComponent = getFieldComponent(field.riKey);
  if (FieldComponent) {
    return (
      <FieldComponent
        fieldKey={field.riKey}
        label={field.label}
        placeholder="Cliquer pour modifier"
      />
    );
  }

  // Default rendering
  if (Array.isArray(rawValue)) return rawValue.join(", ");
  if (rawValue !== undefined && rawValue !== null) return String(rawValue);
  return <span className="text-gray-400">—</span>;
}
