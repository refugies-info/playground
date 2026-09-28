export { computeContentHash } from "@playground/supabase/ingestion-runs";

const DEFAULT_PAGE_SIZE = Number(process.env.DI_PAGE_SIZE) || 100;
const DEFAULT_BATCH_SIZE = 100;
const SOURCE_CARIF_OREF = "carif-oref";

export interface DiIngestionOptions<T = any> {
  /** Number of items per API page (default: 100) */
  pageSize?: number;
  /** Maximum number of structures to fetch (default: unlimited) */
  limit?: number;
  /** Progress callback called after each page fetch */
  onProgress?: (current: number, total: number | null) => void;
  /** Additional query parameters to pass to the API */
  extraQueryParams?: Record<string, unknown>;
  /** Optional filter function to apply to each item before ingestion */
  filter?: (item: T) => boolean;
  /** Optional function to generate a key for deduplication */
  deduplicateKey?: (item: T) => string;
  /** If true, excludes ALL occurrences of a duplicate key instead of keeping the first one */
  excludeAllDuplicates?: boolean;
}

export { DEFAULT_BATCH_SIZE, DEFAULT_PAGE_SIZE, SOURCE_CARIF_OREF };
