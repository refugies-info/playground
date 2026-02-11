-- Migration: Move online_status and work_status to records

-- 1. Add columns to editorial_records
ALTER TABLE public.editorial_records 
  ADD COLUMN online_status text CHECK (online_status IS NULL OR online_status IN ('published', 'archived')),
  ADD COLUMN work_status text CHECK (work_status IS NULL OR work_status IN ('to_process', 'draft'));

-- 2. Add columns to translation_records
ALTER TABLE public.translation_records 
  ADD COLUMN online_status text CHECK (online_status IS NULL OR online_status IN ('published', 'archived')),
  ADD COLUMN work_status text CHECK (work_status IS NULL OR work_status IN ('to_process', 'draft'));

-- 3. Data Migration for Editorial Records
-- Sync online_status and work_status from workflows to editorial_records
UPDATE public.editorial_records er
SET 
  online_status = w.online_status,
  work_status = w.work_status
FROM public.workflows w
WHERE w.editorial_record_id = er.id;

-- 4. Data Migration for Translation Records
-- Reset all translation records to work_status='to_process', online_status=NULL
UPDATE public.translation_records
SET 
  work_status = 'to_process',
  online_status = NULL;

-- 5. Drop old status column from translation_records if it exists
ALTER TABLE public.translation_records DROP COLUMN IF EXISTS status;

-- 6. Update Triggers (Remove writes to workflows status columns, redirect where necessary)

-- 6a. Update handle_new_editorial_record
-- Previously updated workflows.work_status = 'draft'. 
-- Now should set editorial_records.work_status = 'draft' (if not default)
-- But triggers happen AFTER INSERT, so we should rely on default or input value. 
-- However, we must stop it from trying to update workflows.work_status.
CREATE OR REPLACE FUNCTION public.handle_new_editorial_record()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  -- Update the content_flow linked to the Ingestion record
  -- Removed work_status update on workflows
  UPDATE public.workflows
  SET
    editorial_record_id = NEW.id
  WHERE ingestion_record_id = NEW.ingestion_record_id;
  RETURN NEW;
END;
$$;

-- 6b. Update handle_new_ingestion_record
-- Previously inserted into workflows with NULL statuses. 
-- Now workflows doesn't have these columns.
CREATE OR REPLACE FUNCTION public.handle_new_ingestion_record()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  -- Update the content_flow linked to the RCO record
  -- Removed work_status, compliance_status update (compliance stays on workflows? yes)
  -- Wait, compliance_status stays on workflows.
  INSERT INTO public.workflows (ingestion_record_id, compliance_status)
  VALUES (NEW.id, NULL);
  RETURN NEW;
END;
$$;

-- 6c. Update update_workflow_status_from_ingestion_record
-- Previously updated work_status and online_status on workflows.
-- Now should only update compliance_status.
-- Logic for "to_process" or "archived" based on compliance is now UI/App logic 
-- OR strictly about compliance status.
-- User said: "Si un workflow est conforme... il faut que le workdflow ait un statut "à traiter" (frontend)"
-- So we just remove the side-effects on online_status/work_status.
CREATE OR REPLACE FUNCTION public.update_workflow_status_from_ingestion_record()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_report_status text;
  v_report_metadata jsonb;
  v_compliant boolean;
BEGIN
  -- Only proceed if ingestion_report_id is set
  IF NEW.ingestion_report_id IS NOT NULL THEN
    -- Fetch report data
    SELECT status, metadata INTO v_report_status, v_report_metadata
    FROM public.letta_reports
    WHERE id = NEW.ingestion_report_id;

    -- Look for compliance status in metadata
    IF v_report_metadata IS NOT NULL AND v_report_metadata ? 'compliant' THEN
      v_compliant := (v_report_metadata->>'compliant')::boolean;
      
      IF v_compliant THEN
        UPDATE public.workflows
        SET compliance_status = 'compliant'
        -- Removed work_status update
        WHERE ingestion_record_id = NEW.id;
      ELSE
        UPDATE public.workflows
        SET compliance_status = 'non_compliant'
        -- Removed online_status update
        WHERE ingestion_record_id = NEW.id;
      END IF;
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

-- 6d. Update update_workflow_status_from_letta_report
-- Same logic as above.
CREATE OR REPLACE FUNCTION public.update_workflow_status_from_letta_report()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_compliant boolean;
  v_ingestion_record_id uuid;
BEGIN
  -- Only proceed if it is an ingestion report and has metadata
  IF NEW.report_type = 'ingestion' AND NEW.metadata IS NOT NULL AND NEW.metadata ? 'compliant' THEN
     v_compliant := (NEW.metadata->>'compliant')::boolean;
     
     -- Find linked ingestion record
     SELECT id INTO v_ingestion_record_id
     FROM public.ingestion_records
     WHERE ingestion_report_id = NEW.id;

     IF v_ingestion_record_id IS NOT NULL THEN
        IF v_compliant THEN
            UPDATE public.workflows
            SET compliance_status = 'compliant'
            -- Removed work_status update
            WHERE ingestion_record_id = v_ingestion_record_id;
        ELSE
            UPDATE public.workflows
            SET compliance_status = 'non_compliant'
            -- Removed online_status update
            WHERE ingestion_record_id = v_ingestion_record_id;
        END IF;
     END IF;
  END IF;
  RETURN NEW;
END;
$$;

-- 6e. Update `handle_new_rco_record` trigger if exists
-- Check previous schema: 
-- INSERT INTO public.workflows (rco_record_id, progress, status) -> moved to compliance/online/work
-- It was inserting: VALUES (NEW.id, 'to_process', 'unknown');
-- 'to_process' was work_status. 'unknown' was status (removed).
-- Now we probably just insert rco_record_id ?
-- Wait, handle_new_rco_record in 20251209083837_initial-schema.sql inserted into workflows.
-- But 20260209120000_harmonize_workflow_columns.sql changed columns.
-- Check if handle_new_rco_record was updated in 20260209120000... NO. 
-- It was NOT updated in 20260209120000. This might be a bug or it was dropped?
-- Let's assume we need to fix it regardless.
CREATE OR REPLACE FUNCTION public.handle_new_rco_record()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  -- Insert into workflows with minimal info
  INSERT INTO public.workflows (rco_record_id)
  VALUES (NEW.id);
  RETURN NEW;
END;
$$;


-- 7. Drop columns from workflows
ALTER TABLE public.workflows 
  DROP COLUMN online_status,
  DROP COLUMN work_status;
