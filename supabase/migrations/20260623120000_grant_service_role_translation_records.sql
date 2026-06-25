-- Fix missing GRANTs on translation_records for service_role
--
-- Problem: translation_records was created in 20260127160000_secure_rls_roles.sql
-- without GRANTs for service_role. The service_role bypasses RLS but still
-- requires explicit table-level GRANTs.
--
-- Impact: all translation workflows failed with PostgreSQL error 42501
-- "permission denied for table translation_records".

GRANT SELECT, INSERT, UPDATE, DELETE ON public.translation_records TO service_role;
