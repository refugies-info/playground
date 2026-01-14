import type { Letta } from "@letta-ai/letta-client";

/**
 * The /metadata slash command for Agathe to generate metadata reports.
 */
export const METADATA_SLASH_COMMAND = "/metadata";

/**
 * Generates a metadata report by streaming responses from the Agathe agent.
 * Uses the /metadata slash command to trigger report generation.
 *
 * @param client - The Letta client instance
 * @param content - The document content (markdown with frontmatter)
 * @param agentId - The agent ID to use (PLAYGROUND_AGENT_ID)
 * @param flowId - The workflow/document ID for context
 * @param metadata - Optional additional metadata to include
 */
export const generateMetadataReport = async function* (
  client: Letta,
  content: string,
  agentId: string,
  flowId?: string,
  metadata?: Record<string, unknown>,
  // biome-ignore lint/suspicious/noExplicitAny: Letta SDK stream yields various message types
): AsyncGenerator<any> {
  // Build the message content with the slash command
  const messageParts: string[] = [];

  // Start with the slash command
  messageParts.push(METADATA_SLASH_COMMAND);

  // Add the content for analysis
  messageParts.push(`<content>\n${content}\n</content>`);

  // Add flowId if provided for tracking
  if (flowId) {
    messageParts.push(`<flow_id>${flowId}</flow_id>`);
  }

  // Add metadata if provided
  if (metadata) {
    messageParts.push(
      `<metadata>\n${JSON.stringify(metadata, null, 2)}\n</metadata>`,
    );
  }

  const messageContent = messageParts.join("\n\n");

  const stream = await client.agents.messages.stream(agentId, {
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
