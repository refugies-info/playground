# MVP Roadmap – Editorial Workflow

Roadmap derived from `specs/001-editorial-workflow/spec.md`, aligned with Constitution v1.3.3.

## 1. POC (2 sprints)

Goal: validate the six-stage editorial workflow on real RCO data with Supabase Auth from day one, no automated tests, minimum polish.

### 1.a Sprint 1 – "Turborepo Init, Ingest, Sort"

1. **Turborepo + scaffolding** – Initialize monorepo, Supabase project, Letta Cloud agents, and Supabase Auth (editor/admin roles wired to frontend + tools).
2. **Ingest** – Build RCO ingestion + config-driven manual sources with provenance, idempotency, validation surfacing; seed dashboards for ingestion health.
3. **Sort / quality gate** – Letta classifier auto-flags content, stores reasoning, exposes manual override UI + filters; Next.js list view MUST let editors filter items, inspect AI rationale inline, and re-flag items with attribution.

**Sprint 1 Exit:** Editors can authenticate, view unified content list with source traceability, inspect AI reasoning per item, and change flag status (with justification) so accepted vs rejected queues stay trustworthy.

### 1.b Sprint 2 – "Rewrite, Check metadata, Save, Publish"

1. **Rewrite** – Side-by-side AI rewrites, conversational refinement loop, manual fallback, revision tracking, and approval workflow.
2. **Check metadata** – Mandatory metadata mapping UI, configurable schema stub, editor attribution per field, export blockers until validation recorded.
3. **Save & Publish** – Draft/published/archived states with pessimistic locking, Supabase export job with audit trail, basic dashboard for stage counts + productivity.

**Sprint 2 Exit:** ≥3 editors push ≥20 items through rewrite → metadata → publish in <5 minutes/item; Supabase export history captures provenance, AI edits, and approvals.

## 2. MVP

Goal: productionize core workflow and introduce translation capability foundations.

1. **Translations** – Activate multi-language schema already in place: implement translation revisions, translator-facing UI, Letta translator agent with approval gates, and publishing per language (French remains source of truth).
2. **Operational hardening** – CI/CD, observability, richer analytics, metadata schema finalization, ingestion connector expansion.

**Exit:** Stable translation workflows (request, iterate, approve per language), CI/CD guarding Supabase migrations, telemetry covering ingestion → publish → translation pipelines.
