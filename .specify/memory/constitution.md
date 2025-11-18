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
**Version**: 1.3.4  
**Ratification Date**: 2025-11-12  
**Last Amended**: 2025-11-18

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

### Principle 2: Unified Data Ingestion & Normalization Pipeline with Multiple Source Types

**Rule**: The system MUST include a unified data ingestion pipeline that converts heterogeneous upstream sources into a normalized relational representation that AI workflows, editors, and Supabase tooling can rely on. **POC sources**: automated API streams (RCO) and config file-based manual sources. **MVP+ sources**: file uploads (JSON/CSV), web forms, and future sources. Automated sources MUST be triggered automatically when new or updated data is detected at the source. All ingested data MUST be normalized through the same relational schema with unified provenance tracking. Letta AI agents MUST automatically assess quality and flag newly ingested content items without requiring manual intervention.

**Rationale**: AI workflows only add value if upstream data is trustworthy, deduplicated, and aligned with the relational schema, regardless of source type. A unified ingestion process that handles both automated and manual sources prevents downstream chaos, maintains consistent provenance, and keeps Supabase ready for multi-source expansion. Automatic triggering and AI-driven quality gating eliminate manual bottlenecks and ensure rapid, consistent processing of incoming data from any source.

**Implementation Requirements**:

- **POC - Automated Sources**: Deliver at least one end-to-end ingestion job for the initial automated source (RCO API stream) that extracts raw data, validates fields, normalizes records into Supabase tables, and logs provenance. Ingestion job MUST be triggered automatically when new RCO data is detected (polling, CRON, or webhook, TBD...).
- **POC - Manual Sources**: System MUST load data source configurations from YAML/JSON config files (e.g., `/config/sources.yaml`). Config files MUST define source connection parameters, field mappings, and validation rules. Manual ingestion via config files MUST normalize data through the same schema and provenance tracking as automated sources (source = "config_file", source_record_id = config source ID + record ID).
- **Unified Normalization**: All ingested data (from any source type) MUST be normalized into a unified relational structure with consistent `source_system`, `source_record_id`, and ingestion timestamp fields for audit trail and AI context.
- **Automatic AI quality gating**: Upon successful ingestion from any source, Letta classifier agent MUST automatically analyze newly ingested content items to: (1) assess data quality and completeness to determine if content is suitable for downstream editorial workflow; (2) generate suggested tags, categories, and quality scores; (3) flag items as "accepted" (sufficient quality to proceed) or "rejected" (insufficient quality, requires source remediation). System MUST store AI reasoning/justification for each flag decision. Results MUST be stored as "pending" flags for human review. Editors MUST be able to view AI reasoning, accept/reject flags, and manually re-flag items with their own justification.
- **Multi-source readiness**: Design ingestion contracts so additional sources (DI, future providers, new file formats) plug into the same pipeline without rewriting downstream logic; every record MUST persist `source_system`, `source_record_id`, and ingestion timestamps.
- Supabase schema MUST remain relational yet flexible: use lookup tables/JSON columns only when necessary, and document how each entity maps back to raw source structures.
- Ingestion jobs MUST support incremental updates, deduplication, and idempotent re-runs (no duplicate rows on retries).
- Pipeline MUST surface validation errors with actionable logs/metrics so editors know when a source failed to import.
- Provenance data MUST be available to Letta agents so AI-generated suggestions can reference origin context.
- New sources MUST include connector-specific sanity checks before being marked production-ready.
- **MVP Phase (post POC)**: Ingestion pipeline MUST handle already-imported but updated content items from any source. When source data is re-ingested with changes, system MUST detect updates (via `source_record_id` and content hash), create new normalized records, and trigger automatic re-classification via Letta. Updated content MUST be marked as "updated" in audit trail with link to prior version for comparison.

---

### Principle 3: Workflow Stage Independence

**Rule**: Each workflow stage (Ingest, Sort, Rewrite, Check metadata, Save, Publish) MUST function as an independently testable and deployable unit. User stories MUST be prioritized (P0-P7) and each MUST deliver standalone value. Content lifecycle management (draft/published/archived states) is a cross-cutting concern orthogonal to workflow stages.

**Rationale**: Enables incremental delivery, parallel development, and early validation. Teams can ship Ingest + Sort as MVP1 without waiting for Rewrite completion, then layer metadata checks, save, and publish gates progressively. Reduces risk and accelerates feedback loops. Content lifecycle states provide editors with flexible control independent of workflow progression.

**Implementation Requirements**:

- Database schema MUST support partial workflow completion (e.g., items can be ingested and quality-gated without rewrite)
- Content lifecycle states (draft/published/archived) MUST be independent of workflow stage (editors can save draft at any stage, publish when ready)
- API contracts MUST be versioned per stage
- Each stage MUST have independent test suites
- Feature specs MUST define acceptance criteria per user story, not per entire feature
- Tasks MUST be organized by user story to enable independent implementation

---

### Principle 4: Letta-First AI Orchestration with Custom Tools

**Rule**: All AI logic, task delegation, and conversational workflows MUST be implemented using Letta agents. Direct LLM API calls (OpenAI, Anthropic, etc.) are prohibited except within Letta agent definitions. Supabase access MUST use custom Letta tools that wrap direct SQL queries, not external MCP servers.

**Rationale**: Letta provides memory management, multi-agent orchestration, and auditability that raw LLM calls cannot. Custom tools keep the system self-contained and reduce external dependencies while maintaining full control over data access patterns. Direct SQL queries via Supabase Client provide simplicity and performance without ORM abstraction overhead.

**Implementation Requirements**:

- Define specialized Letta agents: `classifier-agent`, `rewrite-agent`, `validator-agent`
- Use Letta's memory system for context persistence across user sessions
- Letta agents MUST support multi-turn conversational refinement, allowing editors to iteratively request adjustments (e.g., "make it more formal", "simplify terminology") and receive AI suggestions in real-time
- Conversational refinement MUST track all iterations as separate versions with editor request and AI response for audit trail
- Implementation Requirements MUST be articulated at CRUD granularity for every core domain entity (courses, sessions, providers, and similar catalog entities) so engineers can translate requirements directly into Supabase tables and Letta tools
- Create custom Letta tools that wrap Supabase Client for CRUD operations (read, write, update, delete) across those entities
- Custom tools MUST execute direct SQL queries for performance and control
- Custom tools MUST enforce row-level security and audit logging
- Frontend MUST communicate with Letta via REST API, not directly with LLMs
- Agent prompts and configurations MUST be version-controlled in repository

---

### Principle 5: Data Auditability and Traceability

**Rule**: Every AI action, human edit, and state transition MUST be logged with timestamp, user attribution, and version history. Content lineage from import to export MUST be traceable.

**Rationale**: Editorial workflows require accountability for legal, quality, and operational reasons. Audit trails enable debugging, compliance reporting, and understanding how content evolved.

**Implementation Requirements**:

- Database MUST include audit tables: `content_history`, `ai_actions_log`, `editor_actions_log`
- Every content mutation MUST record: `action_type`, `actor_id` (human or agent), `timestamp`, `previous_state`, `new_state`
- UI MUST display version history and diff views for editors
- Export stage MUST include metadata: original source, AI modifications, human approvals
- Logs MUST be queryable for analytics (e.g., "How often are AI rewrites accepted without edits?")

---

### Principle 6: Monorepo Simplicity with Clear Boundaries

**Rule**: Use a Turborepo-based monorepo structure with clear separation between frontend (Next.js), backend (Letta + custom tools), and shared types. Avoid microservices, separate repositories, or over-engineered abstractions during POC and MVP phases. Database access MUST use direct Supabase queries (no ORM). Frontend UI MUST use Tailwind CSS v4, Radix UI primitives, and shadcn/ui components.

**Rationale**: Turborepo provides efficient task orchestration, caching, and parallel builds for small teams. Direct SQL queries eliminate ORM abstraction overhead and provide full control over data access patterns. Tailwind v4 + Radix UI + shadcn/ui provides modern, accessible, and composable UI components with minimal configuration. Clear boundaries prevent tight coupling while maintaining single-repo benefits.

**Implementation Requirements**:

- Repository structure must follow Turborepo standard & best practices
- Use Turborepo for monorepo task orchestration and caching
- Database queries MUST use Supabase Client with direct SQL (no ORM)
- Frontend styling MUST use Tailwind CSS v4 for utility-first design
- Frontend UI components MUST use shadcn/ui (built on Radix UI primitives) for accessibility and composability
- All interactive components MUST leverage Radix UI's accessible foundations
- No circular dependencies between packages

---

### Principle 7: POC-to-MVP Pragmatism with Staged Authentication

**Rule**: Optimize for learning and iteration during POC (1 month, 2 sprints). Avoid premature optimization, complex abstractions, or production-grade infrastructure. Transition to MVP standards only after POC validation. Authentication MUST be Supabase Auth from project kickoff so every environment, even day-one spikes, operates under real user identities.

**Rationale**: POC goal is to validate the full workflow (Ingest → Sort → Rewrite → Check metadata → Save → Publish) with real users. Using Supabase Auth from the start guarantees consistent audit trails, multi-user readiness, and avoids rework replacing placeholder IDs mid-sprint. Over-engineering elsewhere still wastes effort on features that may not survive user testing.

**Implementation Requirements**:

- **POC Phase** (Sprints 1-2):
  - Use Letta Cloud (hosted) instead of self-hosted Letta
  - Use Supabase free tier with simple schema (no complex indexing or partitioning)
  - Hardcode reasonable defaults (e.g., single language, single content type)
  - **Day 1**: Provision Supabase Auth with editor/reviewer roles and integrate into frontend + Letta tools
  - Manual deployment to Vercel (no CI/CD required)
  - Basic UI (functional, not polished)
  - Direct SQL queries via Supabase Client (no ORM)
  - **Skip automated tests** (manual testing only) to reduce token costs and development overhead
  - **Minimize AI documentation** (focus on code comments, not detailed AI docs) to reduce bloat
  - **DO NOT**: Write complex unit tests, integration test suites, or e2e test frameworks
  - **DO NOT**: Create overkill .md documentation files for AI agent behaviors, prompts, or memory patterns

- **MVP Phase** (Post-POC):
  - Implement full role-based access control (editor, reviewer, admin)
  - Add CI/CD pipeline (GitHub Actions → Vercel)
  - Optimize database schema based on POC learnings
  - Polish UI/UX based on user feedback
  - Add observability (logging, error tracking)
  - Deploy to Vercel with production configuration

- **V1 Phase** (Post-MVP, production-ready):
  - **Add comprehensive test suites** (unit, integration, e2e) based on validated patterns
  - **Document AI agent behaviors** (prompts, memory patterns, tool interactions) with detailed .md files
  - Implement production-grade monitoring and error handling
  - Optimize performance based on real usage data

- **Transition Criteria**:
  - POC → MVP1: Full workflow validated with 3+ real editorial team members using authenticated access
  - MVP1 → MVP2: 50+ content items processed end-to-end, <5% error rate
  - MVP → V1: Patterns stable, ready for comprehensive testing and documentation

---

### Principle 8: Content Revision & Rollback as Core Feature

**Rule**: Every content mutation (AI rewrite, human edit, classification change) MUST create an immutable revision record. Team members MUST be able to view full revision history and rollback to any prior version with a single action.

**Rationale**: Editorial workflows are iterative and exploratory. Editors need confidence to experiment knowing they can revert mistakes or compare versions. Revision history also serves as an audit trail for compliance and learning (e.g., "which rewrites do editors typically accept?").

**Implementation Requirements**:

- Database schema MUST include `content_revisions` table with:
  - `id`, `content_id`, `revision_number`, `created_at`, `created_by`, `action_type` (rewrite, edit, classification)
  - `previous_state`, `new_state` (full content snapshots or diffs)
  - `change_summary` (human-readable description of what changed)
- UI MUST display revision timeline with:
  - Chronological list of all changes with actor and timestamp
  - Side-by-side diff view comparing any two revisions
  - One-click rollback button (with confirmation) to restore prior version
- Rollback action MUST create a new revision record (not delete history)
- Revision data MUST be queryable for analytics (e.g., "average revisions per content item")
- Letta custom tools MUST enforce revision creation on every state change

---

### Principle 9: Multi-Language & Versioning Database Schema (POC Foundation)

**Rule**: Database schema MUST be designed from POC phase to support multi-language content and revision versioning, even though translation functionality is deferred to MVP2. French (fr) MUST be the designated source language. Every content item MUST track language and revision metadata to enable future translation workflows without schema migration.

**Rationale**: Retrofitting multi-language and versioning support after POC requires expensive schema migrations and data rewriting. Designing for these concepts upfront (even if unused during POC) ensures the system can scale to translation workflows seamlessly. French as source of truth prevents cascading translation errors and maintains content integrity across languages.

**Implementation Requirements**:

- **POC Phase** (schema design, no translation implementation):
  - Content tables MUST include `language_code` column (default: 'fr' for French source)
  - Content tables MUST include `source_revision_id` column (references `content_revisions.id` for translation lineage tracking)
  - `content_revisions` table MUST include `language_code` column to track which language each revision belongs to
  - `content_revisions` table MUST include `source_revision_id` column (NULL for source language, set for translations)
  - Composite unique constraint: `(content_id, language_code, revision_number)` to prevent duplicate revisions per language
  - Indexes on `(language_code, created_at)` for efficient language-specific queries
  - Schema documentation MUST explain translation lineage (source revisions → translation revisions)
  - Letta custom tools MUST enforce language and revision metadata on every content mutation
  
- **MVP2 Phase** (translation implementation):
  - Translator workflows will query `source_revision_id` to identify which source revisions have been translated
  - Translation history queries will filter by `language_code` and `source_revision_id`
  - No schema changes required; only new UI and Letta translator agent
  
- **Constraint**: POC MUST use `language_code = 'fr'` exclusively; no translation UI or workflows during POC/MVP1

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

**Signed**:  
Jeremie (Developer)
SpecKit AI Assistant (Constitution Author)

---

## End of Constitution v1.3.1
