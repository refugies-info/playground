import { logger } from "@playground/shared-types";
import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { buildPublicationUrl } from "@/lib/url-builder";

interface UsePublicationRealtimeOptions {
  workflowId?: string;
  onSuccess: (publishedUrl: string) => void;
  onError?: (message: string) => void;
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
 */
export function usePublicationRealtime({
  workflowId,
  onSuccess,
  onError,
}: UsePublicationRealtimeOptions) {
  const [isWaiting, setIsWaiting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

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

          if (pubRecord.status === "failed" && pubRecord.error_message) {
            // Workflow failed — show the error
            const message = pubRecord.error_message;
            setError(message);
            setIsWaiting(false);
            onError?.(message);
          } else if (
            pubRecord.status === "published" &&
            pubRecord.remote_id &&
            pubRecord.target
          ) {
            // Success — build the URL
            setError(null);
            const url = buildPublicationUrl(
              pubRecord.target,
              null, // FR document (no language prefix)
              pubRecord.remote_id,
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
  }, [isWaiting, workflowId, onSuccess, onError]);

  /**
   * Start listening for the publication result.
   * Call this after the publication workflow has been started.
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
