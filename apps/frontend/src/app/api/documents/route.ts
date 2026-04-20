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
    "compliance_status",
    "work_status",
    "online_status",
    "id",
    "qualityScore",
    "structureName",
    "sessionStartDate",
    "authorEmail",
    "commune",
    "modalitesEntreesSorties",
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
  const complianceStatusFilter = searchParams.get("complianceStatus");
  const workStatusFilter = searchParams.get("workStatus");
  const onlineStatusFilter = searchParams.get("onlineStatus");
  const dateFromFilter = searchParams.get("dateFrom");
  const dateToFilter = searchParams.get("dateTo");

  // Generate mock data
  let documents = generateMockDocuments(100);

  if (complianceStatusFilter) {
    documents = documents.filter(
      (doc) => doc.complianceStatus === complianceStatusFilter, // Corrected property name from compliance_status
    );
  }

  if (workStatusFilter) {
    documents = documents.filter((doc) => doc.workStatus === workStatusFilter); // Corrected property name from work_status
  }

  if (onlineStatusFilter) {
    documents = documents.filter(
      (doc) => doc.onlineStatus === onlineStatusFilter, // Corrected property name from online_status
    );
  }

  if (dateFromFilter) {
    const dateFrom = new Date(dateFromFilter);
    documents = documents.filter((doc) => new Date(doc.date_added) >= dateFrom);
  }

  if (dateToFilter) {
    const dateTo = new Date(dateToFilter);
    documents = documents.filter((doc) => new Date(doc.date_added) <= dateTo);
  }

  // Map sort fields to document properties
  const sortMapping: Record<DocumentSortField, keyof Document> = {
    title: "title",
    date_added: "date_added",
    updated_at: "updated_at",
    compliance_status: "complianceStatus",
    work_status: "workStatus",
    online_status: "onlineStatus",
    id: "id",
    qualityScore: "qualityScore",
    structureName: "structureName",
    sessionStartDate: "sessionStartDate",
    authorEmail: "authorEmail",
    commune: "commune",
    modalitesEntreesSorties: "modalitesEntreesSorties",
    wordCount: "wordCount",
  };

  // Apply sorting
  documents.sort((a, b) => {
    const sortProperty = sortMapping[sortBy as DocumentSortField];
    let aValue: string | number | undefined = a[sortProperty] as
      | string
      | number
      | undefined;
    let bValue: string | number | undefined = b[sortProperty] as
      | string
      | number
      | undefined;

    if (aValue === undefined && bValue === undefined) return 0;
    if (aValue === undefined) return 1;
    if (bValue === undefined) return -1;

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
