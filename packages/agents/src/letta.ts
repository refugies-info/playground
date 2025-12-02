import "dotenv/config";
import { Letta } from "@letta-ai/letta-client";
import type { AssistantMessage } from "@letta-ai/letta-client/resources/agents.js";
import matter from "gray-matter";

export interface LettaConfig {
  baseUrl?: string;
  token?: string;
}

export const createLettaClient = (config: LettaConfig = {}): Letta => {
  return new Letta({
    baseURL: config.baseUrl,
    apiKey: config.token || process.env.LETTA_API_KEY,
  });
};

export const listAgents = async (client: Letta) => {
  return client.agents.list();
};

export const getAgent = async (client: Letta, agentId: string) => {
  return client.agents.retrieve(agentId);
};

export const checkCompliance = async (
  client: Letta,
  xmlContent: string,
): Promise<string> => {
  const agentId = process.env.COMPLIANCE_AGENT_ID;
  if (!agentId) {
    throw new Error("COMPLIANCE_AGENT_ID is not defined");
  }

  // Clear previous messages before each call
  await client.agents.messages.reset(agentId, {
    add_default_initial_messages: true,
  });

  const response = await client.agents.messages.create(agentId, {
    messages: [
      {
        role: "user",
        content: xmlContent,
      },
    ],
  });

  const messages = response.messages;
  const lastMessage = [...messages]
    .reverse()
    .find(
      ({ message_type }) => message_type === "assistant_message",
    ) as AssistantMessage;

  if (!lastMessage) {
    throw new Error("No message with content found in response");
  }

  const content = lastMessage.content;
  const messageContent =
    typeof content === "string" ? content : JSON.stringify(content);

  // Parse existing frontmatter and enhance with Letta metadata
  const parsed = matter(messageContent);

  const lettaMetadata: Record<string, unknown> = {};

  // Extract usage stats from response if available
  if (response.usage) {
    const usage = response.usage as Record<string, unknown>;
    if (usage.prompt_tokens) lettaMetadata.prompt_tokens = usage.prompt_tokens;
    if (usage.completion_tokens)
      lettaMetadata.completion_tokens = usage.completion_tokens;
    if (usage.total_tokens) lettaMetadata.total_tokens = usage.total_tokens;
  }

  // Add timestamp
  lettaMetadata.processed_at = new Date().toISOString();

  // Merge Letta metadata into frontmatter
  const enhancedData = {
    ...parsed.data,
    letta: lettaMetadata,
  };

  // Reconstruct markdown with enhanced frontmatter
  return matter.stringify(parsed.content, enhancedData);
};

export const checkDuplicates = async (
  client: Letta,
  xmlContent: string,
): Promise<string> => {
  const agentId = process.env.DUPLICATES_AGENT_ID;
  if (!agentId) {
    throw new Error("DUPLICATES_AGENT_ID is not defined");
  }

  // Clear previous messages before each call
  await client.agents.messages.reset(agentId, {
    add_default_initial_messages: true,
  });

  const response = await client.agents.messages.create(agentId, {
    messages: [
      {
        role: "user",
        content: xmlContent,
      },
    ],
  });

  const messages = response.messages;
  const lastMessage = [...messages]
    .reverse()
    .find(
      ({ message_type }) => message_type === "assistant_message",
    ) as AssistantMessage;

  if (!lastMessage) {
    throw new Error("No message with content found in response");
  }

  const content = lastMessage.content;
  const messageContent =
    typeof content === "string" ? content : JSON.stringify(content);

  // Parse existing frontmatter and enhance with Letta metadata
  const parsed = matter(messageContent);

  const lettaMetadata: Record<string, unknown> = {};

  // Extract usage stats from response if available
  if (response.usage) {
    const usage = response.usage as Record<string, unknown>;
    if (usage.prompt_tokens) lettaMetadata.prompt_tokens = usage.prompt_tokens;
    if (usage.completion_tokens)
      lettaMetadata.completion_tokens = usage.completion_tokens;
    if (usage.total_tokens) lettaMetadata.total_tokens = usage.total_tokens;
  }

  // Add timestamp
  lettaMetadata.processed_at = new Date().toISOString();

  // Merge Letta metadata into frontmatter
  const enhancedData = {
    ...parsed.data,
    letta: lettaMetadata,
  };

  // Reconstruct markdown with enhanced frontmatter
  return matter.stringify(parsed.content, enhancedData);
};
