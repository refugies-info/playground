# v1 removal and backup of resources

> **Section §10 — imminent shutdown, backup plan and continuous detection of API outages.**

---

## 10. Schedule constraint — gradual removal and the imminent legacy API shutdown

> **Fact**: Luis indicated on 17/09/2026 that there is **no firm date**, but that the legacy API shutdown is **coming soon**.
> **Consequence**: any phase conditioned on “two weeks of stable production” can no longer be scheduled as things stand. This is not a failure of the plan: it is an **external constraint** to absorb.

### 10.1 Risk escalation

| Risk | With no known deadline | With imminent shutdown |
|---|---|---|
| Fallback used during API downtime | Acceptable | **Production outage** |
| Delayed parity validation | Opportunity cost | Risk of a rushed cutover |
| Postponed purge of Cloud resources | Technical debt | **Possible permanent loss** |
| Partial, long-lived migration (two runtimes) | Acceptable | Permanent risk zone |
| Resuming v1 conversations ([§5.3](01-decision.md#s53)) | Acceptable | ⚠️ Keep it **exceptional**: over-attaching peer memory means paying for backward compatibility indefinitely |

<a id="s102"></a>

### 10.2 What actually changes

**a) PR-01 becomes the immediate priority.**
Recovering and labeling the authoritative resources (memory blocks, instructions, personas, inventory) is no longer a documentation task: these are **pre-shutdown backups**. If the API shuts down before the actual content of the production agents has been extracted and verified, that content is **permanently lost**.

**b) The “four phases before a single write” sequencing is too slow if shutdown is very close.**
Recommended split:

| Wave | Content | Rationale |
|---|---|---|
| **V1 — Backup and conversion** | PR-01 (inventory, official export, **conversion to markdown**) | Irreversible if missed: past the shutdown, the legacy knowledge can no longer be recovered |
| **V2 — Secure minimum viable** | PR-04, PR-05, PR-11, PR-09 — **PR-01 blocks PR-09**, **PR-04 declares the interface**, **PR-11 provides the content** | Controlled fallback + SDK adapter able to read the converted knowledge |
| **V3 — Data safety** | PR-06, PR-07, PR-08 | Can follow the transport cutover **if and only if** activation stays manual, low-volume, on controlled records |
| **V4 — Quality and generalization** | PR-02, PR-03, PR-10 … PR-21 | Can continue after the cutover |

**c) “AI continuity” and “editorial continuity” are two distinct objectives.**
If shutdown happens earlier than expected:

- ✅ **Manual** publication, editing, validation and translation continue.
- ❌ **Automated** audit, metadata, rewriting and translation stop.
- ✅ Nothing is lost if the data is sound and restorable.

This is the **only** tenable guarantee. It must be explicitly accepted by the editorial team, not just by the engineering team.

**d) Escalation trigger.**
As soon as Letta announces a date — **or** if no timeline is provided within two weeks — switch to “fast exit” mode: lighten the heavy qualification (PR-19) in favor of a narrow manual pilot on a single record, with immediate rollback.

### 10.3 What **not** to do under pressure

| Temptation | Why it is dangerous |
|---|---|
| Switching automated translations at the same time as the audit | Overwrites `translation_records.markdown` — irreversible without a snapshot |
| Enabling metadata regeneration without a snapshot of the overrides | Erases human corrections — not reversible by rollback |
| Enabling ingestion fan-out | Multiplies generations before safeguards are in place |
| Deleting v1 scripts and resources to “clean up” | Removes the only remaining fallback path |
| Migrating the whole automation in a single PR | Makes regression attribution impossible |

<a id="s104"></a>

### 10.4 Resource backup plan (to be done **before** any other work)

1. Inventory the production agents: IDs, models, last sync dates.
2. **Acquire the official tool** `backing-up-cloud-agents` (skill from the Letta v1→v2 guide, [§3.4-b](02-current-state.md#s34)) rather than writing a home-grown exporter.
3. **Pause each agent** before the export: stop turns, memory edits and scheduled activities, then wait for pending memory pushes to finish (the tool is not transactional).
4. Export to a **private directory, outside the repository and outside any shared-memory checkout**: messages, metadata and memory may contain secrets.
5. Extract the actual content of the memory blocks / instructions / personas, with its exact provenance.
6. Tag each resource: repository content / derived / frozen / obsolete.
7. **Restore the export into a fresh agent** to prove that restoration works — do not settle for an untested export.
8. Keep the original agent and the backup until the restored agent is validated.
9. **Convert the resources to markdown** in the format expected by the SDK: `system/<label>.md` with `description` frontmatter ([§3.4-h](02-current-state.md#s34)). This is the step that makes the knowledge **readable by the new agents** — without it, the backup preserves unusable content.
10. **Probe the feasibility of the conversion** on a non-critical agent before processing the whole set ([§3.4-h](02-current-state.md#s34)).
11. Have the extracted content reviewed by the editorial leads: an unverified export remains an unreliable export.

> ️ **What the tool does not restore** (documented by the guide): messages, secrets, tools, connections, shared-memory repositories, schedules and archival memory. These must be reconfigured manually — to be folded into the PR-20 procedure.

> **Without this backup, the migration could have succeeded technically and lost the domain knowledge.** This was the project's main risk — it has been addressed since 18/09/2026 (below).

> ✅ **Backup completed on 18/09/2026** ([§3.5](03-production-agents-audit.md)): the eight production agents were
> cloned from `https://api.letta.com/v1/git/{agent-id}/state.git`, i.e. ≈ 176 KB of
> domain knowledge with Git history. **The risk of permanent loss is lifted.**

> ⚠️ **But a backup is not a migration.** Memory is already in Git/MemFS format,
> so directly usable by an SDK agent. The remaining work is to
> **unify the two formats** that coexist in production — `skills/` for six agents,
> `system/` alone for `ru` and `uk`. That is a design decision, no longer a race
> against shutdown.

<a id="s105"></a>

### 10.5 Continuous detection of API outages

Since the removal is **incremental** (one historically documented route has already returned HTTP 400 since 17/07/2026, [§3.4-a](02-current-state.md#s34)) and not a single cutover:

1. Add a **probe** that periodically checks that the legacy routes still used by the code respond.
2. Alert the team as soon as a route starts failing, **before** production hits it.
3. Immediately reclassify the corresponding wave as urgent.
4. Document the routes that are already dead so they are not rediscovered during an incident.

This is the most useful protection against the absence of a firm date: shutdown cannot be planned, but it can be **detected early**.
