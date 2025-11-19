/**
 * ContentItem represents a piece of content ingested from a source system.
 * Supports multiple source systems (RCO, manual upload, etc.) with language tracking.
 */
export interface ContentItem {
  /** Unique identifier (UUID) */
  id: string;
  /** Original text content as ingested */
  originalText: string;
  /** Language code (locked to 'fr' for POC) */
  languageCode: "fr";
  /** Source system identifier (e.g., 'manual_upload', 'rco_api') */
  sourceSystem: string;
  /** Record ID from source system for traceability */
  sourceRecordId: string;
  /** ISO timestamp of ingestion */
  createdAt: string;
  /** User ID who created/ingested this item */
  createdBy: string;
}
