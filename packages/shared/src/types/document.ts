export type ComplianceStatus =
  | "compliant"
  | "non_compliant"
  | "error"
  | "pending";
export type WorkStatus = "to_process" | "draft";
export type OnlineStatus = "published" | "unpublished" | "archived";

// Derived state for backward compatibility or UI logic
export type DocumentSortField =
  | "title"
  | "date_added"
  | "updated_at"
  | "compliance_status"
  | "work_status"
  | "online_status"
  | "id"
  | "qualityScore"
  | "structureName"
  | "sessionStartDate"
  | "authorEmail"
  | "commune"
  | "modalitesEntreesSorties";

export interface Document {
  id: string;
  title: string;
  date_added: string;
  complianceStatus: ComplianceStatus | null;
  workStatus: WorkStatus | null;
  onlineStatus: OnlineStatus;
  content: string;
  ingestionContent?: string; // Immutable original content from ingestion_records
  complianceReport?: string; // Markdown content of the compliance report
  metadata: Record<string, unknown>;
  /** Metadata from editorial_records only (user edits) */
  editorialMetadata?: Record<string, unknown>;
  /** True if a metadata generation is currently in progress */
  isMetadataGenerating?: boolean;
  /** AI-generated metadata from letta_reports (type: metadata, status: complete) */
  metadataReport?: {
    metadata_ri: Record<string, unknown>;
    provenance?: Array<{
      key: string;
      label: string;
      value: string;
      status: string;
      source: string[];
    }>;
  } | null;
  editorialRecordId?: string;
  publishedUrl?: string;
  publicationStatus?: string;
  publicationRemoteId?: string;
  structureName?: string;
  sessionStartDate?: string;
  qualityScore?: number | null;
  sourceSystem: "RCO" | "DI";
  updated_at: string;
  authorEmail?: string;
  authorRole?: string;
  /** Commune from metadata, e.g. "Blois", "Mantes-la-Jolie" */
  commune?: string | null;
  /** Modalités entrées/sorties: "0" (permanentes) | "1" (dates fixes) | null */
  modalitesEntreesSorties?: string | null;
  /** ID Carif-Oref from ingestion metadata (e.g. training offer ID) */
  externalId?: string | null;
}

export interface RiMetadata {
  public: "family" | "women" | "youths" | "senior" | "gender";
}

export interface ContentItem {
  id: string;
  title: string;
  content: string;
  source: string;
  complianceStatus: ComplianceStatus | null;
  workStatus: WorkStatus;
  onlineStatus: OnlineStatus;
  date_added: string;
  metadata: Record<string, unknown>;
  originalText?: string;
  languageCode?: string;
  sourceSystem?: string;
  sourceRecordId?: string;
  createdAt?: string;
  createdBy?: string;
  updated_at?: string;
}
