import { createHash } from "node:crypto";
import stringify from "json-stable-stringify";

const DEFAULT_PAGE_SIZE = Number(process.env.DI_PAGE_SIZE) || 100;
const DEFAULT_BATCH_SIZE = 100;
const SOURCE_CARIF_OREF = "carif-oref";

/**
 * Recursively sort all arrays in a value.
 * Required because json-stable-stringify sorts object keys but NOT array values.
 * The DI API may return the same array values in different order between runs
 * (e.g. modes_mobilisation: ["envoyer-un-courriel", "telephoner"] vs
 * ["telephoner", "envoyer-un-courriel"]), which would produce different hashes
 * for semantically identical records.
 *
 * See: https://github.com/ljharb/json-stable-stringify/issues/12
 */
function sortArraysDeep(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value
      .map(sortArraysDeep)
      .sort((a, b) => {
        const sa =
          a !== null && typeof a === "object" ? stringify(a) : String(a);
        const sb =
          b !== null && typeof b === "object" ? stringify(b) : String(b);
        return sa < sb ? -1 : sa > sb ? 1 : 0;
      });
  }
  if (value !== null && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).map(([k, v]) => [
        k,
        sortArraysDeep(v),
      ]),
    );
  }
  return value;
}

/**
 * Compute SHA-1 hash of content (same algorithm as Git).
 * Used for detecting changes in DI records between ingestion runs.
 * Uses json-stable-stringify to ensure deterministic output
 * regardless of JSON key order, and sorts array values to handle
 * cases where the DI API returns the same values in different order.
 *
 * @param data - The content to hash (can be object or string)
 * @returns 40-character hex string
 */
export function computeContentHash(data: unknown): string {
  const normalized = typeof data === "string" ? data : sortArraysDeep(data);
  const stableString =
    (typeof normalized === "string" ? normalized : stringify(normalized)) || "";
  return createHash("sha1").update(stableString).digest("hex");
}

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
