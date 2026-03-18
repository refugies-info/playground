/**
 * Detects whether an error is caused by a network/connection failure.
 *
 * Used to distinguish "DB down" scenarios from normal application errors.
 * The Supabase SDK never throws on network errors — it catches them and returns
 * { data: { user: null }, error: AuthError }.
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

  // Extract cause (nested error)
  const cause =
    error instanceof Error && error.cause instanceof Error
      ? error.cause.message
      : typeof error === "object" && error !== null && "cause" in error
        ? String((error as { cause: unknown }).cause)
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
      cause.toLowerCase().includes(indicator.toLowerCase()),
    )
  );
}
