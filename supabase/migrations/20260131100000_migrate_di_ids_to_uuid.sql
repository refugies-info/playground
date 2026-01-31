-- Migration: Migrate DI IDs to UUID and Update Ingestion Records

-- 1. Drop dependent views
DROP VIEW IF EXISTS public.di_structures_latest;
DROP VIEW IF EXISTS public.di_services_latest;

-- 2. Migrate di_structures ID
ALTER TABLE public.di_structures DROP CONSTRAINT IF EXISTS di_structures_pkey;
ALTER TABLE public.di_structures DROP COLUMN id;
ALTER TABLE public.di_structures ADD COLUMN id uuid NOT NULL DEFAULT gen_random_uuid();
ALTER TABLE public.di_structures ADD CONSTRAINT di_structures_pkey PRIMARY KEY (id);

-- 3. Migrate di_services ID
ALTER TABLE public.di_services DROP CONSTRAINT IF EXISTS di_services_pkey;
ALTER TABLE public.di_services DROP COLUMN id;
ALTER TABLE public.di_services ADD COLUMN id uuid NOT NULL DEFAULT gen_random_uuid();
ALTER TABLE public.di_services ADD CONSTRAINT di_services_pkey PRIMARY KEY (id);

-- 4. Recreate views
CREATE OR REPLACE VIEW public.di_structures_latest AS
SELECT DISTINCT ON (di_id) *
FROM public.di_structures
ORDER BY di_id, version DESC;

CREATE OR REPLACE VIEW public.di_services_latest AS
SELECT DISTINCT ON (di_id) *
FROM public.di_services
ORDER BY di_id, version DESC;

GRANT SELECT ON public.di_structures_latest TO authenticated, postgres, service_role;
GRANT SELECT ON public.di_services_latest TO authenticated, postgres, service_role;

-- 5. Update ingestion_records
ALTER TABLE public.ingestion_records ALTER COLUMN rco_record_id DROP NOT NULL;
ALTER TABLE public.ingestion_records ADD COLUMN di_service_id uuid REFERENCES public.di_services(id);
ALTER TABLE public.ingestion_records ADD COLUMN di_structure_id uuid REFERENCES public.di_structures(id);
ALTER TABLE public.ingestion_records ADD COLUMN version integer DEFAULT 1;
