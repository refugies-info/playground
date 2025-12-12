import type { Letta } from "@letta-ai/letta-client";
import matter from "gray-matter";
import { sendMessage } from "./agents";

export const generateIngestionReport = async (
  client: Letta,
  xmlContent: string,
): Promise<string> => {
  const agentId = process.env.PLAYGROUND_AGENT_ID;
  if (!agentId) {
    throw new Error("PLAYGROUND_AGENT_ID is not defined");
  }

  const { content, usage } = await sendMessage(client, agentId, xmlContent);

  // Parse existing frontmatter and enhance with Letta metadata
  const parsed = matter(content);

  const lettaMetadata: Record<string, unknown> = {
    agent_id: agentId,
    processed_at: new Date().toISOString(),
  };

  // Extract usage stats from response if available
  if (usage) {
    if (usage.prompt_tokens) lettaMetadata.prompt_tokens = usage.prompt_tokens;
    if (usage.completion_tokens)
      lettaMetadata.completion_tokens = usage.completion_tokens;
    if (usage.total_tokens) lettaMetadata.total_tokens = usage.total_tokens;
  }

  // Merge Letta metadata into frontmatter
  const enhancedData = {
    ...parsed.data,
    letta: lettaMetadata,
  };

  // Reconstruct markdown with enhanced frontmatter
  return matter.stringify(parsed.content, enhancedData);
};
