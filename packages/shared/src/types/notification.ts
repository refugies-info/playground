/**
 * Notification Types
 * Product-facing view of the activity log: the five notification kinds the
 * BOMO sidebar can display and filter on.
 *
 * Deliberately coarser than ACTIVITY_LOG_TYPES (13 values): the audit trail
 * distinguishes `update` from `update_compliance`, the editorial team only ever
 * sees "MAJ". Hence the `actions` mapping rather than a shared enum.
 */

import {
  type ActivityLogType,
  TYPE_ARCHIVE,
  TYPE_ASSIGNMENT,
  TYPE_NOTE,
  TYPE_PUBLICATION,
  TYPE_UPDATE,
  TYPE_UPDATE_COMPLIANCE,
} from "./activity-log";

/**
 * Metadata for a single notification type.
 * `icon` is a lucide-react component name.
 * `actions` lists the activity_log_action values that produce this type.
 */
export interface NotificationTypeMeta {
  value: string;
  label: string;
  icon: string;
  actions: readonly ActivityLogType[];
}

export const NOTIFICATION_PUBLICATION = "publication";
export const NOTIFICATION_UPDATE = "update";
export const NOTIFICATION_ARCHIVE = "archive";
export const NOTIFICATION_ASSIGNMENT = "assignment";
export const NOTIFICATION_NOTE = "note";

export const NOTIFICATION_TYPES = [
  {
    value: NOTIFICATION_PUBLICATION,
    label: "Publication",
    icon: "Send",
    actions: [TYPE_PUBLICATION],
  },
  {
    value: NOTIFICATION_UPDATE,
    label: "MAJ",
    icon: "RefreshCw",
    actions: [TYPE_UPDATE, TYPE_UPDATE_COMPLIANCE],
  },
  {
    value: NOTIFICATION_ARCHIVE,
    label: "Archivage",
    icon: "Archive",
    actions: [TYPE_ARCHIVE],
  },
  {
    value: NOTIFICATION_ASSIGNMENT,
    label: "Assignation",
    icon: "UserPlus",
    actions: [TYPE_ASSIGNMENT],
  },
  {
    value: NOTIFICATION_NOTE,
    label: "Note",
    icon: "MessageSquare",
    actions: [TYPE_NOTE],
  },
] as const satisfies readonly NotificationTypeMeta[];

/** Union of all valid notification type values. */
export type NotificationType = (typeof NOTIFICATION_TYPES)[number]["value"];

/**
 * Every activity_log_action that triggers a notification.
 * Used as the runtime guard in dispatchNotifications.
 */
export const NOTIFIABLE_ACTIONS = NOTIFICATION_TYPES.flatMap(
  (type) => type.actions,
) as readonly ActivityLogType[];

/** Map an activity_log_action to its notification type, if any. */
export function notificationTypeFromAction(
  action: ActivityLogType,
): NotificationType | null {
  const meta = NOTIFICATION_TYPES.find((type) =>
    (type.actions as readonly string[]).includes(action),
  );
  return meta?.value ?? null;
}

/** Expand selected notification types to the actions to filter the query on. */
export function actionsForNotificationTypes(
  types: readonly NotificationType[],
): ActivityLogType[] {
  return NOTIFICATION_TYPES.filter((meta) =>
    (types as readonly string[]).includes(meta.value),
  ).flatMap((meta) => [...meta.actions]);
}
