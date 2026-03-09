/**
 * Creates or updates the `metadata_schema` core memory block on the Letta agent.
 *
 * The block injects the metadata_ri output schema spec into the agent's system
 * prompt, so it is always in context (and KV-cached by the LLM provider) without
 * polluting individual user messages.
 *
 * Usage:
 *   pnpm update:metadata-schema
 *
 * Required env vars:
 *   LETTA_API_KEY       — Letta Cloud API key
 *   LETTA_PROJECT_ID    — Letta Cloud project ID
 *   PLAYGROUND_AGENT_ID — ID of the agent to update
 */
import "dotenv/config";
import { logger } from "@playground/shared-types";
import { createLettaClient } from "../packages/agents/src/index";
import { METADATA_SCHEMA_SPEC } from "../packages/agents/src/metadata-schema-spec";

const BLOCK_LABEL = "metadata_schema";

async function main() {
  const agentId = process.env.PLAYGROUND_AGENT_ID;
  if (!agentId) {
    throw new Error("PLAYGROUND_AGENT_ID environment variable is not set.");
  }

  const client = createLettaClient();

  // Check if the block already exists on the agent
  const existingBlocks = await client.agents.blocks.list(agentId);
  const existing = existingBlocks.find((b) => b.label === BLOCK_LABEL);

  if (existing) {
    await client.agents.blocks.update(BLOCK_LABEL, {
      agent_id: agentId,
      value: METADATA_SCHEMA_SPEC,
    });
    logger.info(
      { blockId: existing.id, label: BLOCK_LABEL },
      "Updated existing memory block",
    );
  } else {
    // Create a new standalone block then attach it to the agent
    const block = await client.blocks.create({
      label: BLOCK_LABEL,
      value: METADATA_SCHEMA_SPEC,
      description:
        "Output schema spec for metadata_ri — injected into system context so the agent always knows the exact format to produce.",
      limit: 8000,
    });
    await client.agents.blocks.attach(block.id, { agent_id: agentId });
    logger.info(
      { blockId: block.id, label: BLOCK_LABEL },
      "Created and attached new memory block",
    );
  }

  logger.info(`Done. Block '${BLOCK_LABEL}' is live on agent ${agentId}.`);
}

main().catch((err) => {
  logger.error(err, "Failed to update metadata schema block");
  process.exit(1);
});
