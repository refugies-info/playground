import type { Letta } from "@letta-ai/letta-client";

import { logger } from "@playground/shared-types";
import matter from "gray-matter";
import { REDACTION_SLASH_COMMAND } from "./prompts";
import type { LettaUsage } from "./types";

/**
 * Fetches usage statistics from Letta API for a given run ID.
 * @param client - Letta client instance
 * @param runId - The run ID to fetch usage for
 * @returns Usage object with token counts
 */
export async function getRunUsage(
  client: Letta,
  runId: string,
): Promise<LettaUsage | undefined> {
  try {
    // biome-ignore lint/suspicious/noExplicitAny: Letta SDK work-around
    const usageData = await (client.runs.usage.retrieve(runId) as any);
    if (usageData && typeof usageData === "object") {
      return {
        promptTokens: usageData.prompt_tokens,
        completionTokens: usageData.completion_tokens,
        totalTokens: usageData.total_tokens,
      };
    }
  } catch (err) {
    logger.error(
      { runId, error: err instanceof Error ? err.message : String(err) },
      "[getRunUsage] Failed to fetch run usage",
    );
  }
  return undefined;
}

/**
 * Result of simplifying content with usage metadata.
 */
export interface SimplifyContentResult {
  content: string;
  usage?: LettaUsage;
}

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

  logger.info(
    { conversationId, contentLength: markdownContent.length },
    "[simplifyContent] Sending message to Letta agent",
  );

  const startTime = Date.now();
  let chunkCount = 0;

  const stream = await client.conversations.messages.create(conversationId, {
    messages: [
      {
        role: "user",
        content: messageContent,
      },
    ],
  });

  logger.info(
    { conversationId, elapsedMs: Date.now() - startTime },
    "[simplifyContent] Stream created, starting to read chunks",
  );

  // biome-ignore lint/suspicious/noExplicitAny: Letta SDK types work-around
  for await (const chunk of stream as AsyncIterable<any>) {
    chunkCount++;
    // biome-ignore lint/suspicious/noExplicitAny: Letta SDK types work-around
    const msg = chunk as any;

    if (chunkCount <= 3 || msg.message_type === "assistant_message") {
      logger.info(
        {
          conversationId,
          chunkCount,
          messageType: msg.message_type,
          hasContent: !!msg.content,
          contentPreview:
            typeof msg.content === "string"
              ? msg.content.slice(0, 80)
              : undefined,
          elapsedMs: Date.now() - startTime,
        },
        `[simplifyContent] Chunk #${chunkCount}`,
      );
    }

    // Add timestamp to every message
    msg.timestamp = new Date().toISOString();

    yield msg;
  }

  logger.info(
    {
      conversationId,
      totalChunks: chunkCount,
      totalMs: Date.now() - startTime,
    },
    "[simplifyContent] Stream completed",
  );
};

/**
 * Non-streaming version of simplifyContent.
 * Calls the Letta agent and consumes the whole stream, returning the full
 * response in one go — the caller never sees chunks or pings.
 *
 * Use this in durable workflow steps where streaming to a client is not needed.
 *
 * @returns The assistant's final message content (markdown).
 * @throws If the agent returns no assistant message.
 */
export async function simplifyContentSync(
  client: Letta,
  markdownContent: string,
  conversationId: string,
): Promise<SimplifyContentResult> {
  const startTime = Date.now();

  logger.info(
    { conversationId, contentLength: markdownContent.length },
    "[simplifyContentSync] Starting (consuming full stream)",
  );

  // The Letta SDK always streams for conversations.messages.create.
  // Depending on the server's streaming mode, `assistant_message` chunks are
  // token deltas rather than complete messages — and a multi-step agent can
  // emit several of them. We must consume the whole stream and concatenate
  // every chunk, otherwise the content is silently truncated.
  let assistantContent = "";
  let usage: SimplifyContentResult["usage"];
  let runId: string | undefined;

  for await (const chunk of simplifyContent(
    client,
    markdownContent,
    conversationId,
  )) {
    // Capture run_id from chunk metadata
    if (!runId && chunk.run_id) {
      runId = chunk.run_id;
    }

    if (chunk.message_type === "assistant_message") {
      assistantContent +=
        typeof chunk.content === "string"
          ? chunk.content
          : JSON.stringify(chunk.content);
    }
  }

  logger.info(
    {
      conversationId,
      totalMs: Date.now() - startTime,
      hasContent: !!assistantContent,
      contentLength: assistantContent.length,
    },
    "[simplifyContentSync] Content received",
  );

  if (!assistantContent) {
    throw new Error("No assistant message in Letta response");
  }

  if (runId) {
    usage = await getRunUsage(client, runId);
  }

  return {
    content: assistantContent,
    usage,
  };
}

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
