-- Migration: Fix DI Ingestion Versioning
-- Bug: processIngestionRecords reads ALL versions from di_services (not di_services_latest)
--      Each version has a different UUID, so the correlation in increment_ingestion_version
--      never finds previous versions -> version stays at 1 forever.
--      handle_new_ingestion_record creates a new workflow every time -> duplicate workflows.
-- Fix: Correlate by di_id (stable API ID) via JOIN with di_services.
--       If version > 1, re-point existing workflow instead of creating a new one.

-- =============================================================================
-- Step 1: Fix increment_ingestion_version trigger
-- =============================================================================
CREATE OR REPLACE FUNCTION public.increment_ingestion_version()
RETURNS TRIGGER AS $$
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
$$ LANGUAGE plpgsql;

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

-- =============================================================================
-- Step 3: Clean up existing duplicates
-- Strategy: keep exactly 1 IR (the "best") and 1 workflow per di_id.
-- The "best" IR = highest version, then most recent created_at.
-- Editorial workflows are re-pointed to the best IR (editorial work preserved).
-- =============================================================================

-- 3A. Identify the best ingestion_record per di_id
CREATE TEMP TABLE di_best_ir AS
SELECT DISTINCT ON (ds.di_id)
    ds.di_id,
    ir.id AS best_ir_id
FROM public.di_services ds
JOIN public.ingestion_records ir ON ir.di_service_id = ds.id
WHERE ds.di_id IS NOT NULL
ORDER BY ds.di_id, ir.version DESC, ir.created_at DESC;

-- 3B. Re-point editorial workflows to the best IR for their di_id
UPDATE public.workflows w
SET ingestion_record_id = best.best_ir_id
FROM public.ingestion_records ir
JOIN public.di_services ds ON ir.di_service_id = ds.id
JOIN di_best_ir best ON best.di_id = ds.di_id
WHERE w.ingestion_record_id = ir.id
  AND w.editorial_record_id IS NOT NULL
  AND w.ingestion_record_id IS DISTINCT FROM best.best_ir_id;

-- 3C. Re-point editorial_records to the best IR for their di_id
UPDATE public.editorial_records er
SET ingestion_record_id = best.best_ir_id
FROM public.ingestion_records ir
JOIN public.di_services ds ON ir.di_service_id = ds.id
JOIN di_best_ir best ON best.di_id = ds.di_id
WHERE er.ingestion_record_id = ir.id
  AND er.ingestion_record_id IS DISTINCT FROM best.best_ir_id;

-- 3D. Delete non-editorial workflows pointing to non-best IRs
DELETE FROM public.workflows w
WHERE w.editorial_record_id IS NULL
  AND NOT EXISTS (
      SELECT 1 FROM di_best_ir b WHERE b.best_ir_id = w.ingestion_record_id
  )
  AND w.ingestion_record_id IN (
      SELECT ir.id FROM public.ingestion_records ir WHERE ir.di_service_id IS NOT NULL
  );

-- 3E. Delete non-editorial workflows on the best IR when an editorial
--     workflow already points to the same IR (after re-pointing in 3B)
DELETE FROM public.workflows w
WHERE w.editorial_record_id IS NULL
  AND EXISTS (
      SELECT 1 FROM public.workflows w2
      WHERE w2.ingestion_record_id = w.ingestion_record_id
        AND w2.editorial_record_id IS NOT NULL
        AND w2.id != w.id
  );

-- 3F. Delete orphan ingestion_records (not the best, not referenced)
DELETE FROM public.ingestion_records ir
WHERE ir.di_service_id IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM di_best_ir b WHERE b.best_ir_id = ir.id)
  AND NOT EXISTS (SELECT 1 FROM public.workflows w WHERE w.ingestion_record_id = ir.id)
  AND NOT EXISTS (SELECT 1 FROM public.editorial_records er WHERE er.ingestion_record_id = ir.id);

DROP TABLE di_best_ir;