import { Letta } from "@letta-ai/letta-client";

export interface ReasoningStep {
  timestamp: string;
  message: string;
  type: "thinking" | "function_call" | "response";
}

export const editorialAgentStream = async function* (
  client: Letta,
  content: string,
  instructions?: string
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

  console.log(`[Editorial Agent Stream] Starting stream...`);

  for await (const chunk of stream as AsyncIterable<any>) {
    const msg = chunk as any;
    const timestamp = new Date().toISOString();

    console.log(`[Editorial Agent Stream] Chunk type: ${msg.message_type}`);

    if (msg.message_type === "reasoning_message") {
      const reasoningText = msg.reasoning;
      console.log(`[Editorial Agent Stream] Reasoning:`, reasoningText);
      yield {
        timestamp,
        message:
          typeof reasoningText === "string"
            ? reasoningText
            : JSON.stringify(reasoningText),
        type: "thinking",
      };
    } else if (msg.message_type === "hidden_reasoning_message") {
      console.log(
        `[Editorial Agent Stream] Hidden reasoning (state: ${msg.state})`
      );
      if (msg.hidden_reasoning) {
        yield {
          timestamp,
          message: msg.hidden_reasoning,
          type: "thinking",
        };
      }
    } else if (msg.message_type === "tool_call_message") {
      const functionName = msg.tool_call?.name || "unknown";
      console.log(`[Editorial Agent Stream] Tool call: ${functionName}`);
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
      console.log(`[Editorial Agent Stream] Final content received`);
      yield {
        type: "content",
        content: finalContent,
      };
    }
  }

  console.log(`[Editorial Agent Stream] Stream complete`);
};
