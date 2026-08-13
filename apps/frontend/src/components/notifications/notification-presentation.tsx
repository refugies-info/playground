import {
  NOTIFICATION_ARCHIVE,
  NOTIFICATION_ASSIGNMENT,
  NOTIFICATION_NOTE,
  NOTIFICATION_PUBLICATION,
  NOTIFICATION_UPDATE,
} from "@playground/shared-types";
import type { NotificationItem } from "@/services/notifications";

export function getNotificationMessage(item: NotificationItem): string {
  const actor = item.actorName ?? "PapaIA";

  switch (item.type) {
    case NOTIFICATION_PUBLICATION:
      return `Publiée par ${actor}`;
    case NOTIFICATION_ARCHIVE:
      return `Archivée par ${actor}`;
    case NOTIFICATION_ASSIGNMENT:
      return `${actor} vous a assigné`;
    case NOTIFICATION_NOTE:
      return item.note
        ? `${actor} : ${item.note}`
        : `${actor} a laissé une note`;
    case NOTIFICATION_UPDATE:
      return item.complianceStatus === "non_compliant"
        ? "Une nouvelle version a été récupérée et rend la fiche non conforme"
        : "Une nouvelle version a été récupérée";
    default:
      return "";
  }
}

export function getNotificationHref(item: NotificationItem): string | null {
  if (!item.documentId) return null;
  return item.type === NOTIFICATION_NOTE
    ? `/documents/${item.documentId}/activity-logs`
    : `/documents/${item.documentId}`;
}

export function formatNotificationDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";

  const day = date.toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
  });
  const time = date
    .toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })
    .replace(":", "h");

  return `${day} – ${time}`;
}

export type NotificationGroupKey = "today" | "week" | "older";

export const NOTIFICATION_GROUP_LABELS: Record<NotificationGroupKey, string> = {
  today: "Aujourd'hui",
  week: "7 derniers jours",
  older: "Plus anciens",
};

export function getNotificationGroup(iso: string): NotificationGroupKey {
  const date = new Date(iso);
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  if (date >= startOfToday) return "today";

  const startOfWeek = new Date(startOfToday);
  startOfWeek.setDate(startOfWeek.getDate() - 7);
  return date >= startOfWeek ? "week" : "older";
}
