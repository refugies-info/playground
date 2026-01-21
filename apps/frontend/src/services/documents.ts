import type { Lheo } from "@playground/rco";
import type { Document, DocumentSortField } from "@playground/shared-types";
import { logger } from "@playground/shared-types";
import type { Database, Json } from "@playground/supabase";
import { createSupabaseServerClient } from "@playground/supabase";

import matter from "gray-matter";
import type { Heading, Root } from "mdast";
import { cookies } from "next/headers";
import remarkParse from "remark-parse";
import { unified } from "unified";

/**
 * Metadata can be a partial LHEO structure or have direct title fields.
 * Uses the canonical Lheo type from @playground/rco package.
 */
type Metadata = Partial<Lheo> & {
  title?: string;
  "intitule-formation"?: string;
  [key: string]: unknown;
};

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

/**
 * Extract title from markdown content.
 * Priority:
 * 1. Title from YAML frontmatter
 * 2. First H1 heading in markdown (parsed with remark)
 * 3. "Untitled" as fallback
 */
async function extractTitleFromMarkdown(markdown: string): Promise<string> {
  if (!markdown) return "Untitled";

  try {
    // Parse YAML frontmatter
    const { data, content } = matter(markdown);

    // Check for title in frontmatter
    if (data.title && typeof data.title === "string") {
      return data.title.trim();
    }

    // Use remark to parse markdown and find first H1 heading
    const tree = unified().use(remarkParse).parse(content) as Root;

    // Find the first heading with depth 1 (H1)
    for (const node of tree.children) {
      if (node.type === "heading" && (node as Heading).depth === 1) {
        const heading = node as Heading;
        // Extract text from heading children
        const text = heading.children
          .filter((child) => child.type === "text")
          .map((child) => ("value" in child ? child.value : ""))
          .join("")
          .trim();

        if (text) {
          return text;
        }
      }
    }
  } catch (error) {
    // If parsing fails, continue to fallback
    logger.error(error, "Failed to parse markdown for title extraction");
  }

  return "Untitled";
}

/**
 * Safely extracts the title from LHEO metadata.
 * Handles the nested structure: lheo.offres.formation[0]["intitule-formation"]
 * Also checks for direct title or intitule-formation fields.
 */
function extractTitleFromMetadata(metadata: Metadata): string | null {
  // Check for direct title field
  if (metadata.title && typeof metadata.title === "string") {
    return metadata.title;
  }

  // Check for direct intitule-formation field
  if (
    metadata["intitule-formation"] &&
    typeof metadata["intitule-formation"] === "string"
  ) {
    return metadata["intitule-formation"];
  }

  // Navigate through LHEO structure: metadata.offres.formation[0]["intitule-formation"]
  // metadata is already Partial<Lheo>, so we access offres directly
  if (!metadata.offres) {
    return null;
  }

  const formations = metadata.offres.formation;
  if (!formations || formations.length === 0) {
    return null;
  }

  // Get the first formation
  const firstFormation = formations[0];
  if (!firstFormation) {
    return null;
  }

  const intitule = firstFormation["intitule-formation"];
  if (!intitule) {
    return null;
  }

  // IntituleFormation type from LHEO has a _text property
  if (typeof intitule === "object" && "_text" in intitule) {
    const text = intitule._text;
    return typeof text === "string" ? text : null;
  }

  // Fallback for direct string (shouldn't happen with canonical types, but be safe)
  if (typeof intitule === "string") {
    return intitule;
  }

  return null;
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
    publication_records: Pick<
      Database["public"]["Tables"]["publication_records"]["Row"],
      "remote_id"
    > | null;
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
  // Map Document fields to their corresponding database columns
  // Note: sorting by fields in joined tables is complex in Supabase JS client.
  // We'll stick to sorting by workflow fields for now.
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
      const remoteId = item.publication_records?.remote_id;

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
      "id, status, progress, updated_at, editorial_record_id, ingestion_record_id, rco_record_id, publication_record_id",
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
      workflow.publication_record_id
        ? supabase
            .from("publication_records")
            .select("remote_id")
            .eq("id", workflow.publication_record_id)
            .single()
        : Promise.resolve({ data: null, error: null }),
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
