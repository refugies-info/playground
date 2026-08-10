import { logger } from "@playground/shared-types";
import { createSupabaseServerClient } from "@playground/supabase";
import { cookies } from "next/headers";

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
