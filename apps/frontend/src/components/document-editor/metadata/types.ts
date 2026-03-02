/**
 * Metadata Types
 * Shared across all publication targets
 */

/**
 * Definition of a metadata field for display.
 */
export interface MetadataFieldDef {
  /** Display label in the "Metadata" column */
  label: string;
  /** Primary key in metadata_ri object */
  riKey: string;
  /** Additional keys to check for modified status (e.g., secondaryThemes for theme) */
  relatedKeys?: string[];
}

/**
 * Status of a metadata field.
 */
export type MetadataFieldStatus =
  | "pristine"
  | "modified"
  | "saving"
  | "saved"
  | "error"
  | "fixed"; // Auto-fix applied
