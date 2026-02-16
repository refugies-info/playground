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
 * Type for ingestion record with joined letta_reports.
 * The letta_reports field can be a single object or an array depending on the join.
 */
interface IngestionRecordWithReport {
  markdown: string;
  metadata: Json;
  created_at: string;
  ingestion_report_id: string | null;
  letta_reports:
    | { markdown: string; status?: string; created_at?: string }
    | { markdown: string; status?: string; created_at?: string }[]
    | null;
}

// Helper type for the joined query result
type WorkflowWithRelations =
  Database["public"]["Tables"]["workflows"]["Row"] & {
    ingestion_records: IngestionRecordWithReport | null;
    editorial_records:
      | (Pick<
          Database["public"]["Tables"]["editorial_records"]["Row"],
          "markdown" | "metadata" | "work_status" | "online_status"
        > & {
          profiles: { email: string; role: string } | null;
        })[]
      | null;
    publication_records:
      | Pick<
          Database["public"]["Tables"]["publication_records"]["Row"],
          "remote_id" | "status" | "updated_at" | "created_at"
        >[]
      | null;
  };

export interface GetDocumentsParams {
  page?: number;
  pageSize?: number;
  sortBy?: DocumentSortField;
  sortOrder?: "asc" | "desc";
  complianceStatus?: (string | null)[] | string | null; // Allow null for unevaluated documents
  workStatus?: string | null;
  onlineStatus?: string | null;
  dateFrom?: string;
  dateTo?: string;
  searchId?: string;
}

type WorkflowIngestionMetadata = {
  workflow_id: string;
  title: string;
  structure_name: string | null;
  session_start_date: string | null;
  quality_score: number | null;
};

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

  // Base query on workflows table
  const selectString = `
      id,
      compliance_status,
      updated_at,
      rco_record_id,
      ingestion_records${searchId ? "!inner" : ""} (
        markdown,
        metadata,
        created_at,
        ingestion_report_id,
        letta_reports (
          created_at
        )
      ),
      editorial_records (
        markdown,
        metadata,
        work_status,
        online_status,
        author_id,
        profiles (
          email,
          role
        )
      ),
      publication_records (
        remote_id,
        status,
        updated_at,
        created_at
      )
    `;

  let query = supabase
    .from("workflows")
    .select(selectString, { count: "exact" })
    .order("created_at", {
      ascending: false,
      referencedTable: "editorial_records",
    });

  // Apply filters
  if (complianceStatus) {
    if (Array.isArray(complianceStatus)) {
      // Separate null from other values
      const nonNullStatuses = complianceStatus.filter(
        (s) => s !== null,
      ) as string[];
      const hasNull = complianceStatus.includes(null);

      if (nonNullStatuses.length > 0 && hasNull) {
        // Include both specific statuses and NULL
        query = query.or(
          `compliance_status.in.(${nonNullStatuses.map((s) => `"${s}"`).join(",")}),compliance_status.is.null`,
        );
      } else if (hasNull) {
        // Only NULL
        query = query.is("compliance_status", null);
      } else {
        // Only specific statuses
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
    query = query.not("compliance_status", "in", '("error")');
    query = query.not("compliance_status", "is", null);
  }

  if (workStatus) {
    // If filtering by "to_process", we also want compliant workflows without editorial records
    if (workStatus === "to_process") {
      query = query.or(
        `editorial_records.work_status.eq.to_process,and(compliance_status.eq.compliant,editorial_records.is.null)`,
      );
    } else {
      query = query.eq("editorial_records.work_status", workStatus);
    }
  }

  if (onlineStatus) {
    query = query.eq("editorial_records.online_status", onlineStatus);
  }

  if (dateFrom) {
    query = query.gte("updated_at", dateFrom);
  }

  if (dateTo) {
    query = query.lte("updated_at", dateTo);
  }

  if (searchId) {
    // Filter by metadata->>id in joined ingestion_records
    // Note: In Supabase/PostgREST, filtering on joined tables uses dot notation
    query = query.ilike("ingestion_records.metadata->>id", `%${searchId}%`);
  }

  // Apply sorting
  const sortFieldMap: Record<DocumentSortField, string> = {
    date_added: "updated_at",
    updated_at: "updated_at",
    compliance_status: "compliance_status",
    work_status: "editorial_records(work_status)",
    online_status: "editorial_records(online_status)",
    title: "title",
  };

  const dbColumn = sortFieldMap[sortBy];
  if (!dbColumn) {
    // This should never happen due to TypeScript, but add runtime safety
    throw new Error(`Unsupported sort field: ${sortBy}`);
  }

  if (dbColumn.includes("editorial_records")) {
    query = query.order(dbColumn.split("(")[1].replace(")", ""), {
      ascending: sortOrder === "asc",
      referencedTable: "editorial_records",
    });
  } else {
    query = query.order(dbColumn, { ascending: sortOrder === "asc" });
  }

  // Apply pagination
  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize - 1;
  query = query.range(startIndex, endIndex);

  const { data, error, count } = await query;

  if (error) {
    logger.error(error, "Error fetching documents from Supabase");
    throw new Error(`Failed to fetch documents: ${error.message}`);
  }

  // Cast the data to our helper type since Supabase query builder types are complex with select strings
  const rows = data as unknown as WorkflowWithRelations[];

  // Map to Document type with async title extraction
  const workflowIds = rows.map((row) => row.id);
  const { data: ingestionMetadata } = await supabase
    .from("workflow_ingestion_metadata")
    .select(
      "workflow_id, title, structure_name, session_start_date, quality_score",
    )
    .in("workflow_id", workflowIds);

  const ingestionMetadataByWorkflow = new Map(
    (
      ingestionMetadata as
        | (WorkflowIngestionMetadata & { title: string })[]
        | null
    )?.map((row) => [row.workflow_id, row]) ?? [],
  );

  const documents: Document[] = await Promise.all(
    rows.map(async (item) => {
      // Supabase can return arrays or objects for joins
      const ingestionRecordRaw = item.ingestion_records;
      const ingestionRecord = Array.isArray(ingestionRecordRaw)
        ? ingestionRecordRaw[0]
        : ingestionRecordRaw;

      const editorialRecordRaw = item.editorial_records;
      const editorialRecord = Array.isArray(editorialRecordRaw)
        ? editorialRecordRaw[0]
        : editorialRecordRaw;

      // Extract author info
      const { email: authorEmail, role: authorRole } = extractAuthorProfile(
        editorialRecord?.profiles,
      );

      // Merge metadata, protecting technical IDs from ingestion
      const ingestionMetadata = (ingestionRecord?.metadata as Metadata) || {};
      const editorialMetadata = (editorialRecord?.metadata as Metadata) || {};
      const metadata: Metadata = {
        ...ingestionMetadata,
        ...editorialMetadata,
      };

      // Ensure critical identifiers from ingestion are preserved
      if (ingestionMetadata.id) metadata.id = ingestionMetadata.id;
      if (ingestionMetadata.structure_id)
        metadata.structure_id = ingestionMetadata.structure_id;

      // Priority: editorial > ingestion > empty
      const content =
        editorialRecord?.markdown || ingestionRecord?.markdown || "";

      // Title extraction: use the calculated title from our view
      const metadataRow = ingestionMetadataByWorkflow.get(item.id);
      const title = metadataRow?.title || "Untitled";

      const cleanBaseUrl = (process.env.RI_BASE_URL || "").replace(/\/$/, "");
      const publishedPublication = item.publication_records
        ? [...item.publication_records]
            .filter((record) => record.status === "published")
            .sort((a, b) => {
              const aDate = new Date(a.updated_at || a.created_at).getTime();
              const bDate = new Date(b.updated_at || b.created_at).getTime();
              return bDate - aDate;
            })[0]
        : undefined;

      const publishedUrl =
        publishedPublication?.remote_id && cleanBaseUrl
          ? `${cleanBaseUrl}/dispositif/${publishedPublication.remote_id}`
          : undefined;

      const ingestionCreatedAt = ingestionRecord?.created_at;
      const letReportsData = ingestionRecord?.letta_reports;
      const reportCreatedAt = Array.isArray(letReportsData)
        ? letReportsData[0]?.created_at
        : letReportsData?.created_at;

      const dateAdded =
        reportCreatedAt || ingestionCreatedAt || item.updated_at;

      // Determine Statuses with Fallback Logic
      const hasPublicationHistory =
        item.publication_records && item.publication_records.length > 0;

      // Work status: Use editorial_record.work_status if available,
      // otherwise default to 'to_process' for compliant documents without publication history.
      // This handles the case where editorial_record doesn't exist yet (e.g., after compliance check).
      const computedWorkStatus = editorialRecord
        ? editorialRecord.work_status
        : item.compliance_status === "compliant" && !hasPublicationHistory
          ? "to_process"
          : null;

      // Online status: Use editorial_record.online_status if available,
      // otherwise default to 'archived' for non_compliant documents.
      // This ensures non_compliant workflows without editorial records are shown as archived.
      const computedOnlineStatus = editorialRecord
        ? editorialRecord.online_status
        : item.compliance_status === "non_compliant"
          ? "archived"
          : null;

      return {
        id: item.id,
        title,
        date_added: dateAdded,
        complianceStatus: (item.compliance_status as ComplianceStatus) ?? null,
        workStatus: computedWorkStatus as WorkStatus,
        onlineStatus: computedOnlineStatus as OnlineStatus,
        content,
        metadata,
        publishedUrl,
        publicationStatus: publishedPublication?.status,
        publicationRemoteId: publishedPublication?.remote_id,
        structureName: metadataRow?.structure_name ?? undefined,
        sessionStartDate: metadataRow?.session_start_date ?? undefined,
        qualityScore: metadataRow?.quality_score ?? undefined,
        sourceSystem: item.rco_record_id ? "RCO" : "DI",
        updated_at: item.updated_at,
        authorEmail,
        authorRole,
      };
    }),
  );

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

  // First, get the workflow with its linked record IDs
  // Removed work_status, online_status from selection
  const { data: workflow, error: workflowError } = await supabase
    .from("workflows")
    .select(
      "id, compliance_status, updated_at, editorial_record_id, ingestion_record_id, rco_record_id",
    )
    .eq("id", id)
    .single();

  if (workflowError) {
    if (workflowError.code !== "PGRST116") {
      logger.error(workflowError, "Error fetching workflow by ID");
    }
    return null;
  }

  if (!workflow) {
    return null;
  }

  // Fetch the related records individually
  const [
    ingestionResult,
    editorialResult,
    publicationResult,
    ingestionMetadataResult,
  ] = await Promise.all([
    workflow.ingestion_record_id
      ? supabase
          .from("ingestion_records")
          .select(
            `
            markdown,
            metadata,
            created_at,
            ingestion_report_id,
            letta_reports (
              markdown,
              status,
              created_at
            )
          `,
          )
          .eq("id", workflow.ingestion_record_id)
          .single()
      : Promise.resolve({ data: null, error: null }),
    workflow.editorial_record_id
      ? supabase
          .from("editorial_records")
          .select("markdown, metadata, work_status, online_status")
          .eq("id", workflow.editorial_record_id)
          .single()
      : Promise.resolve({ data: null, error: null }),
    supabase
      .from("publication_records")
      .select("remote_id, status")
      .eq("workflow_id", workflow.id)
      .eq("status", "published")
      .order("created_at", { ascending: false })
      .limit(1)
      .single(),
    supabase
      .from("workflow_ingestion_metadata")
      .select(
        "workflow_id, title, structure_name, session_start_date, quality_score",
      )
      .eq("workflow_id", workflow.id)
      .single(),
  ]);

  const ingestionRecordRaw = ingestionResult.data;
  const ingestionRecord = (
    Array.isArray(ingestionRecordRaw)
      ? ingestionRecordRaw[0]
      : ingestionRecordRaw
  ) as IngestionRecordWithReport | null;

  const editorialRecordRaw = editorialResult.data;
  const editorialRecord = Array.isArray(editorialRecordRaw)
    ? editorialRecordRaw[0]
    : editorialRecordRaw;

  // Cast editorial record to include new fields
  const editorialRecordTyped = editorialRecord as
    | Database["public"]["Tables"]["editorial_records"]["Row"]
    | null;

  const publicationRecordRaw = publicationResult.data;
  const publicationRecord = Array.isArray(publicationRecordRaw)
    ? publicationRecordRaw[0]
    : publicationRecordRaw;

  // Use the updated type with title
  const ingestionMetadataRow = ingestionMetadataResult.data as
    | (WorkflowIngestionMetadata & { title: string })
    | null;

  // Fetch compliance report from the joined data
  let complianceReport = "";

  if (ingestionRecord?.letta_reports) {
    // If it's a single relation (one-to-one or one-to-many treated as single), it might be an object or array.
    // Based on typical Supabase/PostgREST join:
    const reportData = Array.isArray(ingestionRecord.letta_reports)
      ? ingestionRecord.letta_reports[0]
      : ingestionRecord.letta_reports;

    if (reportData?.markdown) {
      complianceReport = reportData.markdown;
    }
  }

  // RCO Record is optional now (DI flows use Ingestion Record as source)
  if (!ingestionRecord) {
    logger.error({ workflowId: id }, "Workflow has no Ingestion record");
    return null;
  }

  // Merge metadata, protecting technical IDs from ingestion
  const ingestionMetadata = (ingestionRecord?.metadata as Metadata) || {};
  const editorialMetadata = (editorialRecord?.metadata as Metadata) || {};
  const metadata: Metadata = {
    ...ingestionMetadata,
    ...editorialMetadata,
  };

  // Ensure critical identifiers from ingestion are preserved
  if (ingestionMetadata.id) metadata.id = ingestionMetadata.id;
  if (ingestionMetadata.structure_id)
    metadata.structure_id = ingestionMetadata.structure_id;

  // Current working content: editorial > ingestion > empty
  // For DI records without editorial content, inject frontmatter content into body
  let content = editorialRecord?.markdown || ingestionRecord?.markdown || "";
  if (!editorialRecord && ingestionRecord?.markdown) {
    content = injectFrontmatterContent(ingestionRecord.markdown);
  }

  // Immutable ingestion content (always from ingestion_records)
  // Inject content from frontmatter fields (description, conditions_acces) into body
  const ingestionContent = ingestionRecord?.markdown
    ? injectFrontmatterContent(ingestionRecord.markdown)
    : "";

  // Title extraction: use the calculated title from our view
  const title = ingestionMetadataRow?.title || "Untitled";

  const cleanBaseUrl = (process.env.RI_BASE_URL || "").replace(/\/$/, "");
  const remoteId = publicationRecord?.remote_id;
  const publishedUrl =
    publicationRecord?.status === "published" && remoteId && cleanBaseUrl
      ? `${cleanBaseUrl}/dispositif/${remoteId}`
      : undefined;

  const reportCreatedAt = Array.isArray(ingestionRecord?.letta_reports)
    ? ingestionRecord?.letta_reports[0]?.created_at
    : ingestionRecord?.letta_reports?.created_at;
  const dateAdded =
    reportCreatedAt || ingestionRecord?.created_at || workflow.updated_at;

  // Determine work status
  // If editorial record exists, we use its status.
  // If not, we fallback to 'to_process' if compliant AND no publication history.
  // This handles the case where editorial_record doesn't exist yet (e.g., after compliance check).
  const hasPublicationHistory = publicationResult.data !== null;
  const computedWorkStatus = editorialRecordTyped
    ? editorialRecordTyped.work_status
    : workflow.compliance_status === "compliant" && !hasPublicationHistory
      ? "to_process"
      : null;

  // Determine online status
  // If editorial record exists, we use its status.
  // If not, we fallback to 'archived' if non_compliant, else null.
  // This ensures non_compliant workflows without editorial records are shown as archived.
  const computedOnlineStatus = editorialRecordTyped
    ? editorialRecordTyped.online_status
    : workflow.compliance_status === "non_compliant"
      ? "archived"
      : null;

  return {
    id: workflow.id,
    title,
    date_added: dateAdded,
    complianceStatus: (workflow.compliance_status as ComplianceStatus) ?? null,
    workStatus: computedWorkStatus as WorkStatus,
    onlineStatus: computedOnlineStatus as OnlineStatus,
    content,
    ingestionContent,
    complianceReport,
    metadata,
    publishedUrl,
    publicationStatus: publicationRecord?.status,
    publicationRemoteId: publicationRecord?.remote_id,
    structureName: ingestionMetadataRow?.structure_name ?? undefined,
    sessionStartDate: ingestionMetadataRow?.session_start_date ?? undefined,
    qualityScore: ingestionMetadataRow?.quality_score ?? undefined,
    sourceSystem: workflow.rco_record_id ? "RCO" : "DI",
    updated_at: workflow.updated_at,
  };
}
