# Supabase Authentication Setup Guide

**Feature**: Supabase Authentication & Authorization (003-supabase-auth)  
**Date**: 2025-11-20  
**Status**: POC Phase

This guide walks developers through setting up the local Supabase development environment for the Content Playground authentication system.

---

## Prerequisites

- **Supabase CLI**: Install via `brew install supabase` (macOS) or follow [Supabase CLI installation guide](https://supabase.com/docs/guides/cli/getting-started)
- **Docker**: Required for local Supabase instance (install via Docker Desktop)
- **pnpm**: Package manager for the monorepo
- **Node.js 18+**: Required for frontend development

Verify installation:

```bash
supabase --version  # Should output version 2.58.5 or later
docker --version    # Should output Docker version
pnpm --version      # Should output pnpm version
```

---

## Quick Start (5 minutes)

### 1. Start Local Supabase

```bash
supabase start
```

This command:
- Launches PostgreSQL, Auth, Realtime, and Storage services
- Applies all migrations from `/supabase/migrations/`
- Seeds test data from `/supabase/seed.sql`
- Displays connection URLs and credentials

**Expected Output**:
```
supabase local development setup is running.

         API URL: http://127.0.0.1:54321
     GraphQL URL: http://127.0.0.1:54321/graphql/v1
S3 Storage URL: http://127.0.0.1:54321/storage/v1/s3
    Database URL: postgresql://postgres:postgres@127.0.0.1:54322/postgres
       Studio URL: http://127.0.0.1:54323
        Mailpit URL: http://127.0.0.1:54324
```

### 2. Access Supabase Studio

Open [http://127.0.0.1:54323](http://127.0.0.1:54323) in your browser to access the Supabase Studio dashboard.

**Default credentials**:
- Email: `supabase`
- Password: `password`

### 3. Verify Database Schema

In Supabase Studio, navigate to **SQL Editor** and run:

```sql
SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';
```

**Expected tables**:
- `users` – User accounts with roles (editor, admin)
- `auth_sessions` – Session tokens and expiration
- `audit_logs` – Authentication event logs
- `oauth_providers` – OAuth provider links (Google)

### 4. Test RLS Policies

In Supabase Studio, navigate to **Authentication** → **Users** to verify:
- Test users are created (alice@refugies.info, claudia@refugies.info, xavier@refugies.info)
- RLS policies are active (check **SQL Editor** → **Policies** tab)

### 5. Verify Seed Data

Run in SQL Editor:

```sql
SELECT id, email, role, is_active FROM public.users ORDER BY created_at;
```

**Expected output**:
```
id                                   | email                    | role   | is_active
-------------------------------------|--------------------------|---------|-----------
20000000-0000-0000-0000-000000000001 | alice@refugies.info      | editor | true
20000000-0000-0000-0000-000000000002 | claudia@refugies.info    | editor | true
20000000-0000-0000-0000-000000000003 | xavier@refugies.info     | editor | true
```

---

## Common Commands

### Reset Database to Initial State

```bash
supabase db reset
```

This command:
- Drops all tables and data
- Reapplies all migrations
- Reseeds test data
- Useful for testing schema changes or cleaning up after manual edits

### Stop Local Supabase

```bash
supabase stop
```

### View Logs

```bash
supabase logs --local
```

### Access Database Directly

```bash
psql postgresql://postgres:postgres@127.0.0.1:54322/postgres
```

Then run SQL queries directly in the PostgreSQL shell.

---

## Creating New Migrations

When you need to modify the database schema:

### 1. Create Migration File

```bash
supabase migration new <migration_name>
```

This creates a new migration file in `/supabase/migrations/` with a timestamp prefix.

**Example**:
```bash
supabase migration new add_user_profile_fields
# Creates: supabase/migrations/20251120000005_add_user_profile_fields.sql
```

### 2. Edit Migration

Open the generated file and write your SQL:

```sql
-- Add profile fields to users table
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS full_name TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- Create index for full_name searches
CREATE INDEX IF NOT EXISTS idx_users_full_name ON public.users(full_name);
```

### 3. Test Migration Locally

```bash
supabase db reset
```

This applies all migrations including your new one.

### 4. Push to Production (Later)

Once tested locally:

```bash
supabase link  # Link to production project
supabase db push  # Push migrations to production
```

---

## Testing RLS Policies

Row-Level Security (RLS) policies enforce authorization at the database level. To test policies:

### 1. Simulate User Authentication

In Supabase Studio **SQL Editor**, use the `auth.uid()` function to simulate a logged-in user:

```sql
-- Simulate logged-in user: alice (ID: 20000000-0000-0000-0000-000000000001)
SET request.jwt.claims = '{"sub": "20000000-0000-0000-0000-000000000001", "role": "editor"}';

-- Test: User can view their own profile
SELECT id, email, role FROM public.users WHERE id = auth.uid();
-- Result: Returns alice's row

-- Test: User cannot view other users' profiles
SELECT id, email, role FROM public.users WHERE id != auth.uid();
-- Result: Empty (RLS blocks access)
```

### 2. Test Admin Access

```sql
-- Simulate logged-in admin user
SET request.jwt.claims = '{"sub": "10000000-0000-0000-0000-000000000001", "role": "admin"}';

-- Test: Admin can view all users
SELECT id, email, role FROM public.users;
-- Result: Returns all users
```

### 3. Reset Session

```sql
RESET request.jwt.claims;
```

---

## Troubleshooting

### Issue: `supabase start` fails with "Docker not running"

**Solution**: Start Docker Desktop and try again.

```bash
open /Applications/Docker.app  # macOS
```

### Issue: Port already in use (e.g., 54321)

**Solution**: Stop the running Supabase instance and try again.

```bash
supabase stop
supabase start
```

### Issue: Migrations not applying

**Solution**: Check migration file syntax and reset the database.

```bash
supabase db reset
```

If the error persists, check the migration file for SQL syntax errors.

### Issue: Cannot connect to database

**Solution**: Verify the database URL and credentials.

```bash
# Expected database URL:
postgresql://postgres:postgres@127.0.0.1:54322/postgres

# Test connection:
psql postgresql://postgres:postgres@127.0.0.1:54322/postgres -c "SELECT 1;"
```

### Issue: RLS policies not enforcing

**Solution**: Verify RLS is enabled on the table.

```sql
-- Check RLS status
SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public';

-- Enable RLS if needed
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
```

---

## Environment Variables

The following environment variables are required for frontend development:

```bash
# .env.local (frontend)
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=<from supabase start output>
SUPABASE_SERVICE_ROLE_KEY=<from supabase start output>
```

Copy these values from the `supabase start` output and add to `.env.local`.

---

## Next Steps

1. ✅ Local Supabase is running
2. ✅ Database schema is created
3. ✅ RLS policies are enforced
4. ✅ Test data is seeded
5. → **Next**: Implement email/password authentication (Phase 4: US1)

---

## Resources

- [Supabase CLI Documentation](https://supabase.com/docs/guides/cli/getting-started)
- [Supabase RLS Documentation](https://supabase.com/docs/guides/auth/row-level-security)
- [PostgreSQL Migrations Best Practices](https://www.postgresql.org/docs/current/ddl.html)
- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
