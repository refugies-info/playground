import type { Letta } from "@letta-ai/letta-client";
import type { ReasoningStep } from "./types";

export const simplifyContent = async function* (
  client: Letta,
  content: string,
  instructions?: string,
  flowId?: string,
): AsyncGenerator<ReasoningStep | { type: "content"; content: string }> {
  const templateId = process.env.EDITORIAL_AGENT_TEMPLATE;
  if (!templateId) {
    throw new Error("EDITORIAL_AGENT_TEMPLATE is not defined");
  }

  // Create a new agent from the template
  const sanitizedTemplateId = templateId.replace(/[^a-zA-Z0-9\s\-_]/g, "-");
  const agentResponse = await client.templates.agents.create(templateId, {
    agent_name: `${sanitizedTemplateId}-${flowId}`,
  });
  const agentId = agentResponse.agent_ids[0];

  if (!agentId) {
    throw new Error("Failed to create agent from template");
  }

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
