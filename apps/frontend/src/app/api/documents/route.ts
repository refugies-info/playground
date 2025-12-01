import type { MockDocument } from "@shared/types";
import { type NextRequest, NextResponse } from "next/server";
import { generateMockDocuments } from "@/lib/mock/documents";

interface PaginatedResponse {
  data: MockDocument[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export async function GET(
  request: NextRequest,
): Promise<NextResponse<PaginatedResponse>> {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 500));

  const searchParams = request.nextUrl.searchParams;

  // Pagination parameters
  const page = parseInt(searchParams.get("page") || "1", 10);
  const pageSize = parseInt(searchParams.get("pageSize") || "10", 10);

  // Sorting parameters
  const sortBy = searchParams.get("sortBy") || "date_added";
  const sortOrder = (searchParams.get("sortOrder") || "desc") as "asc" | "desc";

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
    let aValue: any = a[sortBy as keyof MockDocument];
    let bValue: any = b[sortBy as keyof MockDocument];

    if (typeof aValue === "string") {
      aValue = aValue.toLowerCase();
      bValue = (bValue as string).toLowerCase();
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
