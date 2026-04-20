import { logger } from "@playground/shared-types";
import { useCallback, useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";

/** Timeout before starting fallback polling (ms) */
const FALLBACK_TIMEOUT_MS = 60_000;

/** Interval between fallback polling attempts (ms) */
const FALLBACK_POLL_INTERVAL_MS = 5_000;

interface UseEditorialRealtimeOptions {
  workflowId?: string;
  onComplete: (content: string) => void;
  onError?: (message: string) => void;
}

/**
 * Handle an editorial report record (from Realtime or fallback polling).
 * Returns true if the record was handled (terminal state), false otherwise.
 */
function handleEditorialReport(
  report: {
    report_type: string;
    status: string;
    markdown?: string | null;
    raw_response?: string | null;
  },
  callbacks: {
    setError: (msg: string | null) => void;
    setIsWaiting: (v: boolean) => void;
    onComplete: (content: string) => void;
    onError?: (msg: string) => void;
  },
): boolean {
  // Only handle editorial reports
  if (report.report_type !== "editorial") return false;

  if (report.status === "error") {
    const message =
      report.raw_response || "L'IA a rencontré une erreur. Veuillez réessayer.";
    callbacks.setError(message);
    callbacks.setIsWaiting(false);
    callbacks.onError?.(message);
    return true;
  }

  if (report.status === "complete" && report.markdown) {
    callbacks.setError(null);
    callbacks.setIsWaiting(false);
    callbacks.onComplete(report.markdown);
    return true;
  }

  return false;
}

/**
 * Subscribe to letta_reports INSERT events via Supabase Realtime
 * for editorial rewrite results.
 *
 * Same architecture as `usePublicationRealtime`:
 * - Realtime subscription active while `isWaiting` is true
 * - Fallback polling after FALLBACK_TIMEOUT_MS
 *
 * The workflow inserts a new letta_report with type='editorial'
 * when the rewrite completes. This hook picks it up.
 */
export function useEditorialRealtime({
  workflowId,
  onComplete,
  onError,
}: UseEditorialRealtimeOptions) {
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

  const callbacks = { setError, setIsWaiting, onComplete, onError };
  const callbacksRef = useRef(callbacks);
  callbacksRef.current = callbacks;

  // ─── Realtime subscription ──────────────────────────────────────────
  useEffect(() => {
    if (!isWaiting || !workflowId) return;

    const supabase = createClient();
    const channel = supabase
      .channel(`editorial-rewrite-${workflowId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "letta_reports",
          filter: `workflow_id=eq.${workflowId}`,
        },
        (payload) => {
          if (!isMounted.current) return;

          const report = payload.new;
          logger.info(
            { report },
            "Realtime INSERT: letta_reports (editorial rewrite)",
          );

          handleEditorialReport(
            report as {
              report_type: string;
              status: string;
              markdown?: string | null;
              raw_response?: string | null;
            },
            callbacksRef.current,
          );
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [isWaiting, workflowId]);

  // ─── Fallback polling ───────────────────────────────────────────────
  useEffect(() => {
    if (!isWaiting || !workflowId) return;

    let pollInterval: ReturnType<typeof setInterval> | null = null;

    const pollForResult = async () => {
      if (!isMounted.current) return;

      try {
        const supabase = createClient();
        const query = supabase
          .from("letta_reports")
          .select("report_type, status, markdown, raw_response")
          .eq("workflow_id", workflowId)
          .eq("report_type", "editorial")
          .in("status", ["complete", "error"])
          .order("created_at", { ascending: false })
          .limit(1);

        // Only fetch reports created after we started listening
        if (listeningStartedAt.current) {
          query.gte("created_at", listeningStartedAt.current);
        }

        const { data, error: queryError } = await query.maybeSingle();

        if (queryError) {
          logger.warn(
            { queryError },
            "Fallback poll: error querying letta_reports",
          );
          return;
        }

        if (!data || !isMounted.current) return;

        logger.info(
          { data },
          "Fallback poll: found editorial report missed by Realtime",
        );

        const handled = handleEditorialReport(data, callbacksRef.current);
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

      pollForResult();
      pollInterval = setInterval(pollForResult, FALLBACK_POLL_INTERVAL_MS);
    }, FALLBACK_TIMEOUT_MS);

    return () => {
      clearTimeout(timeout);
      if (pollInterval) clearInterval(pollInterval);
    };
  }, [isWaiting, workflowId]);

  /**
   * Start listening for the editorial rewrite result.
   * Call this after the workflow has been started.
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
