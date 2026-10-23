# AGENTS.md

This file provides context and instructions for AI agents working on the **Refugies.info — Content Playground** repository.

## 🧠 Project Overview

**Content Playground** is an AI-assisted editorial workflow designed to streamline content publication for [Refugies.info](https://refugies.info). It combines AI-driven rewriting (Letta agents: Letta Cloud in production, a self-hosted Letta server for local dev) with human validation (Human-in-the-Loop).

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
  - **AI**: [Letta](https://www.letta.com) agents — Letta Cloud in production, self-hosted locally ([guide](documentation/ai/local-letta-dev.md))
  - **Orchestration**: [Vercel Workflow](https://useworkflow.dev) (`packages/workflows`)

## 📂 Repository Structure

```text
playground/
├── apps/
│   ├── frontend/          # Next.js app (pages, server actions, a few API routes)
│   └── storybook/         # Storybook for packages/ui
├── packages/
│   ├── agents/            # Letta client, agent prompts and response parsing
│   ├── airtable/          # Airtable connector (translation tracking)
│   ├── cloudinary/        # Cloudinary connector (image upload)
│   ├── di/                # Data Inclusion API client and ingestion
│   ├── sentry/            # Sentry config shared by the frontend
│   ├── shared/            # Shared types, constants, logger, helpers (@playground/shared-types)
│   ├── supabase/          # Supabase clients, generated DB types, session proxy
│   ├── ui/                # Refugies.info UI library (DSFR-based)
│   └── workflows/         # Vercel Workflow pipelines and steps (ingestion, editorial, publication)
├── supabase/
│   ├── migrations/        # SQL migrations (timestamped)
│   └── seed/              # Local seed data (*.sql, loaded by `supabase db reset`)
├── scripts/               # Dev and maintenance scripts (see documentation/scripts/README.md)
├── documentation/         # Project documentation (index: documentation/README.md)
├── turbo.json             # Turborepo config
└── package.json           # Root scripts
```

### Key Directories

- **`apps/frontend/src`**:
  - `app/`: Next.js App Router — `(main)/` pages, `(auth)/` auth pages, `actions/` server actions, `api/` API routes.
  - `components/`: feature components (`document-editor/`, `translation-editor/`, `documents/`, …). Generic UI lives in `packages/ui`.
  - `services/`: server actions and data access used by pages.
  - `lib/`: utilities (`lib/supabase/client.ts` = browser client).
  - `proxy.ts`: Next.js proxy (session refresh, auth redirects).
- **`packages/shared`**: shared entities. Modify this package when adding new entities; it is consumed from source, no build step.
- **`packages/workflows`**: long-running AI and publication jobs. Files with `"use workflow"` (`pipelines/**`) must not import Node-only modules; do the work in `"use step"` files (`steps/**`).
- **`supabase/migrations`**: SQL migrations for the Supabase schema.

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
- **Validate**: `pnpm validate` (doc links, agent corpus, knip: unused files, unused/unlisted dependencies); runs in CI

### 3. Coding Conventions

- **Types**: Define shared entities in `packages/shared`. Import them as `@playground/shared-types`.
- **Database Access**:
  - **Reads**: Direct Supabase Client, but only at the page/feature level (protected by RLS) — never inside a presentational component.
  - **Writes**: server actions (`apps/frontend/src/services/`, `src/app/actions/`) or API routes (`src/app/api/`) with the user's session; the Service Role Key only where RLS cannot apply (user admin, workflows).
  - Context providers (`MetadataContext`, `TranslationContext`) may read Supabase directly: they are the feature-level data owners.
- **Styling**: Use Tailwind CSS utility classes.
- **Components**: Use `shadcn/ui` components where possible. Presentational components must not fetch or import data themselves — they receive it via props; data is loaded at the page/feature level and passed down.
- **Language**: The content is primarily **French** (`language_code = 'fr'`); code, types, and comments are in **English**.
- **Functional Programming**: Prefer a functional approach over Object-Oriented Programming (OOP). Avoid classes; use pure functions and immutable data structures where possible. Implement objects as little as possible.
- **Naming**: `camelCase` for variables/functions, `PascalCase` for types/interfaces and component files, `kebab-case` for other files/folders. Prefer a descriptive name that is a bit longer over a short, cryptic one.
- **Comments**: write self-explanatory code first — good code shouldn't need comments to be understood. When you do comment, keep it short and in English, reserved for what the code can't say by itself (an exception, a workaround, a non-obvious rule) — not a restatement of what the line does.
- **Don't repeat yourself**: refactor to reuse an existing function instead of copy-pasting; keep the codebase light.
- Full rules and rationale: [Coding Conventions guide](documentation/guides/coding-conventions.md).

### 4. Architecture Notes

- **Supabase**:
  - Browser and server clients use the publishable/anon key with the user's session (RLS enforced) — `packages/supabase/src/clients.ts`.
  - `SUPABASE_SERVICE_ROLE_KEY` (`getSupabaseAdmin`) is used by workflows and admin-only actions (users, avatars).
- **Letta Integration**:
  - AI logic is handled by Letta agents, called from `packages/workflows` steps through `packages/agents` (`createLettaClient`).
  - The frontend starts workflows from server actions (e.g. `forceArbitrationAction`) or the DI cron (`/api/cron/di-ingestion`).

## 📝 Documentation

- Refer to `README.md` for high-level objectives.
- Refer to [documentation/README.md](documentation/README.md) for the documentation index, and [documentation/architecture/tech-stack.md](documentation/architecture/tech-stack.md) for technology choices.
- Run `pnpm validate:docs` after editing docs: it checks every relative link.
- **Features**:
  - [Publication & Archive](documentation/frontend/publication/index.md)
- **Database**:
  - [Migrations & Best Practices](documentation/database/migrations.md)

## 🚀 Deployment & Migrations

### Database Migrations
- **Location**: `supabase/migrations/`
- **Naming**: Always use `supabase migration new <name>` to generate timestamped files.
- **Apply locally**: `pnpm db:migrate` (`supabase migration up`) applies pending migrations and keeps local data; `npx supabase db reset` rebuilds from scratch (migrations + `supabase/seed/*.sql`).
- **Conflicts**: If you encounter a timestamp collision (CI error), **rename your file** by incrementing the timestamp.
- **Safety**: Always run `npx supabase db reset` locally after resolving conflicts to verify chain integrity.

