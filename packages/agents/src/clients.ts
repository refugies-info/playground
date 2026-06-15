import "dotenv/config";
import { Letta } from "@letta-ai/letta-client";

export const createLettaClient = (): Letta => {
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
