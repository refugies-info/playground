# Local Supabase Development Setup

## Overview

This guide covers setting up and running Supabase locally for the Content Playground project.

## Prerequisites

- Docker and Docker Compose installed
- Supabase CLI installed (`brew install supabase/tap/supabase` on macOS)
- Node.js 18+ and pnpm

## Quick Start

### 1. Start Supabase

```bash
supabase start
```

This will:
- Initialize the PostgreSQL database
- Start all Supabase services (API, Auth, Storage, Realtime)
- Display connection credentials and URLs

### 2. Configure Environment Variables

The startup output will show your local credentials. Create `.env.local` in `/apps/frontend`:

```bash
# Supabase Local Development Configuration
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<your_publishable_key>
SUPABASE_SERVICE_ROLE_SECRET=<your_service_role_secret>
```

Replace the keys with values from `supabase start` output.

### 3. Access Supabase Studio

Open http://127.0.0.1:54323 in your browser to access the Supabase Studio web UI.

### 4. Create Auth Users

**Important**: Database users (in `public.users` table) are separate from Auth users (in Supabase Auth service).

To create auth users with passwords:

1. Go to **Authentication** → **Users** in Supabase Studio
2. Click **Create User** button (top right)
3. Enter email and password
4. Click **Create User**

The auth user will be linked to the database user by email address.

**Bootstrap users** (luis, jeremie, margot, nour, julie) are pre-created in the database. Create auth accounts for them to enable login.

## Service URLs

| Service | URL | Purpose |
|---------|-----|---------|
| API | http://127.0.0.1:54321 | REST/GraphQL endpoints |
| Studio | http://127.0.0.1:54323 | Web UI for database management |
| Database | postgresql://postgres:postgres@127.0.0.1:54322/postgres | Direct PostgreSQL connection |
| Mailpit | http://127.0.0.1:54324 | Email testing interface |

## Database Migrations

Migrations are stored in `/supabase/migrations/` and run automatically on `supabase start`.

### Create a New Migration

```bash
supabase migration new <migration_name>
```

This creates a new SQL file in `/supabase/migrations/` with a timestamp prefix.

### Apply Migrations

Migrations run automatically when starting Supabase. To manually apply:

```bash
supabase db push
```

### Reset Database

To reset the database and re-run all migrations:

```bash
supabase db reset
```

## Configuration

Supabase configuration is in `/supabase/config.toml`. Key settings:

- **Analytics**: Disabled to avoid vector container issues
- **Auth**: Email/password and OAuth providers configured
- **Database**: PostgreSQL 17
- **Realtime**: Enabled for real-time subscriptions

## Troubleshooting

### Vector Container Fails to Start

If you see `supabase_vector_content-playground container is not ready: unhealthy`:

1. Stop Supabase: `supabase stop --no-backup`
2. Clean up Docker: `docker system prune -f`
3. Disable analytics in `/supabase/config.toml`: Set `[analytics] enabled = false`
4. Restart: `supabase start`

### Port Conflicts

If ports are already in use, modify `/supabase/config.toml`:

```toml
[api]
port = 54321  # Change this

[db]
port = 54322  # Change this

[studio]
port = 54323  # Change this
```

### Database Connection Issues

Verify the database is running:

```bash
psql postgresql://postgres:postgres@127.0.0.1:54322/postgres -c "SELECT 1"
```

## Stopping Supabase

```bash
supabase stop --no-backup
```

Use `--no-backup` to avoid creating backup files.

## Development Workflow

1. **Start Supabase**: `supabase start`
2. **Create migrations**: `supabase migration new <name>`
3. **Write SQL**: Edit the migration file in `/supabase/migrations/`
4. **Apply migrations**: `supabase db push`
5. **Test in Studio**: http://127.0.0.1:54323
6. **Test in app**: Run frontend and test auth flows

## Environment Variables

### Frontend (.env.local)

```
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<publishable_key>
SUPABASE_SERVICE_ROLE_SECRET=<service_role_secret>
```

### Backend (API Routes)

Use `SUPABASE_SERVICE_ROLE_SECRET` for server-side operations in Next.js API routes.

## Resources

- [Supabase CLI Documentation](https://supabase.com/docs/guides/cli)
- [Supabase Local Development](https://supabase.com/docs/guides/local-development)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
