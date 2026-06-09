import { createSupabaseServerClient } from "@playground/supabase";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { DocumentLayout } from "@/components/document-editor/shared";
import { getAuthUser } from "@/lib/auth";
import { getDocumentById, getEditorsList } from "@/services/documents";
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

  // Auth (user email pour l'Avatar dans le header) + document + référentiels en parallèle
  const cookieStore = await cookies();
  const supabase = createSupabaseServerClient(cookieStore);

  const [_user, document, referenceData, editors] = await Promise.all([
    getAuthUser(supabase),
    getDocumentById(id),
    fetchRiReferenceData(),
    getEditorsList(),
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
    editorialRecordId: document.editorialRecordId, // For Realtime status subscription
    metadataReport: document.metadataReport, // AI-generated metadata report
    isMetadataGenerating: document.isMetadataGenerating, // Spinner state for MetadataView
    referenceData, // Themes & needs ID→name lookups from RI
    publishedUrl: document.publishedUrl,
    publicationRemoteId: document.publicationRemoteId,
    ingestionVersionLabel: document.ingestionVersionLabel,
    activeIngestionVersion: document.activeIngestionVersion,
    latestIngestionVersion: document.latestIngestionVersion,
    hasPendingIngestionUpdate: document.hasPendingIngestionUpdate,
    activeRunId: document.activeRunId,
    assigneeEmail: document.assigneeEmail,
  };

  return (
    <DocumentLayout documentId={id} initialData={initialData} editors={editors}>
      {children}
    </DocumentLayout>
  );
}
