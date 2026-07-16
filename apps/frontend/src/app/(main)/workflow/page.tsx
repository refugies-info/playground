import {
  type DocumentSortField,
  parseSearchField,
} from "@playground/shared-types";
import { getQueryParam } from "@/lib/search-params";
import { getDocuments } from "@/services/documents";
import { WorkflowClient } from "./workflow-client";

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

const DEFAULT_PAGE_SIZE = 20;
const MIN_PAGE_SIZE = 1;
const MAX_PAGE_SIZE = 100;

export default async function WorkflowPage(props: PageProps) {
  const searchParams = await props.searchParams;
  const page =
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

  const search = getQueryParam(searchParams.search);
  const searchField = parseSearchField(getQueryParam(searchParams.searchField));
  const sessionStart = getQueryParam(searchParams.sessionStart);
  const sessionEnd = getQueryParam(searchParams.sessionEnd);

  // Parse and validate sort parameters (server-side sort).
  const sortByParam = getQueryParam(searchParams.sortBy);
  const validSortFields: DocumentSortField[] = [
    "date_added",
    "compliance_status",
    "qualityScore",
    "wordCount",
    "title",
    "structureName",
    "sessionStartDate",
    "activeIngestionVersion",
  ];
  const sortBy =
    sortByParam && validSortFields.includes(sortByParam as DocumentSortField)
      ? (sortByParam as DocumentSortField)
      : "date_added";
  const sortOrderParam = getQueryParam(searchParams.sortOrder);
  const sortOrder =
    sortOrderParam === "asc" || sortOrderParam === "desc"
      ? sortOrderParam
      : "asc";

  const {
    data: inProgressDocuments,
    total,
    totalPages,
  } = await getDocuments({
    page,
    pageSize,
    complianceStatus: ["pending", "error", null], // Include pending, error, and NULL (unevaluated)
    sortBy,
    sortOrder,
    search,
    searchField,
    searchInContent: true, // texte étendu : titre, structure, commune, id + markdown
    sessionStart,
    sessionEnd,
    includePreviewFields: true,
  });

  return (
    <WorkflowClient
      inProgressDocuments={inProgressDocuments}
      totalCount={total}
      currentPage={page}
      totalPages={totalPages}
      pageSize={pageSize}
      sortBy={sortBy}
      sortOrder={sortOrder}
      initialFilters={{
        search,
        searchField: searchField ?? "",
        sessionStart,
        sessionEnd,
      }}
    />
  );
}
