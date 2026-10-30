import type { Letta } from "@letta-ai/letta-client";
import type { ConversationCreateParams } from "@letta-ai/letta-client/resources/conversations";
import { LETTA_MODEL_HANDLE } from "@playground/shared-types";
import { accumulateUsage } from "./simplification";
import type { LettaUsage } from "./types";

export const listAgents = async (client: Letta) => {
  return client.agents.list();
};

export const getAgent = async (client: Letta, agentId: string) => {
  return client.agents.retrieve(agentId);
};

export const sendMessageToConversation = async (
  client: Letta,
  conversationId: string,
  content: string,
  overrideModel = LETTA_MODEL_HANDLE,
): Promise<{
  content: string;
  usage?: LettaUsage;
}> => {
  const stream = await client.conversations.messages.create(conversationId, {
    messages: [
      {
        role: "user",
        content: content,
      },
    ],
    override_model: overrideModel,
  });

  let finalContent = "";
  const usage: LettaUsage = {};
  // biome-ignore lint/suspicious/noExplicitAny: Letta SDK types work-around
  for await (const chunk of stream as AsyncIterable<any>) {
    accumulateUsage(usage, chunk);
    if (chunk.message_type === "assistant_message") {
      // Content is either a string or an array of { type: "text", text } parts.
      finalContent +=
        typeof chunk.content === "string"
          ? chunk.content
          : (chunk.content as { text?: string }[])
              .map((part) => part.text ?? "")
              .join("");
    }
  }

  if (!finalContent) {
    throw new Error("No message with content found in response");
  }

  return {
    content: finalContent,
    usage,
  };
};

/** Conversation named `name` (stored as its summary), or null. */
export const findConversation = async (
  client: Letta,
  agentId: string,
  name: string,
): Promise<string | null> => {
  // summary_search is a substring match ("metadata-12" also finds
  // "metadata-123"): keep the exact one. It also lifts the 100-item page cap.
  const conversations = await client.conversations.list({
    agent_id: agentId,
    summary_search: name,
    limit: 100,
  });
  // biome-ignore lint/suspicious/noExplicitAny: Letta SDK types work-around
  const match = (conversations as any[]).find(
    (c) => c.name === name || c.label === name || c.summary === name,
  );
  return match?.id ?? null;
};

export const findOrCreateConversation = async (
  client: Letta,
  agentId: string,
  name: string,
): Promise<string> => {
  const existingId = await findConversation(client, agentId, name);
  if (existingId) return existingId;

  const createParams: ConversationCreateParams = {
    agent_id: agentId,
    summary: name,
  };

  const newConversation = await client.conversations.create(createParams);

  return newConversation.id;
};
