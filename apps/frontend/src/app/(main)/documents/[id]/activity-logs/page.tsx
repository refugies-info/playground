import { ActivityLogsView } from "@/components/document-editor/activity-logs";
import { getActivityLogs } from "@/services/activity-logs";
import { getProfilesByRoles } from "@/services/profiles";

interface ActivityLogsPageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

const first = (value: string | string[] | undefined): string =>
  Array.isArray(value) ? (value[0] ?? "") : (value ?? "");

export default async function ActivityLogsPage({
  params,
  searchParams,
}: ActivityLogsPageProps) {
  // Route `id` is the workflow id (document spine) — see getDocumentById.
  const { id } = await params;
  const sp = await searchParams;

  const [logs, profiles] = await Promise.all([
    getActivityLogs(id),
    getProfilesByRoles(["admin", "editor"]),
  ]);

  const initialFilters = {
    type: first(sp.type),
    profile: first(sp.profile),
    language: first(sp.language),
  };

  return (
    <ActivityLogsView
      logs={logs}
      profiles={profiles}
      initialFilters={initialFilters}
    />
  );
}
