"use client";

import { NOTIFICATION_NOTE } from "@playground/shared-types";
import { Avatar, cn } from "@playground/ui";
import {
  FrMarkAsReadLine,
  FrMarkAsUnreadLine,
  RiArchiveLine,
  RiExternalLinkLine,
} from "@playground/ui/icons";
import type { ComponentType } from "react";
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
  const message = getNotificationMessage(item);
  const canOpen = getNotificationHref(item) !== null;
  const { icon: TypeIcon, badgeClassName } = getTypePresentation(item.type);

  return (
    <div
      className={cn(
        "group relative flex items-start gap-3 border-b border-(--border-default-grey) py-4 pl-[13px] pr-4",
        "transition-colors hover:bg-(--background-alt-blue-france)",
        isUnread && "border-l-[3px] border-l-(--border-default-blue-france)",
      )}
    >
      <div className="relative h-fit w-[30px] shrink-0">
        <Avatar
          displayName={item.actorName}
          avatarUrl={item.actorAvatar}
          isAI={!item.actorName}
          className="size-6"
        />
        <span
          aria-hidden
          className={cn(
            "absolute left-3 top-[13px] flex size-[18px] items-center justify-center rounded-full",
            "border-[0.45px] border-(--border-default-grey)",
            badgeClassName,
          )}
        >
          <TypeIcon className="size-[9px]" />
        </span>
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <button
          type="button"
          onClick={() => onOpen(item)}
          disabled={!canOpen}
          className={cn(
            "text-left text-base font-medium leading-6",
            "focus-visible:outline-none focus-visible:underline",
            canOpen ? "cursor-pointer hover:underline" : "cursor-default",
            isUnread
              ? "text-(--text-default-grey)"
              : "text-(--text-disabled-grey)",
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

      <div className="relative flex h-6 w-12 shrink-0 items-center justify-end">
        {isUnread && (
          <span
            aria-hidden
            className="size-2 rounded-full bg-(--border-default-blue-france) group-hover:invisible group-focus-within:invisible"
          />
        )}

        <div className="absolute right-0 top-0 hidden overflow-hidden border border-(--border-default-grey) bg-white group-hover:flex group-focus-within:flex">
          <RowAction
            icon={isUnread ? FrMarkAsReadLine : FrMarkAsUnreadLine}
            title={isUnread ? "Marquer comme lue" : "Marquer comme non lue"}
            onClick={() => onToggleRead(item)}
            className="border-r border-(--border-default-grey)"
          />
          <RowAction
            icon={RiArchiveLine}
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
  className,
}: {
  icon: ComponentType<{ size?: number | string; color?: string }>;
  title: string;
  onClick: () => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={cn(
        "flex size-6 cursor-pointer items-center justify-center text-(--text-mention-grey)",
        "transition-colors hover:bg-(--background-alt-blue-france) hover:text-(--text-action-high-blue-france)",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--border-action-high-blue-france)",
        className,
      )}
    >
      <Icon size={16} aria-hidden />
      <span className="sr-only">{title}</span>
    </button>
  );
}
