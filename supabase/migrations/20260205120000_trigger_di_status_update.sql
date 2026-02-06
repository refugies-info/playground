-- Function to update workflow status when a Letta report is linked to an ingestion record
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
  v_new_status text;
BEGIN
  -- Only proceed if ingestion_report_id is set
  IF NEW.ingestion_report_id IS NOT NULL THEN
    -- Fetch report data
    SELECT status, metadata INTO v_report_status, v_report_metadata
    FROM public.letta_reports
    WHERE id = NEW.ingestion_report_id;

    -- Look for compliance status in metadata
    -- Schema: { compliant: boolean, duplicate: boolean }
    IF v_report_metadata IS NOT NULL AND v_report_metadata ? 'compliant' THEN
      v_compliant := (v_report_metadata->>'compliant')::boolean;
      
      IF v_compliant THEN
        v_new_status := 'compliant';
      ELSE
        v_new_status := 'non_compliant';
      END IF;

      -- Update workflow
      UPDATE public.workflows
      SET status = v_new_status
      WHERE ingestion_record_id = NEW.id;
    END IF;
  END IF;
  return NEW;
END;
$$;

-- Function to update workflow status when a Letta report is updated
CREATE OR REPLACE FUNCTION public.update_workflow_status_from_letta_report()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_compliant boolean;
  v_new_status text;
  v_ingestion_record_id uuid;
BEGIN
  -- Only proceed if it is an ingestion report and has metadata
  IF NEW.report_type = 'ingestion' AND NEW.metadata IS NOT NULL AND NEW.metadata ? 'compliant' THEN
     v_compliant := (NEW.metadata->>'compliant')::boolean;
     
     IF v_compliant THEN
        v_new_status := 'compliant';
      ELSE
        v_new_status := 'non_compliant';
      END IF;

      -- Find linked ingestion record
      SELECT id INTO v_ingestion_record_id
      FROM public.ingestion_records
      WHERE ingestion_report_id = NEW.id;

      IF v_ingestion_record_id IS NOT NULL THEN
        -- Update workflow
        UPDATE public.workflows
        SET status = v_new_status
        WHERE ingestion_record_id = v_ingestion_record_id;
      END IF;
  END IF;
  return NEW;
END;
$$;

-- Create Trigger on ingestion_records
DROP TRIGGER IF EXISTS on_ingestion_record_link_report ON public.ingestion_records;
CREATE TRIGGER on_ingestion_record_link_report
  AFTER UPDATE OF ingestion_report_id, metadata ON public.ingestion_records
  FOR EACH ROW
  EXECUTE FUNCTION public.update_workflow_status_from_ingestion_record();

-- Create Trigger on letta_reports
DROP TRIGGER IF EXISTS on_letta_report_update_status ON public.letta_reports;
CREATE TRIGGER on_letta_report_update_status
  AFTER UPDATE OF status, metadata ON public.letta_reports
  FOR EACH ROW
  EXECUTE FUNCTION public.update_workflow_status_from_letta_report();
