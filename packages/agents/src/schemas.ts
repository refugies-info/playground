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
 * Validates that essential RI metadata fields are present, matching the Refugies.info dispositif structure.
 */
export const MetadataMetadataSchema = z
  .object({
    metadata_ri: z
      .object({
        mainSponsor: z.string().optional(),
        needs: z.array(z.string()).optional(),
        secondaryThemes: z.array(z.string()).optional(),
        theme: z.string().optional(),
        titreInformatif: z.string().optional(),
        titreMarque: z.string().optional(),
        abstract: z.string().optional(),
        location: z.string().optional(),
        frenchLevel: z.array(z.string()).optional(),
        age: z.array(z.union([z.string(), z.number()])).optional(),
        price: z
          .array(
            z.object({
              values: z.array(z.string()),
              details: z.string().optional(),
            }),
          )
          .optional(),
        publicStatus: z.array(z.string()).optional(),
        public: z.array(z.string()).optional(),
        conditions: z.string().optional(),
        commitment: z
          .array(
            z.object({
              amountDetails: z.string(),
              hours: z.array(z.number()),
              timeUnit: z.string(),
            }),
          )
          .optional(),
        frequency: z
          .array(
            z.object({
              amountDetails: z.string(),
              hours: z.array(z.number()),
              timeUnit: z.string(),
              frequencyUnit: z.string().optional(),
            }),
          )
          .optional(),
        timeSlots: z.array(z.string()).optional(),
        periode: z
          .array(
            z.object({
              debut: z.object({ $date: z.string() }),
              fin: z.object({ $date: z.string() }),
            }),
          )
          .optional(),
      })
      .passthrough(),
  })
  .passthrough();

export type IngestionMetadata = z.infer<typeof IngestionMetadataSchema>;
export type EditorialMetadata = z.infer<typeof EditorialMetadataSchema>;
export type MetadataMetadata = z.infer<typeof MetadataMetadataSchema>;
