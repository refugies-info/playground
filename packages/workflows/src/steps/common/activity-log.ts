import { type ActivityLogType, logger } from "@playground/shared-types";
import type { Json } from "@playground/supabase";
import { getSupabaseClient } from "./supabase";

/**
 * Parameters for recording a single activity-log entry.
 * Only `action` is required; everything else scopes the event.
 */
export interface RecordActivityParams {
  /** Machine-readable event type (matches ACTIVITY_LOG_TYPES values). */
  action: ActivityLogType;
  /** Who performed the action (profile id). NULL for system actions. */
  authorId?: string | null;
  /** Optional second party — e.g. the assignee in an assignation. */
  targetProfileId?: string | null;
  /** Document spine the action relates to (1:1 with a document). */
  workflowId?: string | null;
  /** Link to the letta_reports row that produced this action (AI events). */
  lettaReportId?: string | null;
  /** Free-form payload: before/after snapshots, extra metadata. */
  activity?: Json;
}

/**
 * Record a new entry in the append-only activity_logs audit trail.
 *
 * Server-only — uses the service-role client (writes are not client-grantable).
 * Failures are logged and swallowed: the audit trail must never break the
 * action it is recording.
 *
 * @returns the new log id, or null if the insert failed.
 */
export async function recordActivity(
  params: RecordActivityParams,
): Promise<string | null> {
  const {
    action,
    authorId = null,
    targetProfileId = null,
    workflowId = null,
    lettaReportId = null,
    activity = {},
  } = params;

  try {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from("activity_logs")
      .insert({
        action,
        author_id: authorId,
        target_profile_id: targetProfileId,
        workflow_id: workflowId,
        letta_report_id: lettaReportId,
        activity,
      })
      .select("id")
      .maybeSingle();

    if (error || !data) {
      logger.error(
        { error, action, workflowId },
        "Failed to record activity log",
      );
      return null;
    }

    return data.id;
  } catch (error) {
    logger.error({ error, action, workflowId }, "Error recording activity log");
    return null;
  }
}
