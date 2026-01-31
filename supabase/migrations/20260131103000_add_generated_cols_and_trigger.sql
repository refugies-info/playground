-- Migration: Add Generated Columns and Ingestion Versioning

-- 1. Ensure Generated Columns exist
-- Drop logic handled by previous migration? If not implicitly dropped, consistent re-definition is safe or `IF NOT EXISTS`.
-- Note: Postgres doesn't easily support `ADD COLUMN IF NOT EXISTS` for generated columns with simple syntax in all versions or complex expressions.
-- Safest is to attempt add or replace.

-- di_structures: di_id
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'di_structures' AND column_name = 'di_id') THEN
        ALTER TABLE public.di_structures ADD COLUMN di_id text GENERATED ALWAYS AS (data->>'id') STORED;
    END IF;
END $$;

-- di_services: di_id, di_structure_id
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'di_services' AND column_name = 'di_id') THEN
        ALTER TABLE public.di_services ADD COLUMN di_id text GENERATED ALWAYS AS (data->>'id') STORED;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'di_services' AND column_name = 'di_structure_id') THEN
        ALTER TABLE public.di_services ADD COLUMN di_structure_id text GENERATED ALWAYS AS (data->>'structure_id') STORED;
        -- Create index for performance on join
        CREATE INDEX IF NOT EXISTS di_services_di_structure_id_idx ON public.di_services(di_structure_id);
    END IF;
END $$;


-- 2. Versioning Trigger for Ingestion Records
CREATE OR REPLACE FUNCTION public.increment_ingestion_version()
RETURNS TRIGGER AS $$
DECLARE
    max_ver integer;
BEGIN
    -- Check if we have a service ID context
    IF NEW.di_service_id IS NOT NULL THEN
        SELECT COALESCE(MAX(version), 0) INTO max_ver
        FROM public.ingestion_records
        WHERE di_service_id = NEW.di_service_id;

        NEW.version := max_ver + 1;
    END IF;
    -- Note: If we support structure-only records later, add logic here.

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tr_ingestion_records_version ON public.ingestion_records;

CREATE TRIGGER tr_ingestion_records_version
BEFORE INSERT ON public.ingestion_records
FOR EACH ROW
EXECUTE FUNCTION public.increment_ingestion_version();
