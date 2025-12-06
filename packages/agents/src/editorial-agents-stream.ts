import type { Letta } from "@letta-ai/letta-client";
import type { ReasoningStep } from "./editorial-agents";

export const editorialAgentStream = async function* (
  client: Letta,
  content: string,
  instructions?: string,
): AsyncGenerator<ReasoningStep | { type: "content"; content: string }> {
  const agentId = process.env.EDITORIAL_AGENT_ID;
  if (!agentId) {
    throw new Error("EDITORIAL_AGENT_ID is not defined");
  }

  // Clear previous messages before each call
  await client.agents.messages.reset(agentId, {
    add_default_initial_messages: true,
  });

  const messageContent = instructions
    ? `Content:\n${content}\n\nInstructions:\n${instructions}`
    : content;

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
    const timestamp = new Date().toISOString();

    if (msg.message_type === "reasoning_message") {
      const reasoningText = msg.reasoning;
      yield {
        timestamp,
        message:
          typeof reasoningText === "string"
            ? reasoningText
            : JSON.stringify(reasoningText),
        type: "thinking",
      };
    } else if (msg.message_type === "hidden_reasoning_message") {
      if (msg.hidden_reasoning) {
        yield {
          timestamp,
          message: msg.hidden_reasoning,
          type: "thinking",
        };
      }
    } else if (msg.message_type === "tool_call_message") {
      const functionName = msg.tool_call?.name || "unknown";
      yield {
        timestamp,
        message: `Calling function: ${functionName}`,
        type: "function_call",
      };
    } else if (msg.message_type === "assistant_message") {
      const responseContent = msg.content;
      const finalContent =
        typeof responseContent === "string"
          ? responseContent
          : JSON.stringify(responseContent);
      yield {
        type: "content",
        content: finalContent,
      };
    }
  }
};
