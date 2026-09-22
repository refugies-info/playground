# Decision and scope

> **Sections §1, §2, §5 and §9 — from the executive summary to the decisions to be made.**

---

<a id="s1"></a>

## 1. Executive summary and recommendation

**Recommendation: a gradual, reversible migration, not a direct replacement.**

The SDK change is, in itself, the **most contained** part of the work: the call surface is concentrated in `packages/agents`, and durable orchestration is already handled by Vercel Workflow, independently of Letta.

The real challenge lies elsewhere: **being able to interrupt, explain and restore an operation without losing editorial work**. The current code has several irreversible effects (overwriting translations, erasing human overrides, automatic report selection, external RI/Airtable effects) that an application-level rollback does not fix.

### Delivery principles

1. **Temporary coexistence.** The two implementations live side by side; each operation uses **a single** implementation, chosen at start-up and kept for all of its retries.
2. **One identified business operation.** An intentional request has a stable identifier, reused by its retries.
3. **Strict separation.** *Re-routing* ≠ *restoring data* ≠ *reconciling external effects*. No global button may claim to undo everything.
4. **Nothing irreversible without evidence.** No deletion of agents, memory or Cloud resources as part of this migration.

### Three trade-offs to confirm before freezing the backlog

These points cannot be settled by reading the code alone. I give a recommendation for each.

| # | Question | Recommendation |
|---|---|---|
| A | **Fallback path isolation.** The conversations of a given agent share its memory: modifying the agent used by v1 during the SDK trials can degrade the fallback. **Added constraint ([§3.4-c](02-current-state.md#s34))**: the legacy path no longer allows **creating** a replacement agent — so isolation cannot be obtained by recreating agents on the v1 side. | Back up the memory of **existing** v1 agents (official tool, [§10.4](07-v1-removal-and-backup.md#s104)) and do not modify it during qualification; use **recent agents** for the SDK trials. |
| B | **Feature freeze.** Parallel developments (retrieval/qmd, translator consolidation, re-enabling the DI fan-out) greatly increase the number of possible causes of a regression. | **Defer** them into separate projects, unless a blocking dependency is demonstrated. |
| C | **Fallback window.** No firm date published, but **shutdown confirmed as imminent by Luis (17/09/2026)**. | Preserve the v1 path at every step, **without planning any comfort period**. Treat the full cutover as **externally dated**; see [§10](07-v1-removal-and-backup.md). |

---

<a id="s2"></a>

## 2. Scope

### In scope

- Introduce an application boundary in `packages/agents` so that we no longer depend directly on the legacy surface.
- Implement a Letta Agent SDK adapter behind that boundary.
- Harden writes (reports, translations, metadata), concurrency and resumption.
- Set up reversible routing and a degraded mode.
- Migrate the active flows one by one: audit, metadata, rewriting, translations.
- Qualify parity in staging and oversee the gradual cutover.

### Out of scope (unless a demonstrated blocker)

- Deploying a Cloud Run worker or a self-hosted App Server.
- Local inference / local development agents.
- Mandatory adoption of qmd or any other indexing engine.
- Consolidating the translators into a single multilingual agent.
- Automatic re-enabling of the DI ingestion fan-out.
- Reworking publication to Réfugiés.info.
- Permanent cleanup of Letta Cloud agents / memories / resources.

> These topics can become separate projects. Piling them into the same migration would make it impossible to identify the cause of a regression.

### Note on the previous plan

The plan carried by PR #321 (and the former Linear project « Migration agent IA — Letta Code SDK et qmd ») is **obsolete** and is not carried over here. Its trade-offs are not considered settled. The legacy inventory nonetheless remains useful as a **source of context** (an inventory of agents, resources and weak points), not as a specification.

---

<a id="s5"></a>

## 5. Recommended target architecture

```text
Playground interface (editor, server actions, API routes)
                          │
                          ▼
                 Vercel Workflow (durability)
                          │
              Persisted business operation
              ├─ request identifier (stable)
              ├─ source + version
              ├─ expected target revision
              ├─ selected runtime (v1 | agent-sdk)
              ├─ agent + conversation
              ─ knowledge release
                          │
                          ▼
             Application boundary (packages/agents)
                  ├─ v1 adapter (legacy)
                  └─ Agent SDK adapter
                          │
                          ▼
             Candidate result + deterministic validation
                          │
                          ▼
             Transactional business commit  ──▶  Supabase / UI progress
```

### 5.1 Proposed data

> The names below are **proposals for new structures**, not existing elements. Reuse the current reports and logs wherever possible, rather than building a complete parallel system.

- **`ai_operations`** — request, attempts, runtime, state, source/target references, result, resumption and restoration information.
- **`letta_conversations`** — mapping between business use, runtime, agent and conversation.

Minimum fields suggested for `ai_operations`: `purpose_key`, `runtime`, `agent_id`, `conversation_id`, `source_id`, `source_version`, `target_revision_expected`, `intent_id`, `attempt`, `state`, `knowledge_release`, `sdk_version`, `uncertain_since`, `superseded_by`.

### 5.2 Mandatory invariants

1. **An intentional request has a stable ID**; its retries reuse it. A **deliberate regeneration** of the same content creates a new request — a key limited to "source + version" would make that impossible.
2. **The runtime is persisted.** A configuration change does not silently switch an attempt already under way.
3. **The agent and the knowledge release are persisted.** A retry must not resolve a new agent ID after a configuration change.
4. **A stale attempt can no longer write** — content, status, assignment, error handler, external send.
5. **A concurrent human edit is protected.** The expected revision is compared before commit or restoration; on divergence, an **explicit conflict**, never an overwrite.
6. **SQL migrations stay additive** during coexistence.
7. **Evaluations do not write a report that can be activated in production.**
8. **Agent generations are distinguished.** A conversation belongs to one generation; it is read, never rewritten by another ([§5.3](#s53)).
9. **Identifiers are distinguished.** Business operation ID, Vercel Workflow ID, conversation ID, any Letta run IDs: these are not synonyms. Letta IDs serve diagnostics, not business identity.

<a id="s53"></a>

### 5.3 Transition between agent generations

Decided with Luis on 18/09/2026. Concerns the resumption of conversations belonging to a legacy
agent by an agent of the new generation.

**A deliberately narrow scope.** The case is **rare**: records still being
drafted or published at the time of the cutover, and targeted annual update
campaigns. It is not a general continuity mechanism.

#### What we did not retain

An **application-level proxy** — where the new agent would relay requests to its v1 counterpart —
was evaluated and then discarded. Three reasons arising from the SDK code (`0.8.3`), not from a
preference:

1. **The SDK resolves the agent from the conversation**, it does not receive it:
   `resumeSession("conv-xxx")` does `agentId = conversation.agent_id`. The SDK therefore
   always talks to the owner of the conversation, never to the new agent.
2. **`agentId` is ignored** as soon as the identifier is a `conv-xxx`: there is no supported
   way to have a conversation handled by another agent.
3. **No extension point** is documented for intercepting conversation creation.
   A proxy would require patching `CloudEnvironmentSession` — unsupported, and broken on
   every SDK version upgrade.

Add to this the doubling of the cost per relayed conversation and the risk of
authorization ambiguity: under which identity does the relay write?

#### What we retained

```text
Legacy conversation (belongs to the v1 agent)
        │
        │ 1. direct read of the history
        ▼
Application orchestrator (Vercel Workflow)
        │
        ├── 2. v1 memory attached to the new agent in READ-ONLY mode
        │      repositories.attach(v1Repo, { permissions: "read" })
        │
        ── 3. new conversation opened by the NEW agent
               (never a thread shared between two identities)
```

**Three native mechanisms, no application-level relay layer:**

| Need | Mechanism |
|---|---|
| The new agent knows its predecessor and what it knew | **Shared memory in read-only mode**: `client.repositories.attach(agentId, repositoryId, { permissions: "read" })` |
| It can ask for a one-off addition | **Sub-agent** authenticated by the runtime (`parent_agent_id`, `is_subagent`) |
| The conversation belongs to the former agent | Read the history, then a **new conversation** opened by the new agent — the two identities never share a thread |

#### Constraints the resumption must respect

1. **The old history is read, never rewritten.** A message sent by the new agent in a v1 conversation would be attributed to the old generation.
2. **Human validation is preserved.** A resumption rewrites neither already-validated content nor a metadata override (invariant 5).
3. **The resumption is explicit.** The user must be able to distinguish it from an ordinary generation. **The exact form of that signalling is to be decided with the product team**: the mechanism is transparent, the display is not necessarily so.
4. **The v1 memory is read-only.** The new agent must not be able to modify the history it consults — otherwise the source of comparison disappears (invariant 3).
5. **Cost and latency documented.** Attaching a memory and reading a history has a token cost; it must be measured before generalisation.

#### Open question — scope of the signalling

The mechanism must be **transparent to the user** in how it works, but one thing remains to be decided:
**where and how should we signal that a record relies on a conversation from the previous generation?**

Options to submit to the product team:
- a discreet mention on the record concerned;
- an indicator in the generation history;
- no signalling at all, the resumption being considered an implementation detail.

**To be decided by the product team.** This decision conditions PR-06 (data model for the mapping between generations) and the display of PR-16.

#### Note — sub-agents and shared memory are broader than this case

These two mechanisms are not specific to the transition: they are the standard way of
making agents cooperate at Letta. What is decided here is **to use them for
the transition rather than a proxy**, not to confine them to it.

---

<a id="s9"></a>

## 9. Decisions to confirm

### Blocking for freezing the backlog

| # | Decision | Recommendation |
|---|---|---|
| A | **Fallback agent isolation** — use agents dedicated to the SDK, or share the v1 agents? **Can no longer be solved by creating agents on the v1 side** ([§3.4-c](02-current-state.md#s34)). | Back up the memory of existing v1 agents; recent agents for the SDK trials. |
| B | **Feature freeze** — qmd/retrieval, translator consolidation, re-enabling the fan-out | Defer into separate projects. |
| C | **v1 fallback window** — duration and availability | **An external constraint, not a project choice**: the shutdown is imminent and has no firm date. The v1 path must be preserved at every step, but **no comfort period can be planned**. See [§10](07-v1-removal-and-backup.md). |
| D | **SDK backend** — `cloud` with a managed sandbox, `cloud` + `computer`, or `remote` (App Server) | To be decided on the results of PR-03: latency, cost, security, and where tool execution takes place. |
| E | **Translator topology** — keep the current configuration or consolidate | Keep it unchanged during the migration; any consolidation is a separate project. |

### Deferred (to be documented, not decided now)

- Relevance of a qmd-style document index for editorial knowledge.
- Evolution of the duplicate-search service (current source vs target).
- Re-enabling of the DI ingestion fan-out, on the basis of measurements.
- Cleanup of legacy Letta Cloud resources.
