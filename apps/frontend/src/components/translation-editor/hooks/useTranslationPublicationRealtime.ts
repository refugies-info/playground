import { logger } from "@playground/shared-types";
import { useCallback, useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { buildPublicationUrl } from "@/lib/url-builder";

/** Timeout before falling back to a direct DB query (ms) */
const FALLBACK_TIMEOUT_MS = 60_000;

/** Interval between fallback polling attempts (ms) */
const FALLBACK_POLL_INTERVAL_MS = 10_000;

interface UseTranslationPublicationRealtimeOptions {
  translationId?: string;
  language?: string;
  onSuccess: (publishedUrl: string) => void;
  onError?: (message: string) => void;
}

/**
 * Process a translation publication record (from Realtime or fallback polling).
 * Returns true if the record was handled (terminal state), false otherwise.
 */
function handleTranslationRecord(
  pubRecord: {
    status: string;
    mode?: string | null;
    error_message?: string | null;
    remote_id?: string | null;
    target?: string | null;
  },
  language: string | undefined,
  callbacks: {
    setError: (msg: string | null) => void;
    setIsWaiting: (v: boolean) => void;
    onSuccess: (url: string) => void;
    onError?: (msg: string) => void;
  },
): boolean {
  // Ignore non-translation publication events (document publish/update)
  if (pubRecord.mode !== "translation") return false;

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
      language ?? null,
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
 * Subscribe to publication_records INSERT events via Supabase Realtime
 * for translation publications.
 *
 * Mirrors `usePublicationRealtime` (document hook) with two differences:
 * - Filters on `translation_record_id` (requires REPLICA IDENTITY FULL, see migration)
 * - Checks `mode === 'translation'` to ignore document publication events
 *
 * The subscription is active only while `isWaiting` is true, to avoid
 * unnecessary connections when no publication is in progress.
 *
 * **Fallback**: After FALLBACK_TIMEOUT_MS, starts polling `publication_records`
 * directly in case the Realtime event was missed.
 */
export function useTranslationPublicationRealtime({
  translationId,
  language,
  onSuccess,
  onError,
}: UseTranslationPublicationRealtimeOptions) {
  const [isWaiting, setIsWaiting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isMounted = useRef(true);
  const listeningStartedAt = useRef<string | null>(null);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  const callbacks = { setError, setIsWaiting, onSuccess, onError };
  const callbacksRef = useRef(callbacks);
  callbacksRef.current = callbacks;

  // Subscribe to Realtime only when waiting for publication result
  useEffect(() => {
    if (!isWaiting || !translationId) return;

    const supabase = createClient();
    const channel = supabase
      .channel(`translation-publication-${translationId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "publication_records",
          filter: `translation_record_id=eq.${translationId}`,
        },
        (payload) => {
          if (!isMounted.current) return;

          const pubRecord = payload.new;
          logger.info(
            { pubRecord },
            "Realtime INSERT: publication_records (translation)",
          );

          const handled = handleTranslationRecord(
            pubRecord as {
              status: string;
              mode?: string | null;
              error_message?: string | null;
              remote_id?: string | null;
              target?: string | null;
            },
            language,
            callbacksRef.current,
          );

          if (!handled && pubRecord.mode === "translation") {
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
  }, [isWaiting, translationId, language]);

  // Fallback: poll publication_records directly after timeout
  useEffect(() => {
    if (!isWaiting || !translationId) return;

    let pollInterval: ReturnType<typeof setInterval> | null = null;

    const pollForResult = async () => {
      if (!isMounted.current) return;

      try {
        const supabase = createClient();
        const query = supabase
          .from("publication_records")
          .select("status, mode, error_message, remote_id, target")
          .eq("translation_record_id", translationId)
          .eq("mode", "translation")
          .in("status", ["published", "failed"])
          .order("created_at", { ascending: false })
          .limit(1);

        if (listeningStartedAt.current) {
          query.gte("created_at", listeningStartedAt.current);
        }

        const { data, error: queryError } = await query.maybeSingle();

        if (queryError) {
          logger.warn(
            { queryError },
            "Translation fallback poll: error querying publication_records",
          );
          return;
        }

        if (!data || !isMounted.current) return;

        logger.info(
          { data },
          "Translation fallback poll: found record missed by Realtime",
        );

        const handled = handleTranslationRecord(
          data,
          language,
          callbacksRef.current,
        );
        if (handled && pollInterval) {
          clearInterval(pollInterval);
        }
      } catch (err) {
        logger.warn({ err }, "Translation fallback poll: unexpected error");
      }
    };

    const timeout = setTimeout(() => {
      if (!isMounted.current) return;

      logger.warn(
        { translationId },
        `No Realtime event after ${FALLBACK_TIMEOUT_MS / 1000}s — starting fallback poll`,
      );

      pollForResult();
      pollInterval = setInterval(pollForResult, FALLBACK_POLL_INTERVAL_MS);
    }, FALLBACK_TIMEOUT_MS);

    return () => {
      clearTimeout(timeout);
      if (pollInterval) clearInterval(pollInterval);
    };
  }, [isWaiting, translationId, language]);

  /**
   * Start listening for the publication result.
   * Call this after the publication workflow has been successfully started.
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
