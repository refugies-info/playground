-- Migration: Add RLS policies for DI tables to support security_invoker view
-- This allows the workflow_ingestion_metadata view (with security_invoker = true) 
-- to access structure and service data for authorized users.

-- 1. di_structures select policy
CREATE POLICY "di_structures_select_policy" 
ON public.di_structures
FOR SELECT 
TO authenticated 
USING (
  (select public.get_my_role()) in ('admin', 'editor', 'translator')
);

-- 2. di_services select policy
CREATE POLICY "di_services_select_policy" 
ON public.di_services
FOR SELECT 
TO authenticated 
USING (
  (select public.get_my_role()) in ('admin', 'editor', 'translator')
);

-- Grant select is already there from previous migrations, but ensuring it's present just in case
GRANT SELECT ON public.di_structures TO authenticated;
GRANT SELECT ON public.di_services TO authenticated;
