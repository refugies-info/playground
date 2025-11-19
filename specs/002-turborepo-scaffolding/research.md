# Research: POC Sprint 0 – Turborepo + Scaffolding

## Decision Log

### 1. Monorepo Tooling & Package Manager

- **Decision**: Use Turborepo with pnpm workspaces (two workspaces + `/migrations`).
- **Rationale**: Matches Constitution Principle 6 simplification, gives deterministic task orchestration, and pnpm's symlinked node_modules keeps workspace installs fast for two developers.
- **Alternatives Considered**:
  - *Yarn/npm workspaces*: rejected because pnpm is mandated in Constitution v1.4.1 and provides better disk dedupe.
  - *Nx or Rush*: heavier configuration than Turborepo; unnecessary for two-workspace POC.

### 2. Supabase Integration Pattern

- **Decision**: Hybrid approach—direct client reads in components plus Next.js API routes for writes/Letta calls; Supabase client lives in `apps/frontend/lib/supabase.ts` exporting `supabaseClient` (anon) and `supabaseServer` (service role).
- **Rationale**: Keeps Sprint 0 simple while securing writes with server-only key and aligns with new Supabase section in spec and monorepo docs.
- **Alternatives Considered**:
  - *Full API proxy for all operations*: adds latency and code for simple read flows.
  - *Direct server components only*: would complicate Letta call orchestration and hide service role usage.

### 3. UI Scaffold Stack

- **Decision**: Next.js latest (app router) + Tailwind CSS v4 (CSS imports) + shadcn/ui (Radix UI) per Constitution Principle 6 & spec FR-007–FR-011.
- **Rationale**: Provides accessible, composable components quickly; Tailwind v4 removes config overhead which is critical for Sprint 0 velocity.
- **Alternatives Considered**:
  - *Create custom component library*: overkill for POC.
  - *Use Chakra/Material*: conflicts with constitutional requirement to standardize on Tailwind/Radix/shadcn.

### 4. Shared Types Package Scope

- **Decision**: Define `User`, `ContentItem`, `ContentFlag`, `MetadataMapping` base interfaces in `/packages/shared` and publish via `@shared/types` alias.
- **Rationale**: Sprint 0 deliverable per FR-012/FR-013; enables Jeremie & Luis to agree on contracts before Sprint 1 ingestion work.
- **Alternatives Considered**:
  - *Inline types inside frontend*: would block backend agreement and violate FR-012/FR-013.

### 5. Letta Integration Strategy

- **Decision**: No `/apps/backend`; Letta agents + custom tools live in Letta Cloud. Frontend calls REST endpoints only.
- **Rationale**: Aligns with Constitution v1.4.1 amendment and keeps Sprint 0 scope limited to scaffold.
- **Alternatives Considered**:
  - *Add backend workspace now*: rejected to avoid over-engineering prior to Sprint 1 learnings.
