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
  // Secure the prompt against injection by strictly isolating untrusted markdown content
  // using XML-like delimiters. This prevents the LLM from confusing document content
  // with system instructions. We also strip any existing <document> tags from the input.
  const sanitizedContent = markdownContent.replace(/<\/?document>/gi, "");
  const messageContent = `${METADATA_SLASH_COMMAND}

<document>
${sanitizedContent}
</document>`;

  const stream = await client.conversations.messages.create(conversationId, {
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
