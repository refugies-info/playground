import type { DocumentSortField } from "@playground/shared-types";
import { createSupabaseServerClient } from "@playground/supabase";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getAuthUser, getUserProfile } from "@/lib/auth";
import {
  type GetDocumentsParams,
  getDocuments,
  getEditorsList,
} from "@/services/documents";
import { DocumentsList } from "./documents-list";

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

const DEFAULT_PAGE_SIZE = 50;
const MIN_PAGE_SIZE = 1;
const MAX_PAGE_SIZE = 100;

export default async function DocumentsPage(props: PageProps) {
  // Translators must not access /documents — redirect to /translations
  const cookieStore = await cookies();
  const supabase = createSupabaseServerClient(cookieStore);
  const user = await getAuthUser(supabase);
  if (!user) redirect("/login");
  const profile = await getUserProfile(supabase, user.id);
  if (profile?.role === "translator") redirect("/translations");
  const searchParams = await props.searchParams;

  const currentPage =
    typeof searchParams.page === "string"
      ? Number.parseInt(searchParams.page, 10) || 1
      : 1;

  const pageSizeRaw =
    typeof searchParams.pageSize === "string"
      ? Number.parseInt(searchParams.pageSize, 10) || DEFAULT_PAGE_SIZE
      : DEFAULT_PAGE_SIZE;
  const pageSize = Math.min(
    Math.max(pageSizeRaw, MIN_PAGE_SIZE),
    MAX_PAGE_SIZE,
  );

  // Parse and validate sort parameters
  const sortByParam =
    typeof searchParams.sortBy === "string" ? searchParams.sortBy : undefined;
  const validSortFields: DocumentSortField[] = [
    "title",
    "date_added",
    "updated_at",
    "compliance_status",
    "work_status",
    "online_status",
    "id",
    "structureName",
    "sessionStartDate",
    "authorEmail",
    "commune",
    "modalitesEntreesSorties",
    "wordCount",
  ];
  const sortBy =
    sortByParam && validSortFields.includes(sortByParam as DocumentSortField)
      ? (sortByParam as DocumentSortField)
      : "date_added";

  const sortOrderParam =
    typeof searchParams.sortOrder === "string"
      ? searchParams.sortOrder
      : undefined;
  const sortOrder =
    sortOrderParam === "asc" || sortOrderParam === "desc"
      ? sortOrderParam
      : "desc";

  const authorEmailParam =
    typeof searchParams.authorEmail === "string"
      ? searchParams.authorEmail
      : undefined;

  const searchParam =
    typeof searchParams.search === "string" ? searchParams.search : undefined;

  const serviceParams: GetDocumentsParams = {
    page: currentPage,
    pageSize,
    sortBy,
    sortOrder,
    // Support both 'complianceStatus' (new) and 'status' (legacy) query params
    complianceStatus: searchParams.complianceStatus
      ? (searchParams.complianceStatus as string).split(",")
      : searchParams.status
        ? (searchParams.status as string).split(",")
        : undefined,
    workStatus: searchParams.workStatus as string | undefined,
    onlineStatus: searchParams.onlineStatus as string | undefined,
    dateFrom:
      typeof searchParams.dateFrom === "string"
        ? searchParams.dateFrom
        : undefined,
    dateTo:
      typeof searchParams.dateTo === "string" ? searchParams.dateTo : undefined,
    authorEmail: authorEmailParam,
    search: searchParam,
  };

  const [result, editorsList] = await Promise.all([
    getDocuments(serviceParams),
    getEditorsList(),
  ]);

  const initialFilters = {
    complianceStatus:
      typeof searchParams.complianceStatus === "string"
        ? searchParams.complianceStatus
        : typeof searchParams.status === "string"
          ? searchParams.status
          : "",
    workStatus:
      typeof searchParams.workStatus === "string"
        ? searchParams.workStatus
        : "",
    onlineStatus:
      typeof searchParams.onlineStatus === "string"
        ? searchParams.onlineStatus
        : "",
    dateFrom:
      typeof searchParams.dateFrom === "string" ? searchParams.dateFrom : "",
    dateTo: typeof searchParams.dateTo === "string" ? searchParams.dateTo : "",
    authorEmail: authorEmailParam ?? "",
    search: searchParam ?? "",
  };

  return (
    <DocumentsList
      initialDocuments={result.data}
      totalCount={result.total}
      currentPage={result.page}
      totalPages={result.totalPages}
      pageSize={result.pageSize}
      sortBy={sortBy}
      sortOrder={sortOrder}
      initialFilters={initialFilters}
      initialAuthors={editorsList}
    />
  );
}
