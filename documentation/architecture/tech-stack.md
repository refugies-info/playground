# Technology Stack

Why each piece is there and how they fit. Versions live in the `package.json` files; layout and conventions in [AGENTS.md](../../AGENTS.md).

## Frontend

| Technology | Why |
|-----------|-----|
| **Next.js** (App Router) | Pages, server actions (writes with the user's session) and a few API routes (DI cron, editorial rewrite, archive, edit lock) |
| **Tailwind CSS v4** | Utility classes; tokens shared with `packages/ui` |
| **shadcn/ui + Radix UI** | Accessible primitives, restyled to the DSFR-based Refugies.info design in `packages/ui` |
| **Sentry** | Error tracking (`packages/sentry`, `@sentry/nextjs`) |

Session refresh and auth redirects run in `apps/frontend/src/proxy.ts` (Next.js 16 proxy, formerly `middleware.ts`).

## Backend and database

| Technology | Why |
|-----------|-----|
| **Supabase** (Postgres, Auth, Realtime) | One managed service for data, auth and live updates; images go to Cloudinary (`packages/cloudinary`) |
| **Row-Level Security** | Browser and server clients use the publishable key with the user's session, so access control lives in the database; the service role key is reserved for workflows and admin actions |
| **No ORM** | Supabase client or raw SQL; schema changes are SQL migrations in `supabase/migrations/` |

## AI and orchestration

| Technology | Why |
|-----------|-----|
| **Letta** | Stateful agents: the agent's instructions and memory live on the Letta server, the code only sends content plus a slash command (`/audit`, `/redaction`, `/metadata`, `/translate`, see `packages/agents/src/prompts.ts`) |
| **Vercel Workflow** | Long-running, retryable AI and publication jobs (`packages/workflows`); steps call Letta through `createLettaClient()` (`packages/agents`) |

Letta Cloud runs in production; local dev can use a self-hosted server ([local-letta-dev.md](../ai/local-letta-dev.md)). Agents are selected by env vars (`PLAYGROUND_AGENT_ID`, `METADATA_AGENT_ID`, `LETTA_AGENT_<LANG>` for translation), and the model is forced per request with `LETTA_MODEL_HANDLE` (`packages/shared/src/constants/model.ts`).

## Monorepo and tooling

| Technology | Why |
|-----------|-----|
| **Turborepo + pnpm** | Shared packages (`@playground/shared-types`, `@playground/ui`, …) consumed from source across apps |
| **Biome** | Lint and format in one tool (`biome.json`) |
| **Vitest** | Unit tests |
| **Vercel** | Hosts the frontend and runs the workflows |

## Deployment

- Vercel project rooted at `apps/frontend`: `vercel.json` runs `vercel-setup.sh` (installs proto and the `.prototools` toolchain) before `next build`; region `cdg1`; one cron on `/api/cron/di-ingestion`.
- Deploys go through the Vercel Git integration; `.github/workflows/notify-production-deploy.yml` posts the production result to Slack.
- CI: `checks.yml` (Biome, types, tests) on PRs to `main`; `chromatic.yml` for `packages/ui`.
