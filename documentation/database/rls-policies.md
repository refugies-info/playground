# Row-Level Security (RLS) Policies Guide

**Purpose**: Comprehensive guide to designing, implementing, and testing Row-Level Security policies in Supabase.

**Audience**: Backend developers and database engineers implementing authorization.

---

## Overview

Row-Level Security (RLS) enforces access control at the database level. Instead of relying on application logic, RLS policies prevent unauthorized data access directly in PostgreSQL.

### Why RLS?

- **Security**: Prevents data leaks from application bugs
- **Consistency**: All queries respect the same rules
- **Auditability**: Database logs show what data was accessed
- **Performance**: Filters happen at database level

### When to Use RLS

✅ **Use RLS for**:
- User-specific data (users can only see their own profile)
- Role-based access (admins see all, editors see own content)
- Multi-tenant systems (tenants see only their data)
- Sensitive data (financial records, personal information)

❌ **Don't use RLS for**:
- Public data (everyone can see)
- Complex business logic (implement in application)
- Performance-critical queries (RLS adds overhead)

---

## RLS Concepts

### Policies

A **policy** is a rule that determines who can access which rows.

**Structure**:
```sql
CREATE POLICY "policy_name"
  ON table_name
  FOR operation  -- SELECT, INSERT, UPDATE, DELETE
  USING (condition)  -- For SELECT, UPDATE, DELETE
  WITH CHECK (condition);  -- For INSERT, UPDATE
```

### Authentication Context

RLS uses `auth.uid()` to get the current user's ID:

```sql
-- User can only see their own row
USING (auth.uid() = user_id)
```

### Role-Based Access

Use `auth.jwt()` to check user roles:

```sql
-- Admin can see all rows
USING (
  (auth.jwt() ->> 'role') = 'admin'
)
```

---

## Enabling RLS

### Step 1: Enable RLS on Table

```sql
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
```

**Important**: Once RLS is enabled, ALL queries are blocked unless a policy allows them.

### Step 2: Create Helper Functions
For security and performance, we use helper functions to extract metadata from the JWT. These functions use `deterministic` and `search_path = ''` strictly.

```sql
-- Returns the role from JWT user_metadata (admin, editor, translator)
create or replace function public.get_my_role()
returns text as $$
  select coalesce(nullif(current_setting('request.jwt.claims', true)::jsonb -> 'user_metadata' ->> 'role', ''), 'none');
$$ language sql stable set search_path = '';

-- Returns the language assigned to the translator
create or replace function public.get_my_language()
returns text as $$
  select coalesce(nullif(current_setting('request.jwt.claims', true)::jsonb -> 'user_metadata' ->> 'language', ''), 'none');
$$ language sql stable set search_path = '';
```

### Step 3: Create Policies
See the [Project Policies](#project-policies) section for detailed implementations.

### Step 4: Test Policies
See [Testing RLS Policies](#testing-rls-policies) section below.

---

## Project Policies

### Access Matrix

| Table | Admin / Editor | Translator |
| :--- | :--- | :--- |
| `editorial_records` | **FULL** | **SELECT ONLY** |
| `translation_records` | **FULL** | **SELECT/UPDATE** (Filtered by language) |
| `publication_records` | **FULL** | **SELECT** (Filtered) / **INSERT** (Limited) |
| `ingestion_records` | **FULL** | **SELECT ONLY** |
| `letta_reports` | **FULL** | **DENIED** |

### Implementation Examples

#### Filtering by Role
```sql
CREATE POLICY "Admins and Editors have full access"
  ON public.translation_records
  FOR ALL -- Or split by SELECT, INSERT, etc.
  TO authenticated
  USING ((select public.get_my_role()) in ('admin', 'editor'));
```

#### Filtering by Role AND Language
```sql
CREATE POLICY "Translators can view their languages"
  ON public.translation_records
  FOR SELECT
  TO authenticated
  USING (
    (select public.get_my_role()) = 'translator'
    AND language = (select public.get_my_language())
  );
```

#### Performance Optimization (`EXISTS` vs `IN`)
For tables linked via foreign keys (like `publication_records` to `translation_records`), use `EXISTS` to leverage indexes.

```sql
CREATE POLICY "Optimized cross-table select"
  ON public.publication_records
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.translation_records tr 
      WHERE tr.id = translation_record_id 
      AND tr.language = (select public.get_my_language())
    )
  );
```

---

## Policy Patterns

### Pattern 1: User Can Access Own Data

**Use case**: Users can only see/edit their own profile

```sql
-- Users can SELECT their own row
CREATE POLICY "Users can view their own profile"
  ON public.users
  FOR SELECT
  USING (auth.uid() = id);

-- Users can UPDATE their own row
CREATE POLICY "Users can update their own profile"
  ON public.users
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);
```

### Pattern 2: Admin Can Access All Data

**Use case**: Admins can see/edit any user

```sql
-- Admins can SELECT all rows
CREATE POLICY "Admins can view all users"
  ON public.users
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Admins can UPDATE any row
CREATE POLICY "Admins can update any user"
  ON public.users
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
```

### Pattern 3: Role-Based Access

**Use case**: Different roles have different permissions

```sql
-- Editors can see content they created
CREATE POLICY "Editors can view their own content"
  ON public.content_items
  FOR SELECT
  USING (created_by = auth.uid());

-- Reviewers can see all submitted content
CREATE POLICY "Reviewers can view submitted content"
  ON public.content_items
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'reviewer'
    )
  );

-- Admins can see all content
CREATE POLICY "Admins can view all content"
  ON public.content_items
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
```

### Pattern 4: Prevent Deletion

**Use case**: Users can't delete their own data, only admins can

```sql
-- Prevent users from deleting their own data
CREATE POLICY "Only admins can delete users"
  ON public.users
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
```

### Pattern 5: Audit Logging

**Use case**: Users can only see their own audit logs

```sql
-- Users can see their own audit logs
CREATE POLICY "Users can view their own audit logs"
  ON public.audit_logs
  FOR SELECT
  USING (user_id = auth.uid());

-- Admins can see all audit logs
CREATE POLICY "Admins can view all audit logs"
  ON public.audit_logs
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
```

---

## Testing RLS Policies

### Test in Supabase Studio

1. Open http://127.0.0.1:54323
2. Go to **SQL Editor**
3. Simulate a user login with JWT claims:

```sql
-- Simulate logged-in user: alice (editor)
SET request.jwt.claims = '{"sub": "20000000-0000-0000-0000-000000000001", "role": "editor"}';

-- Test: User can see their own profile
SELECT id, email, role FROM public.users WHERE id = auth.uid();
-- Result: Returns alice's row

-- Test: User cannot see other users
SELECT id, email, role FROM public.users WHERE id != auth.uid();
-- Result: Empty (RLS blocks access)

-- Reset session
RESET request.jwt.claims;
```

### Test Admin Access

```sql
-- Simulate logged-in admin: luis
SET request.jwt.claims = '{"sub": "10000000-0000-0000-0000-000000000001", "role": "admin"}';

-- Test: Admin can see all users
SELECT id, email, role FROM public.users;
-- Result: Returns all users

-- Reset session
RESET request.jwt.claims;
```

### Test Denied Access

```sql
-- Simulate logged-in user: alice
SET request.jwt.claims = '{"sub": "20000000-0000-0000-0000-000000000001", "role": "editor"}';

-- Test: User cannot update other users
UPDATE public.users SET role = 'admin' WHERE id != auth.uid();
-- Result: 0 rows updated (RLS blocks)

-- Reset session
RESET request.jwt.claims;
```

### Verify Policies Are Active

```sql
-- Check RLS status
SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public';

-- List all policies
SELECT * FROM pg_policies WHERE schemaname = 'public';

-- List policies for specific table
SELECT * FROM pg_policies WHERE schemaname = 'public' AND tablename = 'users';
```

---

## Common Issues & Solutions

### Issue: "permission denied for schema public"

**Cause**: RLS is enabled but no policies exist.

**Solution**: Create at least one policy:
```sql
CREATE POLICY "Allow all"
  ON public.users
  FOR SELECT
  USING (true);
```

### Issue: "new row violates row-level security policy"

**Cause**: INSERT/UPDATE policy WITH CHECK condition failed.

**Solution**: Check the WITH CHECK condition:
```sql
-- Current policy
CREATE POLICY "Users can create their own profile"
  ON public.users
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Test: Make sure auth.uid() matches the id being inserted
INSERT INTO public.users (id, email, role)
VALUES (auth.uid(), 'test@example.com', 'editor');
```

### Issue: Admin queries are slow

**Cause**: RLS policies with subqueries can be slow.

**Solution**: Use simpler conditions or add indexes:
```sql
-- Slower: Subquery
USING (
  EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid() AND role = 'admin'
  )
)

-- Faster: Direct column check (if role is in JWT)
USING ((auth.jwt() ->> 'role') = 'admin')
```

### Issue: RLS policies not working in application

**Cause**: Application is using service role key (bypasses RLS).

**Solution**: Use anon key for client-side queries:
```typescript
// ❌ Wrong: Service role bypasses RLS
const client = createClient(url, serviceRoleKey);

// ✅ Correct: Anon key respects RLS
const client = createClient(url, anonKey);
```

---

## RLS Best Practices

1. **Enable RLS on all sensitive tables**
   ```sql
   ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
   ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
   ```

2. **Create policies for all operations** (SELECT, INSERT, UPDATE, DELETE)
   ```sql
   -- SELECT policy
   CREATE POLICY "..." ON table FOR SELECT USING (...);
   
   -- INSERT policy
   CREATE POLICY "..." ON table FOR INSERT WITH CHECK (...);
   
   -- UPDATE policy
   CREATE POLICY "..." ON table FOR UPDATE USING (...) WITH CHECK (...);
   
   -- DELETE policy
   CREATE POLICY "..." ON table FOR DELETE USING (...);
   ```

3. **Use meaningful policy names**
   ```sql
   -- ✅ Good
   CREATE POLICY "Users can view their own profile"
   
   -- ❌ Bad
   CREATE POLICY "policy1"
   ```

4. **Document policies with comments**
   ```sql
   -- Policy: Users can only see their own audit logs
   -- Rationale: Prevents users from seeing other users' activity
   -- Role: editor, admin
   CREATE POLICY "Users can view their own audit logs"
     ON public.audit_logs
     FOR SELECT
     USING (user_id = auth.uid());
   ```

5. **Test policies thoroughly**
   - Test with different user roles
   - Test denied access scenarios
   - Test edge cases (null values, empty results)

6. **Use indexes for performance**
   ```sql
   -- Index frequently queried columns in RLS conditions
   CREATE INDEX idx_users_role ON public.users(role);
   CREATE INDEX idx_audit_logs_user_id ON public.audit_logs(user_id);
   ```

---

## Debugging RLS Policies

### Enable Query Logging

```sql
-- Show all queries (including RLS filtering)
SET log_statement = 'all';
SET log_min_duration_statement = 0;
```

### Check Policy Evaluation

```sql
-- See which policies are applied
EXPLAIN (ANALYZE, BUFFERS)
SELECT * FROM public.users WHERE id = auth.uid();
```

### Test with Different Users

```sql
-- Test as user 1
SET request.jwt.claims = '{"sub": "user-1-id"}';
SELECT * FROM public.users;

-- Test as user 2
SET request.jwt.claims = '{"sub": "user-2-id"}';
SELECT * FROM public.users;

-- Test as admin
SET request.jwt.claims = '{"sub": "admin-id", "role": "admin"}';
SELECT * FROM public.users;

-- Reset
RESET request.jwt.claims;
```

---

## Migration Example

Here's how to add RLS to an existing table:

```sql
-- Migration: Add RLS to users table
-- Date: 2025-11-20

-- Enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own profile
CREATE POLICY "Users can view their own profile"
  ON public.users
  FOR SELECT
  USING (auth.uid() = id);

-- Policy: Admins can view all users
CREATE POLICY "Admins can view all users"
  ON public.users
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Policy: Users can update their own profile
CREATE POLICY "Users can update their own profile"
  ON public.users
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Policy: Admins can update any user
CREATE POLICY "Admins can update any user"
  ON public.users
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
```

---

## Next Steps

- **Create Migrations**: See [Migrations Guide](./migrations.md)
- **Seed Test Data**: See [Seed Data Setup](./seed-data.md)
- **Local Development**: See [Supabase Setup Guide](../guides/supabase-setup.md)

---

## Resources

- [Supabase RLS Documentation](https://supabase.com/docs/guides/auth/row-level-security)
- [PostgreSQL RLS Documentation](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)
- [RLS Best Practices](https://supabase.com/docs/guides/auth/row-level-security-best-practices)
