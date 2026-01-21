import type { Letta } from "@letta-ai/letta-client";
import { METADATA_SLASH_COMMAND } from "./prompts";

/**
 * Generates a metadata report by streaming responses from the Letta agent.
 * Uses the /metadata slash command to trigger report generation.
 *
 * Input: Markdown with frontmatter (from editorial_records after simplification)
 * Output: AsyncGenerator yielding stream chunks
 *
 * The agent should preserve input frontmatter and add metadata-specific fields.
 *
 * @param client - The Letta client instance
 * @param markdownContent - The document content (markdown with frontmatter)
 * @param client - The Letta client instance
 * @param markdownContent - The document content (markdown with frontmatter)
 * @param conversationId - The conversation ID to use
 */
export const generateMetadataReport = async function* (
  client: Letta,
  markdownContent: string,
  conversationId: string,
  // biome-ignore lint/suspicious/noExplicitAny: Letta SDK stream yields various message types
): AsyncGenerator<any> {
  // Build the message with the slash command followed by the markdown content
  // The markdown should contain frontmatter with metadata from previous phases
  const messageContent = `${METADATA_SLASH_COMMAND} ${markdownContent}`;

  const stream = await client.conversations.messages.create(
    conversationId,
    {
      messages: [
        {
          role: "user",
          content: messageContent,
        },
      ],
      stream_tokens: true,
      include_pings: true, // Keep connection alive during long tool executions
    },
    {
      timeout: 600_000, // 10 minute timeout
    },
  );

  // biome-ignore lint/suspicious/noExplicitAny: Letta SDK types work-around
  for await (const chunk of stream as AsyncIterable<any>) {
    // biome-ignore lint/suspicious/noExplicitAny: Letta SDK types work-around
    const msg = chunk as any;

    // Add timestamp to every message
    yield { ...msg, timestamp: new Date().toISOString() };
  }
};
