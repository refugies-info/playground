import { ActivityLogsView } from "@/components/document-editor/activity-logs";
import { getQueryParam } from "@/lib/search-params";
import { getActivityLogs } from "@/services/activity-logs";
import { getProfilesByRoles } from "@/services/profiles";

interface ActivityLogsPageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

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
    type: getQueryParam(sp.type),
    profile: getQueryParam(sp.profile),
    language: getQueryParam(sp.language),
  };

  return (
    <ActivityLogsView
      logs={logs}
      profiles={profiles}
      initialFilters={initialFilters}
    />
  );
}
