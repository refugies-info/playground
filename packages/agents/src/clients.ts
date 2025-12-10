import "dotenv/config";
import { Letta } from "@letta-ai/letta-client";

export const createLettaClient = (): Letta => {
  const apiKey = process.env.LETTA_API_KEY;
  const projectID = process.env.LETTA_PROJECT_ID;

  if (!apiKey) {
    throw new Error("LETTA_API_KEY environment variable is not set.");
  }
  if (!projectID) {
    throw new Error("LETTA_PROJECT_ID environment variable is not set.");
  }

  return new Letta({
    apiKey,
    projectID,
  });
};
