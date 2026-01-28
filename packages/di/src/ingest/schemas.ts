import { z } from "zod";

/**
 * Base schema for DI items - validates the minimum required fields
 */
export const DiItemSchema = z.object({
  id: z.string(),
  nom: z.string(),
  source: z.string(),
});

/**
 * Schema for paginated API responses from Data Inclusion
 */
export const DiPageSchema = z.object({
  items: z.array(z.record(z.unknown())),
  total: z.number(),
  pages: z.number(),
});

/**
 * Schema for the full API response wrapper
 * Validates that we have either data or an error
 */
export const DiApiResponseSchema = z.object({
  data: DiPageSchema.optional(),
  error: z.unknown().optional(),
});

export type DiApiResponse = z.infer<typeof DiApiResponseSchema>;
