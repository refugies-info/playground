import "dotenv/config";
import { Letta } from "@letta-ai/letta-client";

/**
 * Creates a Letta client in one of two modes, selected by env vars.
 *
 * LOCAL (free) — self-hosted Letta server backed by a local LLM (Ollama):
 *   Activated when LETTA_BASE_URL is set OR LETTA_ENVIRONMENT=local.
 *   No API key / project ID required (auth-less self-hosted server).
 *   Default URL: http://localhost:8283
 *
 * CLOUD (paid) — Letta Cloud (https://api.letta.com):
 *   Default. Requires LETTA_API_KEY and LETTA_PROJECT_ID.
 *
 * This lets the dev environment run against a local model (zero token cost)
 * while production keeps using the cloud-hosted agents.
 */
export const createLettaClient = (): Letta => {
  const baseURL = process.env.LETTA_BASE_URL;
  const isLocal = process.env.LETTA_ENVIRONMENT === "local" || Boolean(baseURL);

  if (isLocal) {
    // Self-hosted Letta server. apiKey is optional: if the server has no auth
    // configured, the SDK omits the Authorization header when apiKey is null.
    return new Letta({
      baseURL: baseURL ?? "http://localhost:8283",
      apiKey: process.env.LETTA_API_KEY ?? null,
    });
  }

  const apiKey = process.env.LETTA_API_KEY;
  const projectID = process.env.LETTA_PROJECT_ID;

  if (!apiKey) {
    throw new Error("LETTA_API_KEY environment variable is not set.");
  }

  // `projectID` is intentionally optional: the Letta SDK's constructor accepts
  // `projectID?: string | null | undefined`, and some consumers (notably the
  // export script at `scripts/export-letta-cloud-blocks.ts`) target an agent
  // directly without scoping to a project. Callers that need the project
  // context should set LETTA_PROJECT_ID in their environment.
  return new Letta({
    apiKey,
    projectID: projectID ?? undefined,
  });
};
