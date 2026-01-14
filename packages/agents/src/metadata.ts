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
 */
export const generateMetadataReport = async function* (
  client: Letta,
  content: string,
  agentId: string,
  // biome-ignore lint/suspicious/noExplicitAny: Letta SDK stream yields various message types
): AsyncGenerator<any> {
  // Build the message with the slash command followed by the content
  const messageContent = `${METADATA_SLASH_COMMAND} ${content}`;

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
