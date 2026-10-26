/**
 * Pushes the agent definitions of packages/agents/letta/<name>/ to Letta.
 * git is the source of truth, so every run overwrites what is on Letta:
 *   agent.json  → name, model, env var holding the agent id
 *   system.md   → system prompt
 *   blocks/*.md → one read-only memory block per file (label = file name)
 *
 * Usage:
 *   pnpm agents:sync                  # every agent folder
 *   pnpm agents:sync rco-compliance   # one agent
 *
 * The first run creates the agent and prints the env var to add to .env.
 *
 * Local Letta (pnpm letta:up), LLM on Albert: pnpm agents:sync:local <agent>
 *
 * Letta Cloud requires LETTA_AGENT_NAME_PREFIX: agents are matched by name, so
 * the prefix creates a separate set and never touches agents synced before.
 *   LETTA_BASE_URL= LETTA_AGENT_NAME_PREFIX=albert- \
 *     LETTA_AGENT_MODEL=<provider>/<model> pnpm agents:sync
 */
import "dotenv/config";
import fs from "node:fs";
import path from "node:path";
import type { Letta } from "@letta-ai/letta-client";
import { logger } from "@playground/shared-types";
import { createLettaClient } from "../packages/agents/src/index";

const AGENTS_DIR = path.join(__dirname, "../packages/agents/letta");

// Room for the blocks to grow while the rules are being written.
const MIN_BLOCK_LIMIT = 20_000;

// Overrides agent.json, e.g. an Ollama model on the local server.
const MODEL_OVERRIDE = process.env.LETTA_AGENT_MODEL;
const EMBEDDING = process.env.LOCAL_EMBEDDING_MODEL;
const NAME_PREFIX = process.env.LETTA_AGENT_NAME_PREFIX ?? "";
const isLocalServer = Boolean(
  process.env.LETTA_BASE_URL?.match(/localhost|127\.0\.0\.1/),
);

type AgentDefinition = {
  name: string;
  model: string;
  envVar: string;
  system: string;
  blocks: { label: string; value: string; description: string }[];
};

const readText = (...parts: string[]) =>
  fs.readFileSync(path.join(AGENTS_DIR, ...parts), "utf8").trim();

function readAgentDefinition(folder: string): AgentDefinition {
  const blockFiles = fs
    .readdirSync(path.join(AGENTS_DIR, folder, "blocks"))
    .filter((file) => file.endsWith(".md"));
  const agentConfig = JSON.parse(readText(folder, "agent.json"));
  return {
    ...agentConfig,
    name: `${NAME_PREFIX}${agentConfig.name}`,
    ...(MODEL_OVERRIDE && { model: MODEL_OVERRIDE }),
    system: readText(folder, "system.md"),
    blocks: blockFiles.map((file) => ({
      label: path.basename(file, ".md"),
      value: readText(folder, "blocks", file),
      description: `Synced from git (packages/agents/letta/${folder}/blocks/${file}). Do not edit.`,
    })),
  };
}

const toBlockFields = (block: AgentDefinition["blocks"][number]) => ({
  ...block,
  read_only: true,
  limit: Math.max(MIN_BLOCK_LIMIT, block.value.length),
});

async function findAgentId(client: Letta, name: string) {
  for await (const agent of client.agents.list({ name })) return agent.id;
  return null;
}

async function createAgent(client: Letta, definition: AgentDefinition) {
  const agent = await client.agents.create({
    name: definition.name,
    model: definition.model,
    embedding: EMBEDDING,
    agent_type: "letta_v1_agent",
    system: definition.system,
    memory_blocks: definition.blocks.map(toBlockFields),
    // Pure judgement agents: no memory editing, no tools.
    include_base_tools: false,
    tags: ["rco-arbitrage"],
  });
  logger.info({ name: definition.name, agentId: agent.id }, "Agent created");
  process.stdout.write(`${definition.envVar}=${agent.id}\n`);
}

async function updateAgent(
  client: Letta,
  agentId: string,
  definition: AgentDefinition,
) {
  await client.agents.update(agentId, {
    model: definition.model,
    system: definition.system,
  });

  const existingBlocks = new Map<string, string>();
  for await (const block of client.agents.blocks.list(agentId)) {
    if (block.label && block.id) existingBlocks.set(block.label, block.id);
  }

  for (const block of definition.blocks) {
    if (existingBlocks.has(block.label)) {
      await client.agents.blocks.update(block.label, {
        agent_id: agentId,
        ...toBlockFields(block),
      });
    } else {
      const created = await client.blocks.create(toBlockFields(block));
      await client.agents.blocks.attach(created.id as string, {
        agent_id: agentId,
      });
    }
  }

  const gitLabels = new Set(definition.blocks.map((block) => block.label));
  for (const [label, blockId] of existingBlocks) {
    if (gitLabels.has(label)) continue;
    await client.agents.blocks.detach(blockId, { agent_id: agentId });
    logger.warn({ label }, "Block not in git anymore: detached");
  }

  logger.info(
    { name: definition.name, agentId, blocks: [...gitLabels] },
    "Agent synced",
  );
}

async function main() {
  const requested = process.argv.slice(2);
  const folders = fs
    .readdirSync(AGENTS_DIR)
    .filter((folder) => requested.length === 0 || requested.includes(folder));
  if (folders.length === 0) throw new Error(`No agent folder: ${requested}`);

  if (!isLocalServer && !NAME_PREFIX) {
    throw new Error(
      "Letta Cloud: set LETTA_AGENT_NAME_PREFIX (e.g. albert-) so existing agents are never overwritten.",
    );
  }

  const client = createLettaClient();
  for (const folder of folders) {
    const definition = readAgentDefinition(folder);
    const agentId = await findAgentId(client, definition.name);
    if (agentId) await updateAgent(client, agentId, definition);
    else await createAgent(client, definition);
  }
}

main().catch((error) => {
  logger.error(error, "Letta agent sync failed");
  process.exit(1);
});
