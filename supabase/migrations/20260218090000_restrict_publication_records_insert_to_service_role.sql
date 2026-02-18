-- Restrict INSERT on publication_records to service_role only
-- Publication records are created by backend workflows, not by authenticated users
-- This prevents authenticated users (even admins/editors) from directly inserting records
-- which could potentially include malicious 'target' URLs for XSS attacks

-- Drop the overly permissive INSERT policy
drop policy if exists "publication_records_insert_policy" on public.publication_records;

-- Create new restrictive INSERT policy for service_role only
-- Authenticated users can still SELECT and UPDATE (per existing policies)
create policy "publication_records_insert_policy" 
  on public.publication_records 
  for insert 
  to service_role
  with check (true);
