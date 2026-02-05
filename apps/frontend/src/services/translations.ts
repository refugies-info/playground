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
}

export interface GetTranslationsParams {
  page?: number;
  pageSize?: number;
  language?: string; // Filter by specific language
  status?: string;
}

// Helper type for the joined query result
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
  };

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
  const { page = 1, pageSize = 20, language, status } = params;

  const cookieStore = await cookies();
  const supabase = createSupabaseServerClient(cookieStore);

  // Start query on translation_records
  let query = supabase
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
      { count: "exact" },
    )
    .order("updated_at", { ascending: false });

  // Apply Filters
  if (language) {
    query = query.eq("language", language);
  }

  if (status) {
    query = query.eq("status", status);
  }

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

      return {
        id: row.id,
        title,
        wordCount,
        status: row.status || "to_process",
        language: row.language,
        updatedAt: row.updated_at,
        publicationUrl,
        sourceMarkdown,
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
    status: row.status,
    translationMarkdown: row.markdown,
    sourceMarkdown: row.editorial_records?.markdown || "",
  };
}
