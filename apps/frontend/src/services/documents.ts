import type { MockDocument } from "@playground/shared-types";
import { generateMockDocuments } from "@/lib/mock/documents";

export interface GetDocumentsParams {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  status?: string;
  state?: string;
  dateFrom?: string;
  dateTo?: string;
}

export async function getDocuments(params: GetDocumentsParams) {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 500));

  const {
    page = 1,
    pageSize = 10,
    sortBy = "date_added",
    sortOrder = "desc",
    status,
    state,
    dateFrom: dateFromFilter,
    dateTo: dateToFilter,
  } = params;

  // Generate mock data
  let documents = generateMockDocuments(100);

  // Apply filters
  if (status) {
    documents = documents.filter((doc) => doc.status === status);
  }

  if (state) {
    documents = documents.filter((doc) => doc.state === state);
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
    let aValue: string | number = a[sortBy as keyof MockDocument] as
      | string
      | number;
    let bValue: string | number = b[sortBy as keyof MockDocument] as
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

  return {
    data: paginatedDocuments,
    total,
    page,
    pageSize,
    totalPages,
  };
}
