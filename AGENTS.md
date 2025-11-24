# AGENTS.md

This file provides context and instructions for AI agents working on the **Refugies.info — Content Playground** repository.

## 🧠 Project Overview

**Content Playground** is an AI-assisted editorial workflow designed to streamline content publication for [Refugies.info](https://refugies.info). It combines AI-driven rewriting (using Letta Cloud) with human validation (Human-in-the-Loop).

**Core Workflow (POC)**: Ingestion & Import → Quality Gating (AI) → Rewrite (AI) → Metadata Mapping → Export.

## ⚙️ Tech Stack & Environment

*   **Language**: TypeScript
*   **Monorepo**: [Turborepo](https://turbo.build/repo)
*   **Package Manager**: `pnpm` (do not use `npm` or `yarn`)
*   **Formatting/Linting**: [Biome](https://biomejs.dev) (`biome.json`)
*   **Frontend**:
    *   [Next.js 16](https://nextjs.org) (App Router)
    *   [Tailwind CSS v4](https://tailwindcss.com)
    *   [shadcn/ui](https://ui.shadcn.com)
    *   [Radix UI](https://www.radix-ui.com)
*   **Backend / Database**:
    *   [Supabase](https://supabase.com) (Auth, Database, Storage)
    *   **No ORM**: Use raw SQL or the Supabase Client.
    *   **AI**: [Letta Cloud](https://www.letta.com) (Orchestration & Agents)

## 📂 Repository Structure

```text
content-playground/
├── apps/
│   └── frontend/          # Next.js application (UI + Utility API routes)
├── packages/
│   └── shared/            # Shared TypeScript types (@shared/types)
├── migrations/            # Supabase SQL schema & migrations
├── documentation/         # Project documentation & specs
├── .specify/              # Spec templates
├── turbo.json             # Turborepo config
└── package.json           # Root dependencies
```

### Key Directories

*   **`apps/frontend`**: The main application.
    *   `src/app`: Next.js App Router.
    *   `src/components`: UI components (shadcn/ui in `ui/`).
    *   `src/lib`: Utilities, including `supabase.ts` (Client) and `letta-client.ts`.
*   **`packages/shared`**: Shared types.
    *   **Important**: Modify this package when adding new entities. Run `pnpm build` in this package after changes.
*   **`migrations`**: SQL files for Supabase schema.

## 🛠️ Development Guidelines

### 1. Package Management
*   Always use `pnpm`.
*   Install dependencies: `pnpm install`
*   Add dependencies: `pnpm add <package> --filter <workspace>` (e.g., `pnpm add date-fns --filter frontend`)

### 2. Running the Project
*   **Dev Server**: `pnpm dev` (starts all apps)
*   **Build**: `pnpm build`
*   **Lint/Format**: `pnpm lint` / `pnpm format` (uses Biome)
*   **Type Check**: `pnpm type-check`

### 3. Coding Conventions
*   **Types**: Define shared entities in `packages/shared`. Import them as `@shared/types`.
*   **Database Access**:
    *   **Reads**: Direct Supabase Client (frontend, protected by RLS).
    *   **Writes**: API Routes (`apps/frontend/app/api/...`) using the Service Role Key.
*   **Styling**: Use Tailwind CSS utility classes.
*   **Components**: Use `shadcn/ui` components where possible.
*   **Language**: The content is primarily **French** (`language_code = 'fr'`).

### 4. Architecture Notes
*   **Hybrid Supabase Pattern**:
    *   Frontend uses `NEXT_PUBLIC_SUPABASE_ANON_KEY` for read-only (RLS enforced).
    *   API Routes use `SUPABASE_SERVICE_ROLE_KEY` for secure writes and AI operations.
*   **Letta Integration**:
    *   AI logic is handled by Letta agents.
    *   Frontend calls Letta via utility routes (`/api/classify`, etc.).

## 📝 Documentation
*   Refer to `README.md` for high-level objectives.
*   Refer to `documentation/monorepo-structure.md` for detailed architectural decisions and Sprint scopes.
