import {
  type ActivityLogType,
  logger,
  NOTIFIABLE_ACTIONS,
  TYPE_ARCHIVE,
  TYPE_ASSIGNMENT,
  TYPE_NOTE,
  TYPE_PUBLICATION,
  TYPE_UPDATE,
  TYPE_UPDATE_COMPLIANCE,
  USER_ROLES,
} from "@playground/shared-types";
import type { SupabaseClient } from "@supabase/supabase-js";
import { getSupabaseClient } from "./supabase";

/** Safety cap when scanning a document's history for contributors. */
const MAX_CONTRIBUTOR_LOGS = 1000;

/**
 * Parameters for fanning one activity-log entry out to its recipients.
 * Mirrors the shape of the activity_logs row that was just inserted.
 */
export interface DispatchNotificationsParams {
  /** The activity_logs row this notification is a view of. */
  activityLogId: string;
  /** Copied from the log row so both timestamps stay identical. */
  createdAt: string;
  /** Machine-readable event type of the source log. */
  action: ActivityLogType;
  /** Document the event relates to. */
  workflowId?: string | null;
  /** Who performed the action — never notified of their own action. */
  authorId?: string | null;
  /** Second party of the event (the assignee, for an assignation). */
  targetProfileId?: string | null;
}

/**
 * Resolve who should receive a notification for a given event.
 *
 * This is the single source of truth for the recipient rules described in
 * RI-1415:
 *   - publication                       -> every BOMO user
 *   - assignment                        -> the assignee carried by the log row
 *   - archive                           -> the document's current assignee
 *   - update / update_compliance / note -> the document's contributors, i.e.
 *     everyone who acted on or was assigned to it since its creation
 *
 * Returns raw ids, possibly containing nulls and duplicates — the caller
 * normalises.
 */
async function resolveRecipients(
  supabase: SupabaseClient,
  { action, workflowId, targetProfileId }: DispatchNotificationsParams,
): Promise<(string | null)[]> {
  switch (action) {
    case TYPE_PUBLICATION: {
      // "Tous les utilisateurs du BOMO" — there is no "active" flag on
      // profiles, so the role list is the audience.
      const { data, error } = await supabase
        .from("profiles")
        .select("id")
        .in("role", USER_ROLES);

      if (error) throw error;
      return (data ?? []).map((profile) => profile.id);
    }

    case TYPE_ASSIGNMENT:
      return targetProfileId ? [targetProfileId] : [];

    case TYPE_ARCHIVE: {
      if (!workflowId) return [];

      const { data, error } = await supabase
        .from("workflows")
        .select("assignee_id")
        .eq("id", workflowId)
        .maybeSingle();

      if (error) throw error;
      return data?.assignee_id ? [data.assignee_id] : [];
    }

    case TYPE_UPDATE:
    case TYPE_UPDATE_COMPLIANCE:
    case TYPE_NOTE: {
      if (!workflowId) return [];

      const { data, error } = await supabase
        .from("activity_logs")
        .select("author_id, target_profile_id")
        .eq("workflow_id", workflowId)
        .limit(MAX_CONTRIBUTOR_LOGS);

      if (error) throw error;
      return (data ?? []).flatMap((log) => [
        log.author_id,
        log.target_profile_id,
      ]);
    }

    default:
      return [];
  }
}

/**
 * Fan a freshly recorded activity-log entry out to one notification row per
 * recipient.
 *
 * Called by recordActivity — do not call it directly, or the notification will
 * not be tied to a persisted log entry.
 *
 * Only the six notifiable actions produce notifications; the other seven
 * activity_log_action values return early.
 *
 * dispatches the matching notifications (see dispatchNotifications)
 *
 * Failures are logged and swallowed: the audit trail outranks the inbox, and a
 * dispatch error must never break the action being recorded.
 *
 * @returns the number of notifications created, or 0 on failure.
 */
export async function dispatchNotifications(
  params: DispatchNotificationsParams,
): Promise<number> {
  const { activityLogId, createdAt, action, authorId = null } = params;

  if (!NOTIFIABLE_ACTIONS.includes(action)) return 0;

  try {
    const supabase = getSupabaseClient();
    const resolved = await resolveRecipients(supabase, params);

    // Drop nulls, drop the actor (nobody is notified of their own action),
    // then dedupe — a contributor appears once per log row they authored.
    const recipients = [
      ...new Set(
        resolved.filter((id): id is string => Boolean(id) && id !== authorId),
      ),
    ];

    if (recipients.length === 0) return 0;

    // ignoreDuplicates relies on the unique (activity_log_id, recipient_id)
    // constraint: replaying a dispatch is a no-op rather than an error.
    const { error } = await supabase.from("notifications").upsert(
      recipients.map((recipientId) => ({
        recipient_id: recipientId,
        activity_log_id: activityLogId,
        created_at: createdAt,
      })),
      {
        onConflict: "activity_log_id,recipient_id",
        ignoreDuplicates: true,
      },
    );

    if (error) {
      logger.error(
        { error, action, activityLogId },
        "Failed to dispatch notifications",
      );
      return 0;
    }

    return recipients.length;
  } catch (error) {
    logger.error(
      { error, action, activityLogId },
      "Error dispatching notifications",
    );
    return 0;
  }
}
