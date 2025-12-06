import type { Letta } from "@letta-ai/letta-client";
import type { AssistantMessage } from "@letta-ai/letta-client/resources/agents.js";

export interface ReasoningStep {
  timestamp: string;
  message: string;
  type: "thinking" | "function_call" | "response";
}

export interface EditorialAgentResult {
  content: string;
  reasoning: ReasoningStep[];
}

export const editorialAgent = async (
  client: Letta,
  content: string,
  instructions?: string,
): Promise<EditorialAgentResult> => {
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

  const response = await client.agents.messages.create(agentId, {
    messages: [
      {
        role: "user",
        content: messageContent,
      },
    ],
  });

  const messages = response.messages;
  const reasoning: ReasoningStep[] = [];

  // Extract reasoning from all messages
  // biome-ignore lint/suspicious/noExplicitAny: Letta SDK types work-around
  for (const msg of messages as any[]) {
    const timestamp = new Date().toISOString();

    if (msg.message_type === "reasoning_message") {
      const reasoningText = msg.reasoning || msg.content;
      reasoning.push({
        timestamp,
        message:
          typeof reasoningText === "string"
            ? reasoningText
            : JSON.stringify(reasoningText),
        type: "thinking",
      });
    } else if (msg.message_type === "hidden_reasoning_message") {
      if (msg.hidden_reasoning) {
        reasoning.push({
          timestamp,
          message: msg.hidden_reasoning,
          type: "thinking",
        });
      }
    } else if (msg.message_type === "tool_call_message") {
      const functionName = msg.tool_call?.name || "unknown";
      reasoning.push({
        timestamp,
        message: `Calling function: ${functionName}`,
        type: "function_call",
      });
    } else if (msg.message_type === "tool_return_message") {
    }
  }

  const lastMessage = [...messages]
    .reverse()
    .find(
      ({ message_type }) => message_type === "assistant_message",
    ) as AssistantMessage;

  if (!lastMessage) {
    throw new Error("No message with content found in response");
  }

  const responseContent = lastMessage.content;
  const finalContent =
    typeof responseContent === "string"
      ? responseContent
      : JSON.stringify(responseContent);

  return {
    content: finalContent,
    reasoning,
  };
};
