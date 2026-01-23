/**
 * Utility functions for Vercel Workflow integration.
 */

type VercelEnvironment = "development" | "preview" | "production";

/**
 * Builds the Vercel Workflow dashboard URL for a specific workflow run.
 *
 * @param runId - The workflow run ID (e.g., "wrun_01KF13REM5D66GKE5BF2G2E1FM")
 * @param options - Optional configuration
 * @returns The full dashboard URL, or undefined if required env vars are missing
 *
 * @example
 * ```typescript
 * const url = buildWorkflowDashboardUrl("wrun_01KF13REM5D66GKE5BF2G2E1FM");
 * // => "https://vercel.com/refugies-info/playground-frontend/observability/workflows/runs/wrun_01KF13REM5D66GKE5BF2G2E1FM?environment=preview"
 * ```
 */
export function buildWorkflowDashboardUrl(
  runId: string,
  options?: {
    teamSlug?: string;
    projectSlug?: string;
    environment?: VercelEnvironment;
  },
): string | undefined {
  // Use provided values or fall back to environment variables
  const teamSlug =
    options?.teamSlug || process.env.VERCEL_TEAM_SLUG || "refugies-info";
  const projectSlug =
    options?.projectSlug ||
    process.env.VERCEL_PROJECT_SLUG ||
    "playground-frontend";

  // Determine environment from VERCEL_ENV or default to development
  let environment: VercelEnvironment;
  if (options?.environment) {
    environment = options.environment;
  } else if (process.env.VERCEL_ENV) {
    environment = process.env.VERCEL_ENV as VercelEnvironment;
  } else {
    environment = "development";
  }

  if (!runId) {
    return undefined;
  }

  return `https://vercel.com/${teamSlug}/${projectSlug}/observability/workflows/runs/${runId}?environment=${environment}`;
}
