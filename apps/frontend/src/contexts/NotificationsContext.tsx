"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { createClient } from "@/lib/supabase/client";

interface NotificationsContextValue {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
  unreadCount: number;
  refreshUnreadCount: () => Promise<void>;
}

const NotificationsContext = createContext<NotificationsContextValue | null>(
  null,
);

export function NotificationsProvider({
  children,
  initialUnreadCount = 0,
}: {
  children: React.ReactNode;
  initialUnreadCount?: number;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(initialUnreadCount);
  const [supabase] = useState(() => createClient());

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);
  const toggle = useCallback(() => setIsOpen((previous) => !previous), []);

  const refreshUnreadCount = useCallback(async () => {
    const { count, error } = await supabase
      .from("notifications")
      .select("id", { count: "exact", head: true })
      .is("archived_at", null)
      .is("read_at", null);

    if (!error) setUnreadCount(count ?? 0);
  }, [supabase]);

  useEffect(() => {
    const channel = supabase
      .channel("notifications-unread-count")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "notifications" },
        () => {
          void refreshUnreadCount();
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, refreshUnreadCount]);

  const value = useMemo(
    () => ({
      isOpen,
      open,
      close,
      toggle,
      unreadCount,
      refreshUnreadCount,
    }),
    [isOpen, open, close, toggle, unreadCount, refreshUnreadCount],
  );

  return (
    <NotificationsContext.Provider value={value}>
      {children}
    </NotificationsContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationsContext);
  if (!context) {
    throw new Error(
      "useNotifications must be used within a NotificationsProvider",
    );
  }
  return context;
}
