import {
  parseDateFilterCondition,
  parseDateFilterType,
  parseDocumentSortField,
  parseSearchField,
} from "@playground/shared-types";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getIngestionSource } from "@/lib/ingestion-source";
import { getQueryParam, WORKFLOW_FILTERS_COOKIE } from "@/lib/search-params";
import { getDocuments } from "@/services/documents";
import { getLatestIngestionRun } from "@/services/ingestion-runs";
import { WorkflowClient } from "./workflow-client";

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

const DEFAULT_PAGE_SIZE = 20;
const MIN_PAGE_SIZE = 1;
const MAX_PAGE_SIZE = 100;

export default async function WorkflowPage(props: PageProps) {
  const searchParams = await props.searchParams;
  const savedQuery = (await cookies()).get(WORKFLOW_FILTERS_COOKIE)?.value;
  if (Object.keys(searchParams).length === 0 && savedQuery)
    redirect(`/workflow?${savedQuery}`);
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

  // Parsers reject values outside their enum (hand-crafted URLs).
  const filters = {
    search: getQueryParam(searchParams.search),
    searchField: parseSearchField(getQueryParam(searchParams.searchField)),
    dateFilterType: parseDateFilterType(getQueryParam(searchParams.dateType)),
    dateFilterCondition: parseDateFilterCondition(
      getQueryParam(searchParams.dateCondition),
    ),
    dateFrom: getQueryParam(searchParams.dateFrom),
    dateTo: getQueryParam(searchParams.dateTo),
    // "0" (dates fixes) or "1" (à tout moment).
    modalitesEntreesSorties: getQueryParam(
      searchParams.modalitesEntreesSorties,
    ),
    origin: getQueryParam(searchParams.origin),
    excludedContent: getQueryParam(searchParams.excludedContent),
  };

  // Parse and validate sort parameters (server-side sort).
  const sortBy = parseDocumentSortField(
    getQueryParam(searchParams.sortBy),
    "date_added",
  );
  const sortOrderParam = getQueryParam(searchParams.sortOrder);
  const sortOrder =
    sortOrderParam === "asc" || sortOrderParam === "desc"
      ? sortOrderParam
      : "asc";

  const ingestionSource = getIngestionSource();
  const [{ data: inProgressDocuments, total, totalPages }, latestIngestionRun] =
    await Promise.all([
      getDocuments({
        page,
        pageSize,
        complianceStatus: ["pending", "error", null], // Include pending, error, and NULL (unevaluated)
        sortBy,
        sortOrder,
        ...filters,
        excludedContent: filters.excludedContent.split(","),
        searchInContent: true, // texte étendu : titre, structure, commune, id + markdown
        includePreviewFields: true,
      }),
      getLatestIngestionRun(ingestionSource),
    ]);

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
        search: filters.search,
        searchField: filters.searchField ?? "",
        dateType: filters.dateFilterType ?? "",
        dateCondition: filters.dateFilterCondition ?? "",
        dateFrom: filters.dateFrom,
        dateTo: filters.dateTo,
        modalitesEntreesSorties: filters.modalitesEntreesSorties,
        origin: filters.origin,
        excludedContent: filters.excludedContent,
      }}
      ingestionSource={ingestionSource}
      latestIngestionRun={latestIngestionRun}
    />
  );
}
