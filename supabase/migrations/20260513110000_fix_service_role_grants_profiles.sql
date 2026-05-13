-- Fix missing GRANT on profiles for service_role
--
-- Problem: service_role only had REFERENCES, TRIGGER, TRUNCATE on profiles.
-- Missing SELECT, INSERT, UPDATE, DELETE — causing "permission denied for table profiles"
-- (PostgreSQL code 42501) in assertAdmin() and other server-side admin operations.
--
-- Root cause: the profiles table was created without the standard Supabase default grants
-- for service_role. Local dev works because supabase db reset applies default grants
-- automatically; production (supabase db push) only runs migration SQL.
--
-- Impact:
--   - assertAdmin() uses adminClient (service_role) to read profiles.role → SELECT needed
--   - createUser() writes profiles.role after invite → INSERT needed
--   - updateUser() updates profiles.role → UPDATE needed

grant select, insert, update, delete on public.profiles to service_role;
