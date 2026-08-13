"use server";

import { logger, type NotificationType } from "@playground/shared-types";
import { createSupabaseServerClient } from "@playground/supabase";
import { cookies } from "next/headers";
import {
  getNotificationCounts,
  listNotifications,
  type NotificationCounts,
  type NotificationItem,
  type NotificationTab,
} from "./notifications";

export interface NotificationActionResult {
  success: boolean;
  error?: string;
}

/**
 * Set or clear the read mark of one notification.
 *
 * @param id - `notifications.id`.
 * @param read - `true` → lue maintenant, `false` → non lue.
 */
export async function setNotificationRead(
  id: string,
  read: boolean,
): Promise<NotificationActionResult> {
  if (!id) return { success: false, error: "Identifiant manquant" };

  try {
    const cookieStore = await cookies();
    const supabase = createSupabaseServerClient(cookieStore);

    const { error } = await supabase
      .from("notifications")
      .update({ read_at: read ? new Date().toISOString() : null })
      .eq("id", id);

    if (error) {
      logger.error(
        { error, id, read },
        "Error updating notification read mark",
      );
      return { success: false, error: "Erreur lors de la mise à jour" };
    }

    return { success: true };
  } catch (error) {
    logger.error({ error, id }, "Unexpected error updating notification");
    return { success: false, error: "Erreur inattendue" };
  }
}

/**
 * Archive or unarchive one notification.
 *
 * @param id - `notifications.id`.
 * @param archived - `true` → archivée, `false` → de retour dans la liste.
 */
export async function setNotificationArchived(
  id: string,
  archived: boolean,
): Promise<NotificationActionResult> {
  if (!id) return { success: false, error: "Identifiant manquant" };

  try {
    const cookieStore = await cookies();
    const supabase = createSupabaseServerClient(cookieStore);

    const { error } = await supabase
      .from("notifications")
      .update({ archived_at: archived ? new Date().toISOString() : null })
      .eq("id", id);

    if (error) {
      logger.error({ error, id, archived }, "Error archiving notification");
      return { success: false, error: "Erreur lors de l'archivage" };
    }

    return { success: true };
  } catch (error) {
    logger.error({ error, id }, "Unexpected error archiving notification");
    return { success: false, error: "Erreur inattendue" };
  }
}

export async function fetchNotifications(
  options: { tab?: NotificationTab; types?: readonly NotificationType[] } = {},
): Promise<NotificationItem[]> {
  return listNotifications(options);
}

export async function markAllNotificationsAsRead(): Promise<NotificationActionResult> {
  try {
    const cookieStore = await cookies();
    const supabase = createSupabaseServerClient(cookieStore);

    const { error } = await supabase
      .from("notifications")
      .update({ read_at: new Date().toISOString() })
      .is("archived_at", null)
      .is("read_at", null);

    if (error) {
      logger.error({ error }, "Error marking all notifications as read");
      return { success: false, error: "Erreur lors de la mise à jour" };
    }

    return { success: true };
  } catch (error) {
    logger.error({ error }, "Unexpected error marking all as read");
    return { success: false, error: "Erreur inattendue" };
  }
}

export async function fetchNotificationCounts(): Promise<NotificationCounts> {
  return getNotificationCounts();
}
