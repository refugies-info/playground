import type { DocumentSortField } from "@playground/shared-types";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getQueryParam } from "@/lib/search-params";
import { type GetDocumentsParams, getDocuments } from "@/services/documents";
import { getProfilesByRoles } from "@/services/profiles";
import { DocumentsList } from "./documents-list";

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

const DEFAULT_PAGE_SIZE = 50;
const MIN_PAGE_SIZE = 1;
const MAX_PAGE_SIZE = 100;

export default async function DocumentsPage(props: PageProps) {
  // Translators must not access /documents — redirect to /translations
  const currentUser = await getCurrentUser();
  if (currentUser.role === "translator") redirect("/translations");
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
  const sortByParam = getQueryParam(searchParams.sortBy);
  const validSortFields: DocumentSortField[] = [
    "title",
    "date_added",
    "arbitrationDate",
    "updated_at",
    "compliance_status",
    "work_status",
    "online_status",
    "id",
    "structureName",
    "sessionStartDate",
    "assigneeEmail",
    "commune",
    "modalitesEntreesSorties",
    "wordCount",
    "activeIngestionVersion",
  ];
  const sortBy =
    sortByParam && validSortFields.includes(sortByParam as DocumentSortField)
      ? (sortByParam as DocumentSortField)
      : "arbitrationDate";

  const sortOrderParam = getQueryParam(searchParams.sortOrder);
  const sortOrder =
    sortOrderParam === "asc" || sortOrderParam === "desc"
      ? sortOrderParam
      : "desc";

  const assigneeEmailParam = getQueryParam(searchParams.assigneeEmail);

  const searchParam = getQueryParam(searchParams.search);

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
    workStatus: getQueryParam(searchParams.workStatus),
    onlineStatus: getQueryParam(searchParams.onlineStatus),
    sessionStart: getQueryParam(searchParams.sessionStart),
    sessionEnd: getQueryParam(searchParams.sessionEnd),
    assigneeEmail: assigneeEmailParam,
    search: searchParam,
    modalitesEntreesSorties: getQueryParam(
      searchParams.modalitesEntreesSorties,
    ),
  };

  const [result, editorsList] = await Promise.all([
    getDocuments(serviceParams),
    getProfilesByRoles(["admin", "editor"]),
  ]);

  const initialFilters = {
    complianceStatus:
      getQueryParam(searchParams.complianceStatus) ||
      getQueryParam(searchParams.status),
    workStatus: getQueryParam(searchParams.workStatus),
    onlineStatus: getQueryParam(searchParams.onlineStatus),
    sessionStart: getQueryParam(searchParams.sessionStart),
    sessionEnd: getQueryParam(searchParams.sessionEnd),
    assigneeEmail: assigneeEmailParam,
    search: searchParam,
    modalitesEntreesSorties: getQueryParam(
      searchParams.modalitesEntreesSorties,
    ),
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
