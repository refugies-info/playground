import { logger } from "@playground/shared-types";
import { useCallback, useEffect, useRef, useState } from "react";
import { getPublicationStatus } from "@/services/document-actions";

interface UsePublicationPollingOptions {
  workflowId?: string;
  onSuccess: (publishedUrl: string) => void;
  onError?: (message: string) => void;
  maxAttempts?: number;
  intervalMs?: number;
}

/**
 * Poll publication status until the published URL is available.
 */
export function usePublicationPolling({
  workflowId,
  onSuccess,
  onError,
  maxAttempts = 30,
  intervalMs = 2000,
}: UsePublicationPollingOptions) {
  const [isWaiting, setIsWaiting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  const startPolling = useCallback(async () => {
    if (!workflowId) return;

    let attempts = 0;
    setIsWaiting(true);
    setError(null);

    while (attempts < maxAttempts) {
      if (!isMounted.current) return;
      attempts += 1;

      try {
        const result = await getPublicationStatus(workflowId);

        if (!isMounted.current) return;

        if (result.success && result.publishedUrl) {
          onSuccess(result.publishedUrl);
          setIsWaiting(false);
          return;
        }

        if (attempts >= maxAttempts) {
          const message =
            "Le lien n’est pas encore disponible. Réessaie dans quelques instants.";
          setError(message);
          setIsWaiting(false);
          onError?.(message);
          return;
        }

        await new Promise((resolve) => setTimeout(resolve, intervalMs));
      } catch (pollError) {
        if (!isMounted.current) return;
        logger.error(pollError, "Error polling publication status");
        const message = "Impossible de récupérer le lien de publication.";
        setError(message);
        setIsWaiting(false);
        onError?.(message);
        return;
      }
    }
  }, [workflowId, maxAttempts, intervalMs, onSuccess, onError]);

  return {
    isWaiting,
    error,
    setError,
    setIsWaiting,
    startPolling,
  };
}
