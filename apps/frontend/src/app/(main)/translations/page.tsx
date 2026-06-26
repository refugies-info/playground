import { createSupabaseServerClient } from "@playground/supabase";
import type { Metadata } from "next";
import { cookies } from "next/headers";
import { getAuthUser, getUserProfile } from "@/lib/auth";
import {
  type GetTranslationsParams,
  getAllTranslationAuthors,
  getTranslations,
} from "@/services/translations";
import { TranslationsList } from "./TranslationsList";

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export const metadata: Metadata = {
  title: "Mes Traductions | Content Playground",
  description: "Gérez vos traductions assignées",
};

export default async function TranslationsPage(props: PageProps) {
  const searchParams = await props.searchParams;
  const workStatus = searchParams.workStatus;
  const onlineStatus = searchParams.onlineStatus;
  const status = searchParams.status; // Deprecated: for backward compatibility
  const language = searchParams.language;
  const priority = searchParams.priority;
  const authorId = searchParams.authorId;
  const search = searchParams.search;
  const sortBy = searchParams.sortBy;
  const sortOrder = searchParams.sortOrder;

  const page =
    typeof searchParams.page === "string"
      ? Number.parseInt(searchParams.page, 10) || 1
      : 1;
  const pageSize =
    typeof searchParams.pageSize === "string"
      ? Number.parseInt(searchParams.pageSize, 10) || 50
      : 50;

  // Get user to identify language
  const cookieStore = await cookies();
  const supabase = createSupabaseServerClient(cookieStore);

  const user = await getAuthUser(supabase);
  const profile = await getUserProfile(supabase, user.id);
  const userLanguage = profile.language ?? undefined;
  const role = profile.role ?? undefined;

  // If a specific language filter is applied, use it.
  // Otherwise, default to user's assigned language if they have one (and they are a translator).
  // But for "Toutes les traductions" (admin/expert), we might want to see all.
  // The service handles `language: undefined` by showing all.

  // Logic:
  // - If `language` param is present, use it.
  // - If not, and user is strict translator, maybe force their language?
  //   But the previous code passed `userLanguage` effectively filtering by their language.
  //   If we want a filter, we should probably allow overriding it?
  //   For now, let's say: if param exists, use it. If not, use userLanguage (legacy behavior).
  //   Wait, if I select "All languages", param might be empty?

  // Strict restriction for translators: they can ONLY see their own language.
  const isTranslator = role === "translator";
  const effectiveLanguage = isTranslator
    ? userLanguage
    : typeof language === "string"
      ? language
      : undefined;

  const serviceParams: GetTranslationsParams = {
    page,
    pageSize,
    workStatus: typeof workStatus === "string" ? workStatus : undefined,
    onlineStatus: typeof onlineStatus === "string" ? onlineStatus : undefined,
    priority: typeof priority === "string" ? priority : undefined,
    authorId: typeof authorId === "string" ? authorId : undefined,
    search: typeof search === "string" && search ? search : undefined,
    status: typeof status === "string" ? status : undefined, // Deprecated: backward compatibility
    language: effectiveLanguage,
    sortBy: typeof sortBy === "string" ? sortBy : undefined,
    sortOrder:
      sortOrder === "asc" || sortOrder === "desc" ? sortOrder : undefined,
    userRole: role,
  };

  const [{ data: translations, total, totalPages }, authors] =
    await Promise.all([
      getTranslations(serviceParams),
      getAllTranslationAuthors(),
    ]);

  const initialFilters = {
    workStatus: typeof workStatus === "string" ? workStatus : "",
    onlineStatus: typeof onlineStatus === "string" ? onlineStatus : "",
    language: typeof language === "string" ? language : "",
    priority: typeof priority === "string" ? priority : "",
    authorId: typeof authorId === "string" ? authorId : "",
  };

  const showLanguageFilter = role !== "translator";

  return (
    <TranslationsList
      initialTranslations={translations}
      initialFilters={initialFilters}
      authors={authors}
      currentPage={page}
      totalPages={totalPages}
      totalCount={total}
      pageSize={pageSize}
      showLanguageFilter={showLanguageFilter}
      initialSorting={{
        sortBy: typeof sortBy === "string" ? sortBy : "updated_at",
        sortOrder:
          sortOrder === "asc" || sortOrder === "desc" ? sortOrder : "desc",
      }}
      userRole={role}
    />
  );
}
