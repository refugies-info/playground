import type { Letta } from "@letta-ai/letta-client";
import matter from "gray-matter";
import { sendMessage } from "./agents";
import { INGESTION_AGENT_HEADING } from "./prompts";
import type { LettaMetadata } from "./types";

export const generateIngestionReport = async (
  client: Letta,
  xmlContent: string,
): Promise<string> => {
  const agentId = process.env.PLAYGROUND_AGENT_ID;
  if (!agentId) {
    throw new Error("PLAYGROUND_AGENT_ID is not defined");
  }

  const { content, usage } = await sendMessage(
    client,
    agentId,
    `${INGESTION_AGENT_HEADING}\n\n${xmlContent}`,
  );

  // Extract valid markdown content (skipping any preamble text before the frontmatter)
  // This is robust against agents that might chat before outputting the report
  const cleanContent = extractValidContent(content);

  // Parse existing frontmatter and enhance with Letta metadata
  const parsed = matter(cleanContent);

  const lettaMetadata: LettaMetadata = {
    agent_id: agentId,
    processed_at: new Date().toISOString(),
  };

  // Extract usage stats from response if available
  if (usage) {
    if (typeof usage.prompt_tokens === "number")
      lettaMetadata.prompt_tokens = usage.prompt_tokens;
    if (typeof usage.completion_tokens === "number")
      lettaMetadata.completion_tokens = usage.completion_tokens;
    if (typeof usage.total_tokens === "number")
      lettaMetadata.total_tokens = usage.total_tokens;
  }

  // Merge Letta metadata into frontmatter
  const enhancedData = {
    ...parsed.data,
    letta: lettaMetadata,
  };

  // Reconstruct markdown with enhanced frontmatter
  return matter.stringify(parsed.content, enhancedData);
};

/**
 * Extracts valid markdown content by locating the start of the frontmatter.
 * If there is text before the first '---' block (that appears at the start of a line), it is discarded.
 */
function extractValidContent(content: string): string {
  // Look for '---' at the start of the string or immediately following a newline
  const match = content.match(/(?:^|\n)---/);

  if (match && match.index !== undefined) {
    // If the match starts with a newline, we want to slice starting after that newline
    const startIndex = match[0].startsWith("\n")
      ? match.index + 1
      : match.index;
    return content.slice(startIndex);
  }
  return content;
}
