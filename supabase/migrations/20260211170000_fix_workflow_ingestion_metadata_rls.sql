-- Fix: Revoke excessive anon privileges on workflow_ingestion_metadata view
-- The view was recreated (DROP + CREATE) in migration 20260209153000,
-- after the revoke_anon_privileges migration (20260206130000).
-- The DROP/CREATE re-granted default privileges to anon via the
-- default Supabase schema grants.
--
-- The view already has security_invoker=true so the underlying tables'
-- RLS (admin/editor/translator only) is enforced on the querying user.
-- However, the anon role should not have any privileges on this view
-- per the principle of least privilege.

REVOKE ALL ON public.workflow_ingestion_metadata FROM anon;
