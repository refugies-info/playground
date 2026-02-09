-- Migration: Harmonize workflow columns
-- Splits status/progress into compliance_status, online_status, and work_status
-- Note: No data migration needed as DB will be reset

-- 1. Drop old columns first
ALTER TABLE public.workflows 
  DROP COLUMN status,
  DROP COLUMN progress;

-- 2. Add new columns
ALTER TABLE public.workflows 
  ADD COLUMN compliance_status text,
  ADD COLUMN online_status text,
  ADD COLUMN work_status text;

-- 3. Add CHECK constraints to enforce valid values
ALTER TABLE public.workflows
  ADD CONSTRAINT compliance_status_check 
    CHECK (compliance_status IS NULL OR compliance_status IN ('pending', 'compliant', 'non_compliant', 'error')),
  ADD CONSTRAINT online_status_check 
    CHECK (online_status IS NULL OR online_status IN ('published', 'archived')),
  ADD CONSTRAINT work_status_check 
    CHECK (work_status IS NULL OR work_status IN ('to_process', 'draft'));

-- 4. Update triggers to use new column names

-- 4a. Update trigger for new ingestion records
CREATE OR REPLACE FUNCTION public.handle_new_ingestion_record()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.workflows (ingestion_record_id, work_status, compliance_status)
  VALUES (NEW.id, NULL, NULL);
  RETURN NEW;
END;
$$;

-- 4b. Update trigger for new editorial records
CREATE OR REPLACE FUNCTION public.handle_new_editorial_record()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  UPDATE public.workflows
  SET
    editorial_record_id = NEW.id,
    work_status = 'draft'
  WHERE ingestion_record_id = NEW.ingestion_record_id;
  RETURN NEW;
END;
$$;

-- 4c. Update trigger for compliance status from ingestion record
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
        SET compliance_status = 'compliant',
            work_status = 'to_process'
        WHERE ingestion_record_id = NEW.id;
      ELSE
        UPDATE public.workflows
        SET compliance_status = 'non_compliant',
            online_status = 'archived'
        WHERE ingestion_record_id = NEW.id;
      END IF;
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

-- 4d. Update trigger for compliance status from letta report
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
            SET compliance_status = 'compliant',
                work_status = 'to_process'
            WHERE ingestion_record_id = v_ingestion_record_id;
        ELSE
            UPDATE public.workflows
            SET compliance_status = 'non_compliant',
                online_status = 'archived'
            WHERE ingestion_record_id = v_ingestion_record_id;
        END IF;
     END IF;
  END IF;
  RETURN NEW;
END;
$$;

