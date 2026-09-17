# Migration agent IA — Letta Agent SDK

This folder tracks the migration of the editorial AI agent from the legacy Letta API (`@letta-ai/letta-client`) to **`@letta-ai/letta-agent-sdk`**, with a rollback-safe delivery path.

> ⚠️ **Current source of truth**: [`agent-sdk-migration-plan.md`](./agent-sdk-migration-plan.md) (2026-09-17).
> Earlier planning from 15 June 2026 assumed qmd + a Letta Code runtime and a GCP worker; it was not implemented and is **superseded**. The `agent-knowledge/` corpus on `main` is an empty scaffold, not a completed migration.
> Linear project `Migration agent IA — Letta Code SDK et qmd` and its 50 issues were archived on 2026-09-17. The new issue breakdown lives in the plan document.

## Calendar constraint (Luis, 17 September 2026)

There is **no firm date** for the legacy API closure, but it is **imminent**. The legacy path is therefore a bridge of unknown duration, not a comfortable fallback. Archiving the authoritative agent resources (memory blocks, prompts, personas) is the **first priority**, before any transport work.

## Two coexisting agent implementations (15 June 2026)

1. **Agent legacy Letta (production, source of the migration)** — `@playground/agents` package consuming `@letta-ai/letta-client@1.10.2`. Powers the ingestion/editorial/translation workflows in the Next.js frontend. Consumes **markdown + YAML frontmatter** from the Data Inclusion API.
2. **Agent scaffold RCO XML (`.agents/`, `.commands/`, `.skills/`)** — archived from the repo on 15 June 2026 (see Annex C of the inventory). RCO is not an active production source; `packages/rco/src/` helpers are kept for a possible future reactivation.

## Key constraints

1. **Legacy Letta resources are frozen.** Letta deprecated "File" resource updates; production agents rely on resources uploaded before that deprecation and will never be updated again. This is the main driver for moving to a locally versioned setup.
2. **Current input format is markdown (YAML frontmatter + text body)** from the Data Inclusion API.
3. **`search_ri_duplicate_dispositifs` is not a self-contained tool.** It is a client to an ad-hoc API in the karfur codebase that returns likely duplicate candidates, which the LLM then analyses. Any replacement must be justified by a demonstrated incompatibility — do not assume a Supabase `dispositifs` table exists.
4. **The four `/audit`, `/redaction`, `/metadata`, `/translate` strings in `packages/agents/src/prompts.ts` are not an export of the editorial knowledge.** The real instructions and references still need to be recovered and verified.

## Documents

| File | Date | Contents |
| ---- | ---- | -------- |
| [`agent-sdk-migration-plan.md`](./agent-sdk-migration-plan.md) | 2026-09-17 | **Current plan.** Phased PR breakdown, rollback procedure, Linear project structure, calendar constraint. Supersedes all earlier planning. |
| [`letta-cloud-inventory.md`](./letta-cloud-inventory.md) | 2026-06-15 | Historical inventory of the legacy setup, used as context and as the starting point for the resource-archiving work. Its migration mapping is superseded. |

## Scoping decision (15 June 2026, still valid)

- Migration work is executed from `playground` (branch `main`), not from `karfur`.
- The production input format is **markdown + frontmatter** (consistent with the `editorial_records` Supabase table). RCO XML is out of scope.
