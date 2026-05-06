-- Restrict execution of claim_di_audit_targets to service_role only.
-- By default, PostgreSQL grants EXECUTE on functions to PUBLIC (including the anon role),
-- which would allow anyone with the public Supabase key to call this function
-- and disrupt the ingestion pipeline by claiming records.

REVOKE EXECUTE ON FUNCTION public.claim_di_audit_targets(uuid[], integer, interval) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.claim_di_audit_targets(uuid[], integer, interval) TO service_role;
