"use client";

import { Button, cn } from "@playground/ui";
import { FrArrowLeftSLineDouble } from "@playground/ui/icons";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { useNotifications } from "@/contexts/NotificationsContext";
import { useSidebar } from "@/contexts/SidebarContext";
import {
  fetchNotifications,
  markAllNotificationsAsRead,
  setNotificationArchived,
  setNotificationRead,
} from "@/services/notification-actions";
import type { NotificationItem } from "@/services/notifications";
import { NotificationRow } from "./NotificationRow";
import {
  getNotificationGroup,
  getNotificationHref,
  NOTIFICATION_GROUP_LABELS,
  type NotificationGroupKey,
} from "./notification-presentation";

const GROUP_ORDER: NotificationGroupKey[] = ["today", "week", "older"];

export function NotificationsPanel() {
  const { isOpen, close, refreshUnreadCount } = useNotifications();
  const { isCollapsed } = useSidebar();
  const router = useRouter();

  const panelRef = useRef<HTMLDivElement>(null);
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      setItems(await fetchNotifications({ tab: "all" }));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen) void load();
  }, [isOpen, load]);

  useEffect(() => {
    if (!isOpen) return;

    const handlePointerDown = (event: MouseEvent) => {
      const target = event.target as Node;
      if (panelRef.current?.contains(target)) return;
      if ((target as HTMLElement).closest?.("[aria-expanded]")) return;
      close();
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, close]);

  const applyLocally = useCallback(
    (id: string, patch: Partial<NotificationItem>) => {
      setItems((previous) =>
        previous.map((item) => (item.id === id ? { ...item, ...patch } : item)),
      );
    },
    [],
  );

  const handleOpen = useCallback(
    async (item: NotificationItem) => {
      const href = getNotificationHref(item);
      if (!href) return;

      if (item.readAt === null) {
        applyLocally(item.id, { readAt: new Date().toISOString() });
        await setNotificationRead(item.id, true);
        void refreshUnreadCount();
      }
      close();
      router.push(href);
    },
    [applyLocally, close, refreshUnreadCount, router],
  );

  const handleToggleRead = useCallback(
    async (item: NotificationItem) => {
      const isUnRead = item.readAt === null;
      applyLocally(item.id, {
        readAt: isUnRead ? new Date().toISOString() : null,
      });
      await setNotificationRead(item.id, isUnRead);
      void refreshUnreadCount();
    },
    [applyLocally, refreshUnreadCount],
  );

  const handleArchive = useCallback(
    async (item: NotificationItem) => {
      const isArchived = item.archivedAt === null;
      setItems((previous) => previous.filter((row) => row.id !== item.id));
      await setNotificationArchived(item.id, isArchived);
      void refreshUnreadCount();
    },
    [refreshUnreadCount],
  );

  const handleMarkAllAsRead = useCallback(async () => {
    const now = new Date().toISOString();
    setItems((previous) =>
      previous.map((item) => ({ ...item, readAt: item.readAt ?? now })),
    );
    await markAllNotificationsAsRead();
    void refreshUnreadCount();
  }, [refreshUnreadCount]);

  if (!isOpen) return null;

  const groups = GROUP_ORDER.map((key) => ({
    key,
    items: items.filter((item) => getNotificationGroup(item.createdAt) === key),
  })).filter((group) => group.items.length > 0);

  return (
    <div
      ref={panelRef}
      role="dialog"
      aria-label="Notifications"
      className={cn(
        "fixed inset-y-0 z-40 flex w-[522px] max-w-full flex-col",
        "border-r border-(--border-default-grey) bg-white shadow-lg",
        isCollapsed ? "left-20" : "left-[240px]",
      )}
    >
      <header className="flex items-start justify-between gap-4 px-5 pt-7">
        <h2 className="text-[28px] font-bold leading-9 text-(--text-title-grey)">
          Notifications
        </h2>
        <Button
          variant="quatrieme"
          size="sm"
          onClick={close}
          aria-label="Fermer les notifications"
          className="h-12 w-12 shrink-0 justify-center px-0 text-(--text-disabled-grey)"
        >
          <FrArrowLeftSLineDouble size={20} aria-hidden />
        </Button>
      </header>

      <div className="mx-5 mt-6 border-t border-(--border-default-grey)" />

      <div className="flex-1 overflow-y-auto px-1 pb-4">
        {isLoading && items.length === 0 && (
          <p className="px-4 py-6 text-sm text-(--text-mention-grey)">
            Chargement…
          </p>
        )}

        {!isLoading && items.length === 0 && (
          <p className="px-4 py-6 text-sm text-(--text-mention-grey)">
            Aucune notification pour le moment.
          </p>
        )}

        {groups.map((group) => (
          <section key={group.key} className="mb-2">
            <h3 className="px-4 pb-2 pt-6 text-sm font-medium text-(--text-mention-grey)">
              {NOTIFICATION_GROUP_LABELS[group.key]}
            </h3>
            {group.items.map((item) => (
              <NotificationRow
                key={item.id}
                item={item}
                onOpen={handleOpen}
                onToggleRead={handleToggleRead}
                onArchive={handleArchive}
              />
            ))}
          </section>
        ))}
      </div>

      <footer className="flex justify-center border-t border-(--border-default-grey) px-5 py-5">
        <Button variant="tertiaire" size="sm" onClick={handleMarkAllAsRead}>
          Tout marquer comme lu
        </Button>
      </footer>
    </div>
  );
}
