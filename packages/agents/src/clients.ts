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

/**
 * Creates a new conversation for an agent.
 * Each conversation has its own message history but shares memory blocks.
 *
 * @param client - The Letta client instance
 * @param agentId - The agent ID to create a conversation for
 * @returns The conversation ID (conv-xxx format)
 */
export const createConversation = async (
  client: Letta,
  agentId: string,
): Promise<string> => {
  const conversation = await client.conversations.create({ agent_id: agentId });
  return conversation.id;
};
