<!--
Sync Impact Report (v1.1.6):
- Version: 1.1.5 → 1.1.6 (PATCH: added metadata mapping requirement to Principle 1)
- Amended: 2025-11-13
- Changes:
  • Updated Principle 1: Added metadata mapping/validation as mandatory pre-publication step
  • Clarified: Editors MUST check and map document metadata (pricing, dates, public status, related structures) before publishing
  • Specified: Metadata validation is part of human-in-the-loop approval workflow
- Templates requiring updates:
  ⚠ spec-template.md - add metadata mapping acceptance criteria
  ⚠ plan-template.md - add metadata validation to Constitution Check
  ⚠ tasks-template.md - add metadata mapping tasks to export stage
- Follow-up: TODO(METADATA_SCHEMA) - Specific metadata fields to be defined and documented soon
-->

# Project Constitution: Content Playground

**Project Name**: Content Playground  
**Organization**: Refugies.info  
**Version**: 1.1.6  
**Ratification Date**: 2025-11-12  
**Last Amended**: 2025-11-13

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
- Editorial workflow implementation (Import → Sort → Rewrite → Export)
- Content revision history and rollback mechanisms
- Authentication and authorization for team members

---

## Core Principles

### Principle 1: Human-in-the-Loop Supremacy

**Rule**: AI MUST assist, never replace, human editorial judgment. Every AI-generated output (classification, rewrite, validation) MUST be reviewable and editable by human editors before final approval. Editors MUST validate and map document metadata (pricing, dates, public status, related structures, etc.) before publishing.

**Rationale**: The editorial team retains full control and accountability for published content. AI accelerates work but does not make final decisions. Metadata validation ensures content is correctly contextualized for publication and integration with Refugies.info systems. This ensures content quality, brand consistency, and legal compliance.

**Implementation Requirements**:

- All Letta agent outputs MUST be stored as "draft" or "suggested" states
- UI MUST provide clear review/edit/approve/reject workflows for every AI action
- Database schema MUST track approval status and human editor attribution
- No automated publication without explicit human approval step
- UI MUST provide metadata mapping interface for editors to check/validate document metadata before export
- Metadata validation MUST be a mandatory step in the export workflow (cannot export without metadata approval)
- System MUST track which metadata fields were validated/mapped by which editor and when
- Metadata schema MUST be configurable to support different content types and metadata requirements
- TODO(METADATA_SCHEMA): Specific metadata fields (pricing, dates, public status, related structures, etc.) to be defined and documented soon

---

### Principle 2: Workflow Stage Independence

**Rule**: Each workflow stage (Import, Sort, Rewrite, Export) MUST function as an independently testable and deployable unit. User stories MUST be prioritized (P1, P2, P3) and each MUST deliver standalone value.

**Rationale**: Enables incremental delivery, parallel development, and early validation. Teams can ship Import + Sort as MVP1 without waiting for Rewrite completion. Reduces risk and accelerates feedback loops.

**Implementation Requirements**:

- Database schema MUST support partial workflow completion (e.g., items can be imported and sorted without rewrite)
- API contracts MUST be versioned per stage
- Each stage MUST have independent test suites
- Feature specs MUST define acceptance criteria per user story, not per entire feature
- Tasks MUST be organized by user story to enable independent implementation

---

### Principle 3: Letta-First AI Orchestration with Custom Tools

**Rule**: All AI logic, task delegation, and conversational workflows MUST be implemented using Letta agents. Direct LLM API calls (OpenAI, Anthropic, etc.) are prohibited except within Letta agent definitions. Supabase access MUST use custom Letta tools that wrap direct SQL queries, not external MCP servers.

**Rationale**: Letta provides memory management, multi-agent orchestration, and auditability that raw LLM calls cannot. Custom tools keep the system self-contained and reduce external dependencies while maintaining full control over data access patterns. Direct SQL queries via Supabase Client provide simplicity and performance without ORM abstraction overhead.

**Implementation Requirements**:

- Define specialized Letta agents: `classifier-agent`, `rewrite-agent`, `validator-agent`
- Use Letta's memory system for context persistence across user sessions
- Create custom Letta tools that wrap Supabase Client for CRUD operations (read, write, update, delete)
- Custom tools MUST execute direct SQL queries for performance and control
- Custom tools MUST enforce row-level security and audit logging
- Frontend MUST communicate with Letta via REST API, not directly with LLMs
- Agent prompts and configurations MUST be version-controlled in repository

---

### Principle 4: Data Auditability and Traceability

**Rule**: Every AI action, human edit, and state transition MUST be logged with timestamp, user attribution, and version history. Content lineage from import to export MUST be traceable.

**Rationale**: Editorial workflows require accountability for legal, quality, and operational reasons. Audit trails enable debugging, compliance reporting, and understanding how content evolved.

**Implementation Requirements**:

- Database MUST include audit tables: `content_history`, `ai_actions_log`, `editor_actions_log`
- Every content mutation MUST record: `action_type`, `actor_id` (human or agent), `timestamp`, `previous_state`, `new_state`
- UI MUST display version history and diff views for editors
- Export stage MUST include metadata: original source, AI modifications, human approvals
- Logs MUST be queryable for analytics (e.g., "How often are AI rewrites accepted without edits?")

---

### Principle 5: Monorepo Simplicity with Clear Boundaries

**Rule**: Use a Turborepo-based monorepo structure with clear separation between frontend (Next.js), backend (Letta + custom tools), and shared types. Avoid microservices, separate repositories, or over-engineered abstractions during POC and MVP phases. Database access MUST use direct Supabase queries (no ORM). Frontend UI MUST use Tailwind CSS v4, Radix UI primitives, and shadcn/ui components.

**Rationale**: Turborepo provides efficient task orchestration, caching, and parallel builds for small teams. Direct SQL queries eliminate ORM abstraction overhead and provide full control over data access patterns. Tailwind v4 + Radix UI + shadcn/ui provides modern, accessible, and composable UI components with minimal configuration. Clear boundaries prevent tight coupling while maintaining single-repo benefits.

**Implementation Requirements**:

- Repository structure (Turborepo standard):

  ```text
  /apps
    /frontend      # Next.js app (UI, API routes for frontend-only logic)
    /backend       # Letta agent definitions, custom tool implementations
  /packages
    /shared        # TypeScript types, constants, utilities
    /supabase-client  # Supabase client wrapper with direct SQL queries
    /database      # Supabase migrations, schema definitions (SQL)
  /docs            # Architecture, API contracts, runbooks
  ```

- Use Turborepo for monorepo task orchestration and caching
- Database queries MUST use Supabase Client with direct SQL (no ORM)
- Frontend styling MUST use Tailwind CSS v4 for utility-first design
- Frontend UI components MUST use shadcn/ui (built on Radix UI primitives) for accessibility and composability
- All interactive components MUST leverage Radix UI's accessible foundations
- Shared types MUST be exported from `/packages/shared` and imported by apps/backend
- Supabase client wrapper in `/packages/supabase-client` for reuse across apps
- No circular dependencies between packages
- Each app and package MUST have independent test suite

---

### Principle 6: POC-to-MVP Pragmatism with Staged Authentication

**Rule**: Optimize for learning and iteration during POC (1 month, 2 sprints). Avoid premature optimization, complex abstractions, or production-grade infrastructure. Transition to MVP standards only after POC validation. Authentication MUST be implemented by POC step 2 to enable multi-user testing.

**Rationale**: POC goal is to validate the full workflow (Import → Sort → Rewrite → Export) with real users. Over-engineering delays feedback and wastes effort on features that may not survive user testing. Early authentication enables team collaboration during POC.

**Implementation Requirements**:

- **POC Phase** (Sprints 1-2):
  - Use Letta Cloud (hosted) instead of self-hosted Letta
  - Use Supabase free tier with simple schema (no complex indexing or partitioning)
  - Hardcode reasonable defaults (e.g., single language, single content type)
  - **Step 1 (Sprint 1)**: Basic placeholder user ID for single-user testing
  - **Step 2 (Sprint 1-2 transition)**: Add Supabase Auth with basic role support (editor, reviewer)
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

### Principle 7: Content Revision & Rollback as Core Feature

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

### Principle 8: Translation Architecture (Future-Proof, Deferred to V2)

**Rule**: System architecture MUST support multi-language translation workflows as a core concept, but translation functionality is deferred to V2 phase (post-V1). French (fr) MUST be the source of truth for all content. Translation MUST be revision-based: translators work from specific source revisions, not live content. Translators MUST have visibility into translation history and AI-assisted translation suggestions.

**Rationale**: Refugies.info serves multilingual audiences. While POC/MVP/V1 focus on single-language editorial workflows, the system MUST be architected to support translation from day one. Revision-based translation ensures consistency and auditability. French as source of truth prevents cascading errors across language chains.

**Implementation Requirements (V2 Phase)**:

- Database schema MUST include `translation_revisions` table with:
  - `id`, `source_content_id`, `source_revision_id`, `target_language`, `translator_id`, `translation_status` (draft, in-progress, approved, published)
  - `translated_body`, `translation_notes`, `created_at`, `updated_at`
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

- **spec-template.md**: User stories MUST be prioritized and independently testable (Principle 2); revision history acceptance criteria required (Principle 7); translation architecture deferred to V2 (Principle 8)
- **plan-template.md**: Constitution Check section validates compliance (All Principles); revision tracking and rollback capabilities (Principle 7); translation schema design (Principle 8)
- **tasks-template.md**: Tasks MUST be organized by user story for independent implementation (Principle 2); include revision/rollback tasks (Principle 7); translation schema tasks deferred to V2 (Principle 8)
- **checklist-template.md**: Checklists MUST include audit trail verification (Principle 4) and revision history verification (Principle 7); translation schema readiness (Principle 8)

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

**Signed**:  
Jeremie (Developer)
SpecKit AI Assistant (Constitution Author)

---

## End of Constitution v1.1.6
