import type { Letta } from "@letta-ai/letta-client";
import type { ConversationMetaEvent } from "./types";

/**
 * Simplifies content using the Letta agent via the Conversations API.
 *
 * Creates a new conversation for each request, which:
 * - Provides thread-safe concurrent request handling
 * - Enables message history tracking per request
 * - Shares memory blocks and tools across all conversations
 *
 * The first yielded event is a `conversation_meta` event containing the
 * conversation ID for persistence.
 *
 * @param client - The Letta client instance
 * @param content - The content to simplify
 * @param instructions - Optional instructions for the agent
 * @param agentId - The agent ID (required)
 * @param metadata - Optional metadata to include
 */
export const simplifyContent = async function* (
  client: Letta,
  content: string,
  instructions?: string,
  agentId?: string,
  metadata?: Record<string, unknown>,
  // biome-ignore lint/suspicious/noExplicitAny: Letta SDK stream yields various message types
): AsyncGenerator<any> {
  if (!agentId) {
    throw new Error("Agent ID is required");
  }

  // Create a new conversation for this request
  const conversation = await client.conversations.create({ agent_id: agentId });

  // Yield conversation metadata first so consumers can track it
  const metaEvent: ConversationMetaEvent = {
    message_type: "conversation_meta",
    conversation_id: conversation.id,
    timestamp: new Date().toISOString(),
  };
  yield metaEvent;

  // Build the message content with metadata if provided
  const messageParts: string[] = [];

  if (instructions) {
    messageParts.push(`<instructions>\n${instructions}\n</instructions>`);
  }

  messageParts.push(`<content>\n${content}\n</content>`);

  if (metadata) {
    messageParts.push(
      `<metadata>\n${JSON.stringify(metadata, null, 2)}\n</metadata>`,
    );
  }

  const messageContent = messageParts.join("\n\n");

  // Use Conversations API for streaming (always streams by default)
  const stream = await client.conversations.messages.create(conversation.id, {
    messages: [
      {
        role: "user",
        content: messageContent,
      },
    ],
  });

  // biome-ignore lint/suspicious/noExplicitAny: Letta SDK types work-around
  for await (const chunk of stream as AsyncIterable<any>) {
    // biome-ignore lint/suspicious/noExplicitAny: Letta SDK types work-around
    const msg = chunk as any;

    // Add timestamp to every message
    msg.timestamp = new Date().toISOString();

    yield msg;
  }
};
