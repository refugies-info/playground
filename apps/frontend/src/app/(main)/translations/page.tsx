import type { Metadata } from "next";
import { getCurrentUser } from "@/lib/auth";
import { getProfilesByRoles } from "@/services/profiles";
import {
  type GetTranslationsParams,
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

  const currentUser = await getCurrentUser();
  const userLanguage = currentUser.language ?? undefined;
  const role = currentUser.role ?? undefined;

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
    search: typeof search === "string" ? search : undefined,
    status: typeof status === "string" ? status : undefined, // Deprecated: backward compatibility
    language: effectiveLanguage,
    sortBy: typeof sortBy === "string" ? sortBy : undefined,
    sortOrder:
      sortOrder === "asc" || sortOrder === "desc" ? sortOrder : undefined,
    userRole: role,
  };

  const [{ data: translations, total, totalPages }, profiles] =
    await Promise.all([
      getTranslations(serviceParams),
      getProfilesByRoles(["translator"]),
    ]);

  const authors = profiles.map((p) => ({
    value: p.id,
    label: p.displayName ?? p.email,
  }));

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
