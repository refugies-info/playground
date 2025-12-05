export type DocumentStatus = "accepted" | "rejected";
export type DocumentState = "draft" | "to_process" | "archived" | "published";

export interface MockDocument {
  id: string;
  title: string;
  date_added: string;
  status: DocumentStatus;
  state: DocumentState;
  source: string;
  content: string;
  metadata: Record<string, unknown>;
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
