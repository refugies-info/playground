const DEFAULT_PAGE_SIZE = Number(process.env.DI_PAGE_SIZE) || 100;
const DEFAULT_BATCH_SIZE = 100;
const SOURCE_CARIF_OREF = "carif-oref";

export interface DiIngestionOptions {
  /** Number of items per API page (default: 100) */
  pageSize?: number;
  /** Maximum number of structures to fetch (default: unlimited) */
  limit?: number;
  /** Progress callback called after each page fetch */
  onProgress?: (current: number, total: number | null) => void;
  /** Additional query parameters to pass to the API */
  extraQueryParams?: Record<string, unknown>;
}

export { DEFAULT_BATCH_SIZE, DEFAULT_PAGE_SIZE, SOURCE_CARIF_OREF };
