import type { Letta } from "@letta-ai/letta-client";
import type { AssistantMessage } from "@letta-ai/letta-client/resources/agents";
import type { ConversationCreateParams } from "@letta-ai/letta-client/resources/conversations";
import { getRunUsage } from "./simplification";
import type { LettaUsage } from "./types";

export const listAgents = async (client: Letta) => {
  return client.agents.list();
};

export const getAgent = async (client: Letta, agentId: string) => {
  return client.agents.retrieve(agentId);
};

export const sendMessage = async (
  client: Letta,
  agentId: string,
  content: string,
): Promise<{
  content: string;
  usage?: Record<string, unknown>;
}> => {
  const response = await client.agents.messages.create(agentId, {
    messages: [
      {
        role: "user",
        content: content,
      },
    ],
  });

  const messages = response.messages;
  const lastMessage = messages.findLast(
    (msg) => msg.message_type === "assistant_message",
  ) as AssistantMessage;

  if (!lastMessage) {
    throw new Error("No message with content found in response");
  }

  const messageContent = lastMessage.content;
  const resultString =
    typeof messageContent === "string"
      ? messageContent
      : JSON.stringify(messageContent);

  return {
    content: resultString,
    usage: response.usage as Record<string, unknown> | undefined,
  };
};

export const sendMessageToConversation = async (
  client: Letta,
  conversationId: string,
  content: string,
): Promise<{
  content: string;
  usage?: LettaUsage;
  runId?: string;
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
  let runId: string | undefined;
  // biome-ignore lint/suspicious/noExplicitAny: Letta SDK types work-around
  for await (const chunk of stream as AsyncIterable<any>) {
    // Capture run_id from chunks (available in response headers/chunks)
    if (!runId && chunk.run_id) {
      runId = chunk.run_id;
    }
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

  const usage = runId ? await getRunUsage(client, runId) : undefined;

  return {
    content: finalContent,
    usage,
    runId,
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

export const runAgentOneShot = async (
  client: Letta,
  templateId: string,
  flowId: string,
  content: string,
): Promise<{
  content: string;
  agentId: string;
  usage?: Record<string, unknown>;
}> => {
  // Create a new agent from the template
  const agentResponse = await client.templates.agents.create(templateId, {
    agent_name: `${templateId}-${flowId}`.replace(/[:/]/g, "-"),
  });
  const agentId = agentResponse.agent_ids[0];

  if (!agentId) {
    throw new Error("Failed to create agent from template");
  }

  const { content: resultString, usage } = await sendMessage(
    client,
    agentId,
    content,
  );

  return {
    content: resultString,
    agentId,
    usage,
  };
};
