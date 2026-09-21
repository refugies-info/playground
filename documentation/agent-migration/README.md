# AI agent migration — Letta Agent SDK

This folder documents the migration of the editorial AI agent from the legacy Letta API (`@letta-ai/letta-client`) to **`@letta-ai/letta-agent-sdk`**, along a reversible delivery path.

> ⚠️ **Current source of truth**: the eight numbered documents below (plan of 17 September 2026, completed by the audit of 18 September). The plan was initially a single document (`agent-sdk-migration-plan.md`, deleted), split here by intent and by lifetime, for review.
> The earlier planning of 15 June 2026 assumed qmd plus a Letta Code runtime and a GCP worker; it was never implemented and is **obsolete**. The `agent-knowledge/` corpus on `main` is an empty skeleton, not a completed migration.
> The Linear project «Migration agent IA — Letta Code SDK et qmd» and its 50 tickets were archived on 17/09/2026. The new ticket breakdown lives in [`08-linear-and-appendix.md`](./08-linear-and-appendix.md).

## How to read this folder

| Order | Document | Sections | What it contains |
| ----- | -------- | -------- | ---------------- |
| 1 | [`01-decision.md`](./01-decision.md) | §1, §2, §5, §9 | **What must be decided**: executive summary, scope, target architecture, open trade-offs |
| 2 | [`02-current-state.md`](./02-current-state.md) | §3.1 – §3.4 | **What has been observed** in the repository, and what the official Letta guide changes in this plan |
| 3 | [`03-production-agents-audit.md`](./03-production-agents-audit.md) | §3.5 | **The actual state of production**: API audit of 18/09/2026 (agents, memory, resources) |
| 4 | [`04-agent-sdk-changes.md`](./04-agent-sdk-changes.md) | §4 | **What the SDK changes**, relative to the earlier plans |
| 5 | [`05-delivery-plan.md`](./05-delivery-plan.md) | §6 | **What gets executed**: seven phases (0 to 6), 21 PRs, exit criteria |
| 6 | [`06-production-rollback.md`](./06-production-rollback.md) | §7 | **The safety net**: rollback procedure, cases A to D |
| 7 | [`07-v1-removal-and-backup.md`](./07-v1-removal-and-backup.md) | §10 | **What keeps recurring**: schedule constraint, resource backup, outage detection |
| 8 | [`08-linear-and-appendix.md`](./08-linear-and-appendix.md) | §8, §11 | **Steering**: milestones, issue template, critical path, sources and limits |

The original numbering is preserved: a reference such as "§5.3" or "§10.4" remains valid as-is in the new breakdown.

### Where each original reference landed

| Original reference | Destination |
| ------------------ | ----------- |
| §1, §2 | [`01-decision.md#s1`](./01-decision.md#s1), [`01-decision.md#s2`](./01-decision.md#s2) |
| §3.1 – §3.3 | [`02-current-state.md`](./02-current-state.md) |
| §3.4 (and §3.4-a … §3.4-h) | [`02-current-state.md#s34`](./02-current-state.md#s34) |
| §3.5 | [`03-production-agents-audit.md`](./03-production-agents-audit.md) |
| §4 | [`04-agent-sdk-changes.md`](./04-agent-sdk-changes.md) |
| §5, §5.3 | [`01-decision.md#s5`](./01-decision.md#s5), [`01-decision.md#s53`](./01-decision.md#s53) |
| §6 | [`05-delivery-plan.md`](./05-delivery-plan.md) |
| §7 | [`06-production-rollback.md`](./06-production-rollback.md) |
| §8 | [`08-linear-and-appendix.md#s8`](./08-linear-and-appendix.md#s8) |
| §9, §9-A | [`01-decision.md#s9`](./01-decision.md#s9) |
| §10, §10.2, §10.4, §10.5 | [`07-v1-removal-and-backup.md`](./07-v1-removal-and-backup.md) |
| §11 | [`08-linear-and-appendix.md#s11`](./08-linear-and-appendix.md#s11) |

## Schedule constraint (Luis, 17 September 2026)

There is **no firm date** for the legacy API shutdown, but it is **imminent**. The legacy path is therefore a bridge of unknown duration, not a comfortable fallback. Archiving the authoritative resources (memory blocks, prompts, personas) is the **first priority**, ahead of any work on transport.

## Two agent implementations coexist (15 June 2026)

1. **Legacy Letta agent (production, the origin of this migration)** — `@playground/agents` package consuming `@letta-ai/letta-client@1.10.2`. It powers the ingestion, editorial and translation workflows of the Next.js frontend. It consumes **markdown + YAML frontmatter** from the Data Inclusion API.
2. **RCO XML agent skeleton (`.agents/`, `.commands/`, `.skills/`)** — archived from the repository on 15 June 2026 (see appendix C of the inventory). RCO is not an active production source; the `packages/rco/src/` helpers are kept for a possible future reactivation.

Appendix C of the inventory gives the detail; the audit of 18/09/2026 (§3.5) has since clarified which of these resources actually exist in production. That audit is **dated**: API facts change quickly (§3.4-e), so it will have to be re-verified before implementation.

## Key constraints

1. **Legacy Letta resources are frozen.** Letta deprecated updates to "File" resources; the production agents rely on resources uploaded before that deprecation and will never be updated again. This is the main driver for moving to configuration versioned in the repository.
2. **The current input format is markdown (YAML frontmatter + body)** from the Data Inclusion API.
3. **`search_ri_duplicate_dispositifs` is not a standalone tool.** It is a client for an ad-hoc API in the karfur repository that returns duplicate candidates, which the LLM then analyses. Any replacement must be justified by a demonstrated incompatibility — do not assume a Supabase `dispositifs` table exists.
4. **The four `/audit`, `/redaction`, `/metadata`, `/translate` chains in `packages/agents/src/prompts.ts` are not an export of the editorial knowledge.** The real instructions and references still have to be recovered and verified.

## Scope decision (15 June 2026, still valid)

- Migration work is carried out from `playground` (branch `main`), not from `karfur`.
- The production input format is **markdown + frontmatter** (consistent with the Supabase `editorial_records` table). RCO XML is out of scope.

## Historical documents

| File | Date | Content |
| ---- | ---- | ------- |
| [`letta-cloud-inventory.md`](./letta-cloud-inventory.md) | 2026-06-15 | Historical inventory of the Letta Cloud setup, used as context and starting point for the archiving work. Its migration mapping is obsolete. |
| [`agent-knowledge/`](./agent-knowledge/) | 2026-06-15 | Corpus skeleton (empty) from the abandoned qmd plan. |
