import { createSupabaseServerClient } from "@playground/supabase";
import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
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
  const status = searchParams.status;
  const language = searchParams.language;
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

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const userLanguage = user.user_metadata?.language;
  const role = user.user_metadata?.role;

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
    status: typeof status === "string" ? status : undefined,
    language: effectiveLanguage,
    sortBy: typeof sortBy === "string" ? sortBy : undefined,
    sortOrder:
      sortOrder === "asc" || sortOrder === "desc" ? sortOrder : undefined,
  };

  const {
    data: translations,
    total,
    totalPages,
  } = await getTranslations(serviceParams);

  const initialFilters = {
    status: typeof status === "string" ? status : "",
    language: typeof language === "string" ? language : "",
  };

  const title =
    role === "translator" ? "Traductions" : "Toutes les traductions";
  const showLanguageFilter = role !== "translator";

  return (
    <TranslationsList
      initialTranslations={translations}
      initialFilters={initialFilters}
      title={title}
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
    />
  );
}
