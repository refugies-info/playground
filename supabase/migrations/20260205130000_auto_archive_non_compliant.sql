-- Migration: Auto-archive non-compliant workflows
-- Replaces the functions to add logic: status = 'non_compliant' -> progress = 'archived'

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
        SET status = 'compliant'
        WHERE ingestion_record_id = NEW.id;
      ELSE
        UPDATE public.workflows
        SET status = 'non_compliant',
            progress = 'archived'
        WHERE ingestion_record_id = NEW.id;
      END IF;
    END IF;
  END IF;
  return NEW;
END;
$$;

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
            SET status = 'compliant'
            WHERE ingestion_record_id = v_ingestion_record_id;
        ELSE
            UPDATE public.workflows
            SET status = 'non_compliant',
                progress = 'archived'
            WHERE ingestion_record_id = v_ingestion_record_id;
        END IF;
     END IF;
  END IF;
  return NEW;
END;
$$;
