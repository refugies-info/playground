# Migration agent IA — Letta Code SDK et qmd

This folder tracks the migration of the editorial AI agent from **Letta Cloud** (SDK `@letta-ai/letta-client`) to **Letta Code SDK** + `qmd` corpus.

## Linear tracking

- Project: [Migration agent IA — Letta Code SDK et qmd](https://linear.app/refugies-info/project/migration-agent-ia-letta-code-sdk-et-qmd-458608ee4f70)
- 50 issues, 6 waves (inventory → corpus → skills → runtime abstraction → Letta Code runtime → cutover).

## Two coexisting agent implementations (15 June 2026)

1. **Agent Letta Cloud (production, source of the migration)** — `@playground/agents` package consuming `@letta-ai/letta-client@1.10.2`. Powers the ingestion/editorial/translation workflows in the Next.js frontend. Consumes **markdown + YAML frontmatter** from the Data Inclusion API. Production project: `project-pZvdCSjhJ7Fgmi66gqgy`.
2. **Agent Letta Code (scaffolded, target of the migration)** — `.agents/`, `.commands/`, `.skills/`. "Agathe" agent partially scaffolded for **RCO XML (Lhéo)** input. Not active in production today, but RCO will become relevant again — resources must be kept.

The migration **moves the production setup toward the Letta Code pattern**, while **preserving the RCO scaffolded setup** for future activation.

## Key constraints (Luis, 15 June 2026)

1. **Letta Cloud resources are frozen.** Letta deprecated "File" resource updates. Production agents rely on resources uploaded before this deprecation and will **never be updated again** on Letta Cloud. The migration must switch to a fully local+versioned pattern (Letta Code + qmd).
2. **Current input format is markdown (YAML frontmatter + text body)** from the Data Inclusion API. RCO XML is not in active production but will be relevant again — the associated resources (`.commands/*.md`, `.skills/metadata/`) must be preserved.
3. **`search_ri_duplicate_dispositifs` is not a self-contained tool.** It's a client to an ad-hoc API in the karfur codebase that returns likely duplicate candidates, which the LLM then analyzes. Migration must replace this with a Supabase-based equivalent in playground.
4. **`ressources_metadatas/base-connaissance.md`** (referenced by `.skills/metadata/SKILL.md`) **is intentionally left missing** for now. Luis will check with the RI team whether the knowledge base is still relevant.

## Documents

| File                                       | RI            | Contents                                                                       |
| ------------------------------------------ | ------------- | ------------------------------------------------------------------------------ |
| [`letta-cloud-inventory.md`](./letta-cloud-inventory.md) | RI-1258 (PR 01) | Full inventory of both setups (Letta Cloud + Letta Code scaffold) before migration. Includes format-of-input decision, migration mapping table, per-PR implications. |

## Scoping decision (15 June 2026)

- Migration work is executed from `playground` (branch `main`), not from `karfur`.
- The original karfur PRs are still **referenced** in Linear descriptions (title "PR##") but **all migration code** is rewritten in this repo, from scratch.
- The production input format is **markdown + frontmatter** (consistent with the `editorial_records` Supabase table). The RCO XML setup in `.commands/` is kept for future reactivation but is out of scope for the current migration.
