import { logger } from "@playground/shared-types";
import { useCallback, useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { buildPublicationUrl } from "@/lib/url-builder";

/** Timeout before falling back to a direct DB query (ms) */
const FALLBACK_TIMEOUT_MS = 60_000;

/** Interval between fallback polling attempts (ms) */
const FALLBACK_POLL_INTERVAL_MS = 10_000;

interface UsePublicationRealtimeOptions {
  workflowId?: string;
  onSuccess: (publishedUrl: string) => void;
  onError?: (message: string) => void;
}

/**
 * Process a publication record (from Realtime or fallback polling).
 * Returns true if the record was handled (terminal state), false otherwise.
 */
function handlePublicationRecord(
  pubRecord: {
    status: string;
    error_message?: string | null;
    remote_id?: string | null;
    target?: string | null;
  },
  callbacks: {
    setError: (msg: string | null) => void;
    setIsWaiting: (v: boolean) => void;
    onSuccess: (url: string) => void;
    onError?: (msg: string) => void;
  },
): boolean {
  if (pubRecord.status === "failed" && pubRecord.error_message) {
    const message = pubRecord.error_message;
    callbacks.setError(message);
    callbacks.setIsWaiting(false);
    callbacks.onError?.(message);
    return true;
  }

  if (
    pubRecord.status === "published" &&
    pubRecord.remote_id &&
    pubRecord.target
  ) {
    callbacks.setError(null);
    const url = buildPublicationUrl(
      pubRecord.target,
      null, // FR document (no language prefix)
      pubRecord.remote_id,
    );
    if (url) {
      callbacks.setIsWaiting(false);
      callbacks.onSuccess(url);
    } else {
      const message =
        "Configuration invalide pour la publication. Contactez l'équipe technique.";
      callbacks.setError(message);
      callbacks.setIsWaiting(false);
      callbacks.onError?.(message);
    }
    return true;
  }

  return false;
}

/**
 * Subscribe to publication_records INSERT events via Supabase Realtime.
 *
 * Replaces the old polling approach with real-time notifications:
 * - `status = 'published'` → calls onSuccess with the published URL
 * - `status = 'failed'` → calls onError with the error message
 *
 * The subscription is active only while `isWaiting` is true, to avoid
 * unnecessary connections when no publication is in progress.
 *
 * **Fallback**: After FALLBACK_TIMEOUT_MS, starts polling `publication_records`
 * directly in case the Realtime event was missed (race condition, network issue,
 * or silent insert failure).
 */
export function usePublicationRealtime({
  workflowId,
  onSuccess,
  onError,
}: UsePublicationRealtimeOptions) {
  const [isWaiting, setIsWaiting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isMounted = useRef(true);
  // Track when listening started to only fetch records created after
  const listeningStartedAt = useRef<string | null>(null);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  const callbacks = { setError, setIsWaiting, onSuccess, onError };
  // Keep callbacks in a ref to avoid re-subscribing on every render
  const callbacksRef = useRef(callbacks);
  callbacksRef.current = callbacks;

  // Subscribe to Realtime when waiting for publication result
  useEffect(() => {
    if (!isWaiting || !workflowId) return;

    const supabase = createClient();
    const channel = supabase
      .channel(`document-publication-${workflowId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "publication_records",
          filter: `workflow_id=eq.${workflowId}`,
        },
        (payload) => {
          if (!isMounted.current) return;

          const pubRecord = payload.new;
          logger.info(
            { pubRecord },
            "Realtime INSERT: publication_records (document)",
          );

          const handled = handlePublicationRecord(
            pubRecord as {
              status: string;
              error_message?: string | null;
              remote_id?: string | null;
              target?: string | null;
            },
            callbacksRef.current,
          );

          if (!handled) {
            const message = "État de publication inattendu. Rechargez la page.";
            callbacksRef.current.setError(message);
            callbacksRef.current.setIsWaiting(false);
            callbacksRef.current.onError?.(message);
          }
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [isWaiting, workflowId]);

  // Fallback: poll publication_records directly after timeout
  // Catches cases where Realtime missed the event (race condition, network, etc.)
  useEffect(() => {
    if (!isWaiting || !workflowId) return;

    let pollInterval: ReturnType<typeof setInterval> | null = null;

    const pollForResult = async () => {
      if (!isMounted.current) return;

      try {
        const supabase = createClient();
        const query = supabase
          .from("publication_records")
          .select("status, error_message, remote_id, target")
          .eq("workflow_id", workflowId)
          .in("status", ["published", "failed"])
          .order("created_at", { ascending: false })
          .limit(1);

        // Only fetch records created after we started listening
        if (listeningStartedAt.current) {
          query.gte("created_at", listeningStartedAt.current);
        }

        const { data, error: queryError } = await query.maybeSingle();

        if (queryError) {
          logger.warn(
            { queryError },
            "Fallback poll: error querying publication_records",
          );
          return;
        }

        if (!data || !isMounted.current) return;

        logger.info(
          { data },
          "Fallback poll: found publication record missed by Realtime",
        );

        const handled = handlePublicationRecord(data, callbacksRef.current);
        if (handled && pollInterval) {
          clearInterval(pollInterval);
        }
      } catch (err) {
        logger.warn({ err }, "Fallback poll: unexpected error");
      }
    };

    // Start polling after FALLBACK_TIMEOUT_MS
    const timeout = setTimeout(() => {
      if (!isMounted.current) return;

      logger.warn(
        { workflowId },
        `No Realtime event after ${FALLBACK_TIMEOUT_MS / 1000}s — starting fallback poll`,
      );

      // First poll immediately, then at interval
      pollForResult();
      pollInterval = setInterval(pollForResult, FALLBACK_POLL_INTERVAL_MS);
    }, FALLBACK_TIMEOUT_MS);

    return () => {
      clearTimeout(timeout);
      if (pollInterval) clearInterval(pollInterval);
    };
  }, [isWaiting, workflowId]);

  /**
   * Start listening for the publication result.
   * Call this after the publication workflow has been started.
   */
  const startListening = useCallback(() => {
    listeningStartedAt.current = new Date().toISOString();
    setIsWaiting(true);
    setError(null);
  }, []);

  return {
    isWaiting,
    error,
    setError,
    setIsWaiting,
    startListening,
  };
}
