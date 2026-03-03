import { logger } from "@playground/shared-types";
import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { buildPublicationUrl } from "@/lib/url-builder";

interface UseTranslationPublicationRealtimeOptions {
  translationId?: string;
  language?: string;
  onSuccess: (publishedUrl: string) => void;
  onError?: (message: string) => void;
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

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

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

          // Ignore non-translation publication events (document publish/update)
          if (pubRecord.mode !== "translation") return;

          if (pubRecord.status === "failed" && pubRecord.error_message) {
            // Workflow failed — surface the error
            const message = pubRecord.error_message as string;
            setError(message);
            setIsWaiting(false);
            onError?.(message);
          } else if (
            pubRecord.status === "published" &&
            pubRecord.remote_id &&
            pubRecord.target
          ) {
            // Success — build the published URL
            setError(null);
            const url = buildPublicationUrl(
              pubRecord.target as string,
              language ?? null,
              pubRecord.remote_id as string,
            );
            if (url) {
              setIsWaiting(false);
              onSuccess(url);
            } else {
              const message =
                "Configuration invalide pour la publication. Contactez l'équipe technique.";
              setError(message);
              setIsWaiting(false);
              onError?.(message);
            }
          } else {
            // Unexpected status or missing data
            const message = "État de publication inattendu. Rechargez la page.";
            setError(message);
            setIsWaiting(false);
            onError?.(message);
          }
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [isWaiting, translationId, language, onSuccess, onError]);

  /**
   * Start listening for the publication result.
   * Call this after the publication workflow has been successfully started.
   */
  const startListening = () => {
    setIsWaiting(true);
    setError(null);
  };

  return {
    isWaiting,
    error,
    setError,
    setIsWaiting,
    startListening,
  };
}
