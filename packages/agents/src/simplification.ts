import type { Letta } from "@letta-ai/letta-client";

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
