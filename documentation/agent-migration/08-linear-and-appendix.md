# Linear organization and appendix

> **Sections §8 and §11 — milestones, TEC issue template, critical path, sources and limitations of the analysis.**

---

<a id="s8"></a>

## 8. Linear project organization

### Milestones

1. **Feasibility confirmed** — PR-01 to PR-03.
2. **Rollback and integrity available** — PR-04 to PR-08.
3. **SDK and knowledge ready** — PR-09 to PR-12.
4. **Flows migrated, disabled by default** — PR-13 to PR-18.
5. **Acceptance testing accepted** — PR-19 and PR-20.
6. **Cutover and observation** — OPS-01 to OPS-03.
7. **Removal of the historical path** — PR-21 + closure.

### TEC issue template

- **Problem and objective**
- **Scope / out of scope**
- **Affected user flow**
- **Planned changes**
- **Blocking dependencies**
- **Acceptance criteria** (checkboxes)
- **Expected tests and evidence**
- **Data / security / i18n / RGAA impact**
- **Rollback procedure**
- **Owner and required approval**

### Critical path

```text
Inventory + baseline + feasibility
                 ↓
Contract v1 + routing + operations + safe writes
                 ↓
SDK + knowledge + validation
                 ↓
Migration of flows
                 ↓
Acceptance testing + rollback exercise
                 ↓
Pilot → extension → observation
                 ↓
Removal of the historical path
```

The corpus, the baseline and the spike can proceed **in parallel**. Flows can be split once the shared contracts have stabilized.

### Branch and title convention

- Branches: `luis/tec-<n>-<slug>` — the TEC prefix enables automatic linking when the GitHub integration covers the correct repository.
- PR titles: Conventional Commits format, for example `feat(agents): implement the Letta Agent SDK adapter (TEC-XX)`.
- Each PR references its issue.

---

<a id="s11"></a>

## 11. Appendix — Sources and limitations of the analysis

### Official sources consulted (17/09/2026)

- Official v1 → v2 migration guide (Letta repository) — <https://github.com/letta-ai/agent-v1-to-v2-migration-guide> (reviewed on 18/09/2026, commit `61693d0`)
  - Migrating folders → repositories — `filesystem/README.md`, `filesystem/v1_example.ts`, `filesystem/v2_example.ts`
  - Backing up and restoring Cloud agents — `.agents/skills/backing-up-cloud-agents/SKILL.md` + `references/format.md`
  - Migrating PostgreSQL agents → local backend — `.agents/skills/migrating-v1-postgres-agents/SKILL.md` + `references/format.md`

- Agent SDK overview — <https://docs.letta.com/agent-sdk/index.md>
- Deployment, sandboxes and recovery after expiration — <https://docs.letta.com/agent-sdk/deployment/index.md>
- Sessions, turns and durability — <https://docs.letta.com/agent-sdk/sessions/index.md>
- Sending messages, events, message identity — <https://docs.letta.com/agent-sdk/messages/index.md>
- SDK reference (client, session, options) — <https://docs.letta.com/agent-sdk/reference/index.md>
- Permissions — <https://docs.letta.com/agent-sdk/permissions/index.md>
- MCP and client tools (execution and lifecycle) — <https://docs.letta.com/agent-sdk/mcp/index.md>
- Memory, MemFS and dreaming — <https://docs.letta.com/agent-sdk/memory/index.md>
- Shared memory repositories — <https://docs.letta.com/agent-sdk/repositories/index.md>

### Verifications performed

- Read of the code at revision `112228bf`: `packages/agents`, `packages/workflows`, `apps/frontend/src/app/api`, `packages/shared/src/constants`, `supabase/migrations`.
- Review of the published metadata of the `@letta-ai/letta-agent-sdk` package on the npm registry (latest version, dependencies, Node constraint).
- Read of the official documentation listed above.

### What was not done

- No test, build or lint was run.
- No database (Supabase, MongoDB) was queried. **Update of 22/09/2026:** the production
  Supabase database has since been audited live via MCP ([§3.3.1](02-current-state.md)) —
  production matches the repository migration chain.
- No Letta Cloud resource was inspected (agents, memories, tools, conversations).
- No verification of the actual Vercel execution limits.
- No external confirmation of the historical API support policy.

**Consequence:** the sequencing and safety recommendations are solid on the basis of the code read; decisions D (backend) and C (fallback window) depend on external verifications that remain to be carried out in phase 0.

---

 Generated with [Letta Code](https://letta.com)
