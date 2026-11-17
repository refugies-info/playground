/**
 * Creates the local dev agents on a self-hosted Letta server (LLM on Albert,
 * embeddings on Ollama),
 * then prints the env vars to paste into .env.
 *
 * Safe by design: refuses to run against Letta Cloud, so it can never create
 * paid agents by accident. Requires local mode (LETTA_BASE_URL set, or
 * LETTA_ENVIRONMENT=local).
 *
 * Usage (one shot):
 *   pnpm letta:init
 *
 * Or manually:
 *   pnpm letta:up
 *   pnpm letta:pull            # pulls nomic-embed-text
 *   pnpm letta:sync            # restart Letta so it discovers the new models
 *   LETTA_BASE_URL=http://localhost:8283 pnpm agents:create-local
 *
 * The LLM is Albert's gpt-oss-120b (ALBERT_API_KEY, see docker-compose.letta.yml).
 * Letta only syncs Ollama models at startup, so always restart Letta after
 * pulling a new model.
 *
 * Optional env overrides:
 *   LOCAL_LLM_MODEL        — model handle (default: openai-proxy/gpt-oss-120b)
 *   LOCAL_EMBEDDING_MODEL  — embedding handle (default: ollama/nomic-embed-text:latest)
 *
 * See documentation/ai/local-letta-dev.md.
 */
import "dotenv/config";
import { logger } from "@playground/shared-types";
import { createLettaClient } from "../packages/agents/src/index";

const isLocal =
  process.env.LETTA_ENVIRONMENT === "local" ||
  Boolean(process.env.LETTA_BASE_URL);

// Albert (OpenAI-compatible). letta/letta-free creates fine on the self-hosted
// server but 401s at inference time (it needs Letta Cloud auth).
const MODEL = process.env.LOCAL_LLM_MODEL ?? "openai-proxy/gpt-oss-120b";
const EMBEDDING =
  process.env.LOCAL_EMBEDDING_MODEL ?? "ollama/nomic-embed-text:latest";

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
