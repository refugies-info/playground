import type { Letta } from "@letta-ai/letta-client";
import type { ConversationMetaEvent } from "./types";

/**
 * The /metadata slash command for Agathe to generate metadata reports.
 */
export const METADATA_SLASH_COMMAND = "/metadata";

/**
 * Generates a metadata report by streaming responses from the Agathe agent
 * using the Conversations API.
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
 * @param content - The document content (markdown with frontmatter)
 * @param agentId - The agent ID to use (PLAYGROUND_AGENT_ID)
 */
export const generateMetadataReport = async function* (
  client: Letta,
  content: string,
  agentId: string,
  // biome-ignore lint/suspicious/noExplicitAny: Letta SDK stream yields various message types
): AsyncGenerator<any> {
  // Create a new conversation for this request
  const conversation = await client.conversations.create({ agent_id: agentId });

  // Yield conversation metadata first so consumers can track it
  const metaEvent: ConversationMetaEvent = {
    message_type: "conversation_meta",
    conversation_id: conversation.id,
    timestamp: new Date().toISOString(),
  };
  yield metaEvent;

  // Build the message with the slash command followed by the content
  const messageContent = `${METADATA_SLASH_COMMAND} ${content}`;

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
    yield { ...msg, timestamp: new Date().toISOString() };
  }
};
