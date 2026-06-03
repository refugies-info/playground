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
 * Sentinel schema indicating that no frontmatter is expected.
 * When passed to parseAgentResponse, content without frontmatter is treated as complete.
 */
export const NoFrontmatterSchema = z.void();

/**
 * Schema for metadata extracted from the metadata generation report.
 *
 * INGESTION LAYER (Layer 1): Accepts any shape for metadata_ri.
 * We only verify the YAML frontmatter is parsable and contains a
 * `metadata_ri` object. Individual field validation happens later:
 * - Layer 2 (publication): strict Typegoose-aligned schema (future PR)
 * - Layer 3 (editor): advisory validation with UI warnings (future PR)
 *
 * @see /docs/architecture/metadata-validation-strategy.md
 */
export const MetadataMetadataSchema = z
  .object({
    metadata_ri: z.record(z.string(), z.unknown()),
    provenance: z.array(z.unknown()).optional(),
  })
  .passthrough();

export type IngestionMetadata = z.infer<typeof IngestionMetadataSchema>;
export type MetadataMetadata = z.infer<typeof MetadataMetadataSchema>;
