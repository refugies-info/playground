import {
  extractTitleFromMarkdown,
  extractTitleFromMetadata,
  logger,
  type Metadata,
} from "@playground/shared-types";
import {
  createSupabaseServerClient,
  type Database,
} from "@playground/supabase";
import { cookies } from "next/headers";
import { extractAuthorProfile } from "./helpers";

// Define the shape of a translation item for the frontend
export interface TranslationItem {
  id: string;
  title: string;
  wordCount: number;
  status: string;
  language: string;
  updatedAt: string;
  publicationUrl?: string;
  sourceMarkdown?: string; // from editorial_record
  author: string;
  authorRole: string;
}

// Extended helper type including profiles
type TranslationWithRelations =
  Database["public"]["Tables"]["translation_records"]["Row"] & {
    editorial_records: Pick<
      Database["public"]["Tables"]["editorial_records"]["Row"],
      "markdown" | "metadata"
    > | null;
    workflows:
      | (Pick<Database["public"]["Tables"]["workflows"]["Row"], "id"> & {
          publication_records: Pick<
            Database["public"]["Tables"]["publication_records"]["Row"],
            "remote_id" | "target" | "payload"
          >[];
        })
      | null;
    profiles: { email: string; role: string } | null;
  };

export interface GetTranslationsParams {
  page?: number;
  pageSize?: number;
  language?: string; // Filter by specific language
  status?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
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
    status,
    sortBy = "updated_at",
    sortOrder = "desc",
  } = params;

  const cookieStore = await cookies();
  const supabase = createSupabaseServerClient(cookieStore);

  // Start query on translation_records
  let query = supabase.from("translation_records").select(
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
      ),
      profiles (
        email,
        role
      )
    `,
    { count: "exact" },
  );

  // Apply Filters
  if (language) {
    query = query.eq("language", language);
  }

  if (status) {
    query = query.eq("work_status", status);
  }

  // Role-based filtering: Translators should NOT see 'pending' or 'error' translations
  // We need to check the role. We can't easily get it here without passing it or fetching user again.
  // BUT we already get the user to check `userLanguage`.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user?.id ?? "")
    .single();

  const role = profile?.role;

  if (role !== "admin" && role !== "editor") {
    // Restrict view for translators and unknown roles: hide pending/error
    query = query.not("work_status", "in", '("pending","error")');
  }

  // Sorting
  let dbSortColumn = "updated_at";
  if (sortBy === "language") dbSortColumn = "language";
  else if (sortBy === "status") dbSortColumn = "work_status";

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

  const rows = data as unknown as TranslationWithRelations[];

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

      // Extract author info
      const { email: authorEmail, role: authorRole } = extractAuthorProfile(
        row.profiles,
      );

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
        workStatus: row.work_status,
        language: row.language,
        updatedAt: row.updated_at,
        publicationUrl,
        sourceMarkdown,
        author: authorEmail || "",
        authorRole: authorRole || "",
      };
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
        markdown
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
      editorial_records: { markdown: string };
    };

  return {
    id: row.id,
    language: row.language,
    status:
      row.online_status === "published"
        ? "published"
        : row.work_status || "to_process",
    onlineStatus: row.online_status,
    workStatus: row.work_status,
    translationMarkdown: row.markdown,
    sourceMarkdown: row.editorial_records?.markdown || "",
  };
}
