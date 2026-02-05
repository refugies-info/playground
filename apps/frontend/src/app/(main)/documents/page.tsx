import type { DocumentSortField } from "@playground/shared-types";
import { type GetDocumentsParams, getDocuments } from "@/services/documents";
import { DocumentsList } from "./documents-list";

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function DocumentsPage(props: PageProps) {
  const searchParams = await props.searchParams;

  const currentPage =
    typeof searchParams.page === "string"
      ? Number.parseInt(searchParams.page, 10) || 1
      : 1;

  const pageSizeRaw =
    typeof searchParams.pageSize === "string"
      ? Number.parseInt(searchParams.pageSize, 10) || 50
      : 50;
  const pageSize = Math.min(Math.max(pageSizeRaw, 1), 100);

  // Parse and validate sort parameters
  const sortByParam =
    typeof searchParams.sortBy === "string" ? searchParams.sortBy : undefined;
  const validSortFields: DocumentSortField[] = [
    "date_added",
    "updated_at",
    "status",
    "state",
    "title",
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

  const serviceParams: GetDocumentsParams = {
    page: currentPage,
    pageSize,
    sortBy,
    sortOrder,
    status:
      typeof searchParams.status === "string" ? searchParams.status : undefined,
    state:
      typeof searchParams.state === "string" ? searchParams.state : undefined,
    dateFrom:
      typeof searchParams.dateFrom === "string"
        ? searchParams.dateFrom
        : undefined,
    dateTo:
      typeof searchParams.dateTo === "string" ? searchParams.dateTo : undefined,
  };

  const result = await getDocuments(serviceParams);

  const initialFilters = {
    status: typeof searchParams.status === "string" ? searchParams.status : "",
    state: typeof searchParams.state === "string" ? searchParams.state : "",
    dateFrom:
      typeof searchParams.dateFrom === "string" ? searchParams.dateFrom : "",
    dateTo: typeof searchParams.dateTo === "string" ? searchParams.dateTo : "",
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
    />
  );
}
