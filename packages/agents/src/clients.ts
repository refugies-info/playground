import "dotenv/config";
import { Letta } from "@letta-ai/letta-client";

export const createLettaClient = (): Letta => {
  return new Letta({
    apiKey: process.env.LETTA_API_KEY,
    projectID: process.env.LETTA_PROJECT_ID,
  });
};
