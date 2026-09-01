export type ComplianceStatus =
  | "compliant"
  | "non_compliant"
  | "error"
  | "pending";
export type WorkStatus = "to_process" | "draft" | "to_review";
export type OnlineStatus = "published" | "unpublished" | "archived";

/**
 * Colonnes triables, indexées par l'`id` de colonne TanStack émis par
 * DataTableColumnHeader. Source unique : les pages ne redéclarent pas leur
 * propre whitelist, sinon une colonne triable côté UI retombe silencieusement
 * sur le tri par défaut (RI-1445).
 */
export const DOCUMENT_SORT_FIELDS = [
  "title",
  "date_added",
  "arbitrationDate",
  "updated_at",
  "compliance_status",
  "work_status",
  "online_status",
  "id",
  "externalId",
  "structureName",
  "sessionStartDate",
  "assigneeEmail",
  "commune",
  "modalitesEntreesSorties",
  "wordCount",
  "activeIngestionVersion",
] as const;

export type DocumentSortField = (typeof DOCUMENT_SORT_FIELDS)[number];

/** Narrow an untrusted query-param string to a valid DocumentSortField. */
export function parseDocumentSortField(
  value: string | undefined,
  fallback: DocumentSortField,
): DocumentSortField {
  return value && (DOCUMENT_SORT_FIELDS as readonly string[]).includes(value)
    ? (value as DocumentSortField)
    : fallback;
}

export interface Document {
  id: string;
  title: string;
  date_added: string;
  arbitrationDate?: string | null;
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
    /** letta_reports row id — used as a change-detection key after regeneration */
    id: string;
    metadata_ri: Record<string, unknown>;
    provenance?: Array<{
      key: string;
      label: string;
      value: string;
      status: string;
      source?: unknown;
    }>;
  } | null;
  editorialRecordId?: string;
  publishedUrl?: string;
  publicationStatus?: string;
  publicationRemoteId?: string;
  publishedAt?: string | null;
  archivedAt?: string | null;
  archivedAtIsApproximate?: boolean;
  structureName?: string;
  sessionStartDate?: string;
  sessionEndDate?: string | null;
  sourceSystem: "RCO" | "DI";
  updated_at: string;
  assigneeEmail?: string;
  assigneeAvatar?: string;
  assigneeRole?: string;
  /** Commune from metadata, e.g. "Blois", "Mantes-la-Jolie" */
  commune?: string | null;
  /** Entry/exit modalities: "0" (rolling admission) | "1" (fixed dates) | null */
  modalitesEntreesSorties?: string | null;
  /** ID Carif-Oref from ingestion metadata (e.g. training offer ID) */
  externalId?: string | null;
  /** Word count from ingestion markdown (frontmatter excluded) */
  wordCount?: number | null;
  /** Active/accepted ingestion version used by the workflow */
  activeIngestionVersion?: number | null;
  /** Latest available ingestion version for the workflow */
  latestIngestionVersion?: number | null;
  /** True when a newer ingestion version exists but is not active yet */
  hasPendingIngestionUpdate?: boolean;
  /** Vercel Workflow runId when an AI editorial rewrite is in progress or waiting for user decision */
  activeRunId?: string;
  /** User ID currently holding the edit lock on this fiche (NULL if free) */
  currentEditorId?: string | null;
  /** Display name of the user currently holding the edit lock on this fiche (NULL if free) */
  currentEditorName?: string | null;
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
