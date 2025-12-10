import type { Letta } from "@letta-ai/letta-client";
import { runAgentOneShot } from "./agents";

export const convertMetadata = async (
  client: Letta,
  frontmatter: string,
  flowId: string,
): Promise<string> => {
  const templateId = process.env.CONVERT_METADATA_AGENT_TEMPLATE;
  if (!templateId) {
    throw new Error("CONVERT_METADATA_AGENT_TEMPLATE is not defined");
  }

  const { content } = await runAgentOneShot(
    client,
    templateId,
    flowId,
    frontmatter,
  );

  return content;
};
