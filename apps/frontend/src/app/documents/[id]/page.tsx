import { notFound } from "next/navigation";
import { DocumentEditorLayout } from "@/components/document-editor/DocumentEditorLayout";
import { getDocumentById } from "@/services/documents";

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
    editorialContent: document.content, // Current working version (editorial or ingestion)
    ingestionContent: document.ingestionContent, // Immutable original from ingestion_records
    metadata: document.metadata, // Include metadata from ingestion_records
  };

  return <DocumentEditorLayout documentId={id} initialData={initialData} />;
}
