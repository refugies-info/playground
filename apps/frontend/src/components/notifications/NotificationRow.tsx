"use client";

import { NOTIFICATION_NOTE } from "@playground/shared-types";
import { Avatar, cn } from "@playground/ui";
import { RiExternalLinkLine } from "@playground/ui/icons";
import { Archive, Mail, MailOpen } from "lucide-react";
import type { NotificationItem } from "@/services/notifications";
import {
  formatNotificationDate,
  getNotificationHref,
  getNotificationMessage,
  getTypePresentation,
} from "./notification-presentation";

export function NotificationRow({
  item,
  onOpen,
  onToggleRead,
  onArchive,
}: {
  item: NotificationItem;
  onOpen: (item: NotificationItem) => void;
  onToggleRead: (item: NotificationItem) => void;
  onArchive: (item: NotificationItem) => void;
}) {
  const isUnread = item.readAt === null;
  const { icon: TypeIcon, badgeClassName } = getTypePresentation(item.type);
  const message = getNotificationMessage(item);
  const canOpen = getNotificationHref(item) !== null;

  return (
    <div
      className={cn(
        "group relative flex gap-3 border-b border-(--border-default-grey) py-4 pl-4 pr-3",
        "transition-colors hover:bg-(--background-alt-blue-france)",
        isUnread && "border-l-2 border-l-(--blue-france-sun-113-625-hover)",
      )}
    >
      <div className="relative shrink-0">
        <Avatar
          displayName={item.actorName}
          avatarUrl={item.actorAvatar}
          isAI={!item.actorName}
          className="size-8"
        />
        <span
          aria-hidden
          className={cn(
            "absolute -bottom-1 -right-1 flex size-4 items-center justify-center rounded-full",
            badgeClassName,
          )}
        >
          <TypeIcon className="size-2.5" />
        </span>
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <button
          type="button"
          onClick={() => onOpen(item)}
          disabled={!canOpen}
          className={cn(
            "text-left text-sm font-bold leading-6",
            "focus-visible:outline-none focus-visible:underline",
            canOpen ? "cursor-pointer hover:underline" : "cursor-default",
            isUnread
              ? "text-(--text-title-grey)"
              : "text-(--text-mention-grey)",
          )}
        >
          {item.documentTitle ?? "Fiche supprimée"}
        </button>

        <p
          className={cn(
            "text-sm leading-6 text-(--text-mention-grey)",
            item.type === NOTIFICATION_NOTE && "line-clamp-2",
          )}
        >
          {message}
          {item.language && (
            <RiExternalLinkLine
              size={14}
              aria-hidden
              className="ml-1 inline-block align-text-bottom text-(--text-action-high-blue-france)"
            />
          )}
        </p>

        <time
          dateTime={item.createdAt}
          className="text-xs leading-5 text-(--text-disabled-grey)"
        >
          {formatNotificationDate(item.createdAt)}
        </time>
      </div>

      <div className="flex shrink-0 flex-col items-end justify-between">
        <span
          aria-hidden
          className={cn(
            "mt-1 size-2 rounded-full",
            isUnread
              ? "bg-(--blue-france-sun-113-625-hover)"
              : "bg-transparent",
          )}
        />

        <div className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">
          <RowAction
            icon={isUnread ? MailOpen : Mail}
            title={isUnread ? "Marquer comme lue" : "Marquer comme non lue"}
            onClick={() => onToggleRead(item)}
          />
          <RowAction
            icon={Archive}
            title={item.archivedAt ? "Désarchiver" : "Archiver"}
            onClick={() => onArchive(item)}
          />
        </div>
      </div>
    </div>
  );
}

function RowAction({
  icon: Icon,
  title,
  onClick,
}: {
  icon: typeof Archive;
  title: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className="flex size-8 cursor-pointer items-center justify-center rounded text-(--text-mention-grey) transition-colors hover:bg-white hover:text-(--text-action-high-blue-france) focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--border-action-high-blue-france)"
    >
      <Icon className="size-4" />
      <span className="sr-only">{title}</span>
    </button>
  );
}
