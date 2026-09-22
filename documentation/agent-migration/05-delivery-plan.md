# Delivery plan — phases and PRs

> **Section §6 — seven phases (0 to 6), 21 planned PRs and exit criteria.**

---

## 6. Breakdown into phases and PRs

> References **PR-01 … PR-21** are **planning markers**. They are neither GitHub numbers nor existing TEC tickets. Each line becomes a Tech issue.
> Cutovers and observation periods become separate operations issues: they do not artificially require a PR.

### Phase 0 — Establish the facts and prove feasibility

#### PR-01 — `docs(agent-migration): update the migration scope and facts`

**Content**
- Reconcile code, deployed configuration, dashboard agents, languages and models.
- Reconcile the deployed Supabase schema with the committed migration chain; record the target
  environment and migration version used by every later database change.
- Document the support window of the legacy API and the degraded mode.
- Identify the authoritative editorial sources.
- Explicitly separate: validated decisions / assumptions / feasibility questions.
- **Integrate the official Cloud agent backup tool** (skill `backing-up-cloud-agents` from the Letta v1→v2 guide, [§3.4-b](02-current-state.md#s34)) rather than writing a homegrown exporter.
- **Probe the legacy routes** still used by the code (continuous detection, [§10.5](07-v1-removal-and-backup.md#s105)).

**Acceptance criteria**
- [ ] **Obsolescence status written into the document itself**: deprecation header, stated replacement, procedure for recovering the inventory into the new home. Do not leave an obsolete plan as the default source of authority.
- [ ] **Tagging of frozen resources**: mark on each Letta Cloud resource (memory blocks, agents) its last synchronization date with the repository and its frozen nature, as well as **the recovery procedure if the API is shut down**. This is the most immediately useful deliverable.
- [ ] **Backup export performed for each production agent** via the official tool, agents paused, private folders outside the repository ([§10.4](07-v1-removal-and-backup.md#s104)).
- [ ] **Conversion probe run on a non-critical agent** ([§3.4-h](02-current-state.md#s34)): are the memory blocks readable in the export, and is the agent memory accessible in Git?
- [ ] **Conversion path decided** (A original documents / B backup / C copy-paste) and **justified in writing**. The official conversion logic blocks → `system/<label>.md` is documented, but it reads PostgreSQL: if it is not reusable, our own conversion must be written.
- [ ] **v1 agent resources converted to markdown** in the `system/<label>.md` format with `description` frontmatter, in a versioned Git repository.
- [ ] **Documented gap** between the converted resources and the original documents, in other words: the gap between what actually ran in production and the reference editorial source.
- [ ] **Editorial review** of the converted resources performed by a referent.
- [ ] **Restoration proven** in a fresh agent, with the known exclusions (messages, secrets, tools, connections, shared repositories, schedules, archival memory) listed for PR-20.
- [ ] **`folders` route confirmed dead** and no usage in the code (already verified on 18/09: no usage).
- [ ] **Legacy route probe** in place, with an alert before production impact.
- [ ] Complete matrix of the flows: active, dormant, to be removed.
- [ ] Agent IDs, languages and models reconciled with the configuration actually deployed.
- [ ] Knowledge sources identified and the status of each made explicit.
- [ ] **Production is the verified schema baseline** ([§3.3.1](02-current-state.md)):
  production matches `main` (93/93 migrations, 22/09/2026 audit); re-audit it before PR-06.
- [ ] Each **production** security-advisor finding that affects the migration boundary has an
  explicit outcome: remediated before PR-06 or accepted with a documented owner and rationale.
- [ ] No production agent change.

**Dependencies:** none. **Blocks PR-09** ([§3.4-d](02-current-state.md#s34)).

#### PR-02 — `test(agents): establish the non-regression baselines`

**Content**
- Representative, anonymized corpus: audit, metadata, writing, translations.
- Edge cases: invalid frontmatter, missing `---`, nested directives, duplicates, long content, RTL / complex languages.
- Transport fixtures and assertions on the current business contracts.

**Acceptance criteria**
- [ ] Baseline recorded **before** any behavior change.
- [ ] Comparison on structured data, business decisions and editorial quality — not on raw textual equality.
- [ ] Every language actually enabled is covered.
- [ ] Known defects are listed and distinguished from behaviors to preserve.

**Dependencies:** PR-01.

#### PR-03 — `test(agents): validate the SDK in the Vercel runtime`

**Content**
- SDK version pinned and compatible with the maturity policy.
- Isolated trial, with dedicated evaluation agents.
- Next.js build and execution of a **real Vercel Workflow step**.
- Measurement of sandbox startup, turn duration, execution limits.
- Tests for cut-off after send, resume, cancellation, permissions, usage reporting.

**Acceptance criteria**
- [ ] Proof of compatibility for the chosen version (not merely reading the types).
- [ ] Verification that **skill** content is actually accessible in the sandbox — that is, that the loading mechanism works, independently of our content, which arrives in PR-11.
- [ ] No paid call or business effect triggered from the production routes.
- [ ] Written **go / no-go** decision.

**Dependencies:** PR-01; PR-02 for representative trials.

**🚦 Exit gate:** if Vercel is unsuitable, return to an architecture decision. **Do not implicitly introduce a GCP worker**: that is a separate project.

---

### Phase 1 — Build the shared safeguards and the rollback

#### PR-04 — `refactor(agents): isolate v1 calls behind an application contract`

**Content**
- Centralize calls, events, errors and results in `packages/agents`.
- Remove the dependency of the workflows on the error classes specific to the legacy client.
- Keep only the active v1 implementation.

**Acceptance criteria**
- [ ] Business behavior unchanged; PR-02 baseline preserved.
- [ ] No client/session object carried in the persisted arguments of a workflow.
- [ ] The API-first types allow Vercel-compatible bundling.
- [ ] **Knowledge supply interface defined**: each flow declares which instruction content it expects (skill name, memory file, or repository identifier), without presuming the SDK. The adapter implementation is delivered in PR-11.
- [ ] In line with [§5.3](01-decision.md#s53): the interface accepts **a read-only v1 counterpart memory** and designates it as such, so that the new agent can identify its predecessor in natural language.

**Dependencies:** PR-02. Can proceed in parallel with the spike.

#### PR-05 — `feat(agents): add controlled routing and generation shutdown`

**Content**
- Server-side selection per flow; **per-language** granularity for translations.
- Proposed controls: `v1`, `agent-sdk`, `paused`.
- Authenticated, audited dynamic configuration with deterministic priority.
- The `paused` mode blocks new generations but keeps the safe editorial functions.

**Acceptance criteria**
- [ ] v1 remains the default.
- [ ] The SDK cannot be enabled before its adapter exists.
- [ ] A routing change is verifiable **without assuming** that a Vercel environment modification is instantaneous.
- [ ] If the configuration is unreadable, no implicit SDK activation (conservative behavior).
- [ ] Emergency shutdown tested.

**Dependencies:** PR-04.

#### PR-06 — `feat(workflows): persist operations and conversations`

**Content**
- Additive migrations for operations and conversation mappings.
- Uniqueness and lookup on `(purpose_key, runtime, agent_id)`.
- Preservation of the existing editorial references.
- Atomic acquisition of an operation, concurrency control, protection against stale attempts (lease / fencing).

**Acceptance criteria**
- [ ] Two identical requests do not create two active operations.
- [ ] A deliberate regeneration remains possible on the same source.
- [ ] Retries preserve runtime, agent and request identity.
- [ ] Earlier workflows, without the new fields, remain interpretable as v1.
- [ ] **For [§5.3](01-decision.md#s53)**: the mapping between a generation's conversation and its agent is persisted; in case of ambiguity (multiple agents, or agent not found), the resume is **explicitly blocked**, never resolved by assumption.
- [ ] **The identity of the agent owning the conversation is read back from the conversation itself** (`agent_id`), never inferred from the summary or the name.
- [ ] **Conversation resolution precedes workflow startup**: an impossible resume must fail before any work is started.
- [ ] The UI can display the origin of a resume **when the product signaling is retained** ([§5.3](01-decision.md#s53)), without the mechanism depending on that decision.
- [ ] RLS, permissions and migrations tested; `supabase db reset` verified.
- [ ] Migration written against the re-audited production baseline (verified: production matches
  `main` as of 22/09/2026), not inferred only from generated TypeScript types.
- [ ] Existing conversation IDs are preserved when valid; missing IDs are not backfilled by
  guessing from names, timestamps or neighboring reports.
- [ ] Legacy workflows are classified explicitly as resumable, eligible for a fresh conversation,
  terminal, or requiring manual reconciliation — at production scale: 2,823 workflows, only 152
  with a conversation ID ([§3.3.1](02-current-state.md)).

**Dependencies:** PR-04, PR-05, PR-03 conclusions.

#### PR-07 — `fix(workflows): secure writes and preserve previous versions`

**Content**
- Separate **generated result** and **business activation**.
- Back up the replaced values: translations, metadata overrides, links, statuses.
- Atomic commit with verification of the source version **and** the target revision.
- Make automatic report selections compatible with quarantine and restoration.

**Acceptance criteria**
- [ ] A discarded report is not reactivated by a subsequent backup.
- [ ] The deployed `link_letta_reports_to_editorial_record()` trigger is removed or constrained so
  that it cannot override an explicitly selected or quarantined report.
- [ ] A concurrent human modification is never overwritten.
- [ ] A failure between generation and persistence does not automatically trigger a new generation.
- [ ] A stale attempt can modify neither content nor status.
- [ ] Selective restoration demonstrated on a translation and on metadata overrides.

**Dependencies:** PR-06.

#### PR-08 — `fix(workflows): make operation cancellation and resume reliable`

**Content**
- Explicitly separate: application cancellation, Vercel cancellation, transport cancellation.
- Operable states: **uncertain send**, cancellation requested, reconciliation required.
- Handle abandoned `generating` / `pending` sentinels.
- Reconciliation tied to the operation, rather than to a time window.

**Acceptance criteria**
- [ ] A late response after cancellation does not become active.
- [ ] The absence of remote shutdown confirmation is not proof of shutdown.
- [ ] No blind retry after an uncertain send.
- [ ] Blocked generations are visible and recoverable by operations.
- [ ] Fencing protects the data **even if** the remote generation continues.

**Dependencies:** PR-06, PR-07.

---

### Phase 2 — Add the SDK and the necessary knowledge

#### PR-09 — `feat(agents): implement the Letta Agent SDK adapter`

**Content**
- `LettaAgentClient` (backend to be decided in PR-03).
- Creation / resumption of conversations according to the persisted mappings.
- `send()` + **complete** consumption of `stream()`, terminal result, session cleanup.
- Typed errors, bounded retry policy, documented resume.
- Explicit tool list and permission policy.
- `otid` for correlating sends.
- **Effective supply of the knowledge** declared by the PR-04 interface, from the content produced in PR-11.

**Acceptance criteria**
- [ ] SDK disabled by default.
- [ ] No duplication of fragments + terminal result.
- [ ] A failed terminal never produces a successful business result.
- [ ] Sessions closed on success, error and cancellation (`await using`).
- [ ] No business write tool or database secret exposed to the model.
- [ ] No interactive approval likely to block a server-side processing indefinitely.
- [ ] `resumeSession` after an unexpected close covered by a test.
- [ ] **A real SDK session sees the flow instructions** — verified by a test, not by reading configuration. Without this assertion, an adapter can be "green" while producing uninstructed agents.

**Dependencies:** PR-03 to PR-08, **PR-01 (blocking) and PR-11 (blocking)**. The knowledge must be materialized on the Git side before an SDK adapter reads a memory: the legacy API and the SDK write to two different stores ([§3.4-d](02-current-state.md#s34)). Without PR-01 or PR-11, the SDK agent starts **without instructions** and produces silently degraded output.

#### PR-10 — `feat(agents): trace executions and their consumption`

**Content**
- Correlation operation ↔ Vercel workflow ↔ conversation ↔ Letta runs.
- Metrics per runtime / flow / language: success, latency, retries, sandbox time, uncertain results.
- Traceability: SDK version, observed model, knowledge release.

**Acceptance criteria**
- [ ] No internal reasoning, secret or full document in ordinary logs.
- [ ] Unknown usage represented by `null`, **never** by zero.
- [ ] `token_cost` remains identified as **token counting**, not as a monetary amount.
- [ ] No business need depends on a return to the legacy APIs to obtain an optional metric.

**Dependencies:** PR-06, PR-09.

#### PR-11 — `feat(agents): version and distribute the editorial knowledge`

**Content**
- Controlled retrieval of the authoritative instructions and resources, according to the path decided in PR-01 (original documents / agent backup / copy-paste — [§3.4-h](02-current-state.md#s34)).
- Audit, writing, metadata and translation skills, with their references.
- Distribution via agent memory and/or shared memory repositories.
- Release manifest and restoration procedure.
- Isolation of the v1 knowledge and of the evaluations.

**Acceptance criteria**
- [ ] An empty or incomplete corpus makes validation **fail** (the current validator does not detect an empty corpus).
- [ ] Historical drafts are not presented as production exports.
- [ ] Each skill is effectively accessible in a real SDK session.
- [ ] **The supplied content matches the interface declared in PR-04**: each flow actually receives the knowledge it expects.
- [ ] **`system/<label>.md` format respected** for resources originating from legacy blocks, with `description` frontmatter ([§3.4-h](02-current-state.md#s34)).
- [ ] **The two coexisting memory generations are supported** ([§3.5](03-production-agents-audit.md)): `skills/<nom>/SKILL.md` (agathe, ar_v2, en, fa, ps, ti) and instructions in `system/*.md` only (`ru`, `uk`).
- [ ] **The pointer to the counterpart lives in the memory, not in the code.** A memory file of the new agent references the v1 counterpart memory and gives it a usage name ("your v1 predecessor"). Goal: a **rule change requires no code modification and no skill redeployment**. Corollary: the resume policy is governed by data, and therefore subject to the same editorial control as the rest of the knowledge.
- [ ] Normative knowledge in read-only mode for the agents wherever possible.
- [ ] No modification of the fallback agent without a verified reversible procedure.
- [ ] Dashboard drift controlled during the cutover (freeze or explicit detection).

**Dependencies:** PR-01 (**blocking**: converting the resources is its deliverable), PR-03, PR-04 (the supply interface must exist before the content). Can proceed in parallel with phase 1.

#### PR-12 — `feat(agents): make metadata validation deterministic`

**Content**
- Turn the agent validation protocol into a skill.
- **Keep a mandatory application-side validation**, independent of the agent's goodwill.
- Serialize the data **sanitized** by the schema.
- Prepare the removal of the Python registration script (after the fallback window).

**Acceptance criteria**
- [ ] The agent forgetting the skill does not allow invalid metadata to be activated.
- [ ] Schema transformations are present in the persisted result.
- [ ] An invalid output leaves the human overrides and the previous links intact.
- [ ] The v1 path remains available during the fallback window.

**Dependencies:** PR-07, PR-09, PR-11.

---

### Phase 3 — Migrate the flows, without enabling them globally

#### PR-13 — `feat(agents): migrate the editorial audit to the SDK`

**Content**
- Forced audit, identified single-record and batch paths.
- Compliance contract + duplicate detection preserved.
- Access limited to the necessary duplicate candidates.

**Acceptance criteria**
- [ ] `compliant=true` **and** `duplicate=false` remain required for the compliant status.
- [ ] Parity on the reference corpus.
- [ ] No dependency on a Supabase `dispositifs` table assumed to exist.
- [ ] `publication_records` is not treated as the authoritative RI duplicate corpus: the
  production audit found only local publication history, not a synchronized copy of karfur
  dispositifs.
- [ ] The current search service is kept, or replaced only if its incompatibility is demonstrated.
- [ ] Automatic fan-out still disabled.

**Dependencies:** PR-09 to PR-11 + phase 1 safeguards.

#### PR-14 — `feat(agents): migrate metadata generation to the SDK`

**Content**
- Forced metadata and other preserved paths.
- Publication via the transactional commit.
- Respect for the active source / pending source distinction.

**Acceptance criteria**
- [ ] A generation never attaches to the wrong ingestion version.
- [ ] A failure leaves the previous report usable.
- [ ] Any planned removal of human overrides is **historized and restorable**.
- [ ] v1 / SDK comparison validated.

**Dependencies:** PR-12.

#### PR-15 — `feat(agents): migrate editorial rewriting to the SDK`

**Content**
- Keep the POST → workflow → result consultation path.
- Replace the transport and wire up cancellation / reconciliation.
- Preserve the resume of the interface after a reload.

**Acceptance criteria**
- [ ] Two concurrent requests do not cancel each other without an explicit rule.
- [ ] Consultation of a result is authorized via **its exact operation**.
- [ ] No attachment to a neighboring report by temporal approximation.
- [ ] The editor keeps the decision to apply the proposal.

**Dependencies:** PR-09, PR-10, PR-11 + phase 1.

#### PR-16 — `feat(agents): migrate translations without changing their topology`

**Content**
- Keep the agents / languages actually configured.
- Switch **each language independently**.
- Protect text, status and assignment against stale results.
- Keep the regeneration rules recently fixed on `main`.

**Acceptance criteria**
- [ ] Complete matrix of the enabled languages + explicit behavior of the non-configured languages.
- [ ] Links, directives and Markdown structure preserved.
- [ ] Editorial validation per language.
- [ ] Previous content restorable without overwriting a later human correction.
- [ ] A stale attempt cannot change the status, reassign a translator, or trigger a new Airtable send.
- [ ] **Resume of a conversation from a previous generation** ([§5.3](01-decision.md#s53)): the history is read without being rewritten, a new conversation is opened by the current agent, and the resume remains **exceptional**. Bulk attachment of a counterpart memory is a sign of over-attachment to be corrected, not a behavior to validate.
- [ ] Uncertain external effects reconcilable — without promising an undemonstrated "exactly once".

**Dependencies:** PR-09 to PR-11, PR-07, PR-08.

#### PR-17 — `fix(api): secure and adapt the metadata SSE stream`

**Content**
- Verify the real consumers of the route.
- If kept: authentication, record authorization, shared transport, correct accumulation, reliable persistence.
- If unused: controlled removal rather than a pointless migration.

**Acceptance criteria**
- [ ] An unauthorized user can neither start nor read a generation.
- [ ] Progressive display preserved if the route remains exposed.
- [ ] The persisted content is **complete**.
- [ ] The end of the transport does not mask a persistence error.
- [ ] Disconnection and late result covered by the tests.

**Dependencies:** PR-14. **The authorization fix can be extracted immediately** if the route is exposed in production.

#### PR-18 — `refactor(scripts): adapt the operations tools to the shared contract`

**Content**
- Migrate `force-metadata-reports` to the same safeguards.
- Make the operations scripts compatible with routing, pause and operation identity.
- Inventory the deferred removals (local agents, Docker/Ollama, old scripts, dead configuration).

**Acceptance criteria**
- [ ] No script bypasses the concurrency or rollback controls.
- [ ] Operations trials perform no surprise writes.
- [ ] Resources still required for the v1 fallback are not removed prematurely.

**Dependencies:** PR-14 + phase 1.

---

### Phase 4 — Qualification and cutover preparation

#### PR-19 — `test(agents): qualify parity, load and recovery after failure`

**Content**
- v1 / SDK comparisons on a production-like dataset, on frozen inputs.
- **SQL and agent memory** isolation.
- Gradual load tests.
- Fault injection: cut-off after send, crash before commit, late result, cancellation, concurrent human edit.

**Acceptance criteria**
- [ ] No RI publication or real Airtable write from the comparison bench.
- [ ] No mixing of conversations, records or languages.
- [ ] No overwriting of human work.
- [ ] No uncertain result accepted as a success.
- [ ] Quality / latency / consumption report with a **go / no-go** decision.

**Dependencies:** flows to enable, PR-10.

#### PR-20 — `feat(ops): finalize the cutover and restoration procedures`

**Content**
- Operable procedures: pause, diagnosis, reconciliation, restoration.
- Identified dual-runtime fallback application artifact.
- Compatibility check of the **already-started workflows** with the new deployments.
- Documentation of responsibilities and accesses.

**Acceptance criteria**
- [ ] Production-like rollback rehearsal run end to end.
- [ ] Restoration of a translation **and** of metadata overrides demonstrated.
- [ ] An editorial backup after restoration does not reactivate a quarantined report.
- [ ] A concurrent human modification is preserved.
- [ ] Resume of a workflow **prior to the deployment** verified.
- [ ] Manual path usable if v1 and the SDK are unavailable.

**Dependencies:** PR-19.

---

### Phase 5 — Progressive operational cutover

> **Operations** issues, not necessarily new PRs.

**OPS-01 — Internal pilot.** Identified users and records; a single runtime per request; priority to explicitly triggered generations; no automatic fan-out.

**OPS-02 — Extension per flow and per language.** Proposed order: forced audit → forced metadata → rewriting → translations (language by language). Each extension requires a review of the previous stage. Routing remains reversible **independently** for each flow.

**OPS-03 — Observation and acceptance.** Proposed thresholds, **to be validated before the pilot**:

| Indicator | Proposed condition |
|---|---|
| Integrity | Zero human overwrite, zero record/language mixing, zero activation of a stale result |
| Validation | No invalid result activated |
| Incidents | No uncertain send left unprocessed beyond the agreed delay |
| Reliability | Failure rate ≤ baseline + 2 points, with published volumes and denominators |
| Retries | Measured **per operation**; limit defined before the pilot |
| Latency | p95 under the business SLO, with margin against the Vercel limits |
| Cost | Budget per operation including the sandboxes; absence of data made explicit |
| Observation | Two stable weeks **and** minimum volumes reached |

Indicative starting volumes: 30 audits, 30 metadata generations, 20 rewrites, 5 translations per enabled language.

> These volumes are **operational** criteria, not a statistical proof. If activity is insufficient, **extend the observation** rather than declaring success because two weeks have elapsed.

---

### Phase 6 — Controlled removal of the legacy path

#### PR-21 — `refactor(agents): remove application calls to the legacy API`

**Content**
- Remove the v1 adapter and its direct dependency when it is no longer needed.
- Remove scripts, local configuration and dead entries.
- Update documentation, configuration and operations contracts.

**Acceptance criteria**
- [ ] No direct application call to the legacy surface.
- [ ] Legitimate transitive SDK dependencies are **not** artificially removed.
- [ ] No active workflow still depends on the removed path.
- [ ] Rollback to a known SDK release and the manual mode remain available.
- [ ] Explicit agreement to close the v1 window.

**Dependencies:** OPS-03 accepted.

> **To be handled separately:** the removal of the old Cloud agents, memories and resources. This potentially irreversible cleanup requires an inventory, a backup and explicit authorization; it must not be a side effect of the code PR.
