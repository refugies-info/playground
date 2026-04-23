import { createSupabaseServerClient } from "@playground/supabase";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { DocumentLayout } from "@/components/document-editor/shared";
import { getAuthUser, getUserProfile } from "@/lib/auth";
import { SIDEBAR_COOKIE } from "@/lib/cookies";
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

  // Lance tout en parallèle — auth, document et référentiels ne se bloquent pas mutuellement
  const cookieStore = await cookies();
  const supabase = createSupabaseServerClient(cookieStore);
  const userPromise = getAuthUser(supabase);
  const documentPromise = getDocumentById(id);
  const referenceDataPromise = fetchRiReferenceData();

  const user = await userPromise;
  const [profile, document, referenceData] = await Promise.all([
    user ? getUserProfile(supabase, user.id) : null,
    documentPromise,
    referenceDataPromise,
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
  };

  const sidebarCollapsed = cookieStore.get(SIDEBAR_COOKIE)?.value === "true";

  return (
    <DocumentLayout
      documentId={id}
      initialData={initialData}
      userRole={profile?.role ?? null}
      userEmail={user?.email ?? null}
      sidebarCollapsed={sidebarCollapsed}
    >
      {children}
    </DocumentLayout>
  );
}
