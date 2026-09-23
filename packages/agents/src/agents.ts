import type { Letta } from "@letta-ai/letta-client";
import type { ConversationCreateParams } from "@letta-ai/letta-client/resources/conversations";
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
  });

  let finalContent = "";
  const usage: LettaUsage = {};
  // biome-ignore lint/suspicious/noExplicitAny: Letta SDK types work-around
  for await (const chunk of stream as AsyncIterable<any>) {
    accumulateUsage(usage, chunk);
    if (chunk.message_type === "assistant_message") {
      if (typeof chunk.content === "string") {
        finalContent += chunk.content;
      } else {
        finalContent += JSON.stringify(chunk.content);
      }
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

export const findOrCreateConversation = async (
  client: Letta,
  agentId: string,
  name: string,
): Promise<string> => {
  // 1. List conversations
  const existingConversations = await client.conversations.list({
    agent_id: agentId,
    limit: 100,
  });

  // check if name exists on the object. If typescript complains, we cast to any or check SDK.
  // Assuming 'name' or 'label' or 'summary' is the property.
  // biome-ignore lint/suspicious/noExplicitAny: Letta SDK types work-around
  const match = (existingConversations as any[]).find(
    (c) => c.name === name || c.label === name || c.summary === name,
  );

  if (match) {
    return match.id;
  }

  const createParams: ConversationCreateParams = {
    agent_id: agentId,
    summary: name,
  };

  const newConversation = await client.conversations.create(createParams);

  return newConversation.id;
};
