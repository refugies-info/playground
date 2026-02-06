-- Security Fix: Revoke excessive privileges from anon role
-- This migration addresses the critical security vulnerability where the anon role
-- was granted ALL privileges (DELETE, TRUNCATE, INSERT, UPDATE) on all tables.
-- 
-- Even though RLS is enabled, granting these privileges violates the principle of
-- least privilege and creates unnecessary risk if RLS policies are misconfigured.

-- Revoke all permissions from anon role on all tables
revoke all on all tables in schema public from anon;
revoke all on all sequences in schema public from anon;
revoke all on all functions in schema public from anon;
revoke all on schema public from anon;

-- Grant minimal usage on schema (required for basic access)
grant usage on schema public to anon;

-- Note: If specific tables need to be accessible to anonymous users in the future,
-- grant only SELECT permission on those specific tables, never INSERT/UPDATE/DELETE.
-- Example (commented out):
-- grant select on public.some_public_table to anon;
