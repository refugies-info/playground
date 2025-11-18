<!--
Sync Impact Report (v1.3.4):
- Version: 1.3.3 → 1.3.4 (PATCH: referenced roadmap doc as governance artifact)
- Amended: 2025-11-18
- Changes:
  • Scope references roadmap file for milestone context
  • Relationship to Templates section calls out `documentation/roadmaps/roadmap-mvp.md`
- Templates requiring updates:
  ⚠ plan-template.md – link roadmap checkpoints in Constitution Check
- Follow-up: TODO(METADATA_SCHEMA) – Define concrete metadata fields
-->

# Project Constitution: Content Playground

**Project Name**: Content Playground  
**Organization**: Refugies.info  
**Version**: 1.4.0  
**Ratification Date**: 2025-11-12  
**Last Amended**: 2025-11-18  
**POC Team Size**: 2 developers (Luis: backend/database, Jeremie: frontend)

---

## Purpose

This constitution defines the non-negotiable architectural and development principles for the **Content Playground** project—an AI-powered editorial workflow system designed to streamline content creation, classification, and publication for Refugies.info through human-in-the-loop AI assistance.

---

## Scope

This constitution applies to:

- All code, configuration, and infrastructure for the Content Playground POC and subsequent MVP phases
- AI agent design and orchestration using Letta
- Database schema and data flow between Next.js frontend, Letta backend, and Supabase
- Custom Letta tools for Supabase access (replacing MCP)
- Editorial workflow implementation (Ingest → Sort → Rewrite → Check metadata → Save → Publish)
- Data ingestion pipelines that transform heterogeneous external sources (e.g., RCO, DI) into relational structures usable by AI workflows
- Content revision history and rollback mechanisms
- Authentication and authorization for team members
- Companion roadmap execution tracked in `documentation/roadmaps/roadmap-mvp.md`

---

## Core Principles

### Principle 1: Human-in-the-Loop Supremacy

**Rule**: AI MUST assist, never replace, human editorial judgment. Every AI-generated output (classification, rewrite, validation) MUST be reviewable and editable by human editors before final approval. Editors MUST validate and map document metadata (pricing, dates, public status, related structures, etc.) before publishing. Editors MUST have explicit control over content lifecycle states (draft, published, archived).

**Rationale**: The editorial team retains full control and accountability for published content. AI accelerates work but does not make final decisions. Metadata validation ensures content is correctly contextualized for publication and integration with Refugies.info systems. Content lifecycle management (draft/published/archived) ensures editors can manage work-in-progress content, control publication timing, and maintain historical records. This ensures content quality, brand consistency, and legal compliance.

**Implementation Requirements**:

- All Letta agent outputs MUST be stored as "draft" or "suggested" states
- UI MUST provide clear review/edit/approve/reject workflows for every AI action
- Database schema MUST track approval status and human editor attribution
- No automated publication without explicit human approval step
- UI MUST provide metadata mapping interface for editors to check/validate document metadata before export
- Metadata validation MUST be a mandatory step in the export workflow (cannot export without metadata approval)
- System MUST track which metadata fields were validated/mapped by which editor and when
- Metadata schema MUST be configurable to support different content types and metadata requirements
- System MUST support content lifecycle states: draft (work-in-progress), published (visible/exported), archived (hidden but retained)
- Editors MUST be able to transition content between states (save as draft, publish, archive, restore) with explicit action and timestamp
- State transitions MUST be tracked with editor attribution for audit trail
- TODO(METADATA_SCHEMA): Specific metadata fields (pricing, dates, public status, related structures, etc.) to be defined and documented soon

---

### Principle 2: Data Ingestion & Quality Gating (POC Simplified)

**Rule**: The system MUST include a data ingestion pipeline that normalizes content into Supabase and automatically assesses quality via Letta classifier. **POC scope**: Manual CSV/JSON upload only (no automatic API triggering). Single source (RCO) for POC. All ingested data MUST be normalized with provenance tracking. Letta classifier MUST automatically flag quality on ingestion.

**Rationale**: POC goal is to validate the Ingest + Sort workflow with real users. Keeping ingestion simple (manual upload) reduces complexity and lets Luis focus on Letta quality gating. Multi-source expansion and automatic triggering deferred to MVP. Provenance tracking ensures audit trail and enables future expansion.

**Implementation Requirements (POC)**:

- **POC - Manual Ingestion Only**: Editors upload CSV/JSON files via frontend UI. System normalizes records into Supabase `content_items` table with fields: `id`, `source_system` (always "manual_upload" for POC), `source_record_id`, `original_text`, `language_code` ('fr'), `created_at`, `created_by`.
- **Unified Normalization**: All ingested data MUST include `source_system`, `source_record_id`, and ingestion timestamp for audit trail.
- **Automatic AI Quality Gating**: Upon successful ingestion, Letta classifier agent MUST automatically analyze content items to: (1) assess data quality/completeness; (2) flag items as "accepted" (proceed to Sort) or "rejected" (needs remediation). System MUST store AI reasoning. Results stored as `content_flags` table with: `id`, `content_id`, `flag_status` (accepted/rejected), `ai_reasoning`, `created_at`.
- **Editor Review**: Editors MUST be able to view AI flags, reasoning, and manually override flags with justification.
- **Deferred to MVP**: Automatic API triggering (RCO, DI), config file sources, multi-source expansion, incremental updates, re-classification of updated content.

---

**MVP Phase (post POC)**:
- Add RCO API stream with automatic polling/webhook triggering
- Add config file-based manual sources (YAML/JSON)
- Add file upload (CSV/JSON) via web form
- Handle already-imported but updated content with change detection and re-classification

---

### Principle 3: Two-Stage POC Workflow (Simplified)

**Rule**: POC MUST focus on two workflow stages: (1) **Ingest** (manual CSV/JSON upload), (2) **Sort** (Letta classifier quality gating). Rewrite, metadata mapping, save, and publish stages deferred to Sprint 2+. Content lifecycle management (draft/published/archived) is independent of workflow stages.

**Rationale**: POC goal is to validate Ingest + Sort with real users in 2 sprints. Limiting scope to 2 stages reduces complexity, lets Luis and Jeremie focus on core AI quality gating, and enables rapid iteration. Deferred stages can be added incrementally in Sprint 2+ without rework.

**Implementation Requirements (POC)**:

- **Stage 1 - Ingest**: Editors upload CSV/JSON files. System normalizes into `content_items` table with provenance.
- **Stage 2 - Sort**: Letta classifier automatically flags quality. Editors review flags and can manually override.
- **Deferred to Sprint 2**: Rewrite (AI-assisted content refinement), Metadata mapping (editor validation), Save (draft/published states), Publish (export).
- Database schema MUST support partial workflow (items can be ingested and flagged without rewrite).
- Content lifecycle states (draft/published) can be added in Sprint 2 independently of workflow stages.

---

### Principle 4: Letta Classifier Agent (POC Simplified)

**Rule**: POC MUST use one Letta agent: `classifier-agent` for quality gating. Direct LLM API calls prohibited. Custom Letta tools wrap Supabase Client for data access.

**Rationale**: POC focuses on Ingest + Sort. Single classifier agent is sufficient. Multi-agent orchestration (rewriter, translator) deferred to Sprint 2+. Custom tools keep system self-contained and provide full control over data access.

**Implementation Requirements (POC)**:

- **Classifier Agent Only**: Deploy single Letta agent to assess content quality/completeness on ingestion. Agent returns: flag_status (accepted/rejected) + reasoning.
- **Custom Letta Tools**: Create tools that wrap Supabase Client for reading content_items and writing content_flags. Tools execute direct SQL queries.
- **Tool Security**: Custom tools MUST enforce row-level security and log all queries.
- **Frontend Integration**: Frontend calls Letta classifier via REST API (not direct LLM calls).
- **Agent Config**: Agent prompts and configurations version-controlled in `/apps/backend` (deferred to Sprint 2).
- **Deferred to Sprint 2**: Rewriter agent, translator agent, multi-turn conversational refinement, memory system.

---

### Principle 5: Basic Audit Trail (POC Simplified)

**Rule**: POC MUST track basic audit trail: ingestion events and AI flag decisions. Full version history and analytics deferred to MVP.

**Rationale**: POC needs to track who uploaded what and what AI flagged. Comprehensive audit tables and analytics are over-engineered for POC. Can be added in MVP based on learnings.

**Implementation Requirements (POC)**:

- **Minimal Audit**: `content_items` table includes `created_by`, `created_at`, `source_system`, `source_record_id`.
- **Flag Audit**: `content_flags` table includes `created_at`, `ai_reasoning`, `flag_status`.
- **Manual Overrides**: Track when editors override AI flags (add `editor_id`, `override_reason` to `content_flags`).
- **Deferred to MVP**: Comprehensive `content_history` table, `ai_actions_log`, `editor_actions_log`, version diffs, analytics queries.

---

### Principle 6: Minimal Monorepo for 2-Person Team (POC)

**Rule**: POC MUST use 2-workspace Turborepo: `/apps/frontend` (Jeremie) + `/packages/shared` (both). Backend code and migrations live outside workspaces in `/migrations` folder. Expand to full 5-workspace structure in Sprint 2 if needed.

**Rationale**: 2-person team doesn't need full 5-workspace complexity. Minimal structure reduces overhead, lets Jeremie and Luis focus on core features. Can expand incrementally in Sprint 2.

**Implementation Requirements (POC)**:

- **Workspaces**: `/apps/frontend` (Next.js), `/packages/shared` (TypeScript types).
- **Non-Workspace**: `/migrations` folder for Supabase schema (Luis).
- **Backend Code**: Letta agent definitions and custom tools deferred to Sprint 2 (`/apps/backend`).
- **Database Access**: Direct Supabase Client with SQL queries (no ORM).
- **Frontend UI**: Tailwind CSS v4 + shadcn/ui (Radix UI primitives) for accessibility.
- **Deferred to Sprint 2**: `/apps/backend`, `/packages/supabase-client`, `/packages/letta-tools` workspaces.

---

### Principle 7: POC Pragmatism (2-Sprint Focused)

**Rule**: POC (Sprints 1-2) MUST focus on validating Ingest + Sort workflow with real users. Avoid premature optimization, over-engineering, or production-grade infrastructure. Supabase Auth from day 1 for consistent audit trails.

**Rationale**: POC goal is to validate 2-stage workflow (Ingest + Sort) with real editorial team. Keep scope tight, iterate fast, learn from users. Multi-stage workflow expansion happens in Sprint 2+.

**Implementation Requirements (POC)**:

- **Infrastructure**: Letta Cloud (hosted), Supabase free tier, manual Vercel deployment.
- **Authentication**: Supabase Auth from day 1 with editor role (skip reviewer/admin for POC).
- **Database**: Simple schema (no complex indexing), direct SQL queries (no ORM).
- **UI**: Functional, not polished. Tailwind + shadcn/ui for basic styling.
- **Testing**: Manual testing only (no automated tests).
- **Documentation**: Code comments only (no detailed AI docs).
- **DO NOT**: Complex unit tests, integration suites, e2e frameworks, overkill .md documentation.
- **Deferred to MVP**: CI/CD, full RBAC, observability, UI polish, comprehensive testing, detailed AI docs.

**Transition Criteria**:
- POC → Sprint 2: Ingest + Sort validated with 2-person team (Luis + Jeremie)
- Sprint 2 → MVP: Rewrite + Metadata stages added, 20+ items processed, <5% error rate

---

### Principle 8: Content Revision (Deferred to Sprint 2)

**Rule**: Revision tracking and rollback deferred to Sprint 2+. POC focuses on Ingest + Sort only.

**Rationale**: POC doesn't include Rewrite stage, so revision tracking is not needed yet. Can be added in Sprint 2 when Rewrite is implemented.

**Implementation Requirements (POC)**:

- **Deferred**: `content_revisions` table, revision timeline UI, rollback functionality, revision analytics.
- **Sprint 2+**: Implement full revision tracking when Rewrite stage is added.

---

### Principle 9: French-Only Content (POC Simplified)

**Rule**: POC uses French (fr) exclusively. Multi-language support deferred to MVP2+. Database schema includes `language_code` column for future expansion but POC uses 'fr' only.

**Rationale**: POC focuses on Ingest + Sort workflow. Single language reduces complexity. Multi-language expansion can be added in MVP2 without schema migration if `language_code` column is present from day 1.

**Implementation Requirements (POC)**:

- **Schema Design**: `content_items` table includes `language_code` column (default: 'fr').
- **POC Constraint**: All content uses `language_code = 'fr'`. No translation UI or workflows.
- **Deferred to MVP2**: Multi-language support, translator workflows, translation schema (source_revision_id, translation_revisions table).

---

### Principle 10: Translation Architecture (Future-Proof, Deferred to MVP2)

**Rule**: System architecture MUST support multi-language translation workflows as a core concept, but translation functionality is deferred to V2 phase (post-V1). French (fr) MUST be the source of truth for all content. Translation MUST be revision-based: translators work from specific source revisions, not live content. Translators MUST have visibility into translation history and AI-assisted translation suggestions.

**Rationale**: Refugies.info serves multilingual audiences. While POC/MVP/V1 focus on single-language editorial workflows, the system MUST be architected to support translation from day one. Revision-based translation ensures consistency and auditability. French as source of truth prevents cascading errors across language chains.

**Implementation Requirements (V2 Phase, TDB use it for reference)**:

- Database schema MUST include `translation_revisions`
  - Link to source revision (immutable reference, never follows live content)
- UI MUST provide translator workflows:
  - View source revision with full context and translation history
  - Create new translation version from specific source revision
  - See what has already been translated for this source revision
  - Access AI-assisted translation suggestions via Letta translator agent
  - Publish translated version for target language independently
- Letta translator agent MUST:
  - Suggest translations based on source revision content
  - Maintain context of previous translations for consistency
  - Support iterative refinement (translator can request alternative suggestions)
- Translation MUST NOT auto-publish; requires explicit translator approval
- Translation history MUST be queryable (e.g., "which revisions have been translated to Spanish?")

**POC/MVP/V1 Constraints**:

- Translation features MUST NOT be implemented in POC, MVP, or V1 phases
- Database schema MUST be designed to support translation (reserved columns, foreign keys) but NOT populated
- No translator UI, no translator agents, no translation workflows during POC/MVP/V1
- Single-language content only (French) during POC/MVP/V1

---

## Governance

### Amendment Process

1. Proposed changes MUST be documented in a pull request with rationale
2. Changes require approval from project lead (Jeremie) and at least one technical reviewer
3. Version bumping:
   - **MAJOR** (X.0.0): Principle removal, redefinition, or backward-incompatible governance change
   - **MINOR** (x.Y.0): New principle added or existing principle materially expanded
   - **PATCH** (x.y.Z): Clarifications, wording improvements, non-semantic fixes
4. After amendment, update `.specify/templates/` to reflect new principles
5. Communicate changes to all contributors via project documentation

### Compliance Review

- Constitution compliance MUST be checked during `/speckit.plan` execution (see "Constitution Check" section in plan-template.md)
- Violations MUST be justified in "Complexity Tracking" table with:
  - What principle is violated
  - Why the violation is necessary
  - What simpler alternative was rejected and why
- Unjustified violations block feature approval

### Versioning Policy

- Constitution version MUST be referenced in all feature specs and plans
- Breaking changes to principles require migration guide for in-flight features
- Constitution MUST be reviewed at end of each sprint for POC/MVP phase alignment

---

## Relationship to Templates

This constitution informs the following SpecKit templates:

- **spec-template.md**: Data ingestion requirements (Principle 2); workflow stage independence and prioritized user stories (Principle 3); revision history acceptance criteria required (Principle 8); translation architecture deferred to V2 (Principle 9)
- **plan-template.md**: Constitution Check section validates compliance (All Principles); ingestion pipeline design (Principle 2); revision tracking and rollback capabilities (Principle 8); translation schema design (Principle 9)
- **tasks-template.md**: Ingestion/connector tasks (Principle 2); tasks organized by user story for independent implementation (Principle 3); include revision/rollback tasks (Principle 8); translation schema tasks deferred to V2 (Principle 9)
- **checklist-template.md**: Ingestion pipeline readiness (Principle 2); audit trail verification (Principle 5) and revision history verification (Principle 8); translation schema readiness (Principle 9)
- **documentation/roadmaps/roadmap-mvp.md**: Operational milestone sequencing (POC sprints, MVP translations) MUST stay aligned with constitutional principles and update when principles change

---

## Ratification

This constitution was ratified on **2025-11-12** by the Content Playground project team to guide POC development (Sprints 1-2) and subsequent MVP phases.

**Amendment (v1.1.0)** on **2025-11-13**: Added Principle 7 (Content Revision & Rollback), clarified Principle 3 (custom Letta tools instead of MCP), and updated Principle 6 (staged authentication and Vercel deployment).

**Amendment (v1.1.1)** on **2025-11-13**: Clarified tech stack decisions—Turborepo for monorepo orchestration, direct SQL queries (no ORM), custom Letta tools wrapping Supabase Client, Supabase Auth for authentication.

**Amendment (v1.1.2)** on **2025-11-13**: Updated Principle 6 to explicitly skip automated tests and minimize AI documentation during POC/MVP phases to reduce token costs and bloat. Testing and comprehensive AI docs deferred to post-MVP.

**Amendment (v1.1.3)** on **2025-11-13**: Clarified Principle 6—comprehensive testing and AI documentation deferred to V1 phase (post-MVP). Added explicit "DO NOT" guidance: no complex unit tests, no overkill .md documentation files during POC/MVP. Added V1 phase requirements.

**Amendment (v1.1.4)** on **2025-11-13**: Updated Principle 5 to specify frontend UI framework stack: Tailwind CSS v4 for styling, shadcn/ui components built on Radix UI primitives for accessibility and composability.

**Amendment (v1.1.5)** on **2025-11-13**: Added Principle 8 (Translation Architecture, Future-Proof, Deferred to V2). Specified French as source of truth, revision-based translation workflows, translator AI assistance, and translation schema design. Clarified that translation features are NOT in POC/MVP/V1 but database schema MUST be designed to support translation.

**Amendment (v1.1.6)** on **2025-11-13**: Updated Principle 1 to add metadata mapping/validation as mandatory pre-publication step. Editors MUST check and map document metadata (pricing, dates, public status, related structures) before publishing. Metadata validation is part of human-in-the-loop approval workflow and export stage.

**Amendment (v1.1.7)** on **2025-11-17**: Clarified Principle 3 Implementation Requirements to mandate CRUD-level coverage for key domain entities (content items, courses, sessions, providers, etc.) so Supabase tables and Letta tools remain actionable.

**Amendment (v1.2.0)** on **2025-11-17**: Added Principle 9 to require a multi-source data ingestion & normalization pipeline (starting with RCO at POC, expanding to DI and others) and updated template relationships accordingly.

**Amendment (v1.2.1)** on **2025-11-17**: Expanded Principle 9 to mandate automatic pipeline triggering (polling or webhook), automatic Letta-driven classification of newly ingested content, and MVP-phase handling of already-imported but updated content with change detection and re-classification.

**Amendment (v1.2.2)** on **2025-11-17**: Reordered principles for logical flow—Data Ingestion & Normalization Pipeline moved from Principle 9 to Principle 2 (foundational). All subsequent principles renumbered accordingly (Workflow Stage Independence 2→3, Letta-First 3→4, Data Auditability 4→5, Monorepo 5→6, POC-to-MVP 6→7, Content Revision 7→8, Translation 8→9).

**Amendment (v1.2.3)** on **2025-11-17**: Clarified Principle 2 "Automatic AI sorting & quality gating" to separate concerns: (1) data ingestion handles deterministic storage; (2) AI sorting agent assesses quality/completeness and gates content; (3) AI flags items as "accepted" or "rejected" with reasoning. Added requirement for editors to review AI reasoning and manually re-flag items.

**Amendment (v1.2.4)** on **2025-11-17**: Unified Principle 2 to handle multiple source types in single ingestion pipeline. Clarified that ingestion accepts both automated sources (API streams like RCO) and manual sources (JSON/CSV file uploads, web form entry). All sources normalize through same relational schema with unified provenance tracking. Manual sources tracked as source="manual_upload" or source="manual_entry". Quality gating applies uniformly to all ingested data.

**Amendment (v1.2.5)** on **2025-11-17**: Clarified POC vs MVP source types in Principle 2. POC sources: RCO API streams + config file-based manual sources (YAML/JSON). MVP+ sources: file uploads (JSON/CSV) + web forms + future sources. Updated POC - Manual Sources requirement to specify config files instead of file uploads/web forms. Config files define source connection parameters, field mappings, validation rules. Manual sources tracked as source="config_file".

**Amendment (v1.3.0)** on **2025-11-17**: Added Principle 9 "Multi-Language & Versioning Database Schema (POC Foundation)" to mandate database schema design for multi-language support during POC, even though translation implementation is deferred to MVP2. Schema MUST include language_code and source_revision_id columns, composite unique constraints, and indexes for efficient language queries. French (fr) is designated source language; POC uses 'fr' exclusively. Renamed former Principle 9 to Principle 10. Rationale: Designing for multi-language upfront prevents expensive schema migrations later and enables seamless scaling to translation workflows in MVP2.

**Amendment (v1.3.1)** on **2025-11-17**: Clarified Principle 1 to explicitly mandate content lifecycle state management (draft/published/archived) with human control over state transitions and audit trail tracking. Updated Principle 3 to clarify workflow stages (Ingestion & Import, Quality Gating, Rewrite, Metadata Mapping, Export) and note that content lifecycle management is a cross-cutting concern orthogonal to workflow progression. Updated Principle 4 to add requirement for multi-turn conversational refinement via Letta agents, allowing editors to iteratively request adjustments and receive AI suggestions in real-time, with all iterations tracked for audit trail. Rationale: Two new user stories (P6: AI-Assisted Iterative Refinement via Chatbot, P7: Manage Content Publication States) require explicit constitutional support for content lifecycle and conversational AI capabilities.

**Amendment (v1.4.0)** on **2025-11-18**: Simplified Constitution for 2-person POC team (Luis + Jeremie). Principle 2 (Data Ingestion): Manual CSV/JSON upload only, no automatic API triggering. Principle 3 (Workflow): Two-stage POC (Ingest + Sort), defer Rewrite/Metadata/Publish to Sprint 2. Principle 4 (Letta): Single classifier agent only, defer rewriter/translator to Sprint 2. Principle 5 (Audit): Minimal audit trail (content_items + content_flags tables), defer comprehensive audit tables to MVP. Principle 6 (Monorepo): 2 workspaces (`/apps/frontend`, `/packages/shared`) + `/migrations` folder, defer `/apps/backend` and `/packages/letta-tools` to Sprint 2. Principle 7 (Pragmatism): Focus on Ingest + Sort validation, skip CI/CD and comprehensive testing. Principle 8 (Revision): Defer to Sprint 2 when Rewrite stage is added. Principle 9 (Multi-Language): French-only POC with `language_code` column for future expansion. Rationale: Reduce scope and complexity for small team, enable rapid iteration, defer multi-stage workflow and advanced features to Sprint 2+ based on learnings.

**Signed**:  
Jeremie (Developer)
SpecKit AI Assistant (Constitution Author)

---

## End of Constitution v1.4.0
