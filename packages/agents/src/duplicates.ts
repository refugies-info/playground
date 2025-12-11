import type { Letta } from "@letta-ai/letta-client";
import matter from "gray-matter";
import { runAgentOneShot } from "./agents";

export const checkDuplicates = async (
  client: Letta,
  content: string,
  flowId: string,
): Promise<string> => {
  const templateId = process.env.DUPLICATES_AGENT_TEMPLATE;
  if (!templateId) {
    throw new Error("DUPLICATES_AGENT_TEMPLATE is not defined");
  }

  const {
    content: agentResponse,
    agentId,
    usage,
  } = await runAgentOneShot(client, templateId, flowId, content);

  // Parse existing frontmatter and enhance with Letta metadata
  const parsed = matter(agentResponse);

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
