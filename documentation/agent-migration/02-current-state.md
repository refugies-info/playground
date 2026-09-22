# Repository current state

> **Sections §3.1 to §3.4 — integration surface, rollback risks already present in the code, and what the official Letta guide changes in this plan.**

---

## 3. Verified current state

### 3.1 Integration surface

| Finding | Reference |
|---|---|
| Dependency declared in `packages/agents` and `packages/workflows` (both `1.10.2`) | `packages/{agents,workflows}/package.json` — `@letta-ai/letta-client: 1.10.2` |
| Dual-mode client factory (`LETTA_BASE_URL` / `LETTA_ENVIRONMENT` → local mode; otherwise cloud with key + project ID) | `packages/agents/src/clients.ts` |
| Active flows: audit, writing, metadata (multi-task), translation | `packages/agents/src/{ingestion,simplification,metadata}.ts`, `packages/workflows/src/steps/translation/generate-translation.ts` |
| Main call: `conversations.messages.create()` with manual stream consumption and **concatenation** of the chunks | `packages/agents/src/agents.ts`, `simplification.ts`, several workflow steps |
| Usage captured from `usage_statistics` stream chunks (summed per agent step) — `runs.usage.retrieve()` removed (TEC-63) | `packages/agents/src/simplification.ts` (`accumulateUsage`), all stream consumers |
| Workflow steps import `APIError` from the canonical `core/error` subpath, with the dependency declared | `packages/workflows/src/steps/ingestion/{di-single-record-steps,audit-di-step,metadata-di-step}.ts` |
| Durability (resume, retry, state) comes from **Vercel Workflow**, not from Letta | `packages/workflows/src/...`, `editorial_records.active_run_id` |
| Conversation lookup by scanning names over a list capped at 100 | `packages/agents/src/agents.ts` |
| The AI fan-out of DI ingestion is **commented out** | `packages/workflows/src/pipelines/ingestion/di-ingestion.ts` |
| `prompts.ts` contains only the `/audit`, `/redaction`, `/metadata`, `/translate` strings | `packages/agents/src/prompts.ts` |
| The documentation corpus present on `main` is a **largely empty structure** | `documentation/agent-migration/agent-knowledge/` |
| Translation configuration: 7 language keys, mixed models, IDs to reconcile | `packages/shared/src/constants/languages.ts` |

> **Caveat**: the constants in `prompts.ts` are **not** an export of the editorial knowledge. The previous plan sometimes treated them as near-complete content: that is not the case. The knowledge must be recovered, verified and versioned (PR-11).

#### 3.1.1 v1 API surface vs letta-code correlation (TEC-63, 22/09/2026)

Correlation of every v1 endpoint used by playground against `letta-ai/letta-code`
(the reference consumer Letta keeps working). Endpoints unused by letta-code are
the ones at deprecation risk.

| v1 endpoint | Used by letta-code | Playground usage after TEC-63 |
|---|---|---|
| `conversations.messages.create` (streaming) | ✅ primary send path | ✅ all flows |
| `conversations.create` / `list` | ✅ | ✅ conversation bootstrap |
| `agents.list` / `retrieve` / `update` (incl. secrets) | ✅ | ✅ client factory, conversation lookup |
| `agents.tools.attach` | ✅ | ✅ registration scripts |
| `runs.usage.retrieve` | ❌ | **Removed** — usage now summed from `usage_statistics` stream chunks (same pattern as letta-code's accumulator) |
| `agents.messages.create` | ❌ | **Removed** — was only used by dead code (`sendMessage`) |
| `templates.agents.create` | ❌ | **Removed** — was only used by dead code (`runAgentOneShot`) |
| `tools.upsert` | ❌ | ⚠️ Still used by one-shot registration scripts (`scripts/register-metadata-validator-tool.ts` and similar). These are **runbook scripts, not runtime code** — they are re-run manually when a tool changes, and can be ported to whatever endpoint replaces `tools.upsert` at that moment. No runtime call path depends on it. |

> **Runbook note on `tools.upsert`**: if Letta removes the endpoint before the
> agent migration lands, the fix is confined to the registration scripts —
> consult the letta-code source for the current tool-registration path and port
> the script. Nothing in `packages/` calls `tools.upsert` at runtime.

### 3.2 Rollback risks already present in the code

These risks **pre-exist** the migration. They must be addressed before any cutover, otherwise the rollback will be ineffective.

**a) Metadata — erasure of human overrides**
A successful regeneration empties `editorial_records.metadata` to make the AI report the new baseline. Reverting to the old SDK **does not restore** those values.
*Reference: `packages/workflows/src/steps/ingestion/metadata-di-step.ts`.*

**b) Translations — direct overwrite**
Generation writes directly to `translation_records.markdown`, with no historization. A restorable version is required **before** cutover.
*Reference: `packages/workflows/src/steps/translation/generate-translation.ts`.*

**c) Reports — automatic selection**
A trigger selects the **latest complete reports** during an editorial backup. An SDK report that was discarded could therefore be reactivated later, during a backup unrelated to the incident.
*Reference: `supabase/migrations/20260119155552_add_letta_reports_workflow_id_and_trigger.sql`.*

**d) Cancellation**
Cancelling a Vercel workflow does not explicitly trigger shutdown on the Letta side. The absence of a shutdown confirmation is not proof of shutdown.

**e) External effects**
RI publication, translator assignment and Airtable sends are not compensated by an application rollback. A remote success followed by a local failure can lead to a duplicate if the operation is replayed.

**f) Metadata SSE route**
`apps/frontend/src/app/api/agents/metadata/stream/route.ts`:
- replaces the accumulated content with the **last chunk** (loss of the previous content);
- has no business authorization check in its handler, even though it uses the service key;
- can send `[DONE]` despite a failed persistence trigger.

This route must be **secured or removed** regardless of which SDK is chosen. This is a security fix in its own right.

### 3.3 Items to verify before planning firmly

| To verify | Why |
|---|---|
| Historical API shutdown date | **Confirmed as imminent, with no firm date** (Luis, 17/09/2026) — determines the length of the v1 bridge. See [§10](07-v1-removal-and-backup.md). |
| Agents actually used in production (IDs, languages, models) | ✅ **Resolved** — see [§3.5](03-production-agents-audit.md) |
| Schema actually deployed vs migrations | ✅ **Resolved on 22/09/2026** — see the live audit below. **Production matches `main`** (93/93 migrations). The deprecated staging project is out of scope (Luis, 22/09/2026). |
| Which AI flows are actually active in production | The fan-out is disabled in the code: to be confirmed on the operations side |
| Actual consumers of the SSE route | Decides between fixing and removing it |
| Authoritative sources for the editorial knowledge | The repository corpus is incomplete; local drafts are not authoritative — **actual state of the resources established in [§3.5](03-production-agents-audit.md)** |
| Vercel execution limits for 1- to 3-minute turns | Determines feasibility (`maxDuration`, regions, cold start) |

#### 3.3.1 Live production database audit — 22/09/2026

The Supabase MCP connection was used to inspect `playground-production` (eu-west-3) directly,
without changing the database. The audit covered relations, columns, constraints, indexes,
triggers, functions, RLS policies, Realtime publication membership, migration history and
aggregate record state.

**Production is at the tip of the migration chain: 93/93 migrations applied**, through
`20260821143000_derive_archived_at_in_workflows_enriched` — the deployed schema matches
`main`, including `activity_logs`, `notifications`, `workflows.assignee_id`,
`latest_ingestion_record_id`, `current_editor_id`, `archived_at` and
`ingestion_records.metadata_report_id`. All 13 tables have RLS enabled; Realtime publishes 6
tables (`workflows`, `ingestion_records`, `letta_reports`, `translation_records`,
`publication_records`, `notifications`). The repository schema snapshot
`packages/supabase/src/types.ts` is therefore faithful to the live target.

| Metric | Production |
|---|---|
| Ingestion records (all DI) | 21,852 |
| Workflows | 2,823 |
| `conversation_id` set | 152 |
| `assignee_id` set | 323 |
| `latest_ingestion_record_id` set | 2,823 (all) |
| Letta reports | 2,679 (2,310 complete, 369 error, 0 `generating`) |
| Editorial records (archived) | 361 (107) |
| Translation records | 133 |
| Publication events (distinct remote IDs) | 296 (171) |
| Activity logs / notifications | 1,279 / 413 |

The live data narrows several assumptions:

- conversation identity is the exception (152 of 2,823 workflows), so PR-06's legacy-row
  classification criterion applies at production scale;
- no report is stuck in `generating`;
- `vercel_workflow_id` and `vercel_hook_token` columns exist on `workflows`, but **no code ever
  writes to them** (only generated type files reference them) and **0 of 2,823 rows** are
  populated. They are dead space from an abandoned callback design — PR-06 should remove or
  repurpose them rather than build on them;
- the automatic `link_letta_reports_to_editorial_record()` trigger is deployed and selects the
  latest `complete` editorial and metadata reports by workflow on every editorial insert or
  update, confirming the rollback risk in §3.2-c;
- `publication_records` is local event history (296 events, 171 distinct remote IDs), not an
  authoritative copy of the karfur dispositif corpus — it cannot replace
  `search_ri_duplicate_dispositifs` as-is.

All 13 tables have RLS enabled, but the Supabase security advisor reports pre-existing findings
that any new persistence migration must not copy: `ingestion_runs` with RLS but no policy, 10
`SECURITY DEFINER` functions executable by `anon` / `authenticated` (including
`rls_auto_enable` and both `update_*_metadata_field` RPCs), mutable `search_path` on 3
functions, `pg_trgm` in `public`, leaked-password protection disabled.

**Planning consequence:** PR-06 can build on the generated types, but must run its RLS /
permissions tests against production (or a production-like clone), and the security-advisor
findings need remediation or explicit acceptance before new persistence tables are added.

**Out of scope:** the deprecated staging project (eu-west-2) is unmaintained, drifted 20
migrations behind `main`, and will be shut down (Luis, 22/09/2026). It is excluded from this
plan; its shutdown is a separate operational task with no migration consequence.

---

> **Update of 18/09/2026 — contributions of the official `letta-ai/agent-v1-to-v2-migration-guide`.** The plan below was revised on four structural points, detailed in **[§3.4](#s34)**:
> 1. **Some features** of the legacy surface **are already shut off in production** (not merely frozen);
> 2. there is **official tooling for backing up Cloud agents**, which turns resource preservation into a delegated operation rather than handcrafted work;
> 3. the v1 fallback path **can no longer host new agents**, which changes [§9-A](01-decision.md#s9);
> 4. a mandatory migration order emerges between transport and memory.

<a id="s34"></a>

### 3.4 What the official Letta guide changes in this plan

Source: <https://github.com/letta-ai/agent-v1-to-v2-migration-guide> (last commit `61693d0`, 14/09/2026), reviewed on 18/09/2026.

**a) Some legacy APIs are already disabled, not merely frozen.**
The guide explicitly documents that the `folders` endpoint returns **HTTP 400 since 17 July 2026** (`This API route is deprecated and no longer supported on the Letta API`).

✅ **Verified against our code**: no use of `folders` / `filesystem` / `files` / `exportFile` in `packages`, `apps` or `scripts`. **No impact on Playground.**
➡️ The Letta Cloud removal is therefore **incremental**, not a "big bang": some paths go down before others. [§10](07-v1-removal-and-backup.md) should aim for **continuous detection** of these cutovers, not a single date.

**b) Official Cloud agent backup tooling exists — and it is tested.**
The repository provides a `backing-up-cloud-agents` skill with a script (`cloud-agent.ts`) that exports an agent's settings, its context messages and **the full Git history of its memory** to a private folder, and can then **recreate a brand-new agent** from that backup.

- Export: `GET /v1/agents/{id}` + `GET /v1/messages/{id}` + authenticated Git access on `/v1/git/{agent-id}/state.git`.
- Restore: `POST /v1/agents` (allowlisted body, empty `initial_message_sequence`), then Git clone/push and `POST /v1/agents/{id}/recompile`.
- Documented safeguards: refuses to overwrite an existing folder, never `git push --force`, **no automatic retry** of a creation that may have succeeded, ID printed before any step that can fail.
- Coverage and exclusions spelled out (`references/format.md`): secrets, tools, connections, shared repositories, schedules, archival memory and **message history** are **not** restored.

️ **Consequence for [§10.4](07-v1-removal-and-backup.md#s104)**: backing up the resources is no longer handcrafted work to be designed; it is an **operation delegated to the official tool**, to be run before shutdown. A CI workflow (`cloud-agent-backup.yml`) and tests are provided, which makes it a maintainable artifact.

**c) The v1 fallback path can no longer host new agents.**
Restore **creates a new Cloud agent** — which is precisely the meaning of "v1 → v2". If the legacy routes shut down, **rollback cannot create a replacement v1 agent**.

➡️ **[§9-A](01-decision.md#s9) changes in nature.** "Sharing v1 agents or creating dedicated ones" is no longer an isolation trade-off: **creating an agent on the legacy path is a dead end**. SDK trials must therefore use recent agents, and v1 preservation must cover **existing agents** whose memory is backed up, not a capacity to recreate them.

**d) Mandatory order: transport first, memory second.**
The guide insists: the v1 API and the SDK write to **two different memory stores** (classic blocks on the v1 side, Git/MemFS on the SDK side). Converting legacy blocks into `system/<label>.md` files is a **separate** tool (the `migrating-v1-postgres-agents` skill), reserved for the old Python server and its local backend.

➡️ **The SDK therefore cannot read the memory of the legacy agents.** As long as the v1 transport remains active, it reads blocks; as soon as it switches to the SDK, it reads a Git repository. Migrating the transport before the knowledge has been **materialized** on the Git side would produce SDK agents **without instructions**, that is, silently degraded generations.

➡️ A sequencing consequence, consistent with [§10.2](07-v1-removal-and-backup.md#s102): in wave **V2**, PR-01 (knowledge materialization) **blocks** PR-09.

**e) The SDK moves fast — pin and revalidate.**
The guide's official example pins `@letta-ai/letta-agent-sdk@0.2.6`, while the npm registry published `0.8.11` on 16/09/2026 (and `0.8.3` on 01/09, the only version satisfying our maturity delay). The SDK APIs have therefore moved between the two. The revalidation of the selected version planned in PR-03 remains **mandatory**: the guide's snippets are indicative, not normative for our version.

**f) Operational precautions of the backup tool.**
According to its documentation, an export **is not a transaction**:

- the agent must be **paused** (stop turns, memory edits and scheduled activities) — the script detects changes between its reads but **cannot take an atomic snapshot**;
- the output folder must be **private and outside the repository**: messages and memory may contain secrets written by people or agents;
- the export reads only **the main chat** (`agent.message_ids`), not all conversations;
- a failed restore **can leave a partial agent behind**, never deleted automatically.

**g) A capability to acquire.**
The official skill is structured as `SKILL.md` + `references/` + `scripts/`, so it is directly installable and auditable. It should be integrated into wave **V1** rather than rewritten.

**h) Converting legacy resources to markdown is not covered by the official tools.**

This is the **most important limitation** of the guide for our case. The guide provides two migration paths, and neither addresses our situation:

| Official path | Source | Output | Does it apply to us? |
|---|---|---|---|
| `backing-up-cloud-agents` | Recent Cloud agent (**Git** memory) | Brand-new agent + intact Git memory | Partially: our v1 agents have **block** memory, not Git |
| `migrating-v1-postgres-agents` | **PostgreSQL** database of the retired Python server | Local backend + `system/<label>.md` files | No: we do not have access to that database |

The `migrating-v1-postgres-agents` skill **does contain the conversion logic we are missing** — blocks → `system/<label>.md` with a `description` frontmatter — but it **reads the PostgreSQL tables** of the legacy server directly. It accepts neither an intermediate file nor a JSON export as input.

**It does, however, confirm the target output standard**, which is valuable: a legacy block becomes a markdown file

```markdown
---
description: "<block description>"
---

<block value>
```

placed under `system/` (labels already prefixed with `system/` are preserved), and the whole forms a **Git repository with an import commit**. This is exactly the format an SDK agent expects in order to read its instructions.

#### Three possible acquisition paths

| Path | Principle | Advantages | Risks |
|---|---|---|---|
| **A — From the original documents** | Rebuild instructions and references from the editorial sources, outside Letta | Source of truth independent of the platform; no dependency on an end-of-life API; natural editorial review; no conversion code to maintain | **Requires verifying the gap** between the original document and what was actually injected into the agents. A silent gap would produce agents that are "compliant with the document" but different from production |
| **B — From an agent backup** | Export the agent's state, then convert blocks → markdown | **Faithful to what is actually running**; export tooling already provided; traceable | The blocks → markdown conversion **is not provided**: a small script to write (~50 lines, the target format is documented above). **To verify before relying on it**: the exact block structure returned by the export API, and whether a v1 agent's memory is accessible in Git |
| **C — Copy-paste from the ADE** | Manual reading in the Letta interface, retyping into files | Always works, independently of any API | Undetectable transcription errors; no diff possible; not repeatable; **loses traceability** |

> ✅ **Update of 18/09/2026**: path B is **already done** — the Git access from [§3.5](03-production-agents-audit.md) made it possible to export the entire agent memory. The choice now narrows to *unifying or keeping* the two existing formats.

> **Initial recommendation (kept for the record): A as the target, B as the immediate safety net.**
> Path A is the cleanest long-term, but it requires a **gap verification** that takes time — time that the imminence of the shutdown does not guarantee. Path B is fast and faithful. Combining them gives the best of both: **B to save now**, **A to rebuild properly later**, with a comparison between the two as a quality check.
> Path C should serve only as a **last resort**, if A and B both fail.

#### Recommended immediate action

Before deciding definitively, a **low-cost probe** on a single non-critical agent:

1. export the agent with the official tool;
2. inspect `agent.json`: are the memory blocks present and readable?
3. check whether the agent's memory is accessible in Git at `/v1/git/{agent-id}/state.git`;
4. if the blocks are usable, write the minimal conversion and **compare the result** with the expected editorial content.

The outcome of this probe determines the path for all agents, and **gates PR-01** ([§10.4](07-v1-removal-and-backup.md#s104)). It must be handled before any work on the transport ([§3.4-d](#s34)).

> ️ **Caveat on ordering.** This conversion feeds `PR-01`, which **blocks `PR-09`**. In other words: without converting the resources, the SDK adapter cannot produce properly instructed agents. The conversion is therefore not a side documentation task; it is a **technical prerequisite**.
