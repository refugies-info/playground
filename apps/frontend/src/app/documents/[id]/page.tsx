import { notFound } from "next/navigation";
import { DocumentLayout } from "@/components/document-editor/DocumentLayout";
import { getDocumentById } from "@/services/documents";

export const dynamic = "force-dynamic";
export const revalidate = 0;

interface DocumentPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function DocumentPage(props: DocumentPageProps) {
  const params = await props.params;
  const { id } = params;

  // Fetch the document
  const document = await getDocumentById(id);

  // If document not found, show 404
  if (!document) {
    notFound();
  }

  // Prepare initial data for the editor
  const initialData = {
    id: document.id,
    title: document.title,
    complianceStatus: document.complianceStatus,
    workStatus: document.workStatus,
    onlineStatus: document.onlineStatus,
    editorialContent: document.content, // Current working version (editorial or ingestion)
    ingestionContent: document.ingestionContent, // Immutable original from ingestion_records
    complianceReport: document.complianceReport,
    metadata: document.metadata, // Include metadata from ingestion_records
    publishedUrl: document.publishedUrl,
  };

  return <DocumentLayout documentId={params.id} initialData={initialData} />;
}
