import type { Document } from "@playground/shared-types";
import type { Database } from "@playground/supabase";
import { createSupabaseServerClient } from "@playground/supabase";
import { cookies } from "next/headers";

export interface GetDocumentsParams {
  page?: number;
  pageSize?: number;
  sortBy?: string;
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
  };

export async function getDocuments(params: GetDocumentsParams) {
  const {
    page = 1,
    pageSize = 10,
    sortBy = "updated_at",
    sortOrder = "desc",
    status,
    state,
    dateFrom,
    dateTo,
  } = params;

  const cookieStore = await cookies();
  const supabase = createSupabaseServerClient(cookieStore);

  // Base query on workflows table
  let query = supabase.from("workflows").select(
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
      )
    `,
    { count: "exact" },
  );

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
  // Note: sorting by fields in joined tables is complex in Supabase JS client.
  // We'll stick to sorting by workflow fields for now.
  if (sortBy === "date_added" || sortBy === "updated_at") {
    query = query.order("updated_at", { ascending: sortOrder === "asc" });
  } else if (sortBy === "status") {
    query = query.order("status", { ascending: sortOrder === "asc" });
  } else if (sortBy === "state") {
    query = query.order("progress", { ascending: sortOrder === "asc" });
  } else {
    // Default sort
    query = query.order("updated_at", { ascending: false });
  }

  // Apply pagination
  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize - 1;
  query = query.range(startIndex, endIndex);

  const { data, error, count } = await query;

  if (error) {
    // logger.error(error, "Error fetching documents"); // Logger not available here yet, using simple throw
    throw new Error("Failed to fetch documents");
  }

  // Cast the data to our helper type since Supabase query builder types are complex with select strings
  const rows = data as unknown as WorkflowWithRelations[];

  // Map to Document type
  const documents: Document[] = rows.map((item) => {
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
      {}) as Record<string, unknown>;

    // Priority: editorial > ingestion > empty
    // We do not use rcoRecord.source_raw as per requirements
    const content =
      editorialRecord?.markdown || ingestionRecord?.markdown || "";

    // Simple title extraction if available in metadata, otherwise "Untitled"
    // The title logic uses the markdown content mainly now.
    const title =
      (metadata?.title as string) ||
      (metadata?.["intitule-formation"] as string) ||
      "Untitled";

    return {
      id: item.id,
      title,
      date_added: item.updated_at,
      status: item.status,
      state: item.progress,
      content,
      metadata,
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

  const { data, error } = await supabase
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
      )
    `,
    )
    .eq("id", id)
    .single();

  if (error || !data) {
    return null;
  }

  // Cast the data to our helper type
  const row = data as unknown as WorkflowWithRelations;

  const rcoRecord = row.rco_records;
  const ingestionRecord = row.ingestion_records;
  const editorialRecord =
    row.editorial_records && row.editorial_records.length > 0
      ? row.editorial_records[0]
      : null;

  // Priority: editorial > ingestion > rco
  const metadata = (editorialRecord?.metadata ||
    ingestionRecord?.metadata ||
    rcoRecord?.metadata ||
    {}) as Record<string, unknown>;

  // Priority: editorial > ingestion > empty
  // We do not use rcoRecord.source_raw as per requirements
  const content = editorialRecord?.markdown || ingestionRecord?.markdown || "";

  // Simple title extraction if available in metadata, otherwise "Untitled"
  const title =
    (metadata?.title as string) ||
    (metadata?.["intitule-formation"] as string) ||
    "Untitled";

  return {
    id: row.id,
    title,
    date_added: row.updated_at,
    status: row.status,
    state: row.progress,
    content,
    metadata,
  };
}
