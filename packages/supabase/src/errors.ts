/**
 * Detects whether an error is caused by a network/connection failure.
 *
 * Used to distinguish "DB down" scenarios from normal application errors.
 * The Supabase SDK never throws on network errors — it catches them and returns
 * { data: { user: null }, error: AuthError }.
 *
 * This is critical for the proxy middleware: when a user signs out, getUser()
 * returns an error like "session not found" or "JWT expired" — these are NOT
 * connection errors and should not trigger a redirect to /service-unavailable.
 */
export function isConnectionError(error: unknown): boolean {
  if (!error) return false;

  // Extract message from Error or error-like object
  const msg =
    error instanceof Error
      ? error.message
      : typeof error === "object" && error !== null && "message" in error
        ? String((error as { message: unknown }).message)
        : String(error);

  // Extract cause (nested error) - use type assertion for ES2020 compatibility
  const cause = (error as { cause?: unknown })?.cause;
  const causeMsg =
    cause instanceof Error
      ? cause.message
      : typeof cause === "string"
        ? cause
        : "";

  const connectionIndicators = [
    "fetch failed",
    "ECONNREFUSED",
    "Failed to fetch",
    "network error",
  ];

  return (
    connectionIndicators.some((indicator) =>
      msg.toLowerCase().includes(indicator.toLowerCase()),
    ) ||
    connectionIndicators.some((indicator) =>
      causeMsg.toLowerCase().includes(indicator.toLowerCase()),
    )
  );
}
