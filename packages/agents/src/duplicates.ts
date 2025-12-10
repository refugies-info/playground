import type { Letta } from "@letta-ai/letta-client";
import matter from "gray-matter";
import { runAgentOneShot } from "./agents";

export const checkDuplicates = async (
  client: Letta,
  xmlContent: string,
  flowId: string,
): Promise<string> => {
  const templateId = process.env.DUPLICATES_AGENT_TEMPLATE;
  if (!templateId) {
    throw new Error("DUPLICATES_AGENT_TEMPLATE is not defined");
  }

  const { content, agentId, usage } = await runAgentOneShot(
    client,
    templateId,
    flowId,
    xmlContent,
  );

  // Parse existing frontmatter and enhance with Letta metadata
  const parsed = matter(content);

  const lettaMetadata: Record<string, unknown> = { agentId };

  // Extract usage stats from response if available
  if (usage) {
    if (usage.prompt_tokens) lettaMetadata.prompt_tokens = usage.prompt_tokens;
    if (usage.completion_tokens)
      lettaMetadata.completion_tokens = usage.completion_tokens;
    if (usage.total_tokens) lettaMetadata.total_tokens = usage.total_tokens;
  }

  // Add agent ID to metadata
  lettaMetadata.agent_id = agentId;
  // Add timestamp
  lettaMetadata.processed_at = new Date().toISOString();

  // Merge Letta metadata into frontmatter
  const enhancedData = {
    ...parsed.data,
    letta: lettaMetadata,
  };

  // Reconstruct markdown with enhanced frontmatter
  return matter.stringify(parsed.content, enhancedData);
};
