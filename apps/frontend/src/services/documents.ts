import type { Document, DocumentSortField } from "@playground/shared-types";
import { logger } from "@playground/shared-types";
import type { Database, Json } from "@playground/supabase";
import { createSupabaseServerClient } from "@playground/supabase";
import { cookies } from "next/headers";

import {
  extractTitleFromMarkdown,
  extractTitleFromMetadata,
  type Metadata,
} from "./title-extraction";

/**
 * Type for ingestion record with joined letta_reports.
 * The letta_reports field can be a single object or an array depending on the join.
 */
interface IngestionRecordWithReport {
  markdown: string;
  metadata: Json;
  ingestion_report_id: string | null;
  letta_reports:
    | { markdown: string; status?: string }
    | { markdown: string; status?: string }[]
    | null;
}

export interface GetDocumentsParams {
  page?: number;
  pageSize?: number;
  sortBy?: DocumentSortField;
  sortOrder?: "asc" | "desc";
  status?: string;
  state?: string;
  dateFrom?: string;
  dateTo?: string;
}

// Helper type for the joined query result
type WorkflowWithRelations =
  Database["public"]["Tables"]["workflows"]["Row"] & {
    rco_records: Pick<
      Database["public"]["Tables"]["rco_records"]["Row"],
      "source_raw" | "metadata"
    >;
    ingestion_records: Pick<
      Database["public"]["Tables"]["ingestion_records"]["Row"],
      "markdown" | "metadata"
    > | null;
    editorial_records:
      | Pick<
          Database["public"]["Tables"]["editorial_records"]["Row"],
          "markdown" | "metadata"
        >[]
      | null;
    publication_records:
      | Pick<
          Database["public"]["Tables"]["publication_records"]["Row"],
          "remote_id"
        >[]
      | null;
  };

export async function getDocuments(params: GetDocumentsParams) {
  const {
    page = 1,
    pageSize = 10,
    sortBy = "date_added",
    sortOrder = "desc",
    status,
    state,
    dateFrom,
    dateTo,
  } = params;

  const cookieStore = await cookies();
  const supabase = createSupabaseServerClient(cookieStore);

  // Base query on workflows table
  let query = supabase
    .from("workflows")
    .select(
      `
      id,
      status,
      progress,
      updated_at,
      rco_records!inner (
        source_raw,
        metadata
      ),
      ingestion_records (
        markdown,
        metadata
      ),
      editorial_records (
        markdown,
        metadata
      ),
      publication_records (
        remote_id
      )
    `,
      { count: "exact" },
    )
    .order("created_at", {
      ascending: false,
      referencedTable: "editorial_records",
    });

  // Apply filters
  if (status) {
    query = query.eq("status", status);
  }

  if (state) {
    query = query.eq("progress", state);
  }

  if (dateFrom) {
    query = query.gte("updated_at", dateFrom);
  }

  if (dateTo) {
    query = query.lte("updated_at", dateTo);
  }

  // Apply sorting
  const sortFieldMap: Record<DocumentSortField, string> = {
    date_added: "updated_at", // date_added is computed from updated_at
    updated_at: "updated_at",
    status: "status",
    state: "progress", // state maps to progress column
    title: "updated_at", // title is computed, fall back to updated_at
  };

  const dbColumn = sortFieldMap[sortBy];
  if (!dbColumn) {
    // This should never happen due to TypeScript, but add runtime safety
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

  // Cast the data to our helper type since Supabase query builder types are complex with select strings
  const rows = data as unknown as WorkflowWithRelations[];

  // Map to Document type with async title extraction
  const documents: Document[] = await Promise.all(
    rows.map(async (item) => {
      const rcoRecord = item.rco_records;
      const ingestionRecord = item.ingestion_records;
      const editorialRecord =
        item.editorial_records && item.editorial_records.length > 0
          ? item.editorial_records[0]
          : null;

      // Priority: editorial > ingestion > rco
      const metadata = (editorialRecord?.metadata ||
        ingestionRecord?.metadata ||
        rcoRecord?.metadata ||
        {}) as Metadata;

      // Priority: editorial > ingestion > empty
      // We do not use rcoRecord.source_raw as per requirements
      const content =
        editorialRecord?.markdown || ingestionRecord?.markdown || "";

      // Title extraction priority:
      // 1. Extract from metadata (handles LHEO structure, title, intitule-formation)
      // 2. Extract from markdown content (YAML frontmatter or first H1)
      // 3. "Untitled" as final fallback
      const title =
        extractTitleFromMetadata(metadata) ||
        (await extractTitleFromMarkdown(content));

      const cleanBaseUrl = (process.env.RI_BASE_URL || "").replace(/\/$/, "");
      const remoteId =
        item.publication_records && item.publication_records.length > 0
          ? item.publication_records[0].remote_id
          : undefined;

      const publishedUrl =
        item.progress === "published" && remoteId && cleanBaseUrl
          ? `${cleanBaseUrl}/dispositif/${remoteId}`
          : undefined;

      return {
        id: item.id,
        title,
        date_added: item.updated_at,
        status: item.status,
        state: item.progress,
        content,
        metadata,
        publishedUrl,
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
  const { data: workflow, error: workflowError } = await supabase
    .from("workflows")
    .select(
      "id, status, progress, updated_at, editorial_record_id, ingestion_record_id, rco_record_id",
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
  const [rcoResult, ingestionResult, editorialResult, publicationResult] =
    await Promise.all([
      supabase
        .from("rco_records")
        .select("source_raw, metadata")
        .eq("id", workflow.rco_record_id)
        .single(),
      workflow.ingestion_record_id
        ? supabase
            .from("ingestion_records")
            .select(
              `
            markdown,
            metadata,
            ingestion_report_id,
            letta_reports (
              markdown,
              status
            )
          `,
            )
            .eq("id", workflow.ingestion_record_id)
            .single()
        : Promise.resolve({ data: null, error: null }),
      workflow.editorial_record_id
        ? supabase
            .from("editorial_records")
            .select("markdown, metadata")
            .eq("id", workflow.editorial_record_id)
            .single()
        : Promise.resolve({ data: null, error: null }),
      supabase
        .from("publication_records")
        .select("remote_id")
        .eq("workflow_id", workflow.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .single(),
    ]);

  const rcoRecord = rcoResult.data;
  const ingestionRecord =
    ingestionResult.data as IngestionRecordWithReport | null;
  const editorialRecord = editorialResult.data;
  const publicationRecord = publicationResult.data;

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

  if (!rcoRecord) {
    logger.error(rcoResult.error, "Error fetching rco_record");
    return null;
  }

  // Priority: editorial > ingestion > rco
  const metadata = (editorialRecord?.metadata ||
    ingestionRecord?.metadata ||
    rcoRecord?.metadata ||
    {}) as Metadata;

  // Current working content: editorial > ingestion > empty
  const content = editorialRecord?.markdown || ingestionRecord?.markdown || "";

  // Immutable ingestion content (always from ingestion_records)
  const ingestionContent = ingestionRecord?.markdown || "";

  // Title extraction priority:
  // 1. Extract from metadata (handles LHEO structure, title, intitule-formation)
  // 2. Extract from markdown content (YAML frontmatter or first H1)
  // 3. "Untitled" as final fallback
  const title =
    extractTitleFromMetadata(metadata) ||
    (await extractTitleFromMarkdown(content));

  const cleanBaseUrl = (process.env.RI_BASE_URL || "").replace(/\/$/, "");
  const remoteId = publicationRecord?.remote_id;
  const publishedUrl =
    workflow.progress === "published" && remoteId && cleanBaseUrl
      ? `${cleanBaseUrl}/dispositif/${remoteId}`
      : undefined;

  return {
    id: workflow.id,
    title,
    date_added: workflow.updated_at,
    status: workflow.status,
    state: workflow.progress,
    content,
    ingestionContent,
    complianceReport,
    metadata,
    publishedUrl,
  };
}
