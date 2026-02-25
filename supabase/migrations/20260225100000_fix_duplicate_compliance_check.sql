-- Migration: Fix compliance check to account for duplicate flag (RI-1117)
-- Rule: a record is compliant iff metadata.compliant=true AND metadata.duplicate=false

-- 1. Update trigger: ingestion_record linked to letta_report
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
  IF NEW.ingestion_report_id IS NOT NULL THEN
    SELECT status, metadata INTO v_report_status, v_report_metadata
    FROM public.letta_reports
    WHERE id = NEW.ingestion_report_id;

    IF v_report_metadata IS NOT NULL AND v_report_metadata ? 'compliant' THEN
      -- compliant iff compliant=true AND duplicate=false
      v_compliant := (v_report_metadata->>'compliant')::boolean
                     AND NOT COALESCE((v_report_metadata->>'duplicate')::boolean, false);

      IF v_compliant THEN
        UPDATE public.workflows
        SET compliance_status = 'compliant'
        WHERE ingestion_record_id = NEW.id;
      ELSE
        UPDATE public.workflows
        SET compliance_status = 'non_compliant'
        WHERE ingestion_record_id = NEW.id;
      END IF;
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

-- 2. Update trigger: letta_report metadata updated directly
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
  IF NEW.report_type = 'ingestion' AND NEW.metadata IS NOT NULL AND NEW.metadata ? 'compliant' THEN
    -- compliant iff compliant=true AND duplicate=false
    v_compliant := (NEW.metadata->>'compliant')::boolean
                   AND NOT COALESCE((NEW.metadata->>'duplicate')::boolean, false);

    SELECT id INTO v_ingestion_record_id
    FROM public.ingestion_records
    WHERE ingestion_report_id = NEW.id;

    IF v_ingestion_record_id IS NOT NULL THEN
      IF v_compliant THEN
        UPDATE public.workflows
        SET compliance_status = 'compliant'
        WHERE ingestion_record_id = v_ingestion_record_id;
      ELSE
        UPDATE public.workflows
        SET compliance_status = 'non_compliant'
        WHERE ingestion_record_id = v_ingestion_record_id;
      END IF;
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

-- 3. Fix existing records: mark as non_compliant if duplicate=true but currently compliant
UPDATE public.workflows w
SET compliance_status = 'non_compliant'
FROM public.ingestion_records ir
JOIN public.letta_reports lr ON ir.ingestion_report_id = lr.id
WHERE w.ingestion_record_id = ir.id
  AND w.compliance_status = 'compliant'
  AND lr.report_type = 'ingestion'
  AND (lr.metadata->>'duplicate')::boolean = true;
