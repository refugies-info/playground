import type { Letta } from "@letta-ai/letta-client";
import type { ConversationCreateParams } from "@letta-ai/letta-client/resources/conversations";
import { LETTA_MODEL_NAME, logger } from "@playground/shared-types";
import { createLettaClient } from "./clients";
import { accumulateUsage } from "./simplification";
import type { LettaUsage } from "./types";

export const listAgents = async (client: Letta) => {
  return client.agents.list();
};

export const getAgent = async (client: Letta, agentId: string) => {
  return client.agents.retrieve(agentId);
};

/**
 * Per-process cache of agent model handles, keyed by agent ID.
 * Prod Letta Cloud agents are frozen (model never changes), so one
 * retrieve per process per agent is enough (TEC-65).
 */
const agentModelCache = new Map<string, string>();

/**
 * Resolves the actual model handle of an agent via `agents.retrieve`.
 *
 * Used to populate `letta_reports.model` with the real handle instead of
 * the `LETTA_MODEL_NAME` config constant. Never throws: on any failure
 * (client creation, network, API, missing field) it falls back to
 * `LETTA_MODEL_NAME` so a model lookup can never block a report from
 * being persisted.
 *
 * @param agentId - The agent whose model handle to resolve
 * @param client - Optional pre-existing Letta client; one is created if omitted
 * @returns The agent's model handle, or `LETTA_MODEL_NAME` as fallback
 */
export const getAgentModel = async (
  agentId: string,
  client?: Letta,
): Promise<string> => {
  const cached = agentModelCache.get(agentId);
  if (cached) {
    return cached;
  }

  try {
    const lettaClient = client ?? createLettaClient();
    const agent = await lettaClient.agents.retrieve(agentId);
    if (agent.model) {
      agentModelCache.set(agentId, agent.model);
      return agent.model;
    }
    logger.warn(
      { agentId },
      "Agent has no model field — falling back to LETTA_MODEL_NAME",
    );
  } catch (error) {
    logger.warn(
      { agentId, error },
      "Failed to retrieve agent model — falling back to LETTA_MODEL_NAME",
    );
  }

  return LETTA_MODEL_NAME;
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
