-- TEMPORARY: Enable update access for workflows
-- 
-- ⚠️ SECURITY WARNING: This policy is intentionally permissive for POC purposes.
-- It allows ANY authenticated user to update ANY workflow.
--
-- WHY: The current schema does not have user ownership on workflows.
-- Workflows are linked to rco_records which don't have user_id either.
--
-- TODO: Before production, implement one of these solutions:
-- 1. Add a user_id column to workflows table and restrict to owners
-- 2. Create a junction table (user_workflows) for multi-user access
-- 3. Implement role-based access control (RBAC) with a roles table
--
-- Example secure policy (requires schema changes):
-- using (auth.uid() IN (
--   SELECT user_id FROM user_workflows WHERE workflow_id = workflows.id
-- ))

create policy "Enable update access for authenticated users"
on "public"."workflows"
for update
to authenticated
using (true)
with check (true);
