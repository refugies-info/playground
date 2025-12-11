import type { Letta } from "@letta-ai/letta-client";
import type { AssistantMessage } from "@letta-ai/letta-client/resources/agents";

export const listAgents = async (client: Letta) => {
  return client.agents.list();
};

export const getAgent = async (client: Letta, agentId: string) => {
  return client.agents.retrieve(agentId);
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

  const response = await client.agents.messages.create(agentId, {
    messages: [
      {
        role: "user",
        content: content,
      },
    ],
  });

  const messages = response.messages;
  const lastMessage = [...messages]
    .reverse()
    .find(
      (msg) =>
        (msg as { message_type?: string }).message_type === "assistant_message",
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
    agentId,
    usage: response.usage as Record<string, unknown> | undefined,
  };
};
