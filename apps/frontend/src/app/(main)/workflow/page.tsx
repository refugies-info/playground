import {
  parseDateFilterCondition,
  parseDateFilterType,
  parseDocumentSortField,
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
  // Filtre de date composite : type + condition + une ou deux dates.
  // Les parsers rejettent les valeurs hors énumération d'une URL bricolée.
  const dateFilterType = parseDateFilterType(
    getQueryParam(searchParams.dateType),
  );
  const dateFilterCondition = parseDateFilterCondition(
    getQueryParam(searchParams.dateCondition),
  );
  const dateFrom = getQueryParam(searchParams.dateFrom);
  const dateTo = getQueryParam(searchParams.dateTo);
  // Type d'entrée : "0" (dates fixes) ou "1" (à tout moment).
  const modalitesEntreesSorties = getQueryParam(
    searchParams.modalitesEntreesSorties,
  );

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
    dateFilterType,
    dateFilterCondition,
    dateFrom,
    dateTo,
    modalitesEntreesSorties,
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
        dateType: dateFilterType ?? "",
        dateCondition: dateFilterCondition ?? "",
        dateFrom,
        dateTo,
        modalitesEntreesSorties,
      }}
    />
  );
}
