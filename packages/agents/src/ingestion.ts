import type { Letta } from "@letta-ai/letta-client";
import { parseAgentResponse } from "./parser";
import { AUDIT_SLASH_COMMAND } from "./prompts";
import { IngestionMetadataSchema } from "./schemas";
import type { LettaReportResult } from "./types";

/**
 * Result of an ingestion report generation.
 * - `complete`: Valid frontmatter was parsed successfully
 * - `incomplete`: No valid frontmatter found, raw response preserved for debugging
 */
export type IngestionReportResult = LettaReportResult;

/**
 * Generates an ingestion (audit) report by streaming responses from the Letta agent.
 * Uses the /audit slash command to trigger report generation.
 *
 * Input: Markdown with frontmatter (containing RCO metadata)
 * Output: AsyncGenerator yielding stream chunks, final message contains report markdown
 *
 * @param client - The Letta client instance
 * @param markdownContent - The document markdown (frontmatter + content from RCO)
 * @param agentId - The agent ID to use (PLAYGROUND_AGENT_ID)
 */
export const generateIngestionReport = async function* (
  client: Letta,
  markdownContent: string,
  agentId: string,
  // biome-ignore lint/suspicious/noExplicitAny: Letta SDK stream yields various message types
): AsyncGenerator<any> {
  // Build the message with the slash command followed by the markdown content
  const messageContent = `${AUDIT_SLASH_COMMAND} ${markdownContent}`;

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
    yield { ...msg, timestamp: new Date().toISOString() };
  }
};

/**
 * Parses the final agent response into a structured IngestionReportResult.
 * Extracts frontmatter metadata and enhances with Letta metadata.
 *
 * @param agentResponse - The raw markdown response from the agent
 * @param agentId - The agent ID used for processing
 * @param usage - Optional usage statistics from the API
 */
export function parseIngestionResponse(
  agentResponse: string,
  agentId: string,
  usage?: {
    prompt_tokens?: number;
    completion_tokens?: number;
    total_tokens?: number;
  },
): IngestionReportResult {
  return parseAgentResponse(
    agentResponse,
    agentId,
    IngestionMetadataSchema,
    usage,
  );
}
