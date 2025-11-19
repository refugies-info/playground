---
description: "Task list for POC Sprint 0: Turborepo + Scaffolding"
---

# Tasks: POC Sprint 0 – Turborepo + Scaffolding

**Input**: Design documents from `/specs/002-turborepo-scaffolding/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md
**Tests**: Manual only (Principle 7). Automated test tasks are omitted per POC constraints.
**Organization**: Tasks are grouped by user story for independent execution.

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Initialize monorepo, git, and package manager.

- [x] T001 Initialize git repository and create `.gitignore` in root
- [x] T002 Install `pnpm` and configure `package.json` workspaces (apps/*, packages/*)
- [x] T003 Install Turborepo (`turbo`) and configure `turbo.json` pipeline (build, dev, lint)
- [x] T004 Create workspace directories: `apps/`, `packages/`, `migrations/`
- [x] T005 Add `.npmrc` for pnpm hoisting settings (if needed)
- [x] T006 Create root `README.md` with setup instructions per quickstart.md

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core shared types and dependencies needed by both frontend and future backend code.

**⚠️ CRITICAL**: Must complete before US3 (Frontend) to allow type-safe development.

- [x] T007 Create `/packages/shared` workspace with `package.json`
- [x] T008 [P] Install `typescript` and `tsconfig` in shared package
- [x] T009 [P] Define `User` interface in `packages/shared/types/user.ts`
- [x] T010 [P] Define `ContentItem` interface in `packages/shared/types/content-item.ts`
- [x] T011 [P] Define `ContentFlag` interface in `packages/shared/types/content-flag.ts`
- [x] T012 [P] Define `MetadataMapping` interface in `packages/shared/types/metadata.ts`
- [x] T013 Export all types from `packages/shared/index.ts`
- [x] T014 Validate shared package build with `pnpm build`

## Phase 3: User Story 1 - DevOps Monorepo Foundation (Priority: P1)

**Goal**: Establish runnable monorepo with parallel task orchestration.

**Independent Test**: `turbo build` runs across all workspaces; `turbo dev` starts all apps (once added).

- [x] T015 [P] [US1] Configure `turbo.json` global dependencies and cache outputs
- [x] T016 [P] [US1] Add root-level convenience scripts (`dev`, `build`, `lint`) to `package.json`
- [x] T017 [P] [US1] Verify caching behavior by running build twice (second run should be immediate)

## Phase 4: User Story 3 - Frontend Initialization (Priority: P1)

**Goal**: Functional Next.js app with Tailwind, shadcn, and Supabase client hooked up.

**Independent Test**: App runs on localhost:3000, styles load, Supabase client initializes without error.

- [x] T018 [US3] Initialize Next.js app (app router) in `apps/frontend`
- [x] T019 [US3] Configure `apps/frontend/package.json` to depend on `@shared/types`
- [x] T020 [P] [US3] Install Tailwind CSS v4 and configure CSS imports in `apps/frontend/app/globals.css`
- [x] T021 [P] [US3] Initialize shadcn/ui (`components.json`, `lib/utils.ts`)
- [x] T022 [P] [US3] Install `@supabase/supabase-js` in `apps/frontend`
- [x] T023 [P] [US3] Create `apps/frontend/lib/supabase.ts` exporting `supabaseClient` and `supabaseServer`
- [x] T024 [US3] Add environment variable validation for Supabase keys in `apps/frontend`
- [x] T025 [US3] Create API route stub `/api/health` to verify API handling (per contracts)
- [x] T026 [US3] Create API route stub `/api/content` for manual ingestion (per contracts)
- [x] T027 [US3] Create API route stub `/api/classify` for Letta proxy (per contracts)
- [x] T028 [US3] Verify production build with `pnpm build` inside frontend workspace

## Phase 5: User Story 2 - Dependency Verification (Priority: P1)

**Goal**: Validate that fresh clones work deterministically.

**Independent Test**: Clean install + build works on a fresh clone.

- [x] T029 [US2] Verify `pnpm-lock.yaml` is consistent and committed
- [x] T030 [US2] Test "clean install" flow: delete `node_modules`, run `pnpm install`, then `pnpm build`
- [x] T031 [US2] Verify no peer dependency warnings or version conflicts

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final cleanup before Sprint 1 handover.

- [x] T032 Add `.env.example` in `apps/frontend` with Supabase placeholders
- [x] T033 Update documentation to reference new structure (quickstart.md)
- [x] T034 Check file permissions and gitignore rules (ensure .env is ignored)

## Dependencies & Execution Order

### Phase Dependencies
- **Setup**: Starts immediately.
- **Foundational**: Depends on Setup.
- **US1 (DevOps)**: Can run parallel with Foundational (mostly config).
- **US3 (Frontend)**: Depends on Foundational (needs shared types).
- **US2 (Verification)**: Runs last to validate everything.

### Implementation Strategy
1. **MVP**: Complete Setup → Foundational → US3 (Frontend scaffold). This unblocks Sprint 1 immediately.
2. **Full Sprint 0**: Complete US1 & US2 to ensure robust developer experience.
