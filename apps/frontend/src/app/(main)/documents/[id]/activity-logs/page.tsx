import { ActivityLogsView } from "@/components/document-editor/activity-logs";

export default function ActivityLogsPage() {
  // TODO: profiles fetching is being refactored in a separate PR — empty for now.
  return <ActivityLogsView profiles={[]} />;
}
