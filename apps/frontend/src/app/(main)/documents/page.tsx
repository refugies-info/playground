import { type GetDocumentsParams, getDocuments } from "@/services/documents";
import { DocumentsList } from "./documents-list";

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function DocumentsPage(props: PageProps) {
  const searchParams = await props.searchParams;
  const { status, state, dateFrom, dateTo } = searchParams;

  // Convert searchParams to the expected types for our service
  const serviceParams: GetDocumentsParams = {
    page: 1, // Keep page 1 for now as we rely on client-side pagination for the batch
    pageSize: 50,
    status: typeof status === "string" ? status : undefined,
    state: typeof state === "string" ? state : undefined,
    dateFrom: typeof dateFrom === "string" ? dateFrom : undefined,
    dateTo: typeof dateTo === "string" ? dateTo : undefined,
  };

  const { data: documents } = await getDocuments(serviceParams);

  const initialFilters = {
    status: typeof status === "string" ? status : "",
    state: typeof state === "string" ? state : "",
    dateFrom: typeof dateFrom === "string" ? dateFrom : "",
    dateTo: typeof dateTo === "string" ? dateTo : "",
  };

  return (
    <DocumentsList
      initialDocuments={documents}
      initialFilters={initialFilters}
    />
  );
}
