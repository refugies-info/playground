import type { Document, DocumentSortField } from "@playground/shared-types";
import { type NextRequest, NextResponse } from "next/server";
import { generateMockDocuments } from "@/lib/mock/documents";

interface PaginatedResponse {
  data: Document[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

interface ErrorResponse {
  error: string;
}

export async function GET(
  request: NextRequest,
): Promise<NextResponse<PaginatedResponse | ErrorResponse>> {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 500));

  const searchParams = request.nextUrl.searchParams;

  // Pagination parameters
  const page = parseInt(searchParams.get("page") || "1", 10);
  const pageSize = parseInt(searchParams.get("pageSize") || "10", 10);

  // Sorting parameters
  const sortByParam = searchParams.get("sortBy") || "date_added";
  const sortOrder = (searchParams.get("sortOrder") || "desc") as "asc" | "desc";

  // Validate sortBy parameter
  const validSortFields: DocumentSortField[] = [
    "title",
    "date_added",
    "updated_at",
    "status",
    "state",
  ];
  if (!validSortFields.includes(sortByParam as DocumentSortField)) {
    return NextResponse.json(
      {
        error: `Invalid sortBy parameter. Must be one of: ${validSortFields.join(
          ", ",
        )}`,
      },
      { status: 400 },
    );
  }
  const sortBy = sortByParam as DocumentSortField;

  // Filter parameters
  const statusFilter = searchParams.get("status");
  const stateFilter = searchParams.get("state");
  const dateFromFilter = searchParams.get("dateFrom");
  const dateToFilter = searchParams.get("dateTo");

  // Generate mock data
  let documents = generateMockDocuments(100);

  // Apply filters
  if (statusFilter) {
    documents = documents.filter((doc) => doc.status === statusFilter);
  }

  if (stateFilter) {
    documents = documents.filter((doc) => doc.state === stateFilter);
  }

  if (dateFromFilter) {
    const dateFrom = new Date(dateFromFilter);
    documents = documents.filter((doc) => new Date(doc.date_added) >= dateFrom);
  }

  if (dateToFilter) {
    const dateTo = new Date(dateToFilter);
    documents = documents.filter((doc) => new Date(doc.date_added) <= dateTo);
  }

  // Apply sorting
  documents.sort((a, b) => {
    let aValue: string | number = a[sortBy as keyof Document] as
      | string
      | number;
    let bValue: string | number = b[sortBy as keyof Document] as
      | string
      | number;

    if (typeof aValue === "string" && typeof bValue === "string") {
      aValue = aValue.toLowerCase();
      bValue = bValue.toLowerCase();
    }

    if (aValue < bValue) {
      return sortOrder === "asc" ? -1 : 1;
    }
    if (aValue > bValue) {
      return sortOrder === "asc" ? 1 : -1;
    }
    return 0;
  });

  // Apply pagination
  const total = documents.length;
  const totalPages = Math.ceil(total / pageSize);
  const startIndex = (page - 1) * pageSize;
  const paginatedDocuments = documents.slice(startIndex, startIndex + pageSize);

  return NextResponse.json({
    data: paginatedDocuments,
    total,
    page,
    pageSize,
    totalPages,
  });
}
