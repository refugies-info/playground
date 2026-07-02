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
  const sessionStart = getQueryParam(searchParams.sessionStart);
  const sessionEnd = getQueryParam(searchParams.sessionEnd);

  const {
    data: inProgressDocuments,
    total,
    totalPages,
  } = await getDocuments({
    page,
    pageSize,
    complianceStatus: ["pending", "error", null], // Include pending, error, and NULL (unevaluated)
    sortBy: "date_added",
    sortOrder: "asc",
    search,
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
      initialFilters={{
        search,
        sessionStart,
        sessionEnd,
      }}
    />
  );
}
