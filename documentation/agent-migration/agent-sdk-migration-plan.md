# Migration Plan v2 — Letta Cloud API v1 → Letta Agent SDK

**Repository:** `playground` (pnpm/Turborepo monorepo, editorial workflow platform for Refugies.info)
**From:** `@letta-ai/letta-client@1.10.2` (Letta Cloud API v1), pinned in `packages/agents/package.json:12`
**To:** `@letta-ai/letta-agent-sdk` (`LettaAgentClient`, session-based agent harness; docs: https://docs.letta.com/agent-sdk)
**Status:** v3 — supersedes v2. Incorporates Luis's PR review (cloud-only pivot, dashboard-defined agents, drop stateless/local inference) and three Codex P2 findings. v2 integrated three adversarial reviews (qwen3.8-max, k3, gpt-5.6-sol; dispositions in §M). Repo facts verified against commit `ae0df943` (branch `docs/agent-sdk-migration-plan`, 2026-08-19).

> **⚠ Binding-resolution changes (flagged per review policy; terms defined here, details in §D):**
> **C3 (conversation identity, §D.3) is AMENDED, not reversed.** The `letta_conversations` Supabase table (created in ticket MG-05) gains `gateway` + `agent_id` columns. "Gateway" identifies the runtime path (`v1` or `agent-sdk`) that produced the conversation, preventing v1 and SDK agents from sharing a row. The editorial dual-runtime decision moves from MG-21 to MG-05 (i.e. before MG-13). The C3 core default stands: persist IDs, purpose-keyed table, no historical backfill, name-lookup only as logged fallback, editorial `workflows.conversation_id` kept.
> **C1 (token usage, §D.1) and C2 (translator topology, §D.2) are unchanged** — review findings amended ticket mechanics (MG-06 ordering, MG-08 evidence) but demonstrated no factual error in the resolutions themselves.

---

## A. Current State

### A.1 Where the Letta dependency lives (machine-greppable)

Dependency declared in exactly one package: `packages/agents/package.json` — `"@letta-ai/letta-client": "1.10.2"`. Supply-chain allowlist entry: `pnpm-workspace.yaml:49` — `trustPolicyExclude: ["@letta-ai/letta-client"]` under `trustPolicy: no-downgrade`; `minimumReleaseAge: 10080` (7 days) at line 23. **Note (v3, Luis):** the pinned version (1.10.2) is old; whether to upgrade before the migration is a separate decision — the migration plan works regardless of the v1 patch version since it replaces the entire client surface.

`rg "@letta-ai/letta-client"` — 8 TypeScript files (verified):

| Layer | Files | Nature of usage |
|---|---|---|
| SDK wrapper package | `packages/agents/src/{clients,agents,ingestion,metadata,simplification}.ts` (5 files) | All client construction + API calls + type imports (`Letta`, `AssistantMessage`, `ConversationCreateParams`) |
| Workflow steps | `packages/workflows/src/steps/ingestion/{di-single-record-steps,audit-di-step,metadata-di-step}.ts` (3 files) | Import `APIError` from `@letta-ai/letta-client/error` — **without declaring the dependency** in `packages/workflows/package.json`; resolves only via pnpm hoisting. Latent defect to eliminate. |
| Frontend | `apps/frontend/src/app/api/agents/metadata/stream/route.ts` | Consumes wrappers only (SSE proxy) |
| Scripts | `scripts/{list-agents,create-local-agents,register-metadata-validator-tool,force-metadata-reports}.ts` | Client construction, agent/tool management. **v3: `list-agents`, `create-local-agents`, and `register-metadata-validator-tool` are removed (cloud-only, dashboard-defined agents, no local dev). `force-metadata-reports` migrates to the seam in MG-18.** |

### A.2 Client construction — and the `LETTA_BASE_URL` trap

`createLettaClient()` (`packages/agents/src/clients.ts:18-45`) is a dual-mode factory:

- **LOCAL mode** — triggered by `LETTA_BASE_URL` being set OR `LETTA_ENVIRONMENT=local`: `new Letta({ baseURL: baseURL ?? "http://localhost:8283", apiKey: LETTA_API_KEY ?? null })`. Backed by `docker-compose.letta.yml` (letta/letta:latest + Ollama `qwen2.5:0.5b` / `nomic-embed-text`), driven by root `letta:*` scripts (`package.json:45-50`). **v3 (Luis): removed — cloud exclusively.** The local docker/Ollama stack, `LETTA_BASE_URL`, and `LETTA_ENVIRONMENT` are all retired.
- **CLOUD mode** (default) — requires `LETTA_API_KEY` + `LETTA_PROJECT_ID` (throws if missing): `new Letta({ apiKey, projectID })` → `https://api.letta.com`. **The only mode retained.**

**Latent config trap (verified):** `.env.example:27` documents `LETTA_BASE_URL=https://api.letta.com` for cloud mode A/B. Setting `LETTA_BASE_URL` to the cloud URL still selects the "local" branch — an auth-less self-hosted config object pointed at the cloud host. It only works because `apiKey` is passed through in both branches. The migration's backend-selection replaces this heuristic. **v3: the heuristic is removed entirely (cloud-only), not just replaced.**

### A.3 API v1 surface in use (exhaustive)

| API v1 call | Where | Purpose |
|---|---|---|
| `client.agents.list()` | `agents.ts:listAgents` (via `scripts/list-agents.ts`) | Debug listing. **v3: script removed — agents visible on chat.letta.com.** |
| `client.agents.retrieve(agentId)` | `agents.ts:getAgent` | Exported; no in-repo caller |
| `client.agents.create({ name, model, embedding, include_base_tools })` | `scripts/create-local-agents.ts:75-80` | Local dev agents (`playground-local`, `metadata-local`); refuses cloud. **v3: script removed — no local dev agents.** |
| `client.agents.update(agentId, { secrets })` | `scripts/register-metadata-validator-tool.ts:38-40` | Sets `VALIDATE_METADATA_RI_URL` agent secret. **v3: script removed — validator becomes a skill (MG-09).** |
| `client.agents.messages.create(agentId, { messages })` | `agents.ts:sendMessage` | Non-streaming; `findLast(assistant_message)`; reads `response.usage` |
| `client.conversations.messages.create(convId, { messages })` | `agents.ts:sendMessageToConversation`, `ingestion.ts`, `simplification.ts`, `metadata.ts` | **The core call** — always streams; consumers filter `chunk.message_type === "assistant_message"` (token deltas; multi-step agents emit several — whole stream must be consumed or content silently truncates, documented in `simplification.ts:164-168`), accumulate string `content` **by concatenation** (`agents.ts:79`, `simplification.ts:182`, 5 workflow step sites, `force-metadata-reports.ts:358`), capture `chunk.run_id` |
| `client.conversations.list({ agent_id, limit: 100 })` | `agents.ts:findOrCreateConversation:101-131` | Name-based lookup matching `name \|\| label \|\| summary` via `as any` cast |
| `client.conversations.create({ agent_id, summary: name })` | `agents.ts:findOrCreateConversation`, `force-editorial-step.ts:92-95` | Create per-workflow conversations |
| `client.conversations.cancel(convId)` | `force-editorial-step.ts:116-132` | Pre-rewrite cancel; string-sniffs `"No active runs"` error detail |
| `client.runs.usage.retrieve(runId)` | `simplification.ts:getRunUsage:14-35` (cast `as any`) | Token usage → `LettaUsage { promptTokens, completionTokens, totalTokens }` → `letta_reports.token_cost` |
| `client.tools.upsert({ source_code, source_type: "python", pip_requirements, tags })` | `scripts/register-metadata-validator-tool.ts:115-123` | Registers `validate_metadata_ri` Python tool (HTTP-callback to `POST /api/tools/validate-metadata-ri`; `requests` + `pyyaml`). **v3: script removed — validator becomes a skill (MG-09).** |
| `client.agents.tools.attach(tool.id, { agent_id })` | `scripts/register-metadata-validator-tool.ts:128` | Attaches tool to agent. **v3: script removed.** |
| `client.templates.agents.create(templateId, { agent_name })` | `agents.ts:runAgentOneShot` | Unused by workflows — deletable |

**Existing validator contract (verified, corrects v1's MG-09):** `POST /api/tools/validate-metadata-ri` returns JSON only — valid: `{ valid: true, data: <Zod-sanitized object> }`; invalid: `{ valid: false, errors: [{ field, message }] }` (`apps/frontend/src/app/api/tools/validate-metadata-ri/route.ts:36-49`). It never serializes YAML.

Error typing: `import { APIError } from "@letta-ai/letta-client/error"` in the 3 workflow step files (8 call sites): 401/403 → `FatalError`; 429 → `RetryableError(retryAfter: "1m")`; other → `RetryableError` with `attempt² × 30s` backoff.

### A.4 Agent topology, prompts, frozen memory

Per `documentation/agent-migration/letta-cloud-inventory.md` (RI-1258):

- **6 production agents defined only in the Letta Cloud dashboard** (no IaC), living in default project `97c52a94-…` (not the `LETTA_PROJECT_ID` project `project-pZvdCSjhJ7Fgmi66gqgy`, which holds 0 agents + 30+ orphan blocks): "Agathe" multi-task agent (`PLAYGROUND_AGENT_ID`; `METADATA_AGENT_ID` as override — the Agathe agent also carries the literal `<REDACTED>` name bug) + **5 translation agents**. **v3 (Luis): agents stay dashboard-defined — no code provisioning via `createAgent()`.** The migration does not replace dashboard definitions with IaC; it replaces the v1 client surface and adds skills/corpus + shared memory. **v3 (Luis): `METADATA_AGENT_ID` — no separate metadata agent exists in Letta Cloud; metadata uses the same Agathe agent. This env var should be removed or documented as unused.** **Routing matrix (verified v2):** `packages/shared/src/constants/languages.ts:79-94` configures **7 language keys** (`ar/uk/ru/fa/ps/en/ti`) with hardcoded default agent IDs, but the verified inventory holds only 5 real translation agents — **`en` and `fa` have no dedicated agent** ("Les langues `en` et `fa` n'ont effectivement pas d'agent dédié"), and `ps`/`ti` are marked "non câblé par défaut". Additionally the code defaults **drift from the inventory-verified IDs** for `ar` (code `agent-9b1e38aa-…` vs inventory `agent-c19d4b57-…`) and `ti` (code `agent-f59e9249-…` vs inventory `agent-00b19760-…`). Mixed models: haiku-4-5 for ar/uk/ru, sonnet-4-6 for ps/ti. MG-08 must reconcile this matrix before any provisioning.
- **Personality lives in code, not the dashboard**: near-generic `base_instructions`; editorial logic injected per call as slash command in the first user message — `AUDIT/REDACTION/METADATA/TRANSLATE_SLASH_COMMAND` from `packages/agents/src/prompts.ts`, wrapped with the anti-injection `<document>` envelope (untrusted markdown stripped of literal `<document>` tags, then wrapped).
- **Frozen memory blocks** (`metadata_schema` ← `METADATA_SCHEMA_SPEC`; `compliance` ← `prompts/compliance.md`; `doublons` ← `prompts/duplicates.md`): Letta deprecated File-resource updates; frozen server-side, drifting from repo. `package.json:53` references `scripts/update-metadata-schema-block.ts` — **file absent** (stale entry). **v3 (Luis): replace with shared memory repositories + agent memory (MemFS). No need for Letta v1-style frozen memory blocks — the schema/compliance/duplicates content lives in agent or shared memory repos and stays in sync with the repo.**
- **External tool dependency**: `search_ri_duplicate_dispositifs` is a client to an ad-hoc karfur API — must be rewritten (RI-1276). **Verified v2:** the target "Supabase `dispositifs` table" does **not exist** — no migration, no generated type, no `.from("dispositifs")` call site; the actual corpus lives in **MongoDB** (`packages/mongo/src/dispositifs.ts:69`, collection `"dispositifs"`); the only trigram index is on ingestion metadata (`supabase/migrations/20260428110000_add_gin_trgm_index_ingestion_metadata_id.sql`). The inventory describes the Supabase table as a future approach only.
- **Migration corpus is an EMPTY scaffold (verified v2):** `documentation/agent-migration/agent-knowledge/skills/{audit,redaction,metadata,translate}/` contain no files; `skills/README.md` marks all four "vide"; `corpus.config.yaml:34` → `status: scaffold`; `CHANGELOG.md:11` → "scaffoldés (vides — remplissage dans PR-09/10/11/13)". `scripts/validate-corpus.ts` only validates files that exist and treats missing examples as warnings — it cannot catch an empty corpus.

### A.5 Orchestration patterns — and what is actually live today

1. **Conversation-per-workflow reuse** — `findOrCreateConversation(client, agentId, deterministicName)` with names `compliance-${workflowId}`, `metadata-${workflowId}`, `translation-${editorialRecordId}-${language}`; editorial instead persists `workflows.conversation_id` (migration `20260121120000_add_conversation_id_to_workflows.sql`), reads it back and resumes it directly (`force-editorial-step.ts:67-99`), validated by `CONV_ID_PATTERN` (UUID-v4 with `conv-` prefix, `force-editorial-step.ts:30`).
2. **VERIFIED — production fan-out is currently DISABLED.** In `packages/workflows/src/pipelines/ingestion/di-ingestion.ts`, the `fanOutDiRecordsStep` import (line 13) and invocation (lines 50-59) are **commented out** ("Skip Letta working"). The cron (`apps/frontend/src/app/api/cron/di-ingestion/route.ts` → `diIngestionWorkflow`) therefore runs structures/services/records ingestion with **zero Letta calls** today.
3. **Also dormant:** the legacy batch steps `generateDiAuditReportsStep` / `generateDiMetadataReportsStep` have no callers outside `steps/ingestion/*` (not wired into any pipeline). The fan-out children `diSingleAuditStep` / `diSingleMetadataStep` (in `di-single-record.ts`) are only spawned by the commented-out fan-out.
4. **Live Letta paths today:** forced arbitration (`pipelines/ingestion/force-arbitration.ts` → `forceAuditReportStep` + conditionally `forceMetadataReportStep`), forced metadata (`pipelines/ingestion/force-metadata-only.ts` → `forceMetadataReportStep`, UI-triggered via `triggerForceMetadataOnly` server action, `services/document-actions.ts:484`, with the `"generating"` sentinel row in `letta_reports` + Realtime `20260318120000_enable_realtime_letta_reports.sql` driving UI spinners), editorial rewrite (`force-editorial.ts` → `forceEditorialStep`, `/api/editorial-rewrite` + `[runId]` polling with `letta_reports` fallback), and translation (`pipelines/translation/generate-translation.ts` per language via `LANGUAGE_WORKFLOWS` registry).
5. **Response parsing pipeline** (`packages/agents/src/parser.ts`): gray-matter frontmatter extraction with repair (`ensureClosingFrontmatter`), Zod validation (`IngestionMetadataSchema`, `MetadataMetadataSchema`, `NoFrontmatterSchema`), enrichment with `LettaMetadata`, tri-state `status: complete | error | incomplete`. SDK-independent — ports unchanged.
6. **Streaming to browser:** `POST /api/agents/metadata/stream` proxies raw v1 chunks as SSE (`data: ${JSON.stringify(chunk)}`), terminates with `data: [DONE]`, then persists via `persistMetadataWorkflow`. **Verified v2 bug:** the route **overwrites** `finalAssistantContent = chunk.content` on each assistant chunk (`route.ts:143-168`) instead of concatenating — with token-delta chunks this persists only the last delta. MG-15 fixes persistence semantics; wire format is preserved separately.

### A.6 Frontend consumers (verified — corrects Companion A)

The SSE route `apps/frontend/src/app/api/agents/metadata/stream/route.ts` is the **only** frontend file matching `message_type`, and it has **no in-repo caller**: `rg "agents/metadata/stream"` across the repo matches only `documentation/agent-migration/letta-cloud-inventory.md`. The metadata UI components (`MetadataContext.tsx`, `MetadataRow.tsx`, `MetadataTable.tsx`, `DebugPanel.tsx`, `ActivityLogsView.tsx`) do **not** parse the v1 chunk shape — they exist but receive data via server actions (`triggerForceMetadataOnly`, `saveMetadataFieldAction`) and Supabase Realtime on `letta_reports` (`useEditorialRealtime.ts:97-101`). Consequence: the frontend SSE contract risk (R9) is lower than Companion A assessed, and the route itself is a candidate for explicit deprecation — but the wire format is still kept stable via the adapter until that decision is taken (MG-15).

### A.7 Scripts (v3: cloud-only — local dev removed)

`scripts/`: `list-agents.ts` (debug; `agents.list`) — **v3: removed (agents visible on chat.letta.com)**; `create-local-agents.ts` (local bootstrap, cloud-safe guard; `agents.create`) — **v3: removed (no local dev agents)**; `register-metadata-validator-tool.ts` (tool upsert/attach/secret) — **v3: removed (validator becomes a skill, MG-09)**; `force-metadata-reports.ts` (backfill, `--prod`/`--dry-run`/`--retry-failed`, concurrency 5, per-run names `forced-metadata-${workflowId}-${RUN_TIMESTAMP}`; uses `findOrCreateConversation` + stream consumption) — **migrates to the seam in MG-18**. Stale root entry: `update:metadata-schema` → absent file (RI-1278; note the inventory table lists RI-1278 twice — rows 22/23 — treat the stale-script reading as canonical for MG-18 and flag the duplicate to editorial). **v3: local stack (`docker-compose.letta.yml` + `letta:up|down|logs|pull|sync|init`) removed — cloud exclusively.**

### A.8 Environment variables (current)

| Variable | Used by | Notes |
|---|---|---|
| `LETTA_API_KEY` | `clients.ts`, scripts | Cloud auth; the only auth path retained (v3: cloud exclusively) |
| `LETTA_PROJECT_ID` | `clients.ts` | **No Agent SDK equivalent documented** (spike Q1) |
| `LETTA_BASE_URL` | `clients.ts` | **v3: removed** (cloud-only; was local-branch trigger — trap when set to cloud URL, §A.2) |
| `LETTA_ENVIRONMENT` | `clients.ts`, `create-local-agents.ts` | **v3: removed** (cloud-only; `"local"` selector no longer needed) |
| `PLAYGROUND_AGENT_ID` / `METADATA_AGENT_ID` | audit/editorial/metadata steps | Agathe; metadata falls back to playground. **v3 (Luis): `METADATA_AGENT_ID` — no separate metadata agent in Letta Cloud; remove or document as unused.** |
| `LETTA_AGENT_{AR,UK,RU,FA,PS,EN,TI}` | `languages.ts` | **7 configured keys → only 5 real agents** (§A.4); overrides over hardcoded defaults that drift from the inventory |
| `LETTA_MODEL_NAME` | `model.ts` | `letta_reports.model` default "Claude Sonnet 4.6" |
| `MAX_EDITORIAL_BACKLOG` / `MAX_AUDIT_CONCURRENCY` | workflow steps | Batch caps (default 50 / 5); `METADATA_CONCURRENCY = 5` |
| `LOCAL_LLM_MODEL` / `LOCAL_EMBEDDING_MODEL` | `create-local-agents.ts` | **v3: removed** (no local inference; was Ollama handles) |

Runtime floor: `.prototools` pins Node 24.13.1. **v3: local backend Node floor (≥ 22.19) no longer relevant — cloud exclusively. Vercel/CI image compatibility verified in spike Q6.**

---

## B. Target State — API Mapping

### B.1 Mental model

The Agent SDK wraps the **Letta agent harness** (Letta Code runtime), not the raw REST API. Durable object = **agent** (identity + git-backed MemFS memory); **conversation** = thread on the agent (`conv-xxx`, same prefix the repo already validates); **session** = live connection used to `send()` + `stream()` turns. Sessions are cheap; agents durable.

```ts
const client = new LettaAgentClient({ backend: "cloud", apiKey });
// v3: agents are dashboard-defined — no createAgent(). Use the existing agent ID.
await using session = client.resumeSession(agentId);   // or "conv-xxx"
await session.send(msg);
for await (const m of session.stream()) { /* typed SDKMessage */ }
```

### B.2 Mapping table (v1 → Agent SDK)

| Current (v1) | Agent SDK equivalent | Notes |
|---|---|---|
| `new Letta({ apiKey, projectID })` | `new LettaAgentClient({ backend: "cloud", apiKey })` | **No projectID** — token implies scope (Q1). **v3: cloud exclusively — no `backend: "local"` or `backend: "remote"` option.** |
| `new Letta({ baseURL, apiKey })` (docker) | **v3: removed** — no local backend | Cloud-only pivot; the `LETTA_BASE_URL` heuristic and docker/Ollama stack are retired |
| `client.agents.list/retrieve/update/delete` | Same management surface retained | **v3: `list-agents` script removed; management via chat.letta.com. `agents.retrieve` retained for session creation.** |
| Dashboard-defined agents | **v3 (Luis): stay dashboard-defined** — agents are NOT code-provisioned via `createAgent()`. The migration adds skills/corpus + shared memory, not IaC agent creation. | Ends frozen-memory drift via shared memory repos + agent MemFS, not via replacing dashboard definitions |
| Frozen memory blocks | **v3 (Luis): shared memory repositories + agent memory (MemFS)** — `client.repositories.*` + `agents.repositories.attach`, per-session `resources: [{ type: "repository", repositoryId }]`; or `memory` entries → MemFS `system/` files (in-context every turn) | No Letta v1-style frozen blocks; content stays in sync with the repo |
| `conversations.messages.create` + manual delta accumulation | `session.send()` + `session.stream()` — typed `SDKMessage` union: `init`, `reasoning`, `assistant`, `tool_call`, `tool_result`, `result`, `error`, `retry`, `queue_update`, `stream_event`, `loop_status` | Terminal `result` carries `success`, **full final text** (`result`), `stopReason`, `durationMs`, `runIds[]` — eliminates the truncation bug class. **Canonical content contract (v2, §B.5): legacy content chunks carry assistant deltas ONLY; terminal `result` maps to metadata-only completion — never a second content-bearing chunk** |
| `chunk.run_id` scraping | `runId` on stream messages + `result.runIds` | Mechanical via adapter |
| `runs.usage.retrieve(runId)` | **No documented equivalent** | C1 fallback chain (§D.1); `stream_event` "usage statistics" mentioned but shape undocumented (Q2). **v3 (Luis): investigate whether run IDs are fundamental or can be removed — they may be a v1 artifact not needed in the SDK model. Spike Q2 covers this.** |
| `findOrCreateConversation` (name scan) | `client.createSession(agentId)` → persist `session.conversationId`; `client.resumeSession("conv-xxx")` to reopen; `client.conversations.{create,list,retrieve,update,listMessages}` retained | Persisted IDs replace name-scanning (§D.3); list/create field shapes verified in Q3 |
| `conversations.cancel(convId)` | `session.abort()` | Turn-scoped, not conversation-scoped; behavior parity in Q7/MG-13 |
| 409-avoidance `"generating"` sentinel | Runtime queueing (`queue_update`, `removeQueuedMessage`) | Sentinel kept initially; re-evaluated in MG-12 |
| `tools.upsert` (Python/pip) + `agents.tools.attach` + `agents.update({secrets})` | **v3 (Luis): skill in agent or shared memory** — `validate_metadata_ri` becomes a skill (not a client tool); or `mcpServers`; or `baseTools` at creation | `validate_metadata_ri` becomes a skill; no Python, no HTTP callback, no secret, no register script |
| Slash commands as message prefixes | Still works (`send()` takes strings); idiomatic home = `persona`/memory/skills (`skillSources`, agent MemFS `skills/`, project `.agents/skills/`) | Keep in-message triggers for parity during migration |
| `APIError.status` classification | Stream `error` + failed `result.errorCode` (`llm_api_error`, `max_steps`, `interrupted`, `stream_closed`, `protocol_error`, approval codes); `CloudManagedSandboxExpiredError` → close → `resumeSession` → retry-once (pre-send only) | Mapper lives in `packages/agents` |
| `templates.agents.create` (`runAgentOneShot`) | **No templates API** — delete (unused) | — |
| — | New capabilities adopted: `createTranscriptAccumulator()`, `extractStreamTextDelta`, `bootstrapState()`, per-session `model`/`reasoningEffort` overrides, `permissionMode`/`canUseTool`, `sandbox: { ttlMinutes, readyTimeoutMs }`, `requestTimeoutMs` | Load-bearing where cited in tickets |
| — | ~~`stateless: true` sessions~~ | **v3 (Luis): removed — no need to reproduce stateless true.** Workers are stateful; the stateless mode, spike Q8, and risk R13 are all dropped. |

### B.3 Environment variable delta

| Today | After | Notes |
|---|---|---|
| `LETTA_API_KEY` | unchanged | **v3: the only auth path (cloud exclusively)** |
| `LETTA_PROJECT_ID` | **removed** | Pending Q1 confirmation |
| `LETTA_BASE_URL` | **removed** (v3: cloud-only, no backend selection needed) | Fixes the §A.2 trap |
| `LETTA_ENVIRONMENT` | **removed** (v3: cloud-only) | |
| `LETTA_MODEL_NAME` | kept | |
| `PLAYGROUND_AGENT_ID` | kept | Agathe agent |
| `METADATA_AGENT_ID` | **v3: removed** (no separate metadata agent in Letta Cloud) | Luis: "I don't see a separate metadata agent in Letta Cloud" |
| `LETTA_AGENT_{AR…TI}` (7 keys) | kept **per the MG-08 routing matrix** (7 configured keys reconciled against the 5 real agents; `en`/`fa` disposition explicit) **or** collapsed to `LETTA_TRANSLATOR_AGENT_ID` (1 agent) | Per MG-08 decision |
| `VALIDATE_METADATA_RI_URL` (agent secret) + `NEXT_PUBLIC_APP_URL` (register script) | **removed** | Skill needs neither |
| `MAX_EDITORIAL_BACKLOG`, `MAX_AUDIT_CONCURRENCY` | kept | Orchestration knobs, SDK-agnostic |
| `LOCAL_LLM_MODEL` / `LOCAL_EMBEDDING_MODEL` | **v3: removed** (no local inference) | |
| — (new) | `LETTA_GATEWAY=v1\|agent-sdk` global default `v1` **+ per-pipeline overrides** (`LETTA_GATEWAY_INGESTION`, `_EDITORIAL`, `_TRANSLATION`) — resolver implemented and tested in MG-04, not deferred to MG-19 (k3 #6) | Flag-gated dual-implementation, default `v1` |

### B.4 What disappears

`projectID` scoping; `runs.usage` (undocumented equivalent); `templates`; server-side Python `tools.upsert`; `agents.tools.attach`; agent `secrets` via `agents.update`; **v3: local dev stack** (`docker-compose.letta.yml`, Ollama, `LETTA_BASE_URL`/`LETTA_ENVIRONMENT`/`LOCAL_LLM_MODEL`/`LOCAL_EMBEDDING_MODEL`); **v3: `stateless: true` mode** (workers are stateful); **v3: scripts** `list-agents`, `create-local-agents`, `register-metadata-validator-tool` (removed, not migrated). Agents stay dashboard-defined — the migration does not replace dashboard definitions with code provisioning.

### B.5 Adapter seam (adopted naming — Companion B; canonical content contract added in v2)

All SDK access funnels through `packages/agents/src/agent-sdk/` (NEW). **Scope (v2, qwen #3): the seam serves workflow steps and the SSE route.** **v3: management scripts `list-agents`, `create-local-agents`, `register-metadata-validator-tool` are removed (not migrated). `force-metadata-reports` migrates in MG-18.**

- **`createAgentClient(options?)`** — client factory; today's v1 implementation first, `LettaAgentClient` second; **v3: cloud backend only** (no `backend: "local"` or `backend: "remote"`).
- **`createSession(workflowKind, agentIdOrConversationId, options?)`** — per-workflow session factory: dispatches `agent-…` → `resumeSession(agentId)`, `conv-…` → `resumeSession(convId)`; owns session close discipline (`await using`); applies the **per-workflow toolkit contract** — explicit `allowedTools` (client tools) + `permissionMode`, no unintended base tools; least privilege is fixture-tested (gpt #7).
- **`streamTurn(session, content)`** — async generator mapping typed `SDKMessage` events to the **legacy v1 chunk shape** (`{ message_type, content, run_id, timestamp }`). **Canonical content contract (v2):** `assistant` fragments → `assistant_message` delta chunks (**the only content-bearing events**); terminal `result` → metadata-only completion (run IDs, stop reason, usage when C1 branch 1) — it is **never** emitted as a content-bearing chunk. Emitting both deltas and full text would duplicate every answer, because all current consumers concatenate every `assistant_message` (§A.3).
- **`collectTurn(...)`** — shared accumulator for non-streaming consumers: consumes the stream, returns `{ content, runIds, usage }` where `content` comes from the terminal `result.result` exactly once. Regression fixture: fragments `"foo"`, `"bar"` + terminal result `"foobar"` → final content is exactly `"foobar"`, never `"foobarfoobar"`.
- **`resolveConversation(store, purposeKey, agentId)`** — ID-first resolution via the `ConversationStore` port keyed by `(purpose_key, gateway, agent_id)` — all three columns (v3, Codex P2: after agent rotation, both old and new rows can exist for the same `(purpose_key, gateway)`; keying on `agent_id` prevents resuming a conversation belonging to the old agent). Name-lookup only as logged fallback on first touch (v1 only).
- **`mapLettaError(error)` → `FatalError | RetryableError`** — the single error-taxonomy mapper (relocates the 3 workflow files' `APIError` logic).

**`ConversationStore` port (v2, gpt #4):** interface only in `packages/agents` (which has no Supabase dependency and must not gain one — verified `packages/agents/package.json`); the Supabase-backed implementation lives with the existing service-role client in `packages/workflows` / `@playground/supabase`.

**Concrete adapter example (modeled on the SSE adapter pattern):** the `streamTurn` generator and its SSE-route consumer, showing how typed SDK events map to the legacy wire format under the canonical content contract:

```typescript
// packages/agents/src/agent-sdk/streaming.ts
async function* streamTurn(session: Session, content: string): AsyncGenerator<LegacyChunk> {
  for await (const msg of session.stream(content)) {
    switch (msg.type) {
      case "assistant":
        // Canonical content contract: assistant deltas are the ONLY content-bearing events
        yield {
          message_type: "assistant_message",
          content: msg.content,        // delta fragment, not full text
          run_id: msg.runId,
          timestamp: new Date().toISOString(),
        };
        break;
      case "result":
        // Terminal result: metadata-only completion — never a content-bearing chunk
        yield {
          message_type: "run_completed",
          content: "",                 // empty — consumers must NOT concatenate this
          run_id: msg.runIds[0],
          timestamp: new Date().toISOString(),
        };
        break;
      case "error":
        yield {
          message_type: "error",
          content: JSON.stringify({ type: "error", error: msg.error }),
          run_id: msg.runId,
          timestamp: new Date().toISOString(),
        };
        break;
      // reasoning, tool_call, tool_result, etc. mapped as needed
    }
  }
}

// apps/frontend/src/app/api/agents/metadata/stream/route.ts (SSE consumer)
// v3 (Codex P2): stream progressively — forward SSE frames during the streamTurn
// loop AND accumulate for persistence. Do NOT delegate to collectTurn alone,
// which would consume the stream and leave nothing to forward.
let accumulated = "";
let runId: string | undefined;
let usage: LettaUsage | undefined;
for await (const chunk of streamTurn(session, userMessage)) {
  if (chunk.message_type === "assistant_message") {
    accumulated += chunk.content;
  }
  if (chunk.message_type === "run_completed") {
    runId = chunk.run_id;
  }
  // Forward each chunk to the SSE response immediately (progressive streaming)
  res.write(`data: ${JSON.stringify(chunk)}\n\n`);
}
res.write("data: [DONE]\n\n");
// Persistence fix: the accumulator is the SOLE persistence source —
// the v1 route overwrote finalAssistantContent per chunk (route.ts:143-168),
// persisting only the last delta.
await persistReport({
  raw_response: accumulated,           // complete accumulated response
  markdown: accumulated,
  run_id: runId,
  token_cost: usage?.totalTokens ?? null, // C1 branch-dependent (§D.1)
});
```

---

## C. Risk Register (canonical)

Severity / affected files / mitigation / rollback (one per risk) / owning ticket. Files-affected matrix in §C.2.

| ID | Risk | Severity | Affected files | Mitigation | Rollback | Ticket |
|---|---|---|---|---|---|---|
| R1 | **Token-usage accounting gap** — `token_cost` fed by `runs.usage.retrieve`; no documented SDK equivalent | High | `simplification.ts:14-35`, `letta_reports.token_cost`, `pipelines/editorial/persist-*.ts`, activity-logs UI | C1 ordered fallback chain (§D.1), branch selected in spike Q2, implemented once in `streamTurn` plumbing | Flip `LETTA_GATEWAY` back to `v1`; `runs.usage.retrieve` resumes working immediately | MG-01, MG-06 |
| R2 | **Stream event shape change** — every consumer filters `message_type` and accumulates deltas (12+ sites) | High | `agents.ts` (2×), `ingestion.ts`, `metadata.ts`, `simplification.ts` (2×), 5 workflow step files, SSE route, `force-metadata-reports.ts` | Single `streamTurn` adapter (§B.5) maps typed events → legacy chunk shape under the **canonical content contract** (deltas-only content; `result` = metadata); shared `collectTurn` accumulator with exact-once fixture | Flip `LETTA_GATEWAY` back to `v1`; adapter bypassed, original chunk parsing restored | MG-03, MG-04, MG-15 |
| R3 | **Error taxonomy rewrite** — `APIError.status` branches (401/403/429) become `errorCode`/transport errors; 429 signal source unknown | Medium | `di-single-record-steps.ts`, `audit-di-step.ts`, `metadata-di-step.ts` (8 call sites) | One `mapLettaError` → `FatalError`/`RetryableError` mapper in `packages/agents`, fixture-tested; external retry contracts unchanged | Flip `LETTA_GATEWAY` back to `v1`; `APIError` import restored, original classification logic resumes | MG-03, MG-04 |
| R4 | **Conversation lifecycle** — `conversations.cancel` + `"No active runs"` sniffing; conversation create inline | Medium | `force-editorial-step.ts:92-132` | `session.abort()` via the seam; keep `CONV_ID_PATTERN` (same `conv-` format — fixtures verified in Q7) | Flip `LETTA_GATEWAY_EDITORIAL` back to `v1`; `conversations.cancel` + string sniffing restored | MG-13 |
| R5 | **Agent identity change** — new agents → new IDs; 7 configured language keys vs 5 real agents; code defaults drift from inventory (`ar`, `ti`); `<REDACTED>` name bug | High | `packages/shared/src/constants/languages.ts:79-`, env config | Idempotent provisioning script prints env block; hardcoded fallback IDs removed; **MG-08 routing matrix reconciles 7 keys ↔ 5 agents (en/fa disposition explicit) before provisioning** | Keep v1 agent IDs in env (provisioning script prints both); flip gateway back to `v1` | MG-07, MG-08 |
| R6 | **Node/runtime floor** — Vercel/CI images unverified for SDK host process | Low | `.prototools` (24.13.1 ✓), Vercel Functions/Workflows images, CI | Verify floors in spike Q6; cloud backend on current Node | **v3: local Node floor removed (cloud-only). Vercel/CI verification remains.** | MG-01 |
| R7 | **Duplicate-search data source does not exist** — karfur HTTP client dies; the assumed Supabase `dispositifs` table is absent (data lives in Mongo; no vector/semantic index anywhere) | High (raised in v2) | new client tool; audit skill; RI-1276; future `supabase/` migrations | **MG-10a decides + implements the authoritative source (Mongo query vs Supabase mirror with sync/freshness/indexing)** incl. search spec (fields, normalization, candidate generation, whether "semantic" is required, labeled set ≥ 30, numeric precision/recall thresholds); MG-10b implements the client tool against it | Disable the `search_ri_duplicate_dispositifs` tool on the session (remove from `allowedTools`); audit runs without duplicate detection | MG-10a, MG-10b |
| R8 | **Long-running steps / reconnection** — 1-3 min turns over WebSocket; closed sessions unreusable; **no event replay** | Medium | `force-editorial-step.ts`, all steps holding sessions | Per-step open→use→close discipline; documented mid-turn drop recipe: `resumeSession(convId)` + `listMessages()` reconcile (validated in spike Q7) | Flip gateway back to `v1`; stateless REST calls have no WebSocket reconnection risk | MG-01, MG-04, MG-13 |
| R9 | **Frontend SSE contract** — *corrected vs Companion A:* route has no in-repo frontend caller (§A.6); wire format kept for external consumers | Low | `apps/frontend/src/app/api/agents/metadata/stream/route.ts` | Server-side legacy-shape mapper (§B.5) + explicit keep/deprecate decision recorded | Flip gateway back to `v1`; raw v1 chunks resume, no mapper needed | MG-15 |
| ~~R10~~ | ~~**Local dev topology**~~ | ~~Removed~~ | **v3 (Luis): removed — cloud exclusively. No local dev stack, no docker/Ollama, no local inference.** Scripts `create-local-agents.ts` and `docker-compose.letta.yml` are deleted, not migrated. | — | — |
| R11 | **Supply-chain gating** — `minimumReleaseAge: 10080` delays first install; `trustPolicyExclude` needed for the new package; bundle-size impact | Low | `pnpm-workspace.yaml`, `knip.json`, lockfile | Schedule dependency PR ≥ 7 days post-release; mirror `trustPolicyExclude` treatment; knip + cve-lite gates in MG-02 | Remove the new package from `package.json`; `pnpm install` restores the lockfile | MG-02 |
| R12 | **Rollback safety** — dual implementations must coexist; a regression in one pipeline must not block others | Low-Med | all dual-implementation paths | Global + per-pipeline `LETTA_GATEWAY` resolver **implemented and tested in MG-04**; each port wires its own override; rollback drill executed in MG-19 | Per-pipeline flag flip (resolver shipped in MG-04); drill executed in staging before production flip | MG-04, MG-19 |
| ~~R13~~ | ~~**Stateless sessions would suppress agent knowledge**~~ | ~~Removed~~ | **v3 (Luis): removed — no need to reproduce stateless true. Workers are stateful; the stateless mode, spike Q8, and this risk are all dropped.** | — | — |

### C.2 Breaking-changes / files-affected matrix

| Breakage | Files affected | Replacement | Required action |
|---|---|---|---|
| `Letta` class + `createLettaClient` signature | `clients.ts` + every consumer (9 files) | `createAgentClient()` with backend selection | Rewrite `createLettaClient()` to return `LettaAgentClient`; remove `LETTA_PROJECT_ID` requirements |
| Chunk-shape contract (`message_type`, `content`, `run_id`) | `agents.ts`, `ingestion.ts`, `metadata.ts`, `simplification.ts`, SSE route, 5 workflow step files, `force-metadata-reports.ts` | `streamTurn` typed-event adapter under the canonical content contract + `collectTurn` (or `createTranscriptAccumulator`) | Replace `message_type` checks with `type` checks; add `switch(msg.type)` handlers in all consumers |
| `APIError` import + instanceof checks | 3 workflow files (8 call sites) — all via undeclared transitive dep | `mapLettaError` taxonomy mapper in `packages/agents` | Replace `APIError` instanceof checks with `mapLettaError()` calls in 3 workflow files |
| `getRunUsage` | `simplification.ts` + 5 call sites | C1 chain (§D.1) | Replace `getRunUsage()` with C1 branch implementation in `streamTurn` plumbing |
| `findOrCreateConversation` name matching (`as any`) | `agents.ts` + 6 call sites | Persisted conversation IDs, gateway/agent-namespaced (§D.3) | Replace `findOrCreateConversation()` with `resolveConversation()` via `ConversationStore` port |
| `conversations.cancel` + string sniffing | `force-editorial-step.ts` | `session.abort()` | Replace `conversations.cancel()` + string sniffing with `session.abort()` in `force-editorial-step.ts` |
| `tools.upsert` / `agents.tools.attach` / `secrets` | `register-metadata-validator-tool.ts` (DELETED) | **v3: skill in agent or shared memory** (Luis: "transformed to a skill"). Delete `register-metadata-validator-tool.ts` and HTTP route; migrate validator logic to a skill |
| `templates.agents.create` | `agents.ts:runAgentOneShot` (unused) | Delete | Remove `runAgentOneShot` and `templates.agents.create` import (unused, no SDK equivalent) |
| `LETTA_PROJECT_ID` / `LETTA_BASE_URL` / `LETTA_ENVIRONMENT` | env files, `clients.ts`, docs | **v3: cloud-only — all three removed** | Remove from env and code; no `backend` parameter needed (cloud exclusively) |
| Hardcoded translation agent IDs (7 keys, drifting) | `languages.ts` defaults | **v3: dashboard-defined agents** — reconcile IDs per MG-08 routing matrix; no code provisioning | Replace hardcoded `LETTA_AGENTS_CONFIG` defaults with verified dashboard IDs per MG-08 |
| Local dev stack | `docker-compose.letta.yml`, `letta:*` scripts, `create-local-agents.ts` | **v3: removed (cloud-only)** | Delete `docker-compose.letta.yml`, `create-local-agents.ts`, `letta:*` scripts; remove local-dev docs |
| SSE wire format | `metadata/stream/route.ts` | Legacy-shape mapper (semantic contract test); persistence via accumulator — fixes the last-delta overwrite bug; deprecation decision (MG-15) | Rewrite SSE route to use `streamTurn()`; replace per-chunk overwrite with accumulator-based persistence |

---

## D. Resolved Conflicts (binding; C3 amended in v2 — see top-of-plan flag)

### D.1 C1 — Token usage accounting (unchanged)

No parallel options in tickets. Spike Q2 decides; the ordered fallback chain is:

1. **Read usage from `stream_event`** if observable (dump full event stream; inspect for token/usage fields).
2. **Else** keep `@letta-ai/letta-client` installed solely for `runs.usage.retrieve` in a narrow usage-only module inside `packages/agents` during dual-implementation; removed at cutover.
3. **Else** `token_cost` goes NULL behind the flag, with a documented follow-up issue.

Per-branch ticket impact:

| Branch | MG-06 implements | MG-21 (removal) | Other tickets |
|---|---|---|---|
| 1 | Usage extraction in `streamTurn` from `stream_event` payloads | Unchanged — dependency fully removed | none |
| 2 | `usageClient` (v1, usage-only) called by the agent-sdk gateway | Scope grows: delete `usageClient` module + dependency at cutover | none |
| 3 | NULL degradation + follow-up doc; UI renders "n/a" | Unchanged | MG-22 documents the follow-up issue |

`LettaUsage` remains the stable contract everywhere; `persistMetadataWorkflow` / `persistEditorialWorkflow` plumbing unchanged in all branches. **Branch-specific acceptance (v2, qwen #4):** branches 1/2 must populate and validate token counts; branch 3 must assert NULL for all SDK rows, render "n/a", and link a concrete follow-up issue — "populates token_cost per the decision" is never a blanket criterion.

### D.2 C2 — Translator topology (RI-1268) (resolution unchanged; decision evidence hardened in v2)

Decided by **MG-08**, an explicit decision ticket (Companion D's decision-ticket pattern), before any translator provisioning or porting lands. **Routing matrix is a required input (v2, qwen #5/gpt #9/k3 #10):** the verified inventory table maps the **7 configured language keys** to the **5 real agents**, making explicit what happens for `en`/`fa` (no dedicated agent today — skip, alias, or newly provision) and reconciling the `ar`/`ti` ID drift between `languages.ts` defaults and the inventory. Options are defined **by that table**, not by a count:

- **Option A — one multilingual agent** + `translate` skill taking the target language as a parameter.
- **Option B — per-language agents per the routing matrix** (current shape; mixed models haiku ar/uk/ru vs sonnet ps/ti).

**Decision evidence precedes the decision (v2, k3 #10):** baselines for **all five current production languages** (ar/uk/ru/ps/ti) — golden samples + editorial sign-off for ar/uk/ru at minimum, automated schema/non-empty checks for ps/ti — before Option A is chosen. Criteria: cost (sandbox/session profile; model mix — per-session `model` override needed to preserve the mix under Option A, and the tier comparison must be part of the evidence), quality parity per language, env-var surface (1 var vs 7 keys), ops overhead (provisioning idempotency, drift). **Recommendation: Option A** — per-language personas today are near-identical (translation logic already lives in repo prompt constants), env surface shrinks, provisioning simplifies; quality parity is the gate. **Decision deadline:** before MG-07 translator provisioning (Wave 3.2); hard stop before MG-14 (Wave 4.4). No other ticket bakes in either option.

### D.3 C3 — Conversation identity (AMENDED in v2 — core default kept)

**Default (followed):** persist conversation IDs per (workflow, phase) in Supabase via a purpose-keyed table `letta_conversations`, **namespaced by runtime (v2, k3 #4):** columns `(purpose_key, gateway, agent_id, conversation_id, created_at, updated_at)` with `UNIQUE (purpose_key, gateway, agent_id)` — `purpose_key` = `audit:{workflowId}`, `metadata:{workflowId}`, `translation:{editorialRecordId}:{lang}`, `editorial:{workflowId}`. ID-first resolution in the seam (via the `ConversationStore` port, §B.5); name-lookup retained **only as a logged fallback during migration, v1 gateway only** (first touch resolves by name once, stores the ID). No historical backfill (unchanged).

**Why namespacing (amendment):** during dual-implementation, the v1 and Agent SDK paths use *different provisioned agents*; a single `(purpose_key → conversation_id)` row would hand a v1-created conversation to the SDK agent (or vice versa). Distinct rows per `(gateway, agent_id)` keep the runtimes isolated and rollback-safe; the SDK path creates fresh conversations on first touch and never overwrites the v1 ID.

**Editorial (timing amendment):** `workflows.conversation_id` remains the **v1-authoritative** column, untouched; the Agent SDK editorial conversations get rows in `letta_conversations` under `editorial:{workflowId}` + `gateway='agent-sdk'` (the repo reads/resumes the column directly — `force-editorial-step.ts:67-99` — so the column cannot be silently repointed). The keep/null disposition of the legacy column at cleanup is **decided and recorded in MG-05, before MG-13 starts** (v2: moved from MG-21); MG-21 only executes the recorded decision.

Reasoning against the repo (unchanged where it stood): a columns-only approach cannot key translation conversations (record × language, not workflow), so the table is the uniform answer; the repo already demonstrates the persist-ID pattern editorially; a single migration is routine here (30+ existing); and with fan-out disabled (§A.5), audit/metadata resolution is exercised only through the forced paths, so the change lands with minimal live surface. Companion B's opportunistic backfill alternative remains subsumed: no historical migration; first touch resolves and persists.

---

## E. Phase 0 — Spike Gate (MG-01)

Throwaway scratch workspace against the cloud org (read-only where possible). Every question gets a concrete verification method and a go/no-go artifact in `documentation/agent-migration/agent-sdk-spike.md` (NEW).

| Q | Question | Verification method | Go/no-go artifact |
|---|---|---|---|
| Q1 | Project scoping: where do `createAgent()` agents land; is `LETTA_PROJECT_ID` obsolete? | Scratch client with org key; `createAgent` a disposable agent; compare `agents.list()` output vs dashboard projects | Recorded answer + `LETTA_PROJECT_ID` disposition |
| Q2 | Token usage observable? (C1 branch) | Run one full turn; dump **every** stream event including `stream_event` payloads; grep for usage/token fields; inspect SDK types | Event dump + selected C1 branch (§D.1 table) |
| Q3 | `client.conversations.list/create` parameters and matchable fields (name vs summary) | Exercise list/create against a test agent; inspect response fields | Field table + resolver design note (feeds §D.3 fallback) |
| Q4 | How do 429s surface (event? errorCode? thrown)? | Burst 10 concurrent sends on one agent; observe `error`/`retry`/`result.errorCode` | Mapping table → `RetryableError(retryAfter)` |
| Q5 | Managed-sandbox overhead for text-only agents (`baseTools: []`); tuning (`sandbox: { ttlMinutes, readyTimeoutMs }`) | Time 20 session creations with/without sandbox options | Latency numbers + sandbox strategy go/no-go |
| Q6 | Vercel Functions/Workflows runtime + bundle compatibility; `requestTimeoutMs` fit for 1-3 min turns | Deploy a spike route importing the SDK; measure bundle; run a long turn | Compatibility notes + config values; Node floor vs `.prototools` |
| Q7 | Reconnection: mid-turn WebSocket drop + `resumeSession` recovery; confirm **no event replay** | Workflow-step-like harness; kill the socket mid-turn; `resumeSession(convId)`; reconcile via `listMessages()`; verify `CONV_ID_PATTERN` still matches issued IDs | Recovery recipe + committed test (feeds MG-04/MG-13) |

**Gate (v2, narrowed per k3 #5; v3: Q8 removed):** no **Agent-SDK-dependent** implementation ticket starts until the spike doc is merged with a go decision and the C1 branch selected. Two tickets are explicitly **pre-gate**: MG-03 (v1-only refactoring — no SDK import) and MG-10a (data-source decision/implementation — no SDK dependency). MG-05 additionally requires MG-01 because its resolver design consumes Q3/Q7 outputs. **v3: spike Q8 (stateless knowledge loading) is removed — workers are stateful, no stateless investigation needed.**

---

## F. Wave Overview

| Wave | Theme | Tickets |
|---|---|---|
| 0.x | Spike gate + dependency/supply chain | MG-01, MG-02 |
| 1.x | Adapter seam (v1 behind interface) + agent-sdk implementation behind flag | MG-03 (pre-gate), MG-04 |
| 2.x | Data/config hardening: conversation store, usage accounting | MG-05, MG-06 |
| 3.x | Translator decision, agents & tools as code | MG-08 (3.1), MG-07 (3.2), MG-09, MG-10a (pre-gate-eligible), MG-10b |
| 4.x | Parity harness (pre-port) then workflow ports behind flag | MG-16a (4.0), MG-11…MG-15 |
| 5.x | Verification: parity report, paired load test, ops scripts cleanup | MG-16b, MG-17, MG-18 |
| 6.x | Cutover: flag-gated soak, progressive flip, fan-out decision, removal, docs | MG-19…MG-22 |

Wave-order change vs v1 (qwen #6): the translator decision MG-08 is now Wave 3.1 and provisioning MG-07 is Wave 3.2, matching the actual dependency (MG-07 needs MG-08's routing matrix for translator provisioning).

---

## G. Tickets

Format: ID / wave / title / description / acceptance criteria (mechanically checkable) / depends-on / provenance. NEW/DELETED markers on file references. Existing Linear issues cited with French titles verbatim — **only RI-1258…RI-1284 are verified real Linear issues; report-draft labels (`D-draft-NN`) replace Companion D's placeholder RI-13xx numbers, which that report itself declares as placeholders (gpt #6).**

### MG-01 — Wave 0.1 — Phase 0 spike gate
**Description:** Stand up `@letta-ai/letta-agent-sdk` in a scratch workspace; answer Q1-Q7 per §E; capture a full `stream()` event log for one `/audit`-shaped turn against the cloud backend; record go/no-go per question and the selected C1 branch.
**Acceptance criteria:**
- [ ] `documentation/agent-migration/agent-sdk-spike.md` (NEW) answers Q1-Q7 with code evidence + event log.
- [ ] Spike script demonstrating send → stream → terminal `result` runs against the cloud backend (committed under `documentation/agent-migration/spike/`, NEW).
- [ ] Go/no-go recorded per question; C1 branch selected and written into §D.1 terms.
**Depends-on:** — **Provenance:** BASE#1, A MIG-01 (Q1-Q6), C spike#1-3 + R8 (Q7), D-draft-06.

### MG-02 — Wave 0.2 — Add SDK dependency + supply-chain config
**Description:** Add `@letta-ai/letta-agent-sdk` to `packages/agents/package.json` alongside `letta-client` (not removed until MG-21). Add the `trustPolicyExclude` entry mirroring the letta-client treatment in `pnpm-workspace.yaml`. Respect `minimumReleaseAge: 10080` — schedule the PR ≥ 7 days after the package's release. Dependency-only change.
**Acceptance criteria:**
- [ ] Both packages present in `pnpm-lock.yaml`; `import { LettaAgentClient }` type-checks in `packages/agents`.
- [ ] `pnpm install && pnpm check:types && pnpm lint && pnpm knip && pnpm security:scan:js` green with zero runtime code changes (diff shows only manifest/lockfile/workspace-yaml).
**Depends-on:** MG-01 **Provenance:** B LEGACY-2, A MIG-02/R11.

### MG-03 — Wave 1.1 — Adapter seam with v1 implementation (pre-gate; scope narrowed in v2)
**Description:** Introduce `packages/agents/src/agent-sdk/{client,session,streaming,error,conversation}.ts` (NEW) implementing the §B.5 seam — `createAgentClient()` / `createSession()` / `streamTurn()` / `collectTurn()` / `resolveConversation()` / `mapLettaError()` — with the **current v1 client as the only implementation**. Move all `APIError` import/classification logic out of the 3 workflow step files into `mapLettaError`. **Scope (v2, qwen #3): workflow steps and the SSE route switch to the seam.** **v3: management scripts `list-agents`, `create-local-agents`, `register-metadata-validator-tool` are removed (not migrated). `force-metadata-reports` migrates in MG-18.** No behavior change; v1 remains the only runtime.
**Acceptance criteria:**
- [ ] `rg "@letta-ai/letta-client" packages/workflows apps/frontend` → 0 matches (scripts excluded by design; each script's migration is acceptance-checked in its owning ticket).
- [ ] `streamTurn` v1 implementation unit-tested against recorded v1 chunk fixtures (multi-fragment accumulation, `run_id` capture, error propagation); `collectTurn` exact-once fixture green.
- [ ] `pnpm check:types && pnpm lint && pnpm test` green; production behavior unchanged (v1 default).
**Depends-on:** — (pre-gate; parallel-safe with MG-01/02) **Provenance:** BASE#2, B LEGACY-3/4 (naming), A MIG-03.

### MG-04 — Wave 1.2 — Agent SDK adapter behind flag
**Description:** Second seam implementation on `LettaAgentClient`: factory with **v3: cloud backend only** (cloud `apiKey`; no local/remote backend selection); `createSession` dispatch (`agent-…` vs `conv-…`) with the per-workflow toolkit contract (explicit `allowedTools`, `permissionMode`, no unintended base tools); `streamTurn` mapping typed `SDKMessage` → legacy chunk shape under the **canonical content contract** (assistant fragments → `assistant_message` deltas, the only content-bearing events; terminal `result` → metadata-only completion: runIds, stopReason, usage when C1 branch 1); `collectTurn` accumulator with `result.result` as exact-once authoritative content; `mapLettaError` (errorCode → Fatal/Retryable) incl. `CloudManagedSandboxExpiredError` close→resume→retry-once (pre-send only) and the Q7 reconnection recipe; `abort()`; `await using` close discipline. **Gateway resolver (v2, k3 #6):** `LETTA_GATEWAY=v1|agent-sdk` global default `v1` **plus per-pipeline overrides** (`LETTA_GATEWAY_INGESTION`, `_EDITORIAL`, `_TRANSLATION`) implemented and unit-tested here — not deferred to MG-19, because MG-11-14 acceptance criteria already rely on per-pipeline rollback.
**Acceptance criteria:**
- [ ] Unit tests replay recorded SDK event fixtures (multi-fragment, tool-interleaved, failed `result`, mid-turn drop) and assert outputs identical to v1 fixtures (content, runIds, error classes). **Duplication fixture:** deltas `"foo"`,`"bar"` + terminal `result` `"foobar"` → emitted content is exactly `"foobar"` once; terminal event carries no content payload.
- [ ] Gateway resolver unit tests: global default, per-pipeline override precedence, unknown values fall back to global with a logged warning. All three override vars documented in `.env.example`; default `v1` in staging and prod.
- [ ] Toolkit least-privilege test: each workflow kind's session exposes exactly its declared tools.
- [ ] Integration test vs cloud backend completes an `/audit`-shaped turn end-to-end; zero leaked sessions (close instrumentation).
**Depends-on:** MG-01, MG-02, MG-03 **Provenance:** BASE#4, B Phase 1, C Phase 2, A MIG-05/MIG-08, D-draft-15/16 (per-session toolkit).

### MG-05 — Wave 2.1 — Conversation store: gateway-namespaced IDs; retire name lookup
**Description:** Per §D.3 (amended): Supabase migration creating `letta_conversations` with `(purpose_key, gateway, agent_id, conversation_id, timestamps)` and `UNIQUE (purpose_key, gateway, agent_id)`; `ConversationStore` port declared in the seam, **Supabase-backed implementation in `packages/workflows` beside the existing service-role client** (`packages/agents` stays transport-only — it has no Supabase dependency today and does not gain one; v2, gpt #4); ID-first resolution in the seam's resolver keyed by `(purpose_key, gateway, agent_id)` — all three columns (v3, Codex P2); name-lookup only as logged fallback on first touch (v1 gateway only). **Editorial dual-runtime decision executed here (v2, moved from MG-21 per k3 #4):** SDK editorial conversations get `letta_conversations` rows (`editorial:{workflowId}`, `gateway='agent-sdk'`); `workflows.conversation_id` stays v1-authoritative; the eventual keep/null disposition of the legacy column is recorded now, executed in MG-21. `CONV_ID_PATTERN` validation unchanged.
**Acceptance criteria:**
- [ ] Migration `supabase/migrations/*_create_letta_conversations.sql` (NEW) applied; `supabase db reset` green; RLS policies cover the new table; unique constraint enforced by a concurrency-safe upsert test.
- [ ] Resolver unit test: stored ID for the requesting gateway → no `conversations.list` call; missing ID → fallback resolves by name once, logs deprecation warning, persists under the right `(gateway, agent_id)`; v1 and SDK rows never collide.
- [ ] Editorial path still enforces `CONV_ID_PATTERN` (existing test green); dual-runtime editorial decision recorded in the migration docs.
**Depends-on:** MG-01 (Q3/Q7), MG-03 **Provenance:** A MIG-07/R3, BASE#7, §D.3 (amended).

### MG-06 — Wave 2.2 — Token usage accounting (C1 branch; rescoped in v2)
**Description:** Implement the spike-selected C1 branch (§D.1) inside the seam/persistence: (1) `stream_event` usage extraction; (2) narrow v1 usage-only module for `runs.usage.retrieve` during dual-implementation; (3) NULL degradation + follow-up. `LettaUsage` stays the contract. **Rescoped (v2, qwen #4 + k3 #7):** this ticket delivers fixture-level usage extraction, persistence-unit tests, and **one cloud turn end-to-end** — the ≥ 20-record golden run is moved to MG-16b because production-like agents (MG-07) and report-producing workflows (MG-11-14) do not exist yet at Wave 2.2, and the persistence writes live in those step files.
**Acceptance criteria:**
- [ ] Branch recorded in `documentation/agent-migration/usage-accounting.md` (NEW).
- [ ] Branch 1: fixture test proves `stream_event` → `LettaUsage`; one cloud turn observes non-null usage. Branch 2: `rg "runs.usage.retrieve" packages` matches exactly one module; one cloud turn retrieves usage. Branch 3: `letta_reports.token_cost` IS NULL for agent-sdk rows, activity-log UI renders "n/a" (Playwright check), and a concrete follow-up issue is linked — **branch 3 must NOT be held to a "populates token_cost" criterion**.
**Depends-on:** MG-01, MG-04 **Provenance:** A MIG-06/R2, BASE C.1.1, B §3.4.

### MG-08 — Wave 3.1 — Decision: translator topology + routing matrix (RI-1268)
**Description:** Decision ticket per §D.2. Existing Linear issue RI-1268 « Skill `translation` multilingue : reprendre les **5 agents** `ar/uk/ru/ps/ti` (considérer 1 agent multilingue vs 5). `ps` et `ti` ont déjà la persona Letta Code standard — probablement un pré-déploiement. » **Required input (v2, qwen #5/gpt #9): the verified language→agent routing matrix** — all 7 configured keys (`ar/uk/ru/fa/ps/en/ti`) mapped against the 5 real agents, with an explicit disposition for `en`/`fa` (skip / alias / newly provision) and reconciliation of the `ar`/`ti` ID drift between `languages.ts` defaults and the inventory. Options are defined by that matrix. **Decision evidence precedes the decision (v2, k3 #10):** quality baselines for all five production languages (golden samples + editorial sign-off ar/uk/ru; automated schema/non-empty checks ps/ti), including the model-tier comparison if Option A would use per-session `model` overrides. Recommendation: one multilingual agent (Option A). Deadline: before MG-07 (Wave 3.2); hard stop before MG-14.
**Acceptance criteria:**
- [ ] `documentation/agent-migration/translator-agents-decision.md` (NEW) records the routing matrix, decision, rationale, criteria scores, per-language baseline evidence, deadline.
- [ ] MG-07 / MG-14 / MG-22 reference the recorded outcome; no other ticket pre-commits either option.
**Depends-on:** MG-01 **Provenance:** D-draft-18 (decision-ticket pattern), BASE#3, C R5, RI-1268.

### MG-07 — Wave 3.2 — Skills, corpus, and shared memory setup (v3: dashboard-defined agents, no code provisioning)
**Description:** **v3 (Luis): agents stay dashboard-defined — no `createAgent()` provisioning script.** This ticket owns: (1) promoting the `agent-knowledge` scaffold into committed `skills/{audit,redaction,metadata,translate}/SKILL.md` files (extends RI-1259/RI-1260/RI-1264/RI-1265/RI-1266); (2) setting up **shared memory repositories** (`client.repositories.*` + `agents.repositories.attach`) to replace the frozen memory blocks — `metadata_schema`, `compliance`, `doublons` now live as shared memory repo content, staying in sync with the repo; (3) reconciling agent IDs in env config with the verified dashboard inventory per the MG-08 routing matrix; (4) removing `METADATA_AGENT_ID` (no separate metadata agent in Letta Cloud — Luis). **Corpus is a blocking input (v2, gpt #5):** the `agent-knowledge` scaffold is empty today (§A.4); `scripts/validate-corpus.ts` is upgraded to treat missing required skills as errors. **Session-mode proof:** an integration test opens the production session (stateful) and proves `/audit`, `/metadata`, `/translate` can access their instructions and tools.
**Acceptance criteria:**
- [ ] `skills/{audit,redaction,metadata,translate}/SKILL.md` committed and non-empty; `corpus.config.yaml` status flipped from `scaffold`; `pnpm validate:corpus` green **and fails on a removed required skill**.
- [ ] Shared memory repositories created and attached to the dashboard-defined agents; content matches repo sources (compliance, duplicates, metadata schema).
- [ ] Env config reconciled: `METADATA_AGENT_ID` removed; per-language vars or single `LETTA_TRANSLATOR_AGENT_ID` per MG-08 matrix; `.env.example` updated.
- [ ] Dashboard editorial agent passes a manual `/audit` smoke prompt returning valid frontmatter (recorded in spike doc addendum); session-mode knowledge/tool-access integration test is green.
**Depends-on:** MG-01, MG-02, MG-08 **Provenance:** BASE#3, A MIG-11, D-draft-21, B LEGACY-14, RI-1259/RI-1260/RI-1264/RI-1265/RI-1266.

### MG-09 — Wave 3.3 — Skill: `validate_metadata_ri` (v3: skill, not client tool; JSON contract fixed in v2)
**Description:** Existing Linear issue RI-1274 « Tool `validate_metadata_ri` (déjà HTTP route Next.js) — le réexposer en tool Letta Code. » **v3 (Luis): transformed to a skill in agent or shared memory** — not an `AnyAgentTool` client tool. The `MetadataRiSchema` Zod validation logic (same as `POST /api/tools/validate-metadata-ri`) becomes a skill that instructs the agent to validate metadata according to the schema; the schema spec lives in shared memory (MG-07). **Contract (v2, qwen #8): the skill preserves the existing JSON contract** — valid → `{ valid: true, data }` (Zod-sanitized), invalid → `{ valid: false, errors: [{ field, message }] }` — golden-fixture-tested against current route behavior. "Canonical YAML" from v1 is dropped: the route never serializes YAML; if a YAML rendering is ever needed it is a new, separately tested serialization step. Delete `scripts/register-metadata-validator-tool.ts` (DELETED); drop `VALIDATE_METADATA_RI_URL` secret and the `NEXT_PUBLIC_APP_URL` usage; keep the HTTP route only if `rg "validate-metadata-ri"` shows remaining non-agent callers.
**Acceptance criteria:**
- [ ] Skill contract test: valid input → `{ valid: true, data }` matching route fixtures byte-for-byte on the sanitized object; invalid → exact legacy error list (golden fixtures from current route behavior).
- [ ] Parity test: agent in a cloud session uses the skill and self-corrects invalid `metadata_ri` on retry.
- [ ] `rg "VALIDATE_METADATA_RI_URL" --type ts` → 0 matches; `rg "pip_requirements" scripts` → 0 matches; register script absent from `scripts/`.
**Depends-on:** MG-04 **Provenance:** BASE#5, A MIG-12, B LEGACY-9, D-draft-04, RI-1274.

### MG-10a — Wave 3.4 — Duplicate-search data source (NEW in v2, split from MG-10; pre-gate-eligible)
**Description:** Decide and implement the authoritative source for duplicate search — **there is no Supabase `dispositifs` table today** (§A.4): either query the existing Mongo collection through `@playground/mongo`, or create/populate/index a Supabase `dispositifs` table with explicit sync, freshness, deletion, credentials, schema, and production-size performance criteria. RI-1276 presumes the Supabase table; this ticket makes the presumption true or overturns it. Includes the search specification (v2, k3 #8): searchable fields, normalization, candidate-generation SQL/RPC, whether "semantic" matching is actually required (no vector/embedding infrastructure exists today — only one `pg_trgm` index on ingestion metadata), labeled-dataset ownership (≥ 30 cases), and **numeric** precision/recall thresholds agreed with editorial up front.
**Acceptance criteria:**
- [ ] Decision recorded (`documentation/agent-migration/duplicate-search-source.md`, NEW) with the search spec and thresholds; labeled dataset committed with a named owner.
- [ ] Implemented source passes a mechanically runnable search benchmark against the agreed thresholds at production-scale fixture size (command + results committed).
**Depends-on:** — (no SDK dependency; can start immediately) **Provenance:** RI-1276, BASE#6, C R7, qwen #7/gpt #2/k3 #8.

### MG-10b — Wave 3.5 — Client tool: `search_ri_duplicate_dispositifs`
**Description:** Implement `packages/agents/src/tools/search-ri-duplicate-dispositifs.ts` (NEW) against the MG-10a source; attach to audit sessions via the seam's toolkit contract.
**Acceptance criteria:**
- [ ] Ranked candidate list returned for the MG-10a labeled fixtures at the agreed precision/recall thresholds (benchmark re-run in CI or documented reproduction).
- [ ] Audit turn on golden samples emits duplicate/compliant verdicts consistent with the v1 baseline on identical inputs.
- [ ] `rg "karfur" packages` → 0 matches.
**Depends-on:** MG-04, MG-10a **Provenance:** BASE#6, A MIG-13, B LEGACY-10, C R7, RI-1276.

### MG-16a — Wave 4.0 — Parity harness + v1 baselines + observability baseline (NEW in v2, split from MG-16)
**Description:** **Pre-port** harness and baselines (v2, k3 #3/gpt #3/qwen #10/gpt #10): fixed corpus of ingestion/editorial/translation inputs; replay runner over **both gateways** (v1 today, agent-sdk once MG-04 lands); comparison of **parsed `LettaReportResult`** (status, schema-valid metadata, compliance verdicts), token costs where available, and latency — never raw text (rule enforced in code: the harness fails if it diffs raw markdown). v1 baselines recorded **before any port ticket lands**. Also delivers the **executable observability baseline**: a committed report command (SQL/script) computing per-pipeline error rate, retry counts, and sandbox-expiry counts over a fixed lookback window with explicit denominators — the "v1 baseline" referenced by MG-17/MG-19 becomes a command, not an assertion.
**Acceptance criteria:**
- [ ] Harness committed (`scripts/parity-run.ts` NEW or a vitest suite); v1 baselines under `documentation/agent-migration/parity/` (NEW).
- [ ] Observability baseline command committed; running it against production/staging data produces the per-pipeline baseline report referenced by later gates.
- [ ] Comparison rule enforced in code.
**Depends-on:** MG-03, MG-04 **Provenance:** A MIG-16, C testing rule, BASE C.4, qwen #10, k3 #3, gpt #3/#10.

### MG-11 — Wave 4.1 — Port audit path
**Description:** Switch `forceAuditReportStep`, `generateDiAuditReportsStep`, `diSingleAuditStep` (`di-single-record-steps.ts`, `audit-di-step.ts`) to the seam under the flag; sessions **stateful** (v3: no stateless mode); usage per MG-06; activity logging (`TYPE_COMPLIANCE_IA`/`TYPE_UPDATE_COMPLIANCE`) and `letta_reports` insert shape unchanged; pipeline's own `LETTA_GATEWAY_INGESTION` override wired (resolver from MG-04). Note: only the forced path is live today (§A.5).
**Acceptance criteria:**
- [ ] Staging golden run ≥ 20 records via the **MG-16a harness**: identical `status` distribution and schema-valid `metadata` vs v1 baseline (harness diff, §H).
- [ ] Retry classification verified with injected `llm_api_error`/rate-limit fixtures (unit).
- [ ] Rollback verified by flipping `LETTA_GATEWAY_INGESTION` back to `v1` in staging.
**Depends-on:** MG-04, MG-05, MG-06, MG-07, MG-09, MG-10b, MG-16a **Provenance:** BASE#7, A MIG-09, C Phase 3, gpt #7.

### MG-12 — Wave 4.2 — Port metadata path
**Description:** Switch `forceMetadataReportStep` (with `"generating"` sentinel insert/update and concurrent-generation 409 guard), `generateDiMetadataReportsStep`, `diSingleMetadataStep` (`metadata-di-step.ts`, `di-single-record-steps.ts`) to the seam. Keep the sentinel UX; re-evaluate the 409 guard against runtime queueing (`queue_update`) — keep the guard unless spike evidence shows queueing suffices; pipeline override `LETTA_GATEWAY_INGESTION` wired.
**Acceptance criteria:**
- [ ] Forced metadata regeneration via UI works under agent-sdk; sentinel → complete/error transitions visible via Supabase Realtime (Playwright).
- [ ] Concurrent double-trigger test: no unhandled 409; guard-or-queue behavior documented in the ticket.
- [ ] Golden-run parity as MG-11 (MG-16a harness).
**Depends-on:** MG-04, MG-05, MG-06, MG-07, MG-09, MG-16a **Provenance:** BASE#7/#10, A MIG-10.

### MG-13 — Wave 4.3 — Port editorial rewrite step
**Description:** Switch `forceEditorialStep` (+ `pipelines/editorial/force-editorial.ts`): inline `conversations.create` → seam session creation via the **MG-05 dual-runtime store** (`editorial:{workflowId}`, `gateway='agent-sdk'`; `workflows.conversation_id` untouched for v1); `conversations.cancel` + `"No active runs"` sniffing → `session.abort()` (or queue semantics per Q7); keep `CONV_ID_PATTERN`, durable-step retry semantics (`maxRetries = 2`); mid-turn drop recovery per the Q7 recipe (`resumeSession` + `listMessages()` reconcile, no replay); pipeline override `LETTA_GATEWAY_EDITORIAL` wired.
**Acceptance criteria:**
- [ ] `/api/editorial-rewrite` POST → `GET /[runId]` flow works end-to-end in staging under agent-sdk, including resume-after-refresh via `active_run_id` and the `letta_reports` fallback.
- [ ] Concurrent double-forced rewrite: no unhandled 409 (queued, or aborted-and-retried per Q7 finding).
- [ ] `rg "No active runs" packages` → 0 matches; SDK editorial conversation rows never overwrite v1 `workflows.conversation_id`.
**Depends-on:** MG-04, MG-05, MG-06, MG-07, MG-09, MG-16a **Provenance:** BASE#8, A MIG-14, C R4/R8, k3 #4.

### MG-14 — Wave 4.4 — Port translation workflows
**Description:** Switch `generateTranslationStep`, the per-language pipelines in `pipelines/translation/generate-translation.ts` (+ `workflow-registry.ts`), and `getAvailableTranslationAgentsStep` to the seam using MG-07 agents per the MG-08 routing matrix. Preserve per-record-per-language conversation isolation (MG-05 keys), language skip when unconfigured per the matrix, `TYPE_TRANSLATION_ERROR` logging, empty-markdown skip; pipeline override `LETTA_GATEWAY_TRANSLATION` wired.
**Acceptance criteria:**
- [ ] Translations generated in staging for **every language the MG-08 matrix routes to an agent** (not a two-language sample — v2, k3 #10/gpt #9); editorial quality spot-check sign-off recorded for ar/uk/ru.
- [ ] Unconfigured/skipped-language behavior verified by unit test for each non-routed key (incl. `en`/`fa` disposition).
- [ ] Topology-consistent env contract with **exact assertions** (v2, gpt #9): Option A → `rg "LETTA_TRANSLATOR_AGENT_ID" packages/shared` matches the single definition and `rg "LETTA_AGENT_(AR|UK|RU|FA|PS|EN|TI)" packages/shared` → 0 matches; Option B → every per-language var in the matrix documented in `.env.example` and none missing.
- [ ] Exported available-language set unchanged unless the MG-08 decision explicitly approves a change.
**Depends-on:** MG-04, MG-05, MG-06, MG-07, MG-08, MG-16a **Provenance:** BASE#9, A MIG-15, B LEGACY-8, RI-1268.

### MG-15 — Wave 4.5 — SSE route on SDK + contract test
**Description:** Rewrite `POST /api/agents/metadata/stream` on the seam's `streamTurn`; server-side mapper keeps the legacy wire format (`message_type` chunks, `data: [DONE]`, `{type:"error"}` events). **Persistence semantics fixed (v2, gpt #8):** the shared accumulator / terminal `result` is the **sole persistence source** — the current route overwrites `finalAssistantContent` per chunk (`route.ts:143-168`) and would persist only the last delta; that bug is not preserved. Verified repo fact (§A.6): the route has no in-repo frontend caller — record an explicit keep/deprecate decision.
**Acceptance criteria:**
- [ ] SSE contract test (v2, qwen #9): **recorded SDK event fixtures** (not v1 chunks — the mapper consumes `SDKMessage`) replayed through the mapper with **frozen/omitted timestamps** (current generators inject `new Date().toISOString()` per chunk, so byte-identity is impossible by construction); assertions are semantic and canonical: ordered event kinds, concatenated assistant content, run ID, error frame shape, terminating `[DONE]`. One separately recorded v1 fixture serves as the expected *normalized* contract.
- [ ] Persistence fixture: multi-delta stream → persisted `raw_response`/markdown equals the **complete** accumulated response (not merely "a row was inserted").
- [ ] Route e2e in staging: progressive streaming + final `letta_reports` persistence row.
- [ ] Keep/deprecate decision recorded in the migration docs; route no longer references `chunk.run_id`/`message_type` directly (mapper-owned).
**Depends-on:** MG-04, MG-06, MG-12 **Provenance:** BASE#11, A MIG-17/R9 (corrected per §A.6), D-draft-17, C R2, qwen #9, gpt #8.

### MG-16b — Wave 5.1 — Aggregate parity report (split from MG-16 in v2)
**Description:** Post-port aggregation over the MG-16a harness: per-pipeline comparison report across all ported paths (ingestion forced paths, editorial, translation, SSE), discrepancy rate documented, cutover go/no-go recorded. **Owns the batch token-cost verification moved from MG-06 (v2):** ≥ 20-record agent-sdk run validates `token_cost` per the C1 branch — branches 1/2 must populate and validate; branch 3 must produce NULL for all SDK rows and link the follow-up issue. **Translation coverage (v2, k3 #10):** the corpus includes every language the routing matrix serves.
**Acceptance criteria:**
- [ ] Per-pipeline comparison report generated (v1 baselines vs agent-sdk runs on identical corpus); discrepancy rate documented; cutover go/no-go recorded.
- [ ] Batch token-cost criterion satisfied **per branch** (see above) — no blanket "populates" wording.
- [ ] Translation parity section covers every matrix-routed language.
**Depends-on:** MG-11, MG-12, MG-13, MG-14, MG-15 **Provenance:** A MIG-16, C testing rule, BASE C.4, qwen #4, k3 #3/#7, gpt #3.

### MG-17 — Wave 5.2 — Paired load test at fan-out concurrency 5
**Description:** **Paired protocol (v2, qwen #10):** the same fixed ≥ 50-record corpus, concurrency 5 (`METADATA_CONCURRENCY`/`AUDIT_CONCURRENCY` pattern), `SPAWN_DELAY_MS = 500`, same region and observation window, run through **both gateways** (v1 pass and agent-sdk pass in staging via the MG-04 flags) using the MG-16a harness/runner — production fan-out is disabled today (§A.5), so no natural v1 fan-out baseline exists; the pair is manufactured. Measures sandbox warm-up (Q5), 429-equivalent errorCodes (Q4), session leaks, p95 latency. This is the pre-re-enable gate for fan-out.
**Acceptance criteria:**
- [ ] Load script + both passes' results committed; zero leaked sessions (close instrumentation).
- [ ] Comparative thresholds evaluated against the **v1 pass of the same pair** (error rate, p95), plus pre-agreed absolute SLOs recorded before the run; both documented.
- [ ] Go/no-go for fan-out re-enable recorded (feeds MG-19).
**Depends-on:** MG-11, MG-12, MG-16a **Provenance:** BASE C.4, A R8, C Phase 6, qwen #10.

### MG-18 — Wave 5.3 — Ops scripts cleanup (v3: no local dev stack — cloud exclusively)
**Description:** **v3 (Luis): cloud exclusively — no local dev stack, no docker/Ollama, no local inference.** This ticket owns: (1) rewriting `scripts/force-metadata-reports.ts` on the seam (the only script that migrates); (2) deleting `scripts/list-agents.ts`, `scripts/create-local-agents.ts`, `scripts/register-metadata-validator-tool.ts` (removed, not migrated); (3) deleting `docker-compose.letta.yml` and `letta:*` root scripts; (4) removing `documentation/ai/local-letta-dev.md` or replacing with a cloud-only quickstart; (5) removing the stale `update:metadata-schema` entry — existing Linear issue RI-1278 « `scripts/update-metadata-schema-block.ts` devient obsolète (cf. gel). À supprimer ou transformer en script de validation locale. » (the inventory lists RI-1278 twice — rows 22/23; the stale-script reading is canonical here, flag the duplicate to editorial).
**Acceptance criteria:**
- [ ] `rg "update:metadata-schema" package.json` → 0 matches; `docker-compose.letta.yml` deleted; `letta:*` scripts removed or replaced with cloud-only equivalents.
- [ ] `scripts/force-metadata-reports.ts` runs via the seam against the cloud backend.
- [ ] Deleted scripts absent from `scripts/`; `rg "LETTA_BASE_URL|LETTA_ENVIRONMENT|LOCAL_LLM_MODEL" .env.example` → 0 matches.
**Depends-on:** MG-04, MG-07 **Provenance:** BASE#12, B LEGACY-13, A R10, RI-1278.

### MG-19 — Wave 6.1 — Flag-gated cutover, progressive flip, fan-out decision, two-week soak
**Description:** Cutover per §I: per-pipeline flags (resolver shipped in MG-04; this ticket **executes the rollback drill**, it does not introduce controls); progressive flip **ingestion → editorial → translation**, where "ingestion" today means the forced arbitration/metadata paths (fan-out and batch are dormant, §A.5); **explicit decision** whether to re-enable fan-out on the new SDK (uncomment `fanOutDiRecordsStep` in `pipelines/ingestion/di-ingestion.ts`) gated on MG-17 evidence — not an assumption; two-week soak with monitoring; rollback = per-pipeline flag flip. **Soak criteria made executable (v2, gpt #10):** "one full production cycle" is replaced by explicit per-path minimum successful counts, because forced paths are manual and a "cycle" can contain zero SDK calls.
**Acceptance criteria:**
- [ ] Per-pipeline flags documented in `.env.example`; rollback drill executed and recorded (flip one pipeline back in staging).
- [ ] Soak exit requires, under agent-sdk in production: forced audit ≥ 30, forced metadata ≥ 30, editorial rewrites ≥ 20, translations ≥ 5 per matrix-routed language — each with error rate ≤ (MG-16a baseline + 2 pp, denominators from the committed report command), **retry rate ≤ (MG-16a baseline + 10%) expressed as retries per request (v3, Codex P2: absolute retry counts are volume-dependent — a busier but equally reliable period can fail the gate while a low-volume period can pass with a worse retry rate)**, zero unresolved sandbox-expiry incidents, `token_cost` populated per C1 branch. Numeric tolerances are pre-agreed defaults, adjustable before flip with editorial sign-off and recorded in the cutover doc.
- [ ] Fan-out decision recorded with MG-17 evidence; if re-enabled, the uncommented code ships behind its own flag.
- [ ] 2 consecutive clean production weeks (per the above definitions) before MG-20 starts.
**Depends-on:** MG-15, MG-16b, MG-17, MG-18 **Provenance:** B LEGACY-15, BASE#13, C Phase 6, verified repo fact §A.5, gpt #10.

### MG-20 — Wave 6.2 — Final verification checklist
**Description:** Execute post-soak: full quality gates; corpus + docs validation; cloud e2e; production smoke.
**Acceptance criteria:**
- [ ] `pnpm check:types && pnpm lint && pnpm test && pnpm security:scan:js` green.
- [ ] `pnpm validate:corpus && pnpm validate:docs` green.
- [ ] Cloud e2e: one DI record through audit + metadata + editorial produces a `letta_reports` row per report.
- [ ] Production smoke: one editorial rewrite on a real fiche completes via `/api/editorial-rewrite` → `[runId]`.
**Depends-on:** MG-19 **Provenance:** B §8, A MIG-18 (partial).

### MG-21 — Wave 6.3 — Remove v1 SDK + dead code + cloud cleanup
**Description:** Drop `@letta-ai/letta-client` (including the C1 branch-2 usage module if present); delete the v1 seam implementation, `runAgentOneShot`, `sendMessage`/`getAgent` if `rg` confirms no callers, deprecated `INGESTION_AGENT_HEADING`, the `trustPolicyExclude` entry for letta-client; prune `LETTA_PROJECT_ID`/`LETTA_BASE_URL`/`LETTA_ENVIRONMENT` from code and `.env.example`; **execute the `workflows.conversation_id` keep/null decision recorded in MG-05** (v2: decision was made before MG-13; this ticket only executes); retire v1-gateway rows in `letta_conversations` per the recorded policy; empty the orphaned blocks in `project-pZvdCSjhJ7Fgmi66gqgy`.
**Acceptance criteria:**
- [ ] `rg "@letta-ai/letta-client" . -g '!documentation' -g '!pnpm-lock.yaml'` → 0 matches; lockfile contains neither package remnants.
- [ ] `rg "LETTA_PROJECT_ID|LETTA_ENVIRONMENT" apps packages scripts .env.example` → 0 matches.
- [ ] `pnpm install && pnpm build && pnpm check:types && pnpm test && pnpm lint && pnpm knip` green.
- [ ] Orphan cloud project emptied (CLI log/screenshot attached to the ticket).
**Depends-on:** MG-20 **Provenance:** BASE#14, B LEGACY-12, D-draft-26/27, A MIG-18.

### MG-22 — Wave 6.4 — Documentation & config closeout
**Description:** Update `AGENTS.md` (AI section: Agent SDK sessions model), `README.md`, `.env.example` (final env contract per §B.3), inventory post-migration section (append without rewriting history), and `documentation/agent-migration/agent-sdk-cutover.md` (NEW; agent bootstrap, adding a skill / slash command, MemFS layout, cloud testing). Record the usage-accounting outcome, adapter decision, translator decision, and the no-production-shadow decision (§I); close the Linear waves.
**Acceptance criteria:**
- [ ] `pnpm validate:docs` green; `rg "letta-client" documentation` matches only historical inventory sections.
- [ ] `.env.example` matches the implemented env contract (verified by diff against env reads in code).
- [ ] Cutover runbook covers all listed areas with concrete examples; migration folder marked complete with Linear closure links.
**Depends-on:** MG-21 **Provenance:** A MIG-19, D-draft-29/30, B LEGACY-16.

---

## H. Testing Strategy

1. **Parity harness (MG-16a, pre-port):** fixed corpus replayed through both gateways; **compare parsed `LettaReportResult` (status + schema-valid metadata + compliance verdicts), not raw text**; plus token cost where available and latency. v1 baselines committed before any port ticket. Aggregate report in MG-16b.
2. **Paired load test (MG-17):** same fixed ≥ 50-record corpus, concurrency 5, `SPAWN_DELAY_MS 500`, same window — run through both gateways; sandbox warm-up, 429-equivalent codes, session-leak count, p95 latency; comparative + pre-agreed absolute SLOs.
3. **SSE contract test (MG-15):** recorded **SDK event fixtures** → mapper (timestamps frozen) → canonical semantic assertions (ordered kinds, concatenated content, run ID, error frame, `[DONE]`); one recorded v1 fixture as normalized expected contract; persistence fixture asserts the **complete** accumulated response (fixes the last-delta overwrite bug).
4. **Unit:** `streamTurn`/`collectTurn` accumulator (multi-fragment, multi-run, tool-interleaved streams; **exact-once content fixture** — the `simplification.ts` truncation/duplication bug class); gateway resolver (global + per-pipeline precedence); error mapper (auth, rate-limit, mid-turn disconnect, sandbox expiry); conversation resolver (ID-first per gateway, logged name fallback); toolkit least-privilege per workflow kind.
5. **Integration (cloud backend):** full `/audit` chain; `validate_metadata_ri` skill round-trip (agent uses skill to validate and self-corrects invalid `metadata_ri` on retry); queueing on double-send; session-close discipline; **session-mode knowledge test** (instructions + tools accessible in the production session — stateful, v3: no stateless mode).
6. **Existing suite:** `parser.test.ts` and all Zod schemas are SDK-independent and must stay green in every PR.

## I. Cutover Plan (renamed in v2: flag-gated dual-implementation, not "dual-run")

- **Model:** both implementations coexist in the codebase behind `LETTA_GATEWAY=v1|agent-sdk` (global default `v1`) with per-pipeline overrides (`LETTA_GATEWAY_INGESTION`, `LETTA_GATEWAY_EDITORIAL`, `LETTA_GATEWAY_TRANSLATION`) so a regression in one pipeline never blocks rollback of another (R12). The flag **selects** one implementation per pipeline at runtime; it does not shadow-invoke both.
- **Why no production shadow mode (explicit decision, v2 — qwen #2):** shadowing would double LLM cost on 1-3 min turns and duplicate side effects (`letta_reports` inserts, `"generating"` sentinel rows, conversation creation) that would need suppression logic of its own. The source reports' requirement — same batch through both paths — is satisfied by the **paired staging protocol**: MG-16a/MG-16b (identical corpus through both gateways) and MG-17 (paired load runs). Recorded in the cutover doc (MG-22).
- **Progressive flip:** ingestion → editorial → translation. With fan-out disabled (§A.5), the ingestion leg covers the forced arbitration/metadata paths first; batch and fan-out re-entry are gated decisions, not assumptions.
- **Fan-out re-enable:** explicit go/no-go inside MG-19, evidence = MG-17 paired load test; if go, uncommented `fanOutDiRecordsStep` ships behind its own flag.
- **Soak:** two consecutive clean production weeks per the **executable criteria in MG-19** (per-path minimum successful counts; error rate ≤ MG-16a baseline + 2 pp with committed denominators; **retry rate ≤ baseline + 10% expressed as retries per request** (v3, Codex P2); zero unresolved sandbox-expiry incidents; `token_cost` per C1 branch) before MG-20/21.
- **Rollback:** per-pipeline flag flip (resolver shipped and tested in MG-04); drill executed in staging before production flip; rollback plan retired only at MG-21.
- **Final verification checklist:** MG-20 (types/lint/test/security, corpus/docs validation, local e2e, production smoke).

---

## J. Dependency Graph (updated in v3)

```
MG-01 (spike gate: Q1–Q7, C1 branch)  [v3: Q8 removed]
  ├─► MG-02 (dep + supply chain)
  │      └─► MG-04 (agent-sdk adapter + gateway resolver + toolkit + canonical stream)
  │             │
  │             ├─► MG-06 (usage accounting, C1 branch — fixtures + 1 cloud turn)
  │             ├─► MG-09 (validate_metadata_ri skill)  [v3: skill, not client tool]
  │             └─► MG-16a (parity harness + v1 + observability baselines)   [Wave 4.0]
  │
  ├─► MG-08 (translator decision + routing matrix, 3.1)
  │      └─► MG-07 (skills + corpus + shared memory, 3.2)  [v3: dashboard-defined agents]
  │             └─► MG-10b (duplicate tool)
  │                                                        │
MG-10a (data source decision — pre-gate, no SDK dep) ──────┘
  │
MG-03 (seam, v1 impl — pre-gate) ─► MG-05 (conversation store, gateway-namespaced;
  │                                 editorial dual-runtime decision) [needs MG-01: Q3/Q7]
  │                                        │
  └──────────────────┬─────────────────────┘
                     ▼
   MG-11 (audit) ─► MG-12 (metadata) ─► MG-15 (SSE)
   MG-13 (editorial)        MG-14 (translation)
   [each port: MG-04 + MG-05 + MG-06 + MG-07 + MG-16a; + MG-09 for audit/metadata/editorial;
    + MG-10b for audit; + MG-08 for translation; MG-15 additionally requires MG-12]
                     │
                     ▼
   MG-16b (aggregate parity report + batch token cost)   MG-17 (paired load test)   MG-18 (ops scripts cleanup)  [v3: no local dev]
                     └────────────────────────┬──────────────────┴────────────────────┘
                                             ▼
   MG-19 (flag-gated cutover, executable soak, fan-out decision)
                                             │
                                             ▼
   MG-20 (final verification) ─► MG-21 (remove v1 + cleanup) ─► MG-22 (docs closeout)
```

Critical path: MG-01 → MG-02 → MG-04 → MG-16a → MG-11 → MG-12 → MG-15 → MG-19 → MG-20 → MG-21 → MG-22, with the provisioning leg MG-01 → MG-08 → MG-07 (→ MG-10b) feeding every port. MG-03 and MG-10a are pre-gate and parallel-safe from day one; MG-09/MG-10b run parallel to the data tickets; MG-16a must land before any port ticket's golden-run criterion is executed.

## K. Provenance

| Section | Primary source(s) | Notes |
|---|---|---|
| A.1 import inventory | BASE §A.1 + B §1.2 | Counts re-verified by `rg` (8 files) |
| A.2 client + `LETTA_BASE_URL` trap | BASE §A.2 + A §1.2 | Trap verified in `.env.example:27` |
| A.3 API surface table | BASE §A.3, enriched by A §1.3 line refs | Validator JSON contract + accumulation sites verified (v2) |
| A.4 topology/frozen memory | BASE §A.4 + C §A.8 + D §1.3 | 7-keys-vs-5-agents matrix, ID drift, empty corpus scaffold, missing Supabase `dispositifs` — all verified (v2) |
| A.5 orchestration + live-path analysis | BASE §A.5 + repo verification | Fan-out-disabled fact verified; dormant batch steps verified; SSE overwrite bug verified (v2) |
| A.6 frontend consumers | A §1.6/R9 — **corrected against repo** | SSE route orphaned; UI = server actions + Realtime |
| A.7/A.8 scripts, env | BASE §A.6 + A §1.10 | RI-1278 duplicate-row note added (v2) |
| B.1/B.2 mapping | BASE §B (table) + A §2/§3.1 + C §B.1 + D §2.2 | Canonical content contract (v2); ~~stateless demotion (v2)~~ → stateless removed (v3) |
| B.3 env delta | B §3.10 | Per-pipeline resolver moved to MG-04 (v2); cloud-only env vars removed (v3) |
| B.5 adapter naming | B Phase 1 / LEGACY-3/4 | `createAgentClient`/`createSession`/`streamTurn`/`collectTurn` + `ConversationStore` port; seam scope narrowed to workflow/SSE (v2); cloud-only + 3-column resolver (v3) |
| C register R1-R8, R11 | C §C breaking changes; BASE | Renumbered cleanly; R6 local floor removed (v3) |
| C register R9-R12 | A R9-R12 | R9 severity corrected per §A.6; R7 split into MG-10a/10b; R12 resolver timing fixed; ~~R13 added (v2)~~ → R13 removed (v3); R10 removed (v3) |
| C.2 files matrix | BASE §C.2 | — |
| D.1 C1 chain | Task policy over A R2/BASE C.1.1/C R1/B §3.4 | Branch-specific acceptance added (v2) — resolution unchanged |
| D.2 C2 decision | D-draft-18 pattern + RI-1268 + C R5 | Routing matrix + evidence-precedes-decision added (v2) — recommendation unchanged |
| D.3 C3 identity | A MIG-07/R3 + B Phase 6 backfill + BASE C.3 | **Amended (v2):** gateway/agent namespacing; editorial decision moved to MG-05 — flagged at top |
| E Phase 0 | A §3.3 Q1-Q6 + C spike#3 (Q7) | ~~Q8 (stateless knowledge loading) added (v2)~~ → Q8 removed (v3); gate narrowed to SDK-dependent tickets |
| F/G waves & tickets | BASE §D/E (14) expanded with D wave numbering, A MIG series, B LEGACY series, C phases | 22 tickets + MG-10a/10b + MG-16a/16b splits; MG-08/MG-07 wave swap (v2); MG-07 → skills/shared memory (v3); MG-09 → skill (v3); MG-18 → ops cleanup (v3) |
| H testing | A MIG-16/R8 + C testing rules + BASE C.4 | Parsed-result rule from C; paired protocol + semantic SSE test (v2) |
| I cutover | B LEGACY-15 (soak) + C Phase 6 (per-pipeline) + BASE#13 | Renamed flag-gated dual-implementation; no-shadow decision + executable soak (v2) |
| Provenance labels | gpt #6 | D's RI-13xx numbers are report placeholders (MiniMax §5) — relabeled `D-draft-NN`; only RI-1258…RI-1284 treated as real Linear issues |

## L. Open Questions (Phase 0 spikes only)

1. **Q1 — Project scoping:** where `createAgent()` agents land; `LETTA_PROJECT_ID` disposition. Blocks MG-02 env contract, MG-21 pruning.
2. **Q2 — Token usage observability** (`stream_event` shape or absence). Selects the C1 branch; blocks MG-06 and the MG-21 scope.
3. **Q3 — `conversations.list/create` matchable fields** (name vs summary). Shapes the MG-05 name-fallback.
4. **Q4 — 429 surfacing** in the event/error model. Feeds the MG-04 error mapper and MG-17 expectations.
5. **Q5 — Managed-sandbox overhead** for `baseTools: []` text agents; `sandbox: { ttlMinutes, readyTimeoutMs }` tuning. Feeds MG-17 and cost model.
6. **Q6 — Vercel runtime/bundle compatibility** for the SDK host process; `requestTimeoutMs` for 1-3 min turns. Gates the cloud-backend deployment shape.
7. **Q7 — Mid-turn reconnection semantics:** `resumeSession` recovery, `listMessages()` reconciliation, confirmed absence of event replay; `conv-` ID format vs `CONV_ID_PATTERN`. Gates MG-04 recovery wrapper and MG-13.

Everything else in this plan is decided; the `[VERIFY IN SPIKE]` markers in tickets point at these seven. **v3: Q8 (stateless knowledge loading) removed — workers are stateful.**

---

## M. Review Disposition Table (v2 + v3)

Findings from the three adversarial reviews. Merged findings are noted. "ACCEPT" applies the fix to the plan; "DEFER" moves a sub-question to the Phase 0 spike list (§L).

| # | Finding (short) | Reviewer | Disposition | Rationale |
|---|---|---|---|---|
| 1 | Stream adapter can emit the answer twice (deltas + terminal full text) | qwen #1, k3 #2, gpt #1 (merged) | **ACCEPT** | Every consumer concatenates each `assistant_message` (`agents.ts:79`, `simplification.ts:182`, `di-single-record-steps.ts:127,303`, `audit-di-step.ts:292,511`, `metadata-di-step.ts:291,554`, `force-metadata-reports.ts:358` — verified). §B.5/MG-04 now define the canonical content contract: deltas are the only content events; terminal `result` is metadata-only; `collectTurn` returns `result.result` exactly once, with the `"foo"+"bar"→"foobar"` fixture. |
| 2 | "Dual-run" is only a runtime selector, not parallel evidence | qwen #2 (also gpt #10 soak, k3 —) | **ACCEPT** (rename option) | v1's mechanism is a selector; sources (glm C.4 "same ingestion batch through v1 and Agent SDK paths"; gpt #13) require same-batch-both-paths evidence. Satisfied via the paired staging protocol (MG-16a/MG-16b identical corpus; MG-17 paired load runs). Production shadow rejected as an explicit recorded decision: doubled LLM cost on 1-3 min turns + side-effect duplication (`letta_reports` inserts, sentinel rows, conversation creation). §I renamed "flag-gated dual-implementation". |
| 3 | MG-03's three-function seam cannot cover management scripts | qwen #3 | **ACCEPT** (narrow-scope option) | Scripts need `agents.create/update`, `tools.upsert/attach`, `list` (verified: `create-local-agents.ts:75`, `register-metadata-validator-tool.ts:38,115,128`, `list-agents.ts:6`, `force-metadata-reports.ts:29,345`). v1's "all consumers switch" criterion was unachievable. MG-03 narrowed to workflow steps + SSE route; scripts migrate in MG-07/MG-09/MG-18; grep criterion updated to `packages/workflows apps/frontend`. |
| 4 | MG-06 branch-3 contradiction + golden run scheduled too early | qwen #4, k3 #7, gpt #3 (part; merged) | **ACCEPT** | Branch 3 NULLs `token_cost` by design (§D.1) — a blanket "populates" criterion is unsatisfiable; and the 20-record run needs agents (MG-07) and ported persistence (MG-11-14) that don't exist at Wave 2.2. MG-06 rescoped to fixtures + one cloud turn with branch-specific criteria; batch verification moved to MG-16b. |
| 5 | Translator cardinality unresolved (5 agents vs 7 keys) | qwen #5, gpt #9, k3 #10 (merged) | **ACCEPT** | `languages.ts:79-94` configures 7 keys with hardcoded IDs; inventory: 5 real agents, `en`/`fa` none, `ps`/`ti` "non câblé par défaut"; code defaults drift from inventory IDs for `ar`/`ti` (all verified). MG-08 now requires the routing matrix (en/fa disposition explicit); MG-14 tests every matrix-routed language + exact env-var assertions (`LETTA_TRANSLATOR_AGENT_ID` grep fixed — the v1 `LETTA_AGENT_` pattern cannot match it); MG-16b covers all routed languages. |
| 6 | MG-07 ordered before the MG-08 decision it depends on | qwen #6 | **ACCEPT** | Waves swapped: MG-08 = 3.1, MG-07 = 3.2; MG-07 now depends on MG-08 unconditionally (the non-machine-readable "translators only" qualifier removed). Graph and §F updated. |
| 7 | MG-10 targets a Supabase `dispositifs` table that does not exist | qwen #7, gpt #2, k3 #8 (merged) | **ACCEPT** | No `dispositifs` migration/type/call site; corpus is Mongo (`packages/mongo/src/dispositifs.ts:69`); only trigram index is on ingestion metadata (verified). Split: MG-10a (source decision + search spec + labeled set + numeric thresholds + benchmark) / MG-10b (client tool, depends on 10a). K3's capability findings (no vector/semantic infra; dataset ownership) folded into MG-10a. |
| 8 | MG-09 invents "canonical YAML" as legacy behavior | qwen #8 | **ACCEPT** | Route returns JSON only — `{ valid: true, data }` / `{ valid: false, errors }` (`route.ts:11-13,36-49`, verified). MG-09 fixtures the JSON contract; YAML dropped (any future serialization is a new, separately tested step). |
| 9 | MG-15 SSE test: wrong input fixtures + impossible byte-equality | qwen #9 | **ACCEPT** | The mapper consumes `SDKMessage`, not v1 chunks; v1 generators inject `new Date().toISOString()` per chunk (`ingestion.ts:52-58`, `metadata.ts:46-52`) so byte-identity is non-deterministic by construction. Test now feeds recorded SDK fixtures with frozen timestamps and asserts a canonical semantic contract; one recorded v1 fixture kept as the normalized expected contract. |
| 10 | MG-17 compares against a baseline it neither creates nor depends on | qwen #10 | **ACCEPT** | Baselines live in MG-16 (now MG-16a) which ran parallel to MG-17; fan-out is disabled so no natural v1 baseline exists. MG-17 now depends on MG-16a and runs the paired protocol (same corpus/concurrency/delay/window through both gateways) with comparative + pre-agreed absolute SLOs. |
| 11 | Stateless sessions suppress the memory/skills knowledge workers need | k3 #1 | **ACCEPT** (design) + ~~**DEFER** (stateless semantics → Q8)~~ → **v3: Q8 removed, stateless mode dropped** | k3 §B.2.5: stateless runs "without loading or mutating agent memory"; instructions live in memory/skills in the target; the repo sends only command names. Workers default stateful (B.2, MG-11, D.2 amended); ~~`stateless` permitted only if Q8 proves instruction loading in stateless mode~~ **v3: stateless removed entirely (Luis)**; MG-07 adds the session-mode knowledge/tool-access integration test. |
| 12 | Parity harness scheduled after tickets that require it (cycle) | k3 #3, gpt #3 (merged) | **ACCEPT** | MG-11/12 criteria referenced a harness created by MG-16, which depended on MG-11-14 — a cycle. Split MG-16a (pre-port harness + baselines, Wave 4.0, gates the ports) / MG-16b (post-port aggregate report). |
| 13 | Conversation IDs not namespaced by runtime/agent; editorial decision too late | k3 #4 | **ACCEPT** (C3 amended — flagged at top) | v1 and SDK paths use different provisioned agents; one `purpose_key` row cross-wires conversations between runtimes; editorial reads/resumes `workflows.conversation_id` directly (`force-editorial-step.ts:67-99`, verified). Schema now `(purpose_key, gateway, agent_id)` unique; SDK editorial rows in `letta_conversations`; keep/null decision moved from MG-21 to MG-05 (before MG-13). Core C3 default (persist IDs, no backfill, logged name fallback, editorial column kept) stands — amendment, not reversal. |
| 14 | Spike gate contradicts the dependency graph (MG-03 "parallel-safe" vs gate) | k3 #5 | **ACCEPT** | §E gate narrowed to Agent-SDK-dependent tickets; MG-03 (v1-only refactoring) and MG-10a (data source) explicitly pre-gate; MG-05 now depends on MG-01 because the resolver design consumes Q3/Q7. |
| 15 | Per-pipeline rollback flags arrive after the ports that use them | k3 #6 | **ACCEPT** | MG-04 implements + unit-tests the global/per-pipeline resolver and documents all vars in `.env.example`; each port wires its own override; MG-19 executes the drill only. |
| 16 | "Zero cloud cost" not guaranteed by `backend: "local"` | k3 #9 | **ACCEPT** | Today's zero cost comes from the Ollama compose stack (`LOCAL_LLM_MODEL`), not the transport. MG-18 requires an explicit local inference profile; zero-cost claims proven by network instrumentation (no external model calls); otherwise expected inference cost documented. |
| 17 | Translation acceptance can drop languages (ru/ps/ti) | k3 #10 | **ACCEPT** (merged into #5) | MG-08 evidence now baselines all five production languages (sign-off ar/uk/ru, automated ps/ti) before Option A; MG-14/MG-16b enumerate every matrix-routed language; model-tier comparison preserved under Option A. |
| 18 | MG-05 puts Supabase persistence inside the transport package | gpt #4 | **ACCEPT** | `packages/agents/package.json` has no Supabase dependency (verified); ownership lives in `packages/workflows`/`@playground/supabase`. Seam declares the `ConversationStore` interface only; implementation lives with the existing service-role client. MG-05 depends-on MG-01+MG-03 (Q3/Q7 inputs). |
| 19 | Empty corpus scaffold treated as deployable agent behavior | gpt #5 | **ACCEPT** | `skills/{audit,redaction,metadata,translate}/` are empty; `corpus.config.yaml:34` = `scaffold`; `validate-corpus.ts` warns on missing files (all verified). MG-07 now has blocking deliverables: committed SKILL.md files, corpus status flip, provisioning fails on missing skill, validator upgraded to error on missing required skills. |
| 20 | Placeholder RI-1300…1330 presented as real Linear issues | gpt #6 | **ACCEPT** | MiniMax §5 declares those IDs placeholders (verified). Provenance relabeled `D-draft-NN`; only RI-1258…RI-1284 treated as real; RI-1278 duplicate inventory rows flagged (stale-script reading canonical for MG-18). |
| 21 | Tool availability / least-privilege wiring missing from graph | gpt #7 | **ACCEPT** | Session factory with per-workflow `allowedTools` + `permissionMode` added to §B.5/MG-04 (fixture-tested); MG-11 and MG-13 now depend on MG-09 (redaction runs through the editorial path — `simplification.ts` carries `REDACTION_SLASH_COMMAND`, verified); all production sessions go through the tested factory. |
| 22 | MG-15 preserves the last-delta persistence bug | gpt #8 | **ACCEPT** | Route overwrites `finalAssistantContent` per chunk (`route.ts:143-168`, verified) while chunks are token deltas — persists only the last delta. Accumulator/terminal result is now the sole persistence source; multi-delta fixture asserts the complete persisted response. |
| 23 | Soak/baseline criteria not executable (no denominators, windows, tolerances) | gpt #10 | **ACCEPT** | MG-16a delivers the executable observability baseline (committed report command, fixed windows, explicit denominators); MG-19 soak defines per-path minimum successful counts (audit ≥ 30, metadata ≥ 30, editorial ≥ 20, translation ≥ 5/language), numeric tolerances (baseline + 2 pp error rate, + 10% retries), and zero unresolved sandbox-expiry incidents. "One full production cycle" removed. |

**Rejected findings: none.** Every finding was verified against the repo, the source reports, or both before disposition. Two sub-elements were deferred to Phase 0 spikes rather than resolved in-plan: ~~stateless session semantics (Q8, from k3 #1)~~ — **v3: removed (Luis: no stateless mode)** — and — already spike-scoped in v1 — repositories API usage (MG-07 marker).

### v3 Review Dispositions (Luis's PR review + Codex P2s)

| # | Finding | Reviewer | Disposition | Rationale |
|---|---|---|---|---|
| v3-1 | `/root/workspace/playground` reference is a sandbox artifact | Luis (line 6) | **ACCEPT** | Replaced with commit SHA `ae0df943` reference |
| v3-2 | Binding-resolution preamble unclear — `letta_conversations`, "gateway", C1/C2/C3 not defined; MG-06/MG-08 forward references; possibly misplaced | Luis (lines 9-10) | **ACCEPT** | Preamble reworked: terms defined inline (table, gateway = runtime path), section references added (§D.1, §D.2, §D.3), ticket references contextualized |
| v3-3 | letta-client version is old, maybe upgrade before migration | Luis (line 18) | **ACCEPT** (note) | Added note: version is old but migration replaces the entire client surface, so the patch version is not load-bearing |
| v3-4 | Scripts (`list-agents`, `create-local-agents`, `register-metadata-validator-tool`) likely removable | Luis (lines 27, 42, 44, 45) | **ACCEPT** | All three scripts removed — cloud-only, dashboard-defined agents, no local dev. `list-agents` → chat.letta.com; `create-local-agents` → no local dev; `register-metadata-validator-tool` → validator becomes a skill (MG-09) |
| v3-5 | `LETTA_BASE_URL`, `LETTA_ENVIRONMENT` — cloud exclusively, can be removed | Luis (lines 92-94) | **ACCEPT** | Both removed from env contract (§B.3) and code; cloud-only pivot |
| v3-6 | `METADATA_AGENT_ID` — no separate metadata agent in Letta Cloud | Luis (line 95) | **ACCEPT** | `METADATA_AGENT_ID` removed from env contract; metadata uses the same Agathe agent |
| v3-7 | Local inference not needed | Luis (lines 99, 124) | **ACCEPT** | `LOCAL_LLM_MODEL`/`LOCAL_EMBEDDING_MODEL` removed; docker/Ollama stack deleted; no local inference |
| v3-8 | Stick to dashboard-defined agents (not code-provisioned) | Luis (line 126) | **ACCEPT** | MG-07 changed from provisioning script to skills/corpus/shared memory setup; agents stay dashboard-defined |
| v3-9 | Use shared memory repos + agent memory, no v1-style memory | Luis (line 127) | **ACCEPT** | Frozen memory blocks replaced by shared memory repositories (MG-07); §B.2 mapping updated |
| v3-10 | Investigate if run IDs are fundamental or removable | Luis (line 129) | **DEFER** (spike Q2) | Added investigation note to Q2 and §B.2 mapping table; spike Q2 already covers usage observability and will determine if run IDs are needed in the SDK model |
| v3-11 | No need to reproduce stateless true in v2 | Luis (line 139) | **ACCEPT** | `stateless: true` mode, spike Q8, and risk R13 all removed; workers are stateful |
| v3-12 | SSE example should stream progressively, not collectTurn-only | Codex P2 (line 215) | **ACCEPT** | SSE consumer example rewritten to forward SSE frames during the `streamTurn` loop AND accumulate for persistence |
| v3-13 | `resolveConversation` must key on `(purpose_key, gateway, agent_id)` | Codex P2 (line 378) | **ACCEPT** | Resolver signature updated to include `agentId`; rationale documented (agent rotation prevents cross-wiring) |
| v3-14 | Normalize retry threshold per-request, not absolute counts | Codex P2 (line 510) | **ACCEPT** | MG-19 and §I soak criteria changed from "retry counts within baseline + 10%" to "retry rate ≤ baseline + 10% expressed as retries per request" |

### N. Provenance Notes

#### Gemini 3.7 Flash High Teamwork Report (v2)

A fourth adversarial review was conducted using Gemini 3.7 Flash High in teamwork mode (22-ticket decomposition, 8-risk register, 10 breaking-change matrix). The report was reviewed for technical content and format improvements.

**Format improvements adopted (applied in v2):**
1. **Rollback column added to risk register (§C)** — each risk now has a concrete rollback procedure alongside its mitigation.
2. **Required-action column added to breaking-changes matrix (§C.2)** — each breaking change now specifies the concrete migration action.
3. **Concrete code example added to adapter seam (§B.5)** — `streamTurn` generator + SSE-route consumer showing the canonical content contract and persistence fix.
4. **Acceptance criteria converted to `- [ ]` checklist format** across all 24 tickets — improves trackability during implementation.

**Technical content declined (with reasons):**
- **Assumes `dispositifs` in Supabase** — incorrect; the data lives in MongoDB (`packages/mongo/src/dispositifs.ts:69`), already addressed in R7/MG-10a.
- **Assumes fan-out is active** — incorrect; `fanOutDiRecordsStep` is commented out in `pipelines/ingestion/di-ingestion.ts`, already documented in §A.5 and MG-17.
- **Misses the SSE overwrite bug** — the teamwork report does not identify the `route.ts:143-168` per-chunk overwrite defect; this was found by gpt #8 and is addressed in MG-15.
- **Misses the 7-vs-5 language agent discrepancy** — the teamwork report does not surface the `languages.ts` config drift; already addressed in R5/MG-08.
- **Recommends `stateless: true` in RISK-06** — incorrect; ~~stateless sessions suppress memory/skills instructions (R13, k3 #1); workers default stateful~~ **v3: stateless mode removed entirely (Luis).**
- **Rates SSE frontend risk too high** — the SSE route has no in-repo frontend caller (§A.6); risk is Low, not High.

#### Luis's PR Review + Codex P2s (v3)

A fifth review round was conducted by Luis Arias (PR #321, CHANGES_REQUESTED, 19 inline comments) and the Codex connector bot (3 P2 findings). All 22 findings were accepted or deferred; dispositions in the v3 section of §M.

**Structural changes adopted in v3:**
1. **Cloud-only pivot** — removed local dev stack (docker/Ollama), `LETTA_BASE_URL`, `LETTA_ENVIRONMENT`, `LOCAL_LLM_MODEL`/`LOCAL_EMBEDDING_MODEL`, `backend: "local"`/`"remote"` options, scripts `list-agents`/`create-local-agents`/`register-metadata-validator-tool`.
2. **Dashboard-defined agents** — agents stay in the Letta Cloud dashboard; MG-07 changed from code provisioning to skills/corpus/shared memory setup.
3. **Shared memory repositories** — frozen memory blocks replaced by shared memory repos + agent MemFS (MG-07).
4. **Stateless mode dropped** — Q8, R13, and all stateless references removed; workers are stateful.
5. **SSE progressive streaming** — SSE consumer example fixed to forward frames during the streamTurn loop (Codex P2).
6. **3-column conversation lookup** — `resolveConversation` keys on `(purpose_key, gateway, agent_id)` (Codex P2).
7. **Per-request retry threshold** — soak criteria normalized to retries per request, not absolute counts (Codex P2).
