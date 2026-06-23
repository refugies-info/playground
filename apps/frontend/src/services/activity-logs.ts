import { type ActivityLogType, logger } from "@playground/shared-types";
import { createSupabaseServerClient } from "@playground/supabase";
import { cookies } from "next/headers";
import { displayName } from "@/lib/profile-name";

/**
 * A single activity-log entry, shaped for the activity journal UI.
 * Author/target profiles are resolved to display names; the raw payload
 * is kept for type-specific dynamic values (e.g. publication language).
 */
export interface ActivityLogEntry {
  id: string;
  action: ActivityLogType;
  /** ISO timestamp of the event. */
  createdAt: string;
  /** Author email — drives the avatar (null = system/PapaIA). */
  authorEmail: string | null;
  /** Author display name for the dynamic text (null = PapaIA). */
  authorName: string | null;
  /** Second party display name — e.g. the assignee in an assignation. */
  targetName: string | null;
  /** Optional language code carried in the payload (publication_langue). */
  language: string | null;
}

/** Minimal profile shape returned by the Supabase join. */
interface JoinedProfile {
  email: string | null;
  first_name: string | null;
  last_name: string | null;
  username: string | null;
}

/**
 * Fetch the activity journal for a workflow (= document spine), newest first.
 *
 * Only assignment and publication events are recorded today, so no type
 * filtering is applied here — every entry is surfaced to the journal.
 */
export async function getActivityLogs(
  workflowId: string,
): Promise<ActivityLogEntry[]> {
  const cookieStore = await cookies();
  const supabase = createSupabaseServerClient(cookieStore);

  const { data, error } = await supabase
    .from("activity_logs")
    .select(
      `
      id,
      action,
      created_at,
      activity,
      author:profiles!activity_logs_author_id_fkey (
        email, first_name, last_name, username
      ),
      target:profiles!activity_logs_target_profile_id_fkey (
        email, first_name, last_name, username
      )
    `,
    )
    .eq("workflow_id", workflowId)
    .order("created_at", { ascending: false });

  if (error) {
    logger.error({ error, workflowId }, "Error fetching activity logs");
    return [];
  }

  return (data ?? []).map((row) => {
    const author = (row.author ?? null) as JoinedProfile | null;
    const target = (row.target ?? null) as JoinedProfile | null;
    const activity = (row.activity ?? {}) as Record<string, unknown>;
    const language =
      typeof activity.language === "string" ? activity.language : null;

    return {
      id: row.id,
      action: row.action as ActivityLogType,
      createdAt: row.created_at,
      authorEmail: author?.email ?? null,
      authorName: displayName(author),
      targetName: displayName(target),
      language,
    };
  });
}
