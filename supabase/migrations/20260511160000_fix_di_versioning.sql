-- Migration: Fix DI Ingestion Versioning
-- Bug 1: increment_ingestion_version trigger correlated by di_service_id (UUID)
--         Each version has a different UUID → trigger never finds previous versions
--         → version always stays at 1.
-- Bug 2: handle_new_ingestion_record created a new workflow for every new IR
--         (including version 2+) → duplicate workflows per service.
-- Fix: Correlate by di_id (stable API ID) via JOIN with di_services.
--      If version > 1, re-point existing workflow instead of creating a new one.

-- =============================================================================
-- Step 1: Fix increment_ingestion_version trigger
-- =============================================================================
CREATE OR REPLACE FUNCTION public.increment_ingestion_version()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    max_ver integer;
    new_di_id text;
BEGIN
    IF NEW.di_service_id IS NOT NULL THEN
        -- Retrieve the di_id of the new service via JOIN
        SELECT ds.di_id INTO new_di_id
        FROM public.di_services ds
        WHERE ds.id = NEW.di_service_id;

        -- Find max version for this di_id (across all di_services versions)
        SELECT COALESCE(MAX(ir.version), 0) INTO max_ver
        FROM public.ingestion_records ir
        JOIN public.di_services ds ON ir.di_service_id = ds.id
        WHERE ds.di_id = new_di_id;

        NEW.version := max_ver + 1;
    END IF;
    RETURN NEW;
END;
$$;

-- =============================================================================
-- Step 2: Fix handle_new_ingestion_record trigger
-- =============================================================================
CREATE OR REPLACE FUNCTION public.handle_new_ingestion_record()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    new_di_id text;
BEGIN
    -- Retrieve the di_id of the new service
    SELECT ds.di_id INTO new_di_id
    FROM public.di_services ds
    WHERE ds.id = NEW.di_service_id;

    IF NEW.version = 1 THEN
        -- New service: create a new workflow
        INSERT INTO public.workflows (ingestion_record_id)
        VALUES (NEW.id);
    ELSE
        -- Updated service (version > 1): re-point the existing workflow.
        -- Prefer workflows with editorial_record (active editorial work),
        -- fall back to any workflow for this di_id.
        UPDATE public.workflows
        SET ingestion_record_id = NEW.id
        WHERE id = (
            SELECT w.id
            FROM public.workflows w
            JOIN public.ingestion_records ir ON w.ingestion_record_id = ir.id
            JOIN public.di_services ds ON ir.di_service_id = ds.id
            WHERE ds.di_id = new_di_id
              AND ir.id != NEW.id
            ORDER BY (w.editorial_record_id IS NOT NULL) DESC
            LIMIT 1
        );

        -- If no existing workflow found at all, create a new one
        IF NOT FOUND THEN
            INSERT INTO public.workflows (ingestion_record_id)
            VALUES (NEW.id);
        END IF;
    END IF;

    RETURN NEW;
END;
$$;
