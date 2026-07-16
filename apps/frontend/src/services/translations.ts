import {
  extractTitleFromMarkdown,
  extractTitleFromMetadata,
  logger,
  type Metadata,
  type SearchField,
  type WorkStatus,
} from "@playground/shared-types";
import {
  createSupabaseServerClient,
  type Database,
} from "@playground/supabase";
import { cookies } from "next/headers";
import { mapProfileDto, type Profile } from "@/lib/profile";
import { buildPublicationUrl } from "@/lib/url-builder";

// Limit of security if we have a lot of rows returns
const SEARCH_ID_MATCH_LIMIT = 2000;

// Define the shape of a translation item for the frontend
export interface TranslationItem {
  id: string;
  title: string;
  wordCount: number;
  status: string; // Computed for backward compatibility
  onlineStatus?: string | null; // 'published' | 'archived' | null
  workStatus?: WorkStatus | "pending" | "error" | null | undefined;
  language: string;
  updatedAt: string;
  publicationUrl?: string;
  sourceMarkdown?: string; // from editorial_record
  author: Profile | null;
  priority?: string | null; // 'urgent' | null
  structureName?: string | null;
  commune?: string | null;
  /** Date d'archivage de la fiche FR source (editorial_records.archived_at) */
  archivedAt?: string | null;
}

// Extended helper type including profiles
// Note: `priority` added in migration 20260507 — not yet in generated DB types
type TranslationWithRelations =
  Database["public"]["Tables"]["translation_records"]["Row"] & {
    priority?: string | null;
    editorial_records: Pick<
      Database["public"]["Tables"]["editorial_records"]["Row"],
      "markdown" | "metadata" | "archived_at"
    > | null;
    workflows:
      | (Pick<Database["public"]["Tables"]["workflows"]["Row"], "id"> & {
          publication_records: Pick<
            Database["public"]["Tables"]["publication_records"]["Row"],
            "remote_id" | "target" | "payload"
          >[];
        })
      | null;
    profile?: Profile;
  };

export interface GetTranslationsParams {
  page?: number;
  pageSize?: number;
  language?: string;
  workStatus?: string;
  onlineStatus?: string;
  priority?: string;
  authorId?: string; // Filter by author (profile id)
  search?: string; // Full-text search on title (metadata fields)
  /** Scope search: title (metadata), structure_name/commune (via workflow), or all. */
  searchField?: SearchField;
  status?: string; // Deprecated: for backward compatibility
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  userRole?: string;
}

/**
 * Simple word count estimation from markdown
 */
function countWords(markdown: string): number {
  if (!markdown) return 0;
  // Remove markdown syntax roughly to get better count?
  // For now, simple split by whitespace is a good enough approximation for editorial needs
  return markdown.trim().split(/\s+/).length;
}

export async function getTranslations(params: GetTranslationsParams) {
  const {
    page = 1,
    pageSize = 20,
    language,
    workStatus,
    onlineStatus,
    priority,
    authorId,
    search,
    searchField,
    status, // Deprecated: for backward compatibility
    sortBy = "updated_at",
    sortOrder = "desc",
    userRole,
  } = params;

  const cookieStore = await cookies();
  const supabase = createSupabaseServerClient(cookieStore);

  // Start query on translation_records
  let query = supabase.from("translation_records").select(
    `
      *,
      editorial_records (
        markdown,
        metadata,
        archived_at
      ),
      workflows (
        id,
        publication_records (
          remote_id,
          target,
          payload
        )
      ),
      profiles (
        id,
        email,
        role,
        username,
        first_name,
        last_name,
        created_at
      )
    `,
    { count: "exact" },
  );

  // Apply Filters
  if (language) {
    query = query.eq("language", language);
  }

  // Filter by work_status (new param takes precedence over deprecated status param)
  if (workStatus) {
    query = query.eq("work_status", workStatus);
  } else if (status) {
    // Backward compatibility: map old 'status' param to work_status
    query = query.eq("work_status", status);
  }

  // Filter by priority
  if (priority) {
    query = query.eq("priority", priority);
  }

  // Filter by author
  if (authorId) {
    query = query.eq("author_id", authorId);
  }

  // Search by title: titles live in editorial_records.metadata, not in translation_records.
  // Two-step: find matching editorial_record IDs, then restrict to those.
  if (search) {
    const term = `%${search}%`;
    // Quote the value so reserved chars (, ( )) in the term are treated
    // literally by PostgREST's .or() parser instead of breaking it.
    const orTerm = `"${term.replace(/"/g, '\\"')}"`;
    const empty = { data: [], total: 0, page, pageSize, totalPages: 0 };

    if (searchField === "title") {
      // Titles live in editorial_records.metadata (title/nom).
      const { data: matchingEditorial } = await supabase
        .from("editorial_records")
        .select("id")
        .or(`metadata->>title.ilike.${orTerm},metadata->>nom.ilike.${orTerm}`)
        .limit(SEARCH_ID_MATCH_LIMIT);
      const editorialIds = (matchingEditorial ?? []).map((r) => r.id);
      if (editorialIds.length === 0) return empty;
      query = query.in("editorial_record_id", editorialIds);
    } else if (searchField === "structure_name" || searchField === "commune") {
      // structure_name/commune live on workflows_enriched — match, then restrict by workflow_id.
      const { data: matchingWf } = await supabase
        .from("workflows_enriched")
        .select("id")
        .ilike(searchField, term)
        .limit(SEARCH_ID_MATCH_LIMIT);
      const workflowIds = (matchingWf ?? [])
        .map((r) => r.id)
        .filter((id): id is string => typeof id === "string");
      if (workflowIds.length === 0) return empty;
      query = query.in("workflow_id", workflowIds);
    } else {
      // No scope → search all sources: title (metadata) OR structure_name OR commune.
      const [{ data: matchingEditorial }, { data: matchingWf }] =
        await Promise.all([
          supabase
            .from("editorial_records")
            .select("id")
            .or(
              `metadata->>title.ilike.${orTerm},metadata->>nom.ilike.${orTerm}`,
            )
            .limit(SEARCH_ID_MATCH_LIMIT),
          supabase
            .from("workflows_enriched")
            .select("id")
            .or(`structure_name.ilike.${orTerm},commune.ilike.${orTerm}`)
            .limit(SEARCH_ID_MATCH_LIMIT),
        ]);
      const editorialIds = (matchingEditorial ?? []).map((r) => r.id);
      const workflowIds = (matchingWf ?? [])
        .map((r) => r.id)
        .filter((id): id is string => typeof id === "string");
      if (editorialIds.length === 0 && workflowIds.length === 0) return empty;

      const orParts: string[] = [];
      if (editorialIds.length > 0) {
        orParts.push(`editorial_record_id.in.(${editorialIds.join(",")})`);
      }
      if (workflowIds.length > 0) {
        orParts.push(`workflow_id.in.(${workflowIds.join(",")})`);
      }
      query = query.or(orParts.join(","));
    }
  }

  // Filter by online_status
  // Special case: "unpublished" means online_status IS NULL
  if (onlineStatus === "unpublished") {
    query = query.is("online_status", null);
  } else if (onlineStatus) {
    query = query.eq("online_status", onlineStatus);
  }

  // Role-based filtering: Translators should NOT see 'pending', 'error', or 'archived' translations
  // Use userRole from params (passed from page.tsx) for consistency
  const role = userRole;

  if (role !== "admin" && role !== "editor") {
    // Hide pending/error work_status, but keep NULL (published translations have work_status=null)
    // Note: .not("in", ...) excludes NULLs in SQL, so we use .or() — same pattern as online_status below
    query = query.or("work_status.not.in.(pending,error),work_status.is.null");
    // Hide archived online_status (but include NULL/unpublished)
    // Note: .not("eq", "archived") doesn't include NULLs in SQL, so we use .or()
    query = query.or("online_status.neq.archived,online_status.is.null");
  }

  // Sorting
  let dbSortColumn = "updated_at";
  if (sortBy === "language") dbSortColumn = "language";
  else if (sortBy === "workStatus" || sortBy === "status")
    dbSortColumn = "work_status";
  else if (sortBy === "onlineStatus") dbSortColumn = "online_status";

  query = query.order(dbSortColumn, { ascending: sortOrder === "asc" });

  // Pagination
  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize - 1;
  query = query.range(startIndex, endIndex);

  const { data, error, count } = await query;

  if (error) {
    logger.error(error, "Error fetching translations");
    throw new Error(`Failed to fetch translations: ${error.message}`);
  }

  const rows: TranslationWithRelations[] = data.map((row) => {
    const profile = Array.isArray(row.profiles)
      ? row.profiles[0]
      : row.profiles;
    return { ...row, profile: profile ? mapProfileDto(profile) : undefined };
  });

  // Second query: enrich with structure_name, commune, external_id from workflows_enriched
  const workflowIds = rows
    .map((r) => r.workflow_id)
    .filter((id): id is string => typeof id === "string");

  const enrichedMap = new Map<
    string,
    { structureName: string | null; commune: string | null }
  >();

  if (workflowIds.length > 0) {
    const { data: enrichedData, error: enrichedError } = await supabase
      .from("workflows_enriched")
      .select("id, structure_name, commune")
      .in("id", workflowIds);

    if (enrichedError) {
      logger.error(enrichedError, "Error fetching enriched workflow data");
    }

    for (const row of enrichedData ?? []) {
      if (!row.id) continue;
      enrichedMap.set(row.id, {
        structureName: row.structure_name ?? null,
        commune: row.commune ?? null,
      });
    }
  }

  const translations: TranslationItem[] = await Promise.all(
    rows.map(async (row) => {
      // Determine title
      // We prioritize the metadata on the translation record itself,
      // but if missing, we fall back to the editorial record's metadata.
      const translationMetadata = row.metadata as Metadata;
      const editorialMetadata = row.editorial_records?.metadata as Metadata;

      const metadata = translationMetadata || editorialMetadata || {};

      const sourceMarkdown = row.editorial_records?.markdown || "";

      // Title extraction using shared logic
      const title =
        extractTitleFromMetadata(metadata) ||
        (await extractTitleFromMarkdown(sourceMarkdown)) ||
        "Sans titre";

      // Word count from editorial record (source)
      const wordCount = countWords(sourceMarkdown);

      // Publication URL
      let publicationUrl: string | undefined;
      const cleanBaseUrl = (process.env.RI_BASE_URL || "").replace(/\/$/, "");

      // Find the publication record corresponding to THIS translation language
      // We check the payload to see if it contains the translation key
      const pubRecord = row.workflows?.publication_records?.find((record) => {
        const payload = record.payload as unknown as {
          dispositif?: { translations?: Record<string, unknown> };
        };
        const translations = payload?.dispositif?.translations;
        return translations && Object.keys(translations).includes(row.language);
      });

      if (pubRecord?.remote_id && cleanBaseUrl) {
        // Assuming generic /dispositif/ID structure for now, same as documents service
        publicationUrl = `${cleanBaseUrl}/dispositif/${pubRecord.remote_id}`;
      }

      const author = row.profile;

      return {
        id: row.id,
        title,
        wordCount,
        // If it's published, that's the primary status to show in list
        status:
          row.online_status === "published"
            ? "published"
            : row.work_status || "to_process",
        onlineStatus: row.online_status,
        workStatus: row.work_status as
          | WorkStatus
          | "pending"
          | "error"
          | null
          | undefined,
        language: row.language,
        updatedAt: row.updated_at,
        publicationUrl,
        sourceMarkdown,
        author,
        priority: row.priority ?? null,
        archivedAt: row.editorial_records?.archived_at ?? null,
        ...(row.workflow_id ? (enrichedMap.get(row.workflow_id) ?? {}) : {}),
      } as TranslationItem;
    }),
  );

  return {
    data: translations,
    total: count || 0,
    page,
    pageSize,
    totalPages: Math.ceil((count || 0) / pageSize),
  };
}

export async function getTranslationById(id: string) {
  const cookieStore = await cookies();
  const supabase = createSupabaseServerClient(cookieStore);

  const { data, error } = await supabase
    .from("translation_records")
    .select(
      `
      *,
      editorial_records (
        markdown,
        metadata
      ),
      workflows (
        id,
        publication_records (
          remote_id,
          target,
          payload
        )
      )
    `,
    )
    .eq("id", id)
    .single();

  if (error || !data) {
    logger.error(error, "Error fetching translation");
    return null;
  }

  // Cast to correct type since we know the relation exists
  const row =
    data as unknown as Database["public"]["Tables"]["translation_records"]["Row"] & {
      editorial_records: { markdown: string; metadata: unknown };
      workflows: {
        id: string;
        publication_records: Array<{
          remote_id: string;
          target: string;
          payload: unknown;
        }>;
      } | null;
    };

  const baseUrl = process.env.RI_BASE_URL;

  // Check if source document (FR) is published - needed for preview
  // Look for a publication record with FR translation
  const sourcePubRecord = row.workflows?.publication_records?.find((record) => {
    const payload = record.payload as unknown as {
      dispositif?: { translations?: Record<string, unknown> };
    };
    const translations = payload?.dispositif?.translations;
    return translations && Object.keys(translations).includes("fr");
  });

  // Build source publication URL if FR is published
  let sourcePublicationUrl: string | undefined;
  if (sourcePubRecord?.remote_id && baseUrl) {
    const url = buildPublicationUrl(baseUrl, "fr", sourcePubRecord.remote_id);
    if (url) {
      sourcePublicationUrl = url;
    }
  }

  return {
    id: row.id,
    workflowId: row.workflow_id ?? undefined,
    language: row.language,
    status:
      row.online_status === "published"
        ? "published"
        : row.work_status || "to_process",
    onlineStatus: row.online_status,
    workStatus: row.work_status as
      | WorkStatus
      | "pending"
      | "error"
      | null
      | undefined,
    translationMarkdown: row.markdown,
    sourceMarkdown: row.editorial_records?.markdown || "",
    sourceMetadata:
      (row.editorial_records?.metadata as Record<string, unknown>) || {},
    publicationUrl: sourcePublicationUrl, // Use source URL for canPreview check
  };
}
