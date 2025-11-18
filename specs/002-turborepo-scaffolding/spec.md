# Feature Specification: POC Sprint 0 – Turborepo + Scaffolding

**Feature Branch**: `002-turborepo-scaffolding`  
**Created**: 2025-11-18  
**Status**: Draft  
**Constitution Version**: v1.4.0 (Simplified for 2-person team)  
**Input**: User description: "POC Sprint 0: Turborepo + scaffolding - Initialize monorepo with 2 workspaces, set up Next.js frontend scaffold with Tailwind + shadcn/ui, define shared types, and design Supabase schema. Letta agents and Supabase Auth integration deferred to Sprint 1."

## Clarifications

### Session 2025-11-18

- **Q: Do we need `/apps/backend`, `/packages/supabase-client`, and `/packages/database` workspaces for a 2-person team (Luis: backend/database, Jeremie: frontend)?**
  - **A**: No. Simplified to 2 workspaces (`/apps/frontend`, `/packages/shared`) + `/migrations` folder for Sprint 1. Backend code and database setup can live outside Turborepo workspaces. Rationale: Reduces overhead for small team, prevents over-engineering. Can expand to full 5-workspace structure in Sprint 2 if needed.

- **Q: Should we simplify the Constitution for a 2-person POC team?**
  - **A**: Yes. Constitution updated to v1.4.0 with simplified principles: (1) Manual CSV/JSON ingestion only (no automatic API triggering), (2) Two-stage workflow (Ingest + Sort), (3) Single Letta classifier agent, (4) Minimal audit trail, (5) 2-workspace monorepo, (6) Manual testing only, (7) French-only content. Rationale: Reduces scope and complexity, enables rapid iteration, defers multi-stage workflow and advanced features to Sprint 2+ based on learnings.

## User Scenarios & Testing *(mandatory)*

<!--
  IMPORTANT: User stories should be PRIORITIZED as user journeys ordered by importance.
  Each user story/journey must be INDEPENDENTLY TESTABLE - meaning if you implement just ONE of them,
  you should still have a viable MVP (Minimum Viable Product) that delivers value.
  
  Assign priorities (P1, P2, P3, etc.) to each story, where P1 is the most critical.
  Think of each story as a standalone slice of functionality that can be:
  - Developed independently
  - Tested independently
  - Deployed independently
  - Demonstrated to users independently
-->

### User Story 1 - DevOps Engineer Sets Up Monorepo Foundation (Priority: P1)

As a DevOps engineer, I need to initialize a Turborepo-based monorepo with `/apps/frontend` and `/packages/shared` workspaces so that Jeremie (frontend) and Luis (backend/database) can work in parallel with efficient caching and task orchestration.

**Why this priority**: Foundation for all subsequent development. Without monorepo structure, parallel development is blocked.

**Independent Test**: Can be fully tested by verifying monorepo structure exists, Turborepo config is valid, and build/dev tasks execute correctly across all workspaces.

**Acceptance Scenarios**:

1. **Given** a fresh repository, **When** monorepo initialization completes, **Then** directory structure includes `/apps/frontend` and `/packages/shared` workspaces
2. **Given** monorepo is initialized, **When** running `turbo build`, **Then** all workspaces build successfully with proper caching
3. **Given** monorepo is initialized, **When** running `turbo dev`, **Then** all development servers start without conflicts

---

### User Story 2 - Developer Installs Dependencies and Verifies Build (Priority: P1)

As a developer, I need to install monorepo dependencies and verify that all workspaces can build independently so that the foundation is ready for feature development in subsequent sprints.

**Why this priority**: Validates monorepo is functional before other teams begin work on Supabase, Letta, and frontend features.

**Independent Test**: Can be fully tested by running `npm install` (or yarn), then `turbo build`, and verifying all workspaces compile without errors.

**Acceptance Scenarios**:

1. **Given** a fresh clone of the repository, **When** running `npm install`, **Then** all dependencies resolve without conflicts
2. **Given** dependencies are installed, **When** running `turbo build`, **Then** all workspaces build successfully
3. **Given** build completes, **When** checking workspace outputs, **Then** each workspace has valid build artifacts

---

### User Story 3 - Frontend Developer Initializes Next.js App with Styling (Priority: P1)

As a frontend developer, I need to initialize a Next.js app (latest version, app router) with Tailwind CSS V4 and shadcn components in the `/apps/frontend` workspace so that the UI foundation is ready for feature development.

**Why this priority**: Frontend scaffold is critical for Sprint 1 exit (editors need a dashboard to authenticate and view content). Must be ready before other frontend features can be built.

**Independent Test**: Can be fully tested by verifying Next.js app runs locally, Tailwind CSS compiles without config file, and shadcn CLI is configured for component installation.

**Acceptance Scenarios**:

1. **Given** Next.js app is initialized in `/apps/frontend`, **When** running `npm run dev`, **Then** frontend server starts on localhost without errors
2. **Given** Tailwind CSS V4 is configured, **When** checking CSS output, **Then** styles are compiled from CSS imports (no config file)
3. **Given** shadcn is configured, **When** running `npx shadcn-ui add button`, **Then** component is installed successfully and can be imported
4. **Given** frontend app is built, **When** running `npm run build`, **Then** production build completes without errors

### Edge Cases

- What happens when a workspace has conflicting dependencies? System MUST provide clear error messages identifying the conflict.
- How does system handle Turborepo cache corruption? System MUST allow cache reset without affecting source code.
- What if a developer clones the repo on a machine without Node.js installed? System MUST provide setup documentation with version requirements.

## Requirements *(mandatory)*

<!--
  ACTION REQUIRED: The content in this section represents placeholders.
  Fill them out with the right functional requirements.
-->

### Functional Requirements

#### Monorepo & Build Infrastructure

- **FR-001**: System MUST initialize Turborepo with `/apps/frontend` and `/packages/shared` workspaces
- **FR-002**: System MUST configure Turborepo tasks (`build`, `dev`, `lint`) to run across all workspaces with proper caching
- **FR-003**: System MUST support parallel development with isolated node_modules per workspace
- **FR-004**: System MUST include `.gitignore` and `.npmrc` configuration for monorepo best practices
- **FR-005**: System MUST provide `README.md` with setup instructions and workspace descriptions
- **FR-006**: System MUST include `/migrations` folder for Supabase schema and migrations (non-workspace)

#### Next.js Frontend Initialization

- **FR-007**: System MUST initialize Next.js app (latest version) with app router in `/apps/frontend` workspace
- **FR-008**: System MUST configure Tailwind CSS V4 with CSS imports (no config file required)
- **FR-009**: System MUST set up shadcn CLI for component installation and management
- **FR-010**: System MUST configure Next.js to work within Turborepo workspace structure
- **FR-011**: System MUST include basic layout and page structure for future feature development

#### Shared Types Package

- **FR-012**: System MUST initialize `/packages/shared` with core TypeScript types (User, ContentItem, ContentRevision, ContentFlag, MetadataMapping)
- **FR-013**: System MUST export types for use by frontend and backend teams

### Key Entities

- **Workspace**: A package or application within the monorepo (e.g., `/apps/frontend`, `/packages/shared`), with its own `package.json` and build configuration

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Monorepo initialization completes in under 5 minutes with all workspaces properly configured
- **SC-002**: `npm install` resolves all dependencies without conflicts
- **SC-003**: `turbo build` completes successfully for all workspaces in under 2 minutes
- **SC-004**: `turbo dev` starts all development servers without port conflicts
- **SC-005**: New developers can clone and build the monorepo in under 10 minutes following README instructions
- **SC-006**: Next.js frontend dev server starts in under 5 seconds from `npm run dev`
- **SC-007**: Tailwind CSS compiles all styles without requiring a config file
- **SC-008**: shadcn CLI can install components with a single command (`npx shadcn-ui add [component]`)
- **SC-009**: Next.js production build completes successfully with no warnings or errors

## Assumptions

- Node.js 18+ and npm/yarn are installed on all developer machines
- Developers have basic Git knowledge for cloning and branching
- Turborepo is the chosen monorepo tool (already decided in tech stack)
- Next.js latest version supports app router (current standard)
- Tailwind CSS V4 is available and compatible with Next.js latest
- shadcn CLI is compatible with Next.js app router
- Team structure: 2 developers (Luis: backend/database, Jeremie: frontend)
- Backend code and database migrations can live outside Turborepo workspaces for Sprint 1

## Dependencies & Constraints

- **External Dependencies**: Turborepo, Node.js, npm/yarn, Next.js, Tailwind CSS V4, shadcn/ui
- **Constraint**: POC phase explicitly excludes automated tests (manual testing only per Constitution v1.4.0)
- **Constraint**: POC phase minimizes documentation (code comments only, no detailed .md files beyond setup)
- **Constraint**: Monorepo structure is foundational—no feature code, only empty workspace scaffolding
- **Constraint**: Next.js frontend is UI scaffold only—no authentication, data fetching, or business logic in this sprint
