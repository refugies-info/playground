import type { IngestionSource } from "../../../types";

/**
 * Interface for source-specific data adapters.
 * Implement this interface to add support for new data sources (e.g., DI, other APIs).
 *
 * @example
 * ```typescript
 * const rcoAdapter: SourceAdapter = {
 *   source: "rco",
 *   async fetchRawData(recordId) { ... },
 *   async parseToDocument(rawData) { ... },
 *   async extractMetadata(rawData) { ... },
 * };
 * ```
 */
export interface SourceAdapter {
  /** Unique identifier for this data source */
  source: IngestionSource;

  /**
   * Fetches raw data from the source.
   * @param recordId - The ID of the record in the source table
   * @returns Raw data string (e.g., XML for RCO)
   */
  fetchRawData(recordId: string): Promise<string>;

  /**
   * Parses raw data into a standardized document structure.
   * @param rawData - The raw data string from fetchRawData
   * @returns Parsed document ready for markdown generation
   */
  parseToDocument(rawData: string): Promise<Record<string, unknown>>;

  /**
   * Extracts metadata for frontmatter generation.
   * @param rawData - The raw data string
   * @returns Metadata object for the document frontmatter
   */
  extractMetadata(rawData: string): Promise<Record<string, unknown>>;
}
