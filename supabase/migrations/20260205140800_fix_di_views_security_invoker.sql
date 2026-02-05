-- Fix: Re-enable security_invoker on DI views
-- This ensures views respect RLS policies of the querying user, not the view creator

DROP VIEW IF EXISTS public.di_structures_latest;
DROP VIEW IF EXISTS public.di_services_latest;

CREATE VIEW public.di_structures_latest
WITH (security_invoker = true)
AS
SELECT DISTINCT ON (s.di_id) s.*
FROM public.di_structures AS s
ORDER BY s.di_id, s.version DESC;

CREATE VIEW public.di_services_latest
WITH (security_invoker = true)
AS
SELECT DISTINCT ON (s.di_id) s.*
FROM public.di_services AS s
ORDER BY s.di_id, s.version DESC;

GRANT SELECT ON public.di_structures_latest TO authenticated, postgres, service_role;
GRANT SELECT ON public.di_services_latest TO authenticated, postgres, service_role;
