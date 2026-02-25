import { notFound } from "next/navigation";
import { DocumentLayout } from "@/components/document-editor/DocumentLayout";
import { getDocumentById } from "@/services/documents";
import { fetchRiReferenceData } from "@/services/ri-reference-data";

export const dynamic = "force-dynamic";
export const revalidate = 0;

interface DocumentLayoutProps {
  children: React.ReactNode;
  params: Promise<{
    id: string;
  }>;
}

export default async function Layout({
  children,
  params,
}: DocumentLayoutProps) {
  const { id } = await params;

  // Fetch the document and reference data in parallel
  const [document, referenceData] = await Promise.all([
    getDocumentById(id),
    fetchRiReferenceData(),
  ]);

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
    metadata: document.metadata, // Merged metadata (ingestion + editorial)
    editorialMetadata: document.editorialMetadata, // Editorial overrides only
    metadataReport: document.metadataReport, // AI-generated metadata report
    referenceData, // Themes & needs ID→name lookups from RI
    publishedUrl: document.publishedUrl,
  };

  return (
    <DocumentLayout documentId={id} initialData={initialData}>
      {children}
    </DocumentLayout>
  );
}
