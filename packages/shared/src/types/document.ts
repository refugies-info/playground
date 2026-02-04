export type DocumentStatus = "compliant" | "non_compliant" | "error";
export type DocumentState = "to_process" | "draft" | "published" | "archived";
export type DocumentSortField =
  | "title"
  | "date_added"
  | "updated_at"
  | "status"
  | "state";

export interface Document {
  id: string;
  title: string;
  date_added: string;
  status: string;
  state: string;
  content: string;
  ingestionContent?: string; // Immutable original content from ingestion_records
  complianceReport?: string; // Markdown content of the compliance report
  metadata: Record<string, unknown>;
  publishedUrl?: string;
  publicationStatus?: string;
  publicationRemoteId?: string;
  structureName?: string;
  sessionStartDate?: string;
  sourceSystem?: string;
}

export interface ContentItem {
  id: string;
  title: string;
  content: string;
  source: string;
  status: DocumentStatus;
  state: DocumentState;
  date_added: string;
  metadata: Record<string, unknown>;
  originalText?: string;
  languageCode?: string;
  sourceSystem?: string;
  sourceRecordId?: string;
  createdAt?: string;
  createdBy?: string;
}
