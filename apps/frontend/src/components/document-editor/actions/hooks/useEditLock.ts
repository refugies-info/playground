"use client";

import { logger } from "@playground/shared-types";
import { useCallback, useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  claimEditLock,
  forceClaimEditLock,
  releaseEditLock,
} from "@/services/edit-lock-actions";

interface LockTakenPayload {
  by: string;
  byName?: string | null;
}

/**
 * Edit lock for a fiche, backed by `editorial_records.current_editor_id` and
 * kept live via Supabase Realtime Presence + Broadcast on the channel called
 * `editorial-lock-${editorialRecordId}`:
 *
 * - `join` (my own key, lock free) -> write `current_editor_id = me`
 * - `leave` (the holder's key disconnects) -> reset `current_editor_id` to
 *   NULL. `leave` is detected server-side (websocket heartbeat), so this
 *   also covers crashes/hard tab closes, as long as another client is
 *   subscribed to react to it.
 * - `lock-taken` (broadcast, sent by `takeOver`) -> the lock was forcibly
 *   reclaimed by another client; update `isLocked`/`editorName` live so the
 *   previous holder sees the warning dialog without reloading.
 */
export function useEditLock(
  editorialRecordId: string | undefined,
  currentUserId: string | null | undefined,
  currentUserName: string | null | undefined,
  initialEditorId: string | null | undefined,
  initialEditorName: string | null | undefined,
) {
  const initialIsLocked =
    !!initialEditorId && initialEditorId !== currentUserId;

  const [isLocked, setIsLocked] = useState(initialIsLocked);
  const [editorName, setEditorName] = useState(initialEditorName ?? null);

  const takeOverRef = useRef(() => {});

  useEffect(() => {
    if (!editorialRecordId || !currentUserId) return;

    setIsLocked(initialIsLocked);
    setEditorName(initialEditorName ?? null);

    const supabase = createClient();

    // Mutable mirror of `isLocked`/the recorded holder, readable from the
    // stable presence/broadcast handlers below without re-subscribing.
    let locked = initialIsLocked;
    let holderId = initialEditorId ?? null;

    const releaseLock = () => {
      releaseEditLock(editorialRecordId).then(({ success, error }) => {
        if (!success) logger.error(error, "Error releasing edit lock");
      });
    };

    const releaseLockBeacon = () => {
      if (!locked) {
        navigator.sendBeacon(
          "/api/release-edit-lock",
          new Blob([JSON.stringify({ editorialRecordId })], {
            type: "application/json",
          }),
        );
      }
    };

    window.addEventListener("beforeunload", releaseLockBeacon);

    const channel = supabase
      .channel(`editorial-lock-${editorialRecordId}`, {
        config: { presence: { key: currentUserId } },
      })
      .on("presence", { event: "join" }, ({ key }) => {
        if (key === currentUserId && !locked) {
          claimEditLock(editorialRecordId).then(({ success, error }) => {
            if (!success) logger.error(error, "Error claiming edit lock");
          });
        }
      })
      .on("presence", { event: "leave" }, ({ key }) => {
        if (key === holderId && key !== currentUserId) {
          holderId = null;
          releaseLock();
        }
      })
      .on("broadcast", { event: "lock-taken" }, ({ payload }) => {
        const { by, byName } = payload as LockTakenPayload;
        if (by === currentUserId) return;

        holderId = by;
        locked = true;
        setIsLocked(true);
        setEditorName(byName ?? null);
      })
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          await channel.track({ userId: currentUserId });
        }
      });

    // "Reprendre" : force-claim the lock for me and notify the current
    // holder live so their dialog opens immediately.
    takeOverRef.current = () => {
      forceClaimEditLock(editorialRecordId).then(({ success, error }) => {
        if (!success) {
          logger.error(error, "Error taking over edit lock");
          return;
        }

        holderId = currentUserId;
        locked = false;
        setIsLocked(false);
        setEditorName(null);

        channel.send({
          type: "broadcast",
          event: "lock-taken",
          payload: { by: currentUserId, byName: currentUserName },
        });
      });
    };

    return () => {
      window.removeEventListener("beforeunload", releaseLockBeacon);
      supabase.removeChannel(channel);
      takeOverRef.current = () => {};

      if (!locked) releaseLock();
    };
  }, [
    editorialRecordId,
    currentUserId,
    currentUserName,
    initialEditorId,
    initialEditorName,
    initialIsLocked,
  ]);

  const takeOver = useCallback(() => {
    takeOverRef.current();
  }, []);

  return { isLocked, editorName, takeOver };
}
