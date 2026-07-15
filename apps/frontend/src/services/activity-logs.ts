import { type ActivityLogType, logger } from "@playground/shared-types";
import { createSupabaseServerClient } from "@playground/supabase";
import { cookies } from "next/headers";
import { mapProfileDto } from "@/lib/profile";

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
  authorEmail?: string;
  /** Author display name for the dynamic text (null = PapaIA). */
  authorName?: string;
  /** Second party display name — e.g. the assignee in an assignation. */
  targetName?: string;
  /** Optional language code carried in the payload (publication_langue). */
  language: string | null;
  /** Compliance verdict carried in the payload (compliance/update_compliance). */
  complianceStatus: string | null;
  /** Free-form note text carried in the payload (note). */
  note: string | null;
  /** Optional AI report linked to the activity log. */
  lettaReport?: {
    tokenCost: number | null;
    model: string | null;
  };
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
      letta_report:letta_reports!activity_logs_letta_report_id_fkey (
        token_cost,
        model
      ),
      author:profiles!activity_logs_author_id_fkey (
        email, first_name, last_name, username, created_at, role, language
      ),
      target:profiles!activity_logs_target_profile_id_fkey (
        email, first_name, last_name, username, created_at, role, language
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
    const author = row.author ? mapProfileDto(row.author) : undefined;
    const target = row.target ? mapProfileDto(row.target) : undefined;

    const activity = (row.activity ?? {}) as Record<string, unknown>;
    const language =
      typeof activity.language === "string" ? activity.language : null;
    const complianceStatus =
      typeof activity.complianceStatus === "string"
        ? activity.complianceStatus
        : null;
    const note = typeof activity.note === "string" ? activity.note : null;
    const lettaReport =
      row.letta_report && typeof row.letta_report === "object"
        ? {
            tokenCost:
              typeof row.letta_report.token_cost === "number"
                ? row.letta_report.token_cost
                : null,
            model:
              typeof row.letta_report.model === "string"
                ? row.letta_report.model
                : null,
          }
        : undefined;

    return {
      id: row.id,
      action: row.action as ActivityLogType,
      createdAt: row.created_at,
      authorEmail: author?.email,
      authorName: author?.displayName,
      targetName: target?.displayName,
      language,
      complianceStatus,
      note,
      lettaReport,
    };
  });
}
