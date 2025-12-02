import { DocumentEditorLayout } from "@/components/document-editor/DocumentEditorLayout";
import { getDocumentById } from "@/services/documents";
import { notFound } from "next/navigation";

interface DocumentPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function DocumentPage(props: DocumentPageProps) {
  const params = await props.params;
  const { id } = params;

  // Fetch the document from mock data
  const document = await getDocumentById(id);

  // If document not found, show 404
  if (!document) {
    notFound();
  }

  // Prepare initial data for the editor
  const initialData = {
    id: document.id,
    title: document.title,
    content: document.content, // This is the markdown content from mock data
  };

  return <DocumentEditorLayout documentId={id} initialData={initialData} />;
}
