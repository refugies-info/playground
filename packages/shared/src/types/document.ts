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
