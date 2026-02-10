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
  | "online_status";

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
