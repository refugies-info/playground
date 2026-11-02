# Local Development Setup

## Prerequisites

- **Toolchain**: Node, pnpm and npm versions are pinned in `.prototools` (managed by [proto](https://moonrepo.dev/proto), `auto-install = true`). CI and Vercel builds use the same file.
- **Docker** (local Supabase, optional local Letta).
- **Supabase CLI** (`brew install supabase/tap/supabase`): it is not a project dependency, but `pnpm db:migrate` and `pnpm gen:types` call it.

## Setup

```bash
git clone git@github.com:refugies-info/playground.git
cd playground
pnpm install
supabase start          # API :54321, DB :54322, Studio :54323, Mailpit :54324
```

`supabase start` applies `supabase/migrations/` and loads the seed files from `supabase/seed/*.sql` (seed users included, see [Seed Data](../database/seed-data.md)).

### Environment files

There are two env files, each with its own example:

| File | Read by | Template |
|------|---------|----------|
| `.env` (repo root) | `scripts/*` (`dotenv/config`), root scripts such as `di:cron` and `storybook:publish` | `.env.example` |
| `apps/frontend/.env` | Next.js app (server actions, API routes, workflows run inside it) | `apps/frontend/.env.example` |

Fill the Supabase keys from the `supabase start` output. Letta settings (cloud free model, cloud prod agents, or self-hosted) are explained in `.env.example` and in [Local Letta Development](../ai/local-letta-dev.md). Full list: [Environment Variables](../reference/environment-variables.md).

### Run

```bash
pnpm dev
```

- Frontend: `http://localhost:3001` (`apps/frontend` runs `next dev -p 3001`; `site_url` in `supabase/config.toml` matches).
- `pnpm dev` also runs `dev:workflow` (`workflow inspect runs --web`), the Vercel Workflow runs inspector.

## Everyday commands

| Command | What it does |
|---------|--------------|
| `pnpm check:types` | Type check all workspaces (turbo) |
| `pnpm lint` / `pnpm format` | Biome check + fix / format |
| `pnpm test` | Vitest in every workspace (turbo), see [Testing Guide](./testing.md) |
| `pnpm db:migrate` | Apply pending migrations, keep local data (`supabase migration up`) |
| `npx supabase db reset` | Rebuild the local DB from migrations + seed |
| `pnpm gen:types` | Regenerate `packages/supabase/src/types.ts` from the local DB |
| `pnpm --filter @playground/frontend dev` | Run only the frontend |
| `supabase stop` | Stop local Supabase |

Migration rules: [Migrations & Best Practices](../database/migrations.md).
