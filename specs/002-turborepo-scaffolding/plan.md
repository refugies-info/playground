# Implementation Plan: POC Sprint 0 – Turborepo + Scaffolding

**Branch**: `002-turborepo-scaffolding` | **Date**: 2025-11-19 | **Spec**: `specs/002-turborepo-scaffolding/spec.md`
**Input**: POC Sprint 0 specification (monorepo + frontend scaffold + Supabase client)

## Summary

Sprint 0 establishes the Turborepo foundation with two workspaces (`/apps/frontend`, `/packages/shared`), bootstraps the Next.js + Tailwind + shadcn UI scaffold, defines shared TypeScript types, and wires up the Supabase client (anon + service role keys) so Sprint 1 can immediately focus on Ingest + Sort workflows.

## Technical Context

**Language/Version**: TypeScript 5.x on Node.js 20 (Next.js latest app router)  
**Primary Dependencies**: Turborepo, pnpm, Next.js (app router), Tailwind CSS v4 (CSS imports), shadcn/ui (Radix UI), @supabase/supabase-js 2.x  
**Storage**: Supabase Postgres (schema design deferred to Sprint 1, client hookup in Sprint 0)  
**Testing**: Manual only per Constitution Principle 7 (no automated suites in POC)  
**Target Platform**: Local dev + Vercel preview for Next.js; Letta Cloud + Supabase services  
**Project Type**: Web monorepo (Turborepo) with app + package workspaces  
**Performance Goals**: Dev workflows complete quickly (dev server <5s, turbo build <2m) per success criteria  
**Constraints**: POC forbids automated tests/CI, requires pnpm, mandates minimal documentation, and keeps backend/agent code out of Turborepo (Letta Cloud handles orchestration)  
**Scale/Scope**: 2 developers (Jeremie frontend, Luis backend/db). Sprint 0 delivers scaffolding only—no feature logic, no Letta schema, no Supabase Auth wiring.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Requirement | Plan Status |
|-----------|-------------|-------------|
| P1 Human-in-the-Loop | POC still manual-only; Sprint 0 delivers scaffolding only | ✅ No impact (UI scaffold only) |
| P2 Ingestion (Simplified) | Manual CSV/JSON ingestion with Letta gating is Sprint 1 scope | ✅ Sprint 0 only lays groundwork |
| P6 Minimal Monorepo | Exactly 2 workspaces + `/migrations` folder, pnpm, Supabase client in frontend | ✅ Plan conforms |
| P7 Pragmatism | No automated tests/CI, manual validation only | ✅ Plan explicitly avoids tests |
| Tooling Constraints | Letta agents in Letta Cloud, Supabase client only | ✅ No backend workspace added |

**Gate Result**: PASS (no violations). Proceed to Phase 0 research.

## Project Structure

### Documentation (this feature)

```text
specs/002-turborepo-scaffolding/
├── plan.md              # This file (/speckit.plan output)
├── research.md          # Phase 0 findings
├── data-model.md        # Phase 1 entity definitions
├── quickstart.md        # Phase 1 developer bootstrap guide
├── contracts/           # Phase 1 API contracts (Next.js routes)
└── tasks.md             # Generated later via /speckit.tasks
```

### Source Code (repository root)

```text
content-playground/
├── apps/
│   └── frontend/             # Next.js app router scaffold + Supabase client + shadcn
├── packages/
│   └── shared/               # Shared TypeScript types (User, ContentItem, ContentFlag, etc.)
├── migrations/               # SQL files (Sprint 1 ownership, blank placeholder in Sprint 0)
├── turbo.json                # Turborepo pipeline config (build/dev/lint tasks)
├── package.json              # pnpm workspace + turbo scripts
├── pnpm-lock.yaml
└── README.md                 # Monorepo instructions (already aligned)
```

**Structure Decision**: Use Turborepo with two workspaces plus `/migrations`, aligning with Constitution P6. No `/apps/backend` or `/packages/letta-tools` are introduced in Sprint 0. Supabase client lives inside `/apps/frontend/lib/supabase.ts` with shared types consumed from `/packages/shared`.

## Complexity Tracking

No constitutional violations—table not required at this stage.
