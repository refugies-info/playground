export interface IngestionResult {
  rcoRecordId: string;
  ingestionRecordId: string;
  status: "success" | "error";
  error?: unknown;
  reportResults?: {
    type: string;
    status: "success" | "error";
    error?: unknown;
  }[];
}
