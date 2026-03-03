import type { OnlineStatus, WorkStatus } from "@playground/shared-types";
import { logger } from "@playground/shared-types";
import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useDocument } from "../../DocumentContext";

/**
 * Subscribe to editorial_records UPDATE events via Supabase Realtime
 * to keep TopBar status badges (workStatus, onlineStatus) in sync.
 *
 * The subscription is always active while the component is mounted,
 * since status changes can happen from background workflows,
 * DB triggers, or other users at any time.
 */
export function useDocumentStatusRealtime() {
  const { document, setDocument } = useDocument();
  const editorialRecordId = document?.editorialRecordId;

  useEffect(() => {
    if (!editorialRecordId) return;

    const supabase = createClient();
    const channel = supabase
      .channel(`editorial-status-${editorialRecordId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "editorial_records",
          filter: `id=eq.${editorialRecordId}`,
        },
        (payload) => {
          const { work_status, online_status } = payload.new as {
            work_status: string | null;
            online_status: string | null;
          };

          logger.info(
            { editorialRecordId, work_status, online_status },
            "Realtime UPDATE: editorial_records status",
          );

          setDocument((prev) => {
            if (!prev) return prev;

            const newWorkStatus = (work_status as WorkStatus) ?? null;
            const newOnlineStatus =
              (online_status as OnlineStatus) ?? prev.onlineStatus;

            // Skip update if nothing changed
            if (
              prev.workStatus === newWorkStatus &&
              prev.onlineStatus === newOnlineStatus
            ) {
              return prev;
            }

            return {
              ...prev,
              workStatus: newWorkStatus,
              onlineStatus: newOnlineStatus,
            };
          });
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [editorialRecordId, setDocument]);
}
