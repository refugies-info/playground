<!--
Sync Impact Report:
- Version: 1.0.0 (Initial constitution)
- Created: 2025-11-12
- Principles defined: 6 core principles for AI-assisted editorial workflow
- Templates status:
  ✅ spec-template.md - aligned with user story prioritization and independent testing
  ✅ plan-template.md - aligned with constitution check requirements
  ✅ tasks-template.md - aligned with user story-driven task organization
- Follow-up: None - all placeholders filled
-->

# Project Constitution: Content Playground

**Project Name**: Content Playground  
**Organization**: Refugies.info  
**Version**: 1.0.0  
**Ratification Date**: 2025-11-12  
**Last Amended**: 2025-11-12

---

## Purpose

This constitution defines the non-negotiable architectural and development principles for the **Content Playground** project—an AI-powered editorial workflow system designed to streamline content creation, classification, and publication for Refugies.info through human-in-the-loop AI assistance.

---

## Scope

This constitution applies to:

- All code, configuration, and infrastructure for the Content Playground POC and subsequent MVP phases
- AI agent design and orchestration using Letta
- Database schema and data flow between Next.js frontend, Letta backend, and Supabase
- Integration patterns using Model Context Protocol (MCP)
- Editorial workflow implementation (Import → Sort → Rewrite → Export)

---

## Core Principles

### Principle 1: Human-in-the-Loop Supremacy

**Rule**: AI MUST assist, never replace, human editorial judgment. Every AI-generated output (classification, rewrite, validation) MUST be reviewable and editable by human editors before final approval.

**Rationale**: The editorial team retains full control and accountability for published content. AI accelerates work but does not make final decisions. This ensures content quality, brand consistency, and legal compliance.

**Implementation Requirements**:

- All Letta agent outputs MUST be stored as "draft" or "suggested" states
- UI MUST provide clear review/edit/approve/reject workflows for every AI action
- Database schema MUST track approval status and human editor attribution
- No automated publication without explicit human approval step

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

### Principle 3: Letta-First AI Orchestration

**Rule**: All AI logic, task delegation, and conversational workflows MUST be implemented using Letta agents. Direct LLM API calls (OpenAI, Anthropic, etc.) are prohibited except within Letta agent definitions.

**Rationale**: Letta provides memory management, multi-agent orchestration, and auditability that raw LLM calls cannot. Centralizing AI logic in Letta simplifies debugging, version control, and compliance with AI governance requirements.

**Implementation Requirements**:

- Define specialized Letta agents: `classifier-agent`, `rewrite-agent`, `validator-agent`
- Use Letta's memory system for context persistence across user sessions
- All AI ↔ Database interactions MUST use MCP (Model Context Protocol) for Supabase access
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

**Rule**: Use a monorepo structure with clear separation between frontend (Next.js), backend (Letta + MCP), and shared types. Avoid microservices, separate repositories, or over-engineered abstractions during POC and MVP phases.

**Rationale**: Monorepo reduces coordination overhead, simplifies dependency management, and accelerates iteration for small teams. Clear boundaries prevent tight coupling while maintaining single-repo benefits.

**Implementation Requirements**:

- Repository structure:

  ```text
  /frontend        # Next.js app (UI, API routes for frontend-only logic)
  /backend         # Letta agent definitions, MCP server config
  /shared          # TypeScript types, constants, utilities
  /database        # Supabase migrations, schema definitions (Drizzle or Prisma)
  /docs            # Architecture, API contracts, runbooks
  ```

- Use pnpm workspaces for dependency management
- Shared types MUST be exported from `/shared` and imported by frontend/backend
- No circular dependencies between packages
- Each package MUST have independent test suite

---

### Principle 6: POC-to-MVP Pragmatism

**Rule**: Optimize for learning and iteration during POC (1 month, 2 sprints). Avoid premature optimization, complex abstractions, or production-grade infrastructure. Transition to MVP standards only after POC validation.

**Rationale**: POC goal is to validate the full workflow (Import → Sort → Rewrite → Export) with real users. Over-engineering delays feedback and wastes effort on features that may not survive user testing.

**Implementation Requirements**:

- **POC Phase** (Sprints 1-2):
  - Use Letta Cloud (hosted) instead of self-hosted Letta
  - Use Supabase free tier with simple schema (no complex indexing or partitioning)
  - Hardcode reasonable defaults (e.g., single language, single content type)
  - Skip authentication (use placeholder user ID)
  - Manual deployment (no CI/CD required)
  - Basic UI (functional, not polished)

- **MVP Phase** (Post-POC):
  - Add authentication (Supabase Auth)
  - Implement role-based access control (editor, reviewer, admin)
  - Add CI/CD pipeline (GitHub Actions → Vercel/GCP)
  - Optimize database schema based on POC learnings
  - Polish UI/UX based on user feedback
  - Add observability (logging, error tracking)

- **Transition Criteria**:
  - POC → MVP1: Full workflow validated with 3+ real editorial team members
  - MVP1 → MVP2: 50+ content items processed end-to-end, <5% error rate

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

- **spec-template.md**: User stories MUST be prioritized and independently testable (Principle 2)
- **plan-template.md**: Constitution Check section validates compliance (All Principles)
- **tasks-template.md**: Tasks MUST be organized by user story for independent implementation (Principle 2)
- **checklist-template.md**: Checklists MUST include audit trail verification (Principle 4)

---

## Ratification

This constitution was ratified on **2025-11-12** by the Content Playground project team to guide POC development (Sprints 1-2) and subsequent MVP phases.

**Signed**:  
Jeremie (Developer)
SpecKit AI Assistant (Constitution Author)

---

## End of Constitution v1.0.0
