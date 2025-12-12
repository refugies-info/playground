import type { Letta } from "@letta-ai/letta-client";
import matter from "gray-matter";
import { sendMessage } from "./agents";
import type { LettaMetadata } from "./types";

export const generateIngestionReport = async (
  client: Letta,
  xmlContent: string,
): Promise<string> => {
  const agentId = process.env.PLAYGROUND_AGENT_ID;
  if (!agentId) {
    throw new Error("PLAYGROUND_AGENT_ID is not defined");
  }

  const heading = "Analyse conformité + doublons (parallèle):";

  const { content, usage } = await sendMessage(
    client,
    agentId,
    `${heading}\n\n${xmlContent}`,
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
 * If there is text before the first '---' block, it is discarded.
 */
function extractValidContent(content: string): string {
  const frontmatterStart = content.indexOf("---");
  if (frontmatterStart > 0) {
    // Check if it's really the start (preceded by newline or start of file)
    // If it's just '---' in the middle of a sentence, we need to be careful.
    // However, for purposes of cleaning agent output, usually we look for the FIRST occurrence of ---
    // that looks like a frontmatter delimiter.
    return content.slice(frontmatterStart);
  }
  return content;
}
