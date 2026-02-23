import type {
  ComplianceStatus,
  Document,
  DocumentSortField,
  Metadata,
  OnlineStatus,
  WorkStatus,
} from "@playground/shared-types";
import { injectFrontmatterContent, logger } from "@playground/shared-types";
import type { Database, Json } from "@playground/supabase";
import { createSupabaseServerClient } from "@playground/supabase";
import { cookies } from "next/headers";
import { extractAuthorProfile } from "./helpers";

/**
 * Type for the workflows_enriched view row
 */
type WorkflowEnriched =
  Database["public"]["Views"]["workflows_enriched"]["Row"];

export interface GetDocumentsParams {
  page?: number;
  pageSize?: number;
  sortBy?: DocumentSortField;
  sortOrder?: "asc" | "desc";
  complianceStatus?: (string | null)[] | string | null;
  workStatus?: string | null;
  onlineStatus?: string | null;
  dateFrom?: string;
  dateTo?: string;
  searchId?: string;
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
    dateFrom,
    dateTo,
    searchId,
  } = params;

  const cookieStore = await cookies();
  const supabase = createSupabaseServerClient(cookieStore);

  // Build select string - include all fields from the view
  // For searchId filter on ingestion metadata, we need to join with ingestion_records
  const selectString = searchId
    ? `
      *,
      ingestion_records!inner (
        metadata
      )
    `
    : "*";

  // Use the enriched view - single query with all needed data
  let query = supabase
    .from("workflows_enriched")
    .select(selectString, { count: "exact" });

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

  // Date filters use session_start_date (actual training/session start date)
  if (dateFrom) {
    query = query.gte("session_start_date", dateFrom);
  }

  if (dateTo) {
    query = query.lte("session_start_date", dateTo);
  }

  if (searchId) {
    query = query.ilike("ingestion_records.metadata->>id", `%${searchId}%`);
  }

  // Apply sorting
  const sortFieldMap: Record<DocumentSortField, string> = {
    date_added: "updated_at",
    updated_at: "updated_at",
    compliance_status: "compliance_status",
    work_status: "computed_work_status",
    online_status: "computed_online_status",
    title: "title",
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
  const documents: Document[] = rows.map((item) => {
    // Merge metadata from ingestion and editorial
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

    // Content priority: editorial > ingestion
    const content = item.editorial_markdown || item.ingestion_markdown || "";

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

    // Date added: report_created_at > ingestion_created_at > updated_at
    const dateAdded =
      item.report_created_at || item.ingestion_created_at || item.updated_at;

    // Parse author profile from JSONB
    const authorProfile = item.author_profile as {
      email?: string;
      role?: string;
    } | null;
    const { email: authorEmail, role: authorRole } =
      extractAuthorProfile(authorProfile);

    return {
      id: item.id,
      title: item.title || "Untitled",
      date_added: dateAdded,
      complianceStatus: (item.compliance_status as ComplianceStatus) ?? null,
      workStatus: (item.computed_work_status as WorkStatus) ?? null,
      onlineStatus: (item.computed_online_status as OnlineStatus) ?? null,
      content,
      metadata,
      publishedUrl,
      publicationStatus: latestPublication?.status,
      publicationRemoteId: latestPublication?.remote_id,
      structureName: item.structure_name ?? undefined,
      sessionStartDate: item.session_start_date ?? undefined,
      qualityScore: item.quality_score ?? undefined,
      sourceSystem: item.rco_record_id ? "RCO" : "DI",
      updated_at: item.updated_at,
      authorEmail,
      authorRole,
    };
  });

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
    letta_reports:
      | { markdown: string; created_at?: string }
      | { markdown: string; created_at?: string }[]
      | null;
  };
  let ingestionRecord: IngestionWithReports | null = null;

  if (item.ingestion_record_id) {
    const result = await supabase
      .from("ingestion_records")
      .select(
        `
        markdown,
        metadata,
        created_at,
        letta_reports (
          markdown,
          created_at
        )
      `,
      )
      .eq("id", item.ingestion_record_id)
      .single();
    if (result.data) {
      ingestionRecord = result.data as unknown as IngestionWithReports;
    }
  }

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
    const lettaReportsData = ingestionRecord.letta_reports;
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
  } | null;
  const publishedUrl =
    latestPublication?.remote_id && cleanBaseUrl
      ? `${cleanBaseUrl}/dispositif/${latestPublication.remote_id}`
      : undefined;

  // Date added
  const dateAdded =
    item.report_created_at || item.ingestion_created_at || item.updated_at;

  // Author
  const authorProfile = item.author_profile as {
    email?: string;
    role?: string;
  } | null;
  const { email: authorEmail, role: authorRole } =
    extractAuthorProfile(authorProfile);

  return {
    id: item.id,
    title: item.title || "Untitled",
    date_added: dateAdded,
    complianceStatus: (item.compliance_status as ComplianceStatus) ?? null,
    workStatus: (item.computed_work_status as WorkStatus) ?? null,
    onlineStatus: (item.computed_online_status as OnlineStatus) ?? null,
    content,
    ingestionContent,
    complianceReport,
    metadata,
    publishedUrl,
    publicationStatus: latestPublication?.status,
    publicationRemoteId: latestPublication?.remote_id,
    structureName: item.structure_name ?? undefined,
    sessionStartDate: item.session_start_date ?? undefined,
    qualityScore: item.quality_score ?? undefined,
    sourceSystem: item.rco_record_id ? "RCO" : "DI",
    updated_at: item.updated_at,
  };
}
