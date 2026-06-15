#!/usr/bin/env tsx
/**
 * scripts/export-letta-cloud-blocks.ts
 *
 * Export the 3 production "frozen" Letta Cloud memory blocks to the local
 * git-versioned corpus at `documentation/agent-migration/agent-knowledge/`,
 * per the PR-03 (TEC-33, RI-1260) spec.
 *
 * Inputs (env):
 *   LETTA_API_KEY        — required, production Letta Cloud key
 *   PLAYGROUND_AGENT_ID  — required, used for source attribution in the
 *                          frontmatter only (the prod agent has 0 attached
 *                          blocks; the 3 frozen blocks live as workspace-
 *                          level `system/*` templates)
 *   LETTA_BASE_URL       — optional, defaults to `https://api.letta.com`
 *
 * Inputs (CLI):
 *   --project-id <id>    — optional, scope the search to a specific project
 *                          (defaults to workspace-wide listing)
 *   --dry-run            — log what would be written, don't touch the disk
 *   --help, -h           — show usage
 *
 * Output:
 *   documentation/agent-migration/agent-knowledge/prompts/
 *     ├── metadata-schema.md
 *     ├── compliance.md
 *     └── doublons.md
 *
 * Exit codes:
 *   0 — all blocks written successfully
 *   1 — fetch error (auth, network, server)
 *   2 — script ran but some/all blocks were missing or too short
 */

import "dotenv/config";
import fs from "node:fs/promises";
import path from "node:path";
import { createLettaClient } from "../packages/agents/src/clients";

// --- Constants --------------------------------------------------------------

const CORPUS_DIR = path.join(
  process.cwd(),
  "documentation/agent-migration/agent-knowledge/prompts",
);

const MAX_VALUE_LENGTH = 15000; // Hard cap, per spec
const WEAK_EXTRACTION_CHARS = 200; // Anything shorter is flagged

// The 3 frozen blocks we want to export. `file` follows the kebab-case
// convention from SCHEMA.md.
//
// `label` is the EXACT Letta Cloud label (verified via `GET /v1/blocks?label=…`
// on 2026-06-15 against api.letta.com with the production API key from
// `.env.local`). Note: the PR-01 inventory (RI-1258) described these with
// simple English names (`metadata_schema`, `compliance`, `doublons`), but the
// live labels on the server are fully-qualified `system/…` workspace templates
// with French compound names. The English file names on the right are the
// "logical paths" the PR-03 spec requires.
const BLOCKS_TO_EXPORT = [
  {
    label: "system/metadata_schema",
    file: "metadata-schema.md",
    description:
      "Spécification lisible par le LLM du schéma de sortie `metadata_ri` (TypeScript + YAML + règles métier). Injecté dans le contexte système de l'agent de prod via le bloc mémoire `system/metadata_schema`.",
  },
  {
    label: "system/compétence_conformité_éditoriale_di",
    file: "compliance.md",
    description:
      "Prompt de vérification de conformité d'une fiche au périmètre éditorial de Refugies.info (catégorie, objectif, cas d'usage, positionnement) sur source Data Inclusion. Sortie en frontmatter YAML strict.",
  },
  {
    label: "system/compétence_détection_doublons",
    file: "doublons.md",
    description:
      "Prompt de détection de doublons probables (Data Inclusion vs Refugies.info) sur 3 axes : localisation, structure, intitulé/contenu. Comparaison fuzzy et sémantique. Sortie en frontmatter YAML strict.",
  },
] as const;

type BlockLabel = (typeof BLOCKS_TO_EXPORT)[number]["label"];

type FetchedBlocks = {
  blocks: Map<BlockLabel, string>;
  missing: BlockLabel[];
  weak: BlockLabel[];
};

// --- Logger ----------------------------------------------------------------

const ts = (): string => new Date().toISOString();

const logger = {
  info: (obj: unknown, msg: string) =>
    console.log(`[${ts()}] INFO: ${msg}\n    ${JSON.stringify(obj)}`),
  warn: (obj: unknown, msg: string) =>
    console.log(`[${ts()}] WARN: ${msg}\n    ${JSON.stringify(obj)}`),
  error: (obj: unknown, msg: string) =>
    console.log(`[${ts()}] ERROR: ${msg}\n    ${JSON.stringify(obj)}`),
};

// --- CLI parsing -----------------------------------------------------------

function parseCliArgs(argv: string[]): {
  projectId: string | null;
  dryRun: boolean;
} {
  let projectId: string | null = null;
  let dryRun = false;

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--project-id") {
      const value = argv[i + 1];
      if (!value) {
        throw new Error("--project-id requires a value");
      }
      projectId = value;
      i += 1;
    } else if (arg === "--dry-run") {
      dryRun = true;
    } else if (arg === "--help" || arg === "-h") {
      process.stdout.write(
        "Usage: pnpm tsx scripts/export-letta-cloud-blocks.ts " +
          "[--project-id <id>] [--dry-run]\n",
      );
      process.exit(0);
    } else {
      throw new Error(`Unknown argument: ${arg}`);
    }
  }

  return { projectId, dryRun };
}

// --- Core logic ------------------------------------------------------------

async function fetchBlocks(projectId: string | null): Promise<FetchedBlocks> {
  const client = createLettaClient();
  const blocks = new Map<BlockLabel, string>();
  const wanted = new Set(BLOCKS_TO_EXPORT.map((b) => b.label));

  // Two code paths:
  //  1. Default: list blocks workspace-wide using `client.blocks.list()` with no
  //     filter. This is what finds the 3 system/ template blocks, which have
  //     `project_id: null` and aren't attached to any specific agent.
  //  2. Override: if --project-id is given, scope the search to a specific
  //     project (e.g. the orphan project `project-pZvdCSjhJ7Fgmi66gqgy` if you
  //     need to pull from the archived RCO agent skills).
  //
  // Note on the PR-03 spec: it says "the script uses LETTA_API_KEY and
  // PLAYGROUND_AGENT_ID". The agent ID is still required — it's used for
  // source attribution in the frontmatter (see main()). But the actual block
  // search goes through `client.blocks.list()` rather than
  // `client.agents.blocks.list()`, because the prod agent has zero blocks
  // attached (verified on 2026-06-15 via `GET /v1/agents/{id}`).
  const iterator = projectId
    ? client.blocks.list({ project_id: projectId })
    : client.blocks.list();

  for await (const block of iterator) {
    if (block.label && wanted.has(block.label as BlockLabel)) {
      blocks.set(block.label as BlockLabel, block.value ?? "");
    }
  }

  const missing = BLOCKS_TO_EXPORT.filter((b) => !blocks.has(b.label)).map(
    (b) => b.label,
  );
  const weak = [...blocks.entries()]
    .filter(([, value]) => value.length < WEAK_EXTRACTION_CHARS)
    .map(([label]) => label);

  return { blocks, missing, weak };
}

function buildFrontmatter(params: {
  file: string;
  label: BlockLabel;
  description: string;
  source: string;
  length: number;
}): string {
  const { file, label, description, source, length } = params;
  const lastReviewed = new Date().toISOString().split("T")[0]; // YYYY-MM-DD

  const descriptionYamlEscaped = description.replace(/"/g, '\\"');
  const sourceYamlEscaped = source.replace(/"/g, '\\"');

  const lengthBudgetLine =
    length > MAX_VALUE_LENGTH
      ? `# WARNING: source block is ${length} chars, the value below is truncated to ${MAX_VALUE_LENGTH} for the corpus.\n`
      : "";

  return [
    "---",
    `title: ${file.replace(/\.md$/, "")}`,
    `type: letta-block-export`,
    `origin: letta-cloud`,
    `letta-label: "${label}"`,
    `description: "${descriptionYamlEscaped}"`,
    `length: ${length}`,
    `source: "${sourceYamlEscaped}"`,
    `last-reviewed: ${lastReviewed}`,
    "---",
    lengthBudgetLine,
  ]
    .filter((line, idx, arr) => !(line === "" && arr[idx - 1] === ""))
    .join("\n");
}

async function writeCorpusFile(
  file: string,
  body: string,
  dryRun: boolean,
): Promise<"written" | "dry-run"> {
  const filepath = path.join(CORPUS_DIR, file);
  if (dryRun) {
    logger.info(
      { file: filepath, bytes: body.length },
      "[dry-run] would write",
    );
    return "dry-run";
  }
  await fs.mkdir(path.dirname(filepath), { recursive: true });
  await fs.writeFile(filepath, body, "utf-8");
  logger.info({ file: filepath, bytes: body.length }, "Wrote corpus file");
  return "written";
}

// --- Main -------------------------------------------------------------------

async function main() {
  const { projectId, dryRun } = parseCliArgs(process.argv.slice(2));

  const apiKey = process.env.LETTA_API_KEY;
  const agentId = process.env.PLAYGROUND_AGENT_ID;

  if (!apiKey) {
    throw new Error("LETTA_API_KEY environment variable is not set.");
  }
  if (!agentId) {
    throw new Error("PLAYGROUND_AGENT_ID environment variable is not set.");
  }

  logger.info(
    {
      agentId,
      projectId: projectId ?? "(default: workspace-wide)",
      dryRun,
      blocks: BLOCKS_TO_EXPORT.map((b) => b.label),
    },
    "Starting Letta Cloud blocks export",
  );

  let fetched: FetchedBlocks;
  try {
    fetched = await fetchBlocks(projectId);
  } catch (err) {
    logger.error(
      { err },
      "Failed to fetch blocks. The agent/project may not exist, or you may not have access.",
    );
    process.exit(1);
  }

  const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
  let writtenCount = 0;

  for (const { label, file, description } of BLOCKS_TO_EXPORT) {
    const value = fetched.blocks.get(label);
    if (value === undefined) {
      // already logged via fetched.missing
      continue;
    }

    const source = projectId
      ? `Exported from Letta Cloud — project ${projectId}, block \`${label}\`, agent ${agentId}, ${today}`
      : `Exported from Letta Cloud — agent ${agentId}, block \`${label}\`, ${today}`;

    const frontmatter = buildFrontmatter({
      file,
      label,
      description,
      source,
      length: value.length,
    });

    const body =
      value.length > MAX_VALUE_LENGTH
        ? `${frontmatter}\n${value.slice(0, MAX_VALUE_LENGTH)}\n`
        : `${frontmatter}\n${value}\n`;

    const result = await writeCorpusFile(file, body, dryRun);
    if (result === "written") {
      writtenCount += 1;
    }
  }

  const summary = {
    total: BLOCKS_TO_EXPORT.length,
    written: writtenCount,
    missing: fetched.missing,
    weak: fetched.weak,
  };
  logger.info(summary, "Export complete");

  if (fetched.missing.length > 0 || fetched.weak.length > 0) {
    if (fetched.missing.length === BLOCKS_TO_EXPORT.length) {
      logger.error(
        {
          missing: fetched.missing,
        },
        "No blocks exported. The script ran successfully but the source returned no data — see the missing/weak counters above.",
      );
    } else {
      logger.warn(
        {
          missing: fetched.missing,
          weak: fetched.weak,
        },
        "Some blocks were missing or weak. See the counters above.",
      );
    }
    process.exit(2);
  }

  process.exit(0);
}

main().catch((err) => {
  logger.error({ err }, "Unhandled error");
  process.exit(1);
});
