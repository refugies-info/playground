import { createHash } from "node:crypto";
import stringify from "json-stable-stringify";

const DEFAULT_PAGE_SIZE = Number(process.env.DI_PAGE_SIZE) || 100;
const DEFAULT_BATCH_SIZE = 100;
const SOURCE_CARIF_OREF = "carif-oref";

/**
 * Compute SHA-1 hash of content (same algorithm as Git).
 * Used for detecting changes in DI records between ingestion runs.
 * Uses json-stable-stringify to ensure deterministic output
 * regardless of JSON key order.
 *
 * @param data - The content to hash (can be object or string)
 * @returns 40-character hex string
 */
export function computeContentHash(data: unknown): string {
  const stableString =
    (typeof data === "string" ? data : stringify(data)) || "";
  return createHash("sha1").update(stableString).digest("hex");
}

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
