# AGENTS.md

This file provides context and instructions for AI agents working on the **Refugies.info — Content Playground** repository.

## 🧠 Project Overview

**Content Playground** is an AI-assisted editorial workflow designed to streamline content publication for [Refugies.info](https://refugies.info). It combines AI-driven rewriting (using Letta Cloud) with human validation (Human-in-the-Loop).

**Core Workflow (POC)**: Ingestion & Import → Quality Gating (AI) → Rewrite (AI) → Metadata Mapping → Export.

## ⚙️ Tech Stack & Environment

- **Language**: TypeScript
- **Monorepo**: [Turborepo](https://turbo.build/repo)
- **Package Manager**: `pnpm` (do not use `npm` or `yarn`)
- **Formatting/Linting**: [Biome](https://biomejs.dev) (`biome.json`)
- **Frontend**:
  - [Next.js 16](https://nextjs.org) (App Router)
  - [Tailwind CSS v4](https://tailwindcss.com)
  - [shadcn/ui](https://ui.shadcn.com)
  - [Radix UI](https://www.radix-ui.com)
- **Backend / Database**:
  - [Supabase](https://supabase.com) (Auth, Database, Storage)
  - **No ORM**: Use raw SQL or the Supabase Client.
  - **AI**: [Letta Cloud](https://www.letta.com) (Orchestration & Agents)

## 📂 Repository Structure

```text
content-playground/
├── apps/
│   └── frontend/          # Next.js application (UI + Utility API routes)
├── packages/
│   └── shared/            # Shared TypeScript types (@playground/shared-types)
├── migrations/            # Supabase SQL schema & migrations
├── documentation/         # Project documentation & specs
├── .specify/              # Spec templates
├── turbo.json             # Turborepo config
└── package.json           # Root dependencies
```

### Key Directories

- **`apps/frontend`**: The main application.
  - `src/app`: Next.js App Router.
  - `src/components`: UI components (shadcn/ui in `ui/`).
  - `src/lib`: Utilities, including `supabase.ts` (Client) and `letta-client.ts`.
- **`packages/shared`**: Shared types.
  - **Important**: Modify this package when adding new entities. Run `pnpm build` in this package after changes.
- **`migrations`**: SQL files for Supabase schema.

## 🛠️ Development Guidelines

### 1. Package Management

- Always use `pnpm`.
- **Install dependencies**: `pnpm install`
- **Add dependencies**: `pnpm add <package> --filter <workspace>` (e.g., `pnpm add date-fns --filter frontend`)
- **Check for outdated packages**: `pnpm check:outdated` (uses `taze` to check and update dependencies recursively)
- **Audit dependencies**: `pnpm audit`

### 2. Running the Project

- **Dev Server**: `pnpm dev` (starts all apps)
- **Build**: `pnpm build`
- **Lint/Format**: `pnpm lint` / `pnpm format` (uses Biome)
- **Type Check**: `pnpm check:types`

### 3. Coding Conventions

- **Types**: Define shared entities in `packages/shared`. Import them as `@playground/shared-types`.
- **Database Access**:
  - **Reads**: Direct Supabase Client (frontend, protected by RLS).
  - **Writes**: API Routes (`apps/frontend/app/api/...`) using the Service Role Key.
- **Styling**: Use Tailwind CSS utility classes.
- **Components**: Use `shadcn/ui` components where possible.
- **Language**: The content is primarily **French** (`language_code = 'fr'`).
- **Functional Programming**: Prefer a functional approach over Object-Oriented Programming (OOP). Avoid classes; use pure functions and immutable data structures where possible. Implement objects as little as possible.

### 4. Architecture Notes

- **Hybrid Supabase Pattern**:
  - Frontend uses `NEXT_PUBLIC_SUPABASE_ANON_KEY` for read-only (RLS enforced).
  - API Routes use `SUPABASE_SERVICE_ROLE_KEY` for secure writes and AI operations.
- **Letta Integration**:
  - AI logic is handled by Letta agents.
  - Frontend calls Letta via utility routes (`/api/classify`, etc.).

## 📝 Documentation

- Refer to `README.md` for high-level objectives.
- Refer to `documentation/monorepo-structure.md` for detailed architectural decisions and Sprint scopes.
- **Agent Context**: Refer to `.agents/memory/system/` for fine-grained context on team members, project history, and behavioral rules (mirrors Letta Code memory structure).
- **Features**:
  - [Publication & Archive](documentation/frontend/publication/index.md)
- **Database**:
  - [Migrations & Best Practices](documentation/database/migrations.md)

## 🚀 Deployment & Migrations

### Database Migrations
- **Location**: `supabase/migrations/`
- **Naming**: Always use `supabase migration new <name>` to generate timestamped files.
- **Conflicts**: If you encounter a timestamp collision (CI error), **rename your file** by incrementing the timestamp.
- **Safety**: Always run `npx supabase db reset` locally after resolving conflicts to verify chain integrity.

