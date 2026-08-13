import {
  type ActivityLogType,
  logger,
  type NotificationType,
  notificationTypeFromAction,
} from "@playground/shared-types";
import { createSupabaseServerClient } from "@playground/supabase";
import { cookies } from "next/headers";
import { mapProfileDto } from "@/lib/profile";

/**
 * Counts backing the three filter tabs of the notification panel.
 * `all` excludes archived notifications — "Toutes" means "everything still in
 * the inbox", per the specification.
 */
export interface NotificationCounts {
  all: number;
  unread: number;
  archived: number;
}

const EMPTY_COUNTS: NotificationCounts = { all: 0, unread: 0, archived: 0 };

/**
 * Fetch the notification counters for the current user.
 *
 * The three counts are issued in parallel as head-only queries: `count: exact`
 * with `head: true` returns the count in a header and transfers no rows.
 *
 * No recipient filter is applied on purpose — RLS scopes every query to
 * auth.uid(), so a caller can only ever count their own notifications.
 */
export async function getNotificationCounts(): Promise<NotificationCounts> {
  const cookieStore = await cookies();
  const supabase = createSupabaseServerClient(cookieStore);

  const countQuery = () =>
    supabase.from("notifications").select("id", { count: "exact", head: true });

  const [all, unread, archived] = await Promise.all([
    countQuery().is("archived_at", null),
    countQuery().is("archived_at", null).is("read_at", null),
    countQuery().not("archived_at", "is", null),
  ]);

  const failure = all.error ?? unread.error ?? archived.error;
  if (failure) {
    logger.error({ error: failure }, "Error fetching notification counts");
    return EMPTY_COUNTS;
  }

  return {
    all: all.count ?? 0,
    unread: unread.count ?? 0,
    archived: archived.count ?? 0,
  };
}

/** The three tabs of the panel's segmented control. */
export type NotificationTab = "all" | "unread" | "archived";

/**
 * One row of the notification panel.
 *
 * Flattened on purpose: the panel never needs the activity_logs row itself, only
 * what it takes to render a line — who, on which document, what kind of event.
 */
export interface NotificationItem {
  id: string;
  type: NotificationType;
  action: ActivityLogType;
  createdAt: string;
  readAt: string | null;
  archivedAt: string | null;
  documentId: string | null;
  documentTitle: string | null;
  actorName?: string;
  actorAvatar?: string;
  targetName?: string;
  note: string | null;
  language: string | null;
  /**
   * URL publique de la fiche sur Réfugiés.info, portée par la charge d'une
   * publication. C'est la destination du lien externe de la ligne — le titre,
   * lui, renvoie vers la fiche dans le BOMO.
   */
  publishedUrl: string | null;
  /**
   * Non utilisée pour l'instant, mais on la récupère pour pouvoir l'afficher dans le futur.
   */
  complianceStatus: string | null;
}

const NOTIFICATION_LIST_SELECT = `
  id,
  read_at,
  archived_at,
  created_at,
  activity_log:activity_logs!notifications_activity_log_id_fkey (
    action,
    activity,
    workflow_id,
    author:profiles!activity_logs_author_id_fkey (
      id, email, first_name, last_name, username, created_at, role, language, avatar_url
    ),
    target:profiles!activity_logs_target_profile_id_fkey (
      id, email, first_name, last_name, username, created_at, role, language, avatar_url
    )
  )
`;

/**
 * List the current user's notifications, newest first.
 *
 * @param options.tab - `all` excludes archived rows, as "Toutes" means "still in
 *   the inbox". `unread` additionally keeps `read_at IS NULL`.
 * @param options.types - Restrict to these notification types. Empty or omitted
 *   means no type filtering.
 */
export async function listNotifications(
  options: { tab?: NotificationTab; types?: readonly NotificationType[] } = {},
): Promise<NotificationItem[]> {
  const { tab = "all", types } = options;

  const cookieStore = await cookies();
  const supabase = createSupabaseServerClient(cookieStore);

  let query = supabase
    .from("notifications")
    .select(NOTIFICATION_LIST_SELECT)
    .order("created_at", { ascending: false });

  query =
    tab === "archived"
      ? query.not("archived_at", "is", null)
      : query.is("archived_at", null);
  if (tab === "unread") query = query.is("read_at", null);

  const { data, error } = await query;

  if (error) {
    logger.error({ error, tab }, "Error fetching notifications");
    return [];
  }

  const rows = data ?? [];

  const workflowIds = [
    ...new Set(
      rows
        .map((row) => row.activity_log?.workflow_id)
        .filter((id): id is string => Boolean(id)),
    ),
  ];

  const titles = new Map<string, string | null>();
  if (workflowIds.length > 0) {
    const { data: documents, error: titlesError } = await supabase
      .from("workflows_enriched")
      .select("id, title")
      .in("id", workflowIds);

    if (titlesError) {
      logger.error({ error: titlesError }, "Error fetching document titles");
    }
    for (const document of documents ?? []) {
      if (document.id) titles.set(document.id, document.title);
    }
  }

  const selectedTypes = types && types.length > 0 ? new Set(types) : null;

  const items: NotificationItem[] = [];
  for (const row of rows) {
    const log = row.activity_log;
    if (!log) continue;

    const action = log.action as ActivityLogType;
    const type = notificationTypeFromAction(action);
    if (!type) continue;
    if (selectedTypes && !selectedTypes.has(type)) continue;

    const author = log.author ? mapProfileDto(log.author) : undefined;
    const target = log.target ? mapProfileDto(log.target) : undefined;
    const activity = (log.activity ?? {}) as Record<string, unknown>;

    items.push({
      id: row.id,
      type,
      action,
      createdAt: row.created_at,
      readAt: row.read_at,
      archivedAt: row.archived_at,
      documentId: log.workflow_id,
      documentTitle: log.workflow_id
        ? (titles.get(log.workflow_id) ?? null)
        : null,
      actorName: author?.displayName,
      actorAvatar: author?.avatarUrl,
      targetName: target?.displayName,
      note: typeof activity.note === "string" ? activity.note : null,
      language:
        typeof activity.language === "string" ? activity.language : null,
      publishedUrl:
        typeof activity.publishedUrl === "string"
          ? activity.publishedUrl
          : null,
      complianceStatus:
        typeof activity.complianceStatus === "string"
          ? activity.complianceStatus
          : null,
    });
  }

  return items;
}
