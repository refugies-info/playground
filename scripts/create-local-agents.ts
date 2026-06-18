/**
 * Creates the local dev agents on a self-hosted Letta server (Ollama-backed),
 * then prints the env vars to paste into .env.
 *
 * Safe by design: refuses to run against Letta Cloud, so it can never create
 * paid agents by accident. Requires local mode (LETTA_BASE_URL set, or
 * LETTA_ENVIRONMENT=local).
 *
 * Usage:
 *   docker compose -f docker-compose.letta.yml up -d
 *   docker compose -f docker-compose.letta.yml exec ollama ollama pull qwen2.5:7b
 *   docker compose -f docker-compose.letta.yml exec ollama ollama pull nomic-embed-text
 *   LETTA_BASE_URL=http://localhost:8283 pnpm agents:create-local
 *
 * Optional env overrides:
 *   LOCAL_LLM_MODEL        — model handle (default: ollama/qwen2.5:7b)
 *   LOCAL_EMBEDDING_MODEL  — embedding handle (default: ollama/nomic-embed-text)
 *
 * See packages/agents/LOCAL_DEV.md.
 */
import "dotenv/config";
import { logger } from "@playground/shared-types";
import { createLettaClient } from "../packages/agents/src/index";

const isLocal =
  process.env.LETTA_ENVIRONMENT === "local" ||
  Boolean(process.env.LETTA_BASE_URL);

const MODEL = process.env.LOCAL_LLM_MODEL ?? "ollama/gemma3:1b";
const EMBEDDING =
  process.env.LOCAL_EMBEDDING_MODEL ?? "ollama/nomic-embed-text";

// One agent per flow. envVar is what to set in .env to point the app at it.
const AGENTS = [
  { name: "playground-local", envVar: "PLAYGROUND_AGENT_ID" },
  { name: "metadata-local", envVar: "METADATA_AGENT_ID" },
] as const;

async function main() {
  if (!isLocal) {
    throw new Error(
      "Refusing to run against Letta Cloud. Set LETTA_BASE_URL=http://localhost:8283 " +
        "(or LETTA_ENVIRONMENT=local) to target the self-hosted server.",
    );
  }

  const client = createLettaClient();

  logger.info(
    { model: MODEL, embedding: EMBEDDING, baseURL: process.env.LETTA_BASE_URL },
    "Creating local agents",
  );

  const created: { envVar: string; id: string }[] = [];

  for (const { name, envVar } of AGENTS) {
    const agent = await client.agents.create({
      name,
      model: MODEL,
      embedding: EMBEDDING,
      include_base_tools: true,
    });
    logger.info({ name, agentId: agent.id }, "Agent created");
    created.push({ envVar, id: agent.id });
  }

  logger.info("Done. Add these to your .env:");
  for (const { envVar, id } of created) {
    // Plain stdout so the lines are easy to copy.
    process.stdout.write(`${envVar}=${id}\n`);
  }
}

main().catch((err) => {
  logger.error(err, "Failed to create local agents");
  process.exit(1);
});
