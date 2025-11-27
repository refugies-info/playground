# Supabase Migrations Guide

**Purpose**: Comprehensive guide to creating, testing, and managing Supabase database migrations.

**Audience**: All developers working with the database schema.

---

## Overview

Migrations are SQL files that define database schema changes. They are:
- **Version-controlled** in `/supabase/migrations/`
- **Timestamped** with format `YYYYMMDDHHMMSS_description.sql`
- **Applied automatically** when running `supabase start` or `supabase db push`
- **Reversible** via `supabase db reset` (resets to initial state)

---

## Migration Structure

### Directory Location

All migrations live in `/supabase/migrations/`:

```
supabase/
├── migrations/
│   ├── 20251120000000_create_auth_schema.sql
│   ├── 20251120000001_create_initial_admins.sql
│   ├── 20251120000002_create_auth_tables.sql
│   ├── 20251120000003_create_rls_policies.sql
│   └── 20251120000004_create_audit_triggers.sql
├── config.toml
└── seed.sql
```

### Naming Convention

**Format**: `YYYYMMDDhhmmss_description.sql`

**Examples**:
- `20251120000002_create_auth_tables.sql` – Creates auth tables
- `20251120000003_create_rls_policies.sql` – Adds RLS policies
- `20251120000004_create_audit_triggers.sql` – Creates triggers

**Rules**:
- Use lowercase with underscores
- Be descriptive (what does this migration do?)
- Include timestamp to ensure ordering
- Keep descriptions concise (max 50 chars)

---

## Creating Migrations

### Option 1: Using Supabase CLI (Recommended)

```bash
supabase migration new <description>
```

**Example**:
```bash
supabase migration new add_user_profile_fields
# Creates: supabase/migrations/20251120000005_add_user_profile_fields.sql
```

This creates a new migration file with the current timestamp.

### Option 2: Manual Creation

Create a new file in `/supabase/migrations/` with the naming convention above:

```bash
touch supabase/migrations/20251120000005_add_user_profile_fields.sql
```

---

## Writing Migrations

### Basic Structure

```sql
-- Migration: Add user profile fields
-- Date: 2025-11-20
-- Description: Add full_name and avatar_url columns to users table

-- Add columns
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS full_name TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_users_full_name ON public.users(full_name);
```

### Best Practices

1. **Use IF NOT EXISTS** – Makes migrations idempotent (safe to run multiple times)
   ```sql
   CREATE TABLE IF NOT EXISTS public.users (...)
   ALTER TABLE public.users ADD COLUMN IF NOT EXISTS email TEXT;
   ```

2. **Add Comments** – Explain what the migration does
   ```sql
   -- Migration: Create users table
   -- Date: 2025-11-20
   -- Description: Initial user table with email, role, and timestamps
   ```

3. **Use Foreign Keys with ON DELETE CASCADE** – Maintain referential integrity
   ```sql
   CREATE TABLE public.auth_sessions (
     id UUID PRIMARY KEY,
     user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE
   );
   ```

4. **Create Indexes** – Improve query performance
   ```sql
   CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
   CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON public.audit_logs(user_id);
   ```

5. **Enable RLS** – Enforce security at database level
   ```sql
   ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
   ```

6. **Use Transactions** – Wrap related changes
   ```sql
   BEGIN;
     CREATE TABLE public.new_table (...);
     CREATE INDEX idx_new_table_id ON public.new_table(id);
   COMMIT;
   ```

---

## Testing Migrations

### Local Testing

1. **Start Supabase** (applies all migrations automatically):
   ```bash
   supabase start
   ```

2. **Verify Schema** – Check that tables, columns, and indexes exist:
   ```bash
   psql postgresql://postgres:postgres@127.0.0.1:54322/postgres -c \
     "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';"
   ```

3. **Reset Database** – Re-run all migrations from scratch:
   ```bash
   supabase db reset
   ```

4. **Check Indexes**:
   ```bash
   psql postgresql://postgres:postgres@127.0.0.1:54322/postgres -c \
     "SELECT indexname FROM pg_indexes WHERE schemaname = 'public';"
   ```

5. **Verify RLS Policies**:
   ```bash
   psql postgresql://postgres:postgres@127.0.0.1:54322/postgres -c \
     "SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public';"
   ```

### Testing in Supabase Studio

1. Open http://127.0.0.1:54323
2. Go to **SQL Editor**
3. Run test queries:
   ```sql
   -- Check table structure
   \d public.users
   
   -- Check indexes
   SELECT * FROM pg_indexes WHERE schemaname = 'public';
   
   -- Check RLS policies
   SELECT * FROM pg_policies WHERE schemaname = 'public';
   ```

---

## Applying Migrations

### Automatic (Recommended)

Migrations apply automatically when you run:

```bash
supabase start
```

This:
- Starts the local Supabase instance
- Applies all migrations in order
- Seeds test data from `supabase/seed.sql`

### Manual Application

To apply migrations without restarting Supabase:

```bash
supabase db push
```

---

## Resetting Migrations

### Reset to Initial State

```bash
supabase db reset
```

This:
- Drops all tables and data
- Re-runs all migrations from scratch
- Re-seeds test data

**Use when**:
- Testing migration logic
- Cleaning up after manual database changes
- Starting fresh for development

### Stop Supabase

```bash
supabase stop
```

---

## Common Migration Patterns

### Adding a Column

```sql
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS full_name TEXT;

-- Add index if frequently queried
CREATE INDEX IF NOT EXISTS idx_users_full_name ON public.users(full_name);
```

### Creating a Table

```sql
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON public.audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.audit_logs(created_at);
```

### Enabling RLS

```sql
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile"
  ON public.users
  FOR SELECT
  USING (auth.uid() = id);
```

### Creating Triggers

```sql
CREATE OR REPLACE FUNCTION public.log_auth_event()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.audit_logs (user_id, action, status)
  VALUES (NEW.user_id, 'login', 'success');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trigger_log_login
  AFTER INSERT ON public.auth_sessions
  FOR EACH ROW
  EXECUTE FUNCTION public.log_auth_event();
```

---

## Troubleshooting

### Migration Fails to Apply

**Error**: `ERROR: relation "users" already exists`

**Solution**: Use `IF NOT EXISTS` to make migrations idempotent:
```sql
CREATE TABLE IF NOT EXISTS public.users (...)
```

### Migrations Not Applying

**Check**: Are migrations in the correct directory?
```bash
ls -la supabase/migrations/
```

**Check**: Is Supabase running?
```bash
supabase status
```

**Solution**: Reset and restart:
```bash
supabase stop
supabase db reset
supabase start
```

### Cannot Connect to Database

**Check**: Is the database running?
```bash
psql postgresql://postgres:postgres@127.0.0.1:54322/postgres -c "SELECT 1;"
```

**Solution**: Start Supabase:
```bash
supabase start
```

---

## Migration Checklist

Before committing a migration:

- [ ] File is in `/supabase/migrations/`
- [ ] Filename follows `YYYYMMDDhhmmss_description.sql` format
- [ ] Migration uses `IF NOT EXISTS` for idempotency
- [ ] Foreign keys use `ON DELETE CASCADE`
- [ ] Indexes created for frequently queried columns
- [ ] RLS policies enabled if needed
- [ ] Comments explain what the migration does
- [ ] Migration tested locally with `supabase db reset`
- [ ] Schema verified with `\d table_name` in psql
- [ ] Indexes verified with `SELECT * FROM pg_indexes`
- [ ] RLS policies verified if applicable

---

## Next Steps

- **Create RLS Policies**: See [RLS Policies Guide](./rls-policies.md)
- **Seed Test Data**: See [Seed Data Setup](./seed-data.md)
- **Local Development**: See [Supabase Setup Guide](../guides/supabase-setup.md)

---

## Resources

- [Supabase Migrations Documentation](https://supabase.com/docs/guides/cli/managing-databases)
- [PostgreSQL ALTER TABLE](https://www.postgresql.org/docs/current/sql-altertable.html)
- [PostgreSQL CREATE INDEX](https://www.postgresql.org/docs/current/sql-createindex.html)
- [PostgreSQL Triggers](https://www.postgresql.org/docs/current/sql-createtrigger.html)
