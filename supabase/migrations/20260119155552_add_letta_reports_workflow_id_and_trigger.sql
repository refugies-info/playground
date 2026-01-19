-- Migration: Add workflow_id to letta_reports and create auto-linking trigger
-- Purpose: Automatically link letta_reports to editorial_records when they are created

-- Step 1: Add workflow_id column to letta_reports
ALTER TABLE "public"."letta_reports"
ADD COLUMN "workflow_id" uuid REFERENCES public.workflows(id) ON UPDATE CASCADE ON DELETE SET NULL;

-- Step 2: Create index for efficient lookups
CREATE INDEX letta_reports_workflow_id_idx ON public.letta_reports USING btree (workflow_id);

-- Step 3: Create function to link unlinked letta_reports to editorial_record
CREATE OR REPLACE FUNCTION public.link_letta_reports_to_editorial_record()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  v_workflow_id uuid;
  v_editorial_report_id uuid;
  v_metadata_report_id uuid;
BEGIN
  -- Find the workflow that references this editorial_record
  SELECT id INTO v_workflow_id
  FROM public.workflows
  WHERE editorial_record_id = NEW.id
  LIMIT 1;

  IF v_workflow_id IS NULL THEN
    -- No workflow found, nothing to link
    RETURN NEW;
  END IF;

  -- Find unlinked editorial letta_report for this workflow
  SELECT id INTO v_editorial_report_id
  FROM public.letta_reports
  WHERE workflow_id = v_workflow_id
    AND report_type = 'editorial'
  ORDER BY created_at DESC
  LIMIT 1;

  -- Find unlinked metadata letta_report for this workflow
  SELECT id INTO v_metadata_report_id
  FROM public.letta_reports
  WHERE workflow_id = v_workflow_id
    AND report_type = 'metadata'
  ORDER BY created_at DESC
  LIMIT 1;

  -- Update the editorial_record with the report IDs
  IF v_editorial_report_id IS NOT NULL OR v_metadata_report_id IS NOT NULL THEN
    UPDATE public.editorial_records
    SET
      content_report_id = COALESCE(v_editorial_report_id, content_report_id),
      metadata_report_id = COALESCE(v_metadata_report_id, metadata_report_id)
    WHERE id = NEW.id;
  END IF;

  RETURN NEW;
END;
$function$;

-- Step 4: Create trigger that fires after editorial_record is inserted
CREATE TRIGGER on_editorial_record_link_reports
  AFTER INSERT ON public.editorial_records
  FOR EACH ROW
  EXECUTE FUNCTION public.link_letta_reports_to_editorial_record();

-- Step 5: Add comment for clarity
COMMENT ON FUNCTION public.link_letta_reports_to_editorial_record()
IS 'Automatically links letta_reports (editorial and metadata) to editorial_records based on workflow_id';

COMMENT ON COLUMN "public"."letta_reports"."workflow_id"
IS 'Reference to the workflow this report belongs to, used for auto-linking to editorial_records';
