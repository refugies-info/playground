import type {
  ComplianceStatus,
  DateFilterCondition,
  DateFilterType,
  Document,
  DocumentSortField,
  Metadata,
  OnlineStatus,
  SearchField,
  WorkStatus,
} from "@playground/shared-types";
import {
  DATE_FILTER_COLUMNS,
  DEFAULT_DATE_FILTER_CONDITION,
  DEFAULT_DATE_FILTER_TYPE,
  injectFrontmatterContent,
  logger,
  nextIsoDay,
} from "@playground/shared-types";
import type { Database, Json } from "@playground/supabase";
import { createSupabaseServerClient } from "@playground/supabase";
import { cookies } from "next/headers";
import { extractAuthorProfile } from "./helpers";

/**
 * Type for the workflows_enriched view row
 */
type WorkflowEnriched =
  Database["public"]["Views"]["workflows_enriched"]["Row"];

const DOCUMENT_LIST_SELECT = `
  id,
  title,
  created_at,
  ingestion_created_at,
  updated_at,
  report_created_at,
  compliance_status,
  computed_work_status,
  computed_online_status,
  latest_publication,
  archived_at,
  structure_name,
  session_start_date,
  session_end_date,
  quality_score,
  rco_record_id,
  assignee_email,
  assignee_profile,
  commune,
  modalites_entrees_sorties,
  external_id,
  ingestion_word_count,
  active_ingestion_version,
  latest_ingestion_version,
  has_pending_ingestion_update
`;

const DOCUMENT_PREVIEW_FIELDS_SELECT = `
  editorial_markdown,
  editorial_metadata,
  ingestion_markdown,
  ingestion_metadata
`;

export interface GetDocumentsParams {
  page?: number;
  pageSize?: number;
  sortBy?: DocumentSortField;
  sortOrder?: "asc" | "desc";
  complianceStatus?: (string | null)[] | string | null;
  workStatus?: string | null;
  onlineStatus?: string | null;
  /** Début de session — session_start_date >= sessionStart (YYYY-MM-DD) */
  sessionStart?: string;
  /** Fin de session — session_end_date <= sessionEnd (YYYY-MM-DD) */
  sessionEnd?: string;
  /** Type de date filtré (RI-1371). Non renseigné = "Fin de session". */
  dateFilterType?: DateFilterType;
  /** Sens du filtre (RI-1371). Non renseigné = "Jusqu'à". */
  dateFilterCondition?: DateFilterCondition;
  /** Borne basse du filtre de date, incluse (YYYY-MM-DD) */
  dateFrom?: string;
  /** Borne haute du filtre de date, incluse (YYYY-MM-DD) */
  dateTo?: string;
  assigneeEmail?: string;
  /** Multi-column text search (title, external_id, structure_name, commune) */
  search?: string;
  /** Scope search to a single field. Unset = search across all default columns. */
  searchField?: SearchField;
  /** When true, extend `search` to editorial/ingestion markdown content - usefull to know if we are in "Importer du contenu" ou "Fiches" */
  searchInContent?: boolean;
  /** Filter by entry type: "0" (dates fixes) or "1" (entrées permanentes) */
  modalitesEntreesSorties?: string | null;
  /** Include large markdown/json fields. Used by /workflow preview drawer only. */
  includePreviewFields?: boolean;
}

export async function getDocuments(params: GetDocumentsParams) {
  const {
    page = 1,
    pageSize = 10,
    sortBy = "date_added",
    sortOrder = "desc",
    complianceStatus,
    workStatus,
    onlineStatus,
    sessionStart,
    sessionEnd,
    dateFilterType,
    dateFilterCondition,
    dateFrom,
    dateTo,
    assigneeEmail,
    search,
    searchField,
    searchInContent = false,
    modalitesEntreesSorties,
    includePreviewFields = false,
  } = params;

  const cookieStore = await cookies();
  const supabase = createSupabaseServerClient(cookieStore);

  // Use the enriched view - single query with all needed data
  let query = supabase
    .from("workflows_enriched")
    .select(
      includePreviewFields
        ? `${DOCUMENT_LIST_SELECT},${DOCUMENT_PREVIEW_FIELDS_SELECT}`
        : DOCUMENT_LIST_SELECT,
      { count: "exact" },
    );

  // Apply filters
  if (complianceStatus) {
    if (Array.isArray(complianceStatus)) {
      const nonNullStatuses = complianceStatus.filter(
        (s) => s !== null,
      ) as string[];
      const hasNull = complianceStatus.includes(null);

      if (nonNullStatuses.length > 0 && hasNull) {
        query = query.or(
          `compliance_status.in.(${nonNullStatuses.map((s) => `"${s}"`).join(",")}),compliance_status.is.null`,
        );
      } else if (hasNull) {
        query = query.is("compliance_status", null);
      } else {
        query = query.in("compliance_status", nonNullStatuses);
      }
    } else if (complianceStatus === null) {
      query = query.is("compliance_status", null);
    } else {
      query = query.eq("compliance_status", complianceStatus);
    }
  } else {
    // By default, exclude documents that are still being processed or have failed
    // NULL = not yet evaluated, pending = AI processing, error = failed
    // Note: pending workflows are only visible in /workflow, not /documents
    query = query.not("compliance_status", "in", '("pending","error")');
    query = query.not("compliance_status", "is", null);
  }

  // Use computed_work_status for filtering
  if (workStatus) {
    query = query.eq("computed_work_status", workStatus);
  }

  // Use computed_online_status for filtering
  if (onlineStatus) {
    if (onlineStatus === "unpublished") {
      query = query.is("computed_online_status", null);
    } else {
      query = query.eq("computed_online_status", onlineStatus);
    }
  }

  // Début de session : session_start_date >= sessionStart
  if (sessionStart) {
    query = query.gte("session_start_date", sessionStart);
  }
  // Fin de session : session_end_date <= sessionEnd
  if (sessionEnd) {
    query = query.lte("session_end_date", sessionEnd);
  }

  // Filtre de date multi-types (RI-1371) — bornes incluses des deux côtés.
  // La condition détermine quelles bornes sont retenues : une URL bricolée à la
  // main ne peut pas appliquer une borne que le formulaire n'affiche pas.
  if (dateFrom || dateTo) {
    const { column, isTimestamp } =
      DATE_FILTER_COLUMNS[dateFilterType ?? DEFAULT_DATE_FILTER_TYPE];
    const condition = dateFilterCondition ?? DEFAULT_DATE_FILTER_CONDITION;

    if (dateFrom && condition !== "until") {
      query = query.gte(column, dateFrom);
    }
    if (dateTo && condition !== "from") {
      // Sur un horodatage, inclure toute la journée = borner au lendemain exclu.
      query = isTimestamp
        ? query.lt(column, nextIsoDay(dateTo))
        : query.lte(column, dateTo);
    }
  }

  // Filter by assignee email (editors/admins only — translators excluded from dropdown)
  if (assigneeEmail === "__unassigned__") {
    query = query.is("assignee_email", null);
  } else if (assigneeEmail) {
    query = query.eq("assignee_email", assigneeEmail);
  }

  // Filter by entry type (modalités d'entrées/sorties)
  if (modalitesEntreesSorties) {
    query = query.eq("modalites_entrees_sorties", modalitesEntreesSorties);
  }

  // Multi-column text search (title, external_id, structure_name, commune).
  // When searchInContent, also match editorial/ingestion markdown (heavier scan).
  // Uses ilike for case-insensitive substring matching.
  if (search) {
    const term = `%${search}%`;
    if (searchField) {
      // Scoped: match only the selected column.
      query = query.ilike(searchField, term);
    } else {
      // Search-all (default): title, external_id, structure_name, commune.
      const columns = [
        "title",
        "external_id",
        "structure_name",
        "commune",
        ...(searchInContent
          ? ["editorial_markdown", "ingestion_markdown"]
          : []),
      ];
      // Quote the value so reserved chars (, ( )) in the term are treated
      // literally by PostgREST's .or() parser instead of breaking it.
      const orTerm = `"${term.replace(/"/g, '\\"')}"`;
      query = query.or(
        columns.map((col) => `${col}.ilike.${orTerm}`).join(","),
      );
    }
  }

  // Apply sorting
  const sortFieldMap: Record<DocumentSortField, string> = {
    date_added: "created_at",
    arbitrationDate: "report_created_at",
    updated_at: "updated_at",
    compliance_status: "compliance_status",
    work_status: "computed_work_status",
    online_status: "computed_online_status",
    title: "title",
    id: "id",
    qualityScore: "quality_score",
    structureName: "structure_name",
    sessionStartDate: "session_start_date",
    assigneeEmail: "assignee_email",
    commune: "commune",
    modalitesEntreesSorties: "modalites_entrees_sorties",
    wordCount: "ingestion_word_count",
    activeIngestionVersion: "active_ingestion_version",
  };

  const dbColumn = sortFieldMap[sortBy];
  if (!dbColumn) {
    throw new Error(`Unsupported sort field: ${sortBy}`);
  }

  query = query.order(dbColumn, { ascending: sortOrder === "asc" });

  // Apply pagination
  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize - 1;
  query = query.range(startIndex, endIndex);

  const { data, error, count } = await query;

  if (error) {
    logger.error(error, "Error fetching documents from Supabase");
    throw new Error(`Failed to fetch documents: ${error.message}`);
  }

  const rows = data as unknown as WorkflowEnriched[];

  const cleanBaseUrl = (process.env.RI_BASE_URL || "").replace(/\/$/, "");

  // Map directly from enriched view - no N+1 query needed
  const documents = rows
    .map((item): Document | null => {
      // Skip items without ID
      if (!item.id) {
        logger.warn("Workflow without ID found, skipping");
        return null;
      }

      // Keep list rows light by default: full content and merged metadata are
      // fetched only on detail pages, or explicitly for the /workflow preview
      // drawer. Selecting large markdown/json fields on /documents causes
      // PostgREST to serialize tens of MB on staging dumps and can hit the role
      // statement_timeout.
      const ingestionMetadata = includePreviewFields
        ? ((item.ingestion_metadata as Metadata) ?? {})
        : {};
      const editorialMetadata = includePreviewFields
        ? ((item.editorial_metadata as Metadata) ?? {})
        : {};
      const metadata: Metadata = includePreviewFields
        ? {
            ...ingestionMetadata,
            ...editorialMetadata,
          }
        : item.external_id
          ? { id: item.external_id }
          : {};

      // Preserve critical identifiers when preview metadata is selected.
      if (includePreviewFields) {
        if (ingestionMetadata.id) metadata.id = ingestionMetadata.id;
        if (ingestionMetadata.structure_id) {
          metadata.structure_id = ingestionMetadata.structure_id;
        }
      }

      const content = includePreviewFields
        ? item.editorial_markdown || item.ingestion_markdown || ""
        : "";

      // Parse publication info from JSONB
      const latestPublication = item.latest_publication as {
        remote_id?: string;
        status?: string;
        updated_at?: string;
        created_at?: string;
      } | null;

      const publishedUrl =
        latestPublication?.remote_id && cleanBaseUrl
          ? `${cleanBaseUrl}/dispositif/${latestPublication.remote_id}`
          : undefined;

      // Date added: created_at (date de création du workflow)
      // Fallback chain: workflow.created_at should always be set, but we guard defensively.
      const dateAdded =
        item.created_at ?? item.ingestion_created_at ?? item.updated_at ?? null;

      // Parse assignee profile from JSONB
      const assigneeProfile = item.assignee_profile as {
        email?: string;
        role?: string;
      } | null;
      const { email: assigneeEmail, role: assigneeRole } =
        extractAuthorProfile(assigneeProfile);

      return {
        id: item.id,
        title: item.title || "Untitled",
        date_added: dateAdded ?? "",
        arbitrationDate: item.report_created_at ?? null,
        complianceStatus: (item.compliance_status as ComplianceStatus) ?? null,
        workStatus: (item.computed_work_status as WorkStatus) ?? null,
        onlineStatus: (item.computed_online_status as OnlineStatus) ?? null,
        content,
        metadata,
        publishedUrl,
        publicationStatus: latestPublication?.status,
        publicationRemoteId: latestPublication?.remote_id,
        // publication_records est append-only : created_at = date de l'action de publication
        publishedAt: latestPublication?.created_at ?? null,
        archivedAt: item.archived_at ?? null,
        structureName: item.structure_name ?? undefined,
        sessionStartDate: item.session_start_date ?? undefined,
        sessionEndDate: item.session_end_date ?? null,
        qualityScore: item.quality_score ?? undefined,
        sourceSystem: item.rco_record_id ? "RCO" : "DI",
        updated_at: item.updated_at || "",
        editorialRecordId: item.editorial_record_id ?? undefined,
        assigneeEmail,
        assigneeRole,
        commune: item.commune ?? null,
        modalitesEntreesSorties: item.modalites_entrees_sorties ?? null,
        externalId: item.external_id ?? null,
        wordCount:
          (item as unknown as { ingestion_word_count: number | null })
            .ingestion_word_count ?? null,
        activeIngestionVersion: item.active_ingestion_version ?? null,
        latestIngestionVersion: item.latest_ingestion_version ?? null,
        hasPendingIngestionUpdate: item.has_pending_ingestion_update ?? false,
      };
    })
    .filter((doc): doc is Document => doc !== null);

  return {
    data: documents,
    total: count || 0,
    page,
    pageSize,
    totalPages: Math.ceil((count || 0) / pageSize),
  };
}

export async function getDocumentById(id: string): Promise<Document | null> {
  const cookieStore = await cookies();
  const supabase = createSupabaseServerClient(cookieStore);

  // Use enriched view for single document too
  const { data, error } = await supabase
    .from("workflows_enriched")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    if (error.code !== "PGRST116") {
      logger.error(error, "Error fetching workflow by ID");
    }
    return null;
  }

  if (!data) {
    return null;
  }

  const item = data as WorkflowEnriched;

  // For single document, we still need letta_reports for compliance report
  // Fetch separately as it's not in the enriched view
  type IngestionWithReports = {
    markdown: string;
    metadata: Json;
    created_at: string;
    metadata_report_id: string | null;
    compliance_report:
      | { markdown: string; created_at?: string }
      | { markdown: string; created_at?: string }[]
      | null;
  };
  let ingestionRecord: IngestionWithReports | null = null;

  // Fetch the active ingestion record, metadata generation flag, and active rewrite
  // in parallel. Compliance and metadata reports are tied to the active ingestion
  // source so pending updates cannot shadow the current fiche.
  const [ingestionResult, generatingReportResult, activeRunResult] =
    await Promise.all([
      item.ingestion_record_id
        ? supabase
            .from("ingestion_records")
            .select(
              `
              markdown,
              metadata,
              created_at,
              metadata_report_id,
              compliance_report:letta_reports!ingestion_records_ingestion_report_id_fkey (
                markdown,
                created_at
              )
            `,
            )
            .eq("id", item.ingestion_record_id)
            .single()
        : Promise.resolve({ data: null, error: null }),
      // Check if a metadata generation is currently in progress for this workflow.
      // Used by the UI to restore the loading state after a page refresh.
      supabase
        .from("letta_reports")
        .select("id")
        .eq("workflow_id", id)
        .eq("report_type", "metadata")
        .eq("status", "generating")
        .maybeSingle(),
      // Check if an editorial AI rewrite is in progress or pending user decision.
      // Used by AIFloatingButton to resume via GET /api/editorial-rewrite/[runId].
      item.editorial_record_id
        ? supabase
            .from("editorial_records")
            .select("active_run_id, current_editor_id")
            .eq("id", item.editorial_record_id)
            .single()
        : Promise.resolve({ data: null, error: null }),
    ]);

  if (ingestionResult.data) {
    ingestionRecord = ingestionResult.data as unknown as IngestionWithReports;
  }

  const activeRunData = {
    activeRunId: activeRunResult.data?.active_run_id ?? undefined,
    currentEditorId: activeRunResult.data?.current_editor_id ?? undefined,
  };

  let currentEditorName: string | undefined;

  if (activeRunData.currentEditorId) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("username, email")
      .eq("id", activeRunData.currentEditorId)
      .maybeSingle();
    currentEditorName = profile?.username ?? profile?.email ?? undefined;
  }

  const metadataReportId = ingestionRecord?.metadata_report_id ?? null;

  const metadataReportResult = metadataReportId
    ? await supabase
        .from("letta_reports")
        .select("id, metadata, status")
        .eq("id", metadataReportId)
        .eq("report_type", "metadata")
        .eq("status", "complete")
        .maybeSingle()
    : { data: null, error: null };

  // Merge metadata
  const ingestionMetadata = (item.ingestion_metadata as Metadata) || {};
  const editorialMetadata = (item.editorial_metadata as Metadata) || {};

  const metadata: Metadata = {
    ...ingestionMetadata,
    ...editorialMetadata,
  };

  // Preserve critical identifiers
  if (ingestionMetadata.id) metadata.id = ingestionMetadata.id;
  if (ingestionMetadata.structure_id)
    metadata.structure_id = ingestionMetadata.structure_id;

  // Content with frontmatter injection for DI records
  let content = item.editorial_markdown || item.ingestion_markdown || "";
  const ingestionContent = item.ingestion_markdown
    ? injectFrontmatterContent(item.ingestion_markdown)
    : "";

  if (!item.editorial_markdown && item.ingestion_markdown) {
    content = injectFrontmatterContent(item.ingestion_markdown);
  }

  // Compliance report from letta_reports
  let complianceReport = "";
  if (ingestionRecord) {
    const lettaReportsData = ingestionRecord.compliance_report;
    if (lettaReportsData) {
      const report = Array.isArray(lettaReportsData)
        ? lettaReportsData[0]
        : lettaReportsData;
      if (report?.markdown) {
        complianceReport = report.markdown;
      }
    }
  }

  // Publication URL
  const cleanBaseUrl = (process.env.RI_BASE_URL || "").replace(/\/$/, "");
  const latestPublication = item.latest_publication as {
    remote_id?: string;
    status?: string;
    updated_at?: string;
    created_at?: string;
  } | null;
  const publishedUrl =
    latestPublication?.remote_id && cleanBaseUrl
      ? `${cleanBaseUrl}/dispositif/${latestPublication.remote_id}`
      : undefined;

  // Date added: created_at (date de création du workflow)
  // Fallback chain: workflow.created_at should always be set, but we guard defensively.
  const dateAdded =
    item.created_at ?? item.ingestion_created_at ?? item.updated_at ?? null;

  // Assignee
  const assigneeProfile = item.assignee_profile as {
    email?: string;
    role?: string;
  } | null;
  const { email: assigneeEmail, role: assigneeRole } =
    extractAuthorProfile(assigneeProfile);

  // ID is required - should never be null after the data check above
  if (!item.id) {
    logger.error({ workflowId: id }, "Workflow found but ID is null");
    return null;
  }

  // Extract metadata report if available and complete
  const report = metadataReportResult.data as {
    id: string;
    metadata: Record<string, unknown> | string;
    status: string;
  } | null;

  let metadataReportValue: Document["metadataReport"] = null;
  if (report && report.status === "complete") {
    let metadata: Record<string, unknown> | null = report.metadata as Record<
      string,
      unknown
    >;
    if (typeof report.metadata === "string") {
      try {
        metadata = JSON.parse(report.metadata);
      } catch {
        metadata = null;
      }
    }
    if (metadata) {
      const metadataObj = metadata as Record<string, unknown>;
      metadataReportValue = {
        id: report.id,
        metadata_ri: (metadataObj.metadata_ri as Record<string, unknown>) ?? {},
        provenance: metadataObj.provenance as
          | {
              key: string;
              label: string;
              value: string;
              status: string;
              source?: unknown;
            }[]
          | undefined,
      };
    }
  }

  return {
    id: item.id,
    title: item.title || "Untitled",
    date_added: dateAdded ?? "",
    arbitrationDate: item.report_created_at ?? null,
    complianceStatus: (item.compliance_status as ComplianceStatus) ?? null,
    workStatus: (item.computed_work_status as WorkStatus) ?? null,
    onlineStatus: (item.computed_online_status as OnlineStatus) ?? null,
    content,
    ingestionContent,
    complianceReport,
    metadata,
    editorialMetadata,
    editorialRecordId: item.editorial_record_id ?? undefined,
    isMetadataGenerating: !!generatingReportResult.data,
    metadataReport: metadataReportValue,
    publishedUrl,
    publicationStatus: latestPublication?.status,
    publicationRemoteId: latestPublication?.remote_id,
    // publication_records est append-only : created_at = date de l'action de publication
    publishedAt: latestPublication?.created_at ?? null,
    archivedAt: item.archived_at ?? null,
    structureName: item.structure_name ?? undefined,
    sessionStartDate: item.session_start_date ?? undefined,
    sessionEndDate: item.session_end_date ?? null,
    qualityScore: item.quality_score ?? undefined,
    sourceSystem: item.rco_record_id ? "RCO" : "DI",
    updated_at: item.updated_at ?? "",
    assigneeEmail,
    assigneeRole,
    externalId: item.external_id ?? null,
    activeIngestionVersion: item.active_ingestion_version ?? null,
    latestIngestionVersion: item.latest_ingestion_version ?? null,
    hasPendingIngestionUpdate: item.has_pending_ingestion_update ?? false,
    // AI editorial rewrite — runId for resume via GET /api/editorial-rewrite/[runId]
    activeRunId: activeRunData.activeRunId,
    currentEditorId: activeRunData.currentEditorId,
    currentEditorName: currentEditorName,
  };
}
