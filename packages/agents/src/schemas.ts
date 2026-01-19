import { z } from "zod";

/**
 * Schema for metadata extracted from the ingestion (audit) report.
 * Validates that compliance and duplication checks were performed.
 */
export const IngestionMetadataSchema = z.object({
  compliant: z.boolean(),
  duplicate: z.boolean(),
});

/**
 * Schema for metadata extracted from the editorial (redaction) report.
 * Focuses on potential metadata fields produced during simplification.
 */
export const EditorialMetadataSchema = z
  .object({
    // Add specific editorial fields here if needed.
    // For now, we allow any fields but validate the structure.
  })
  .passthrough();

/**
 * Schema for metadata extracted from the metadata generation report.
 * Validates that essential RI metadata fields are present.
 */
export const MetadataMetadataSchema = z
  .object({
    // Based on the expected metadata for a Refugies.info dispositif
    title: z.string().optional(),
    abstract: z.string().optional(),
    // Add more specific fields as they become standardized in the prompt
  })
  .passthrough();

export type IngestionMetadata = z.infer<typeof IngestionMetadataSchema>;
export type EditorialMetadata = z.infer<typeof EditorialMetadataSchema>;
export type MetadataMetadata = z.infer<typeof MetadataMetadataSchema>;
