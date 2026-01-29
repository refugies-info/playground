-- Fix: Enable security_invoker on views to respect RLS policies
-- This makes the views show as "RLS Enabled" in Supabase Studio

-- Recreate views with security_invoker = true
DROP VIEW IF EXISTS public.di_structures_latest;
DROP VIEW IF EXISTS public.di_services_latest;

CREATE VIEW public.di_structures_latest
WITH (security_invoker = true)
AS
SELECT DISTINCT ON (di_id) *
FROM public.di_structures
ORDER BY di_id, version DESC;

CREATE VIEW public.di_services_latest
WITH (security_invoker = true)
AS
SELECT DISTINCT ON (di_id) *
FROM public.di_services
ORDER BY di_id, version DESC;

-- Grant read access to views
GRANT SELECT ON public.di_structures_latest TO authenticated, postgres, service_role;
GRANT SELECT ON public.di_services_latest TO authenticated, postgres, service_role;
