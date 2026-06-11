"use client";

import { logger } from "@playground/shared-types";
import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { claimEditLock, releaseEditLock } from "@/services/edit-lock-actions";

/**
 * Edit lock for a fiche, backed by `editorial_records.current_editor_id`.
 *
 * `isLocked` reflects the value loaded with the page — if someone else
 * already holds the lock, the user has to refresh to check again (no live
 * reclaim). Otherwise this client claims the lock via Realtime Presence:
 *
 * - `join` (my own key, lock free) -> write `current_editor_id = me`
 * - `leave` (the holder's key disconnects) -> reset `current_editor_id` to
 *   NULL. `leave` is detected server-side (websocket heartbeat), so this
 *   also covers crashes/hard tab closes, as long as another client is
 *   subscribed to react to it.
 * - `sync` (on connect) -> if the recorded holder isn't actually present
 *   anymore, the lock is stale -> reset it immediately.
 */
export function useEditLock(
  editorialRecordId: string | undefined,
  currentUserId: string | undefined,
  currentEditorId: string | null | undefined,
) {
  const isLocked = !!currentEditorId && currentEditorId !== currentUserId;

  useEffect(() => {
    if (!editorialRecordId || !currentUserId) return;

    const supabase = createClient();

    const releaseLock = () => {
      releaseEditLock(editorialRecordId).then(({ success, error }) => {
        if (!success) logger.error(error, "Error releasing edit lock");
      });
    };

    const channel = supabase
      .channel(`editorial-lock-${editorialRecordId}`, {
        config: { presence: { key: currentUserId } },
      })
      .on("presence", { event: "sync" }, () => {
        if (
          currentEditorId &&
          currentEditorId !== currentUserId &&
          !channel.presenceState()[currentEditorId]
        ) {
          releaseLock();
        }
      })
      .on("presence", { event: "join" }, ({ key }) => {
        if (key === currentUserId && !isLocked) {
          claimEditLock(editorialRecordId).then(({ success, error }) => {
            if (!success) logger.error(error, "Error claiming edit lock");
          });
        }
      })
      .on("presence", { event: "leave" }, ({ key }) => {
        if (key === currentEditorId && key !== currentUserId) {
          releaseLock();
        }
      })
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          await channel.track({ userId: currentUserId });
        }
      });

    return () => {
      supabase.removeChannel(channel);

      if (!isLocked) releaseLock();
    };
  }, [editorialRecordId, currentUserId, currentEditorId, isLocked]);

  return { isLocked };
}
