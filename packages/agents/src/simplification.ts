import type { Letta } from "@letta-ai/letta-client";
import matter from "gray-matter";
import { REDACTION_SLASH_COMMAND } from "./prompts";

/**
 * Simplifies/transforms content using the Letta agent with the /redaction command.
 *
 * Input: Markdown with frontmatter (containing metadata from ingestion phase)
 * Output: AsyncGenerator yielding stream chunks
 *
 * The agent output should be markdown with frontmatter, preserving input metadata
 * and adding any additional fields from the simplification process.
 *
 * @param client - The Letta client instance
 * @param markdownContent - Markdown with frontmatter (from editorial_records)
 * @param client - The Letta client instance
 * @param markdownContent - Markdown with frontmatter (from editorial_records)
 * @param conversationId - The conversation ID to use
 */
export const simplifyContent = async function* (
  client: Letta,
  markdownContent: string,
  conversationId: string,
  // biome-ignore lint/suspicious/noExplicitAny: Letta SDK stream yields various message types
): AsyncGenerator<any> {
  if (!conversationId) {
    throw new Error("Conversation ID is required");
  }

  // Secure the prompt against injection by strictly isolating untrusted markdown content
  // using XML-like delimiters. This prevents the LLM from confusing document content
  // with system instructions. We also strip any existing <document> tags from the input.
  const sanitizedContent = markdownContent.replace(/<\/?document>/gi, "");
  const messageContent = `${REDACTION_SLASH_COMMAND}

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
    msg.timestamp = new Date().toISOString();

    yield msg;
  }
};

/**
 * Builds markdown with frontmatter from separate content and metadata.
 * Use this helper when the UI provides content and metadata separately.
 *
 * @param content - The text content (body)
 * @param metadata - The metadata to include in frontmatter
 * @param instructions - Optional instructions to include in frontmatter
 */
export function buildMarkdownWithFrontmatter(
  content: string,
  metadata?: Record<string, unknown>,
  instructions?: string,
): string {
  const frontmatterData: Record<string, unknown> = {
    ...metadata,
  };

  if (instructions) {
    frontmatterData.instructions = instructions;
  }

  return matter.stringify(content, frontmatterData);
}
