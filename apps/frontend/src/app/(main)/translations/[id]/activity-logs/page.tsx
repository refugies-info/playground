import { notFound } from "next/navigation";
import { ActivityLogsView } from "@/components/document-editor/activity-logs";
import { getActivityLogs } from "@/services/activity-logs";
import { getProfilesByRoles } from "@/services/profiles";
import { getTranslationById } from "@/services/translations";

interface ActivityLogsPageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

const first = (value: string | string[] | undefined): string =>
  Array.isArray(value) ? (value[0] ?? "") : (value ?? "");

export default async function TranslationActivityLogsPage({
  params,
  searchParams,
}: ActivityLogsPageProps) {
  // Route `id` is the translation id — the journal is keyed by the workflow
  // of the source document (shared with the FR fiche).
  const { id } = await params;
  const sp = await searchParams;

  const translation = await getTranslationById(id);

  if (!translation?.workflowId) {
    notFound();
  }

  const [logs, profiles] = await Promise.all([
    getActivityLogs(translation.workflowId),
    getProfilesByRoles(["admin", "editor"]),
  ]);

  const initialFilters = {
    type: first(sp.type),
    profile: first(sp.profile),
    language: first(sp.language),
  };

  return (
    <ActivityLogsView
      workflowId={translation.workflowId}
      logs={logs}
      profiles={profiles}
      initialFilters={initialFilters}
    />
  );
}
