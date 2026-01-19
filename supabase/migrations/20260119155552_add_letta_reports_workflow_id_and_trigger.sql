-- Migration: Add workflow_id to letta_reports and create auto-linking trigger
-- Purpose: Automatically link letta_reports to editorial_records when they are created

-- Step 1: Add workflow_id column to letta_reports
ALTER TABLE "public"."letta_reports"
ADD COLUMN "workflow_id" uuid REFERENCES public.workflows(id) ON UPDATE CASCADE ON DELETE SET NULL;

-- Step 2: Create index for efficient lookups
CREATE INDEX letta_reports_workflow_id_idx ON public.letta_reports USING btree (workflow_id);

-- Step 3: Create function to link unlinked letta_reports to editorial_record
-- This fires BEFORE INSERT OR UPDATE, allowing us to modify the record being saved
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
  -- Find the workflow via ingestion_record_id (editorial_record has this FK)
  SELECT id INTO v_workflow_id
  FROM public.workflows
  WHERE ingestion_record_id = NEW.ingestion_record_id
  LIMIT 1;

  IF v_workflow_id IS NULL THEN
    -- No workflow found, nothing to link
    RETURN NEW;
  END IF;

  -- Find the most recent editorial letta_report for this workflow
  SELECT id INTO v_editorial_report_id
  FROM public.letta_reports
  WHERE workflow_id = v_workflow_id
    AND report_type = 'editorial'
    AND status = 'complete'
  ORDER BY created_at DESC
  LIMIT 1;

  -- Find the most recent metadata letta_report for this workflow
  SELECT id INTO v_metadata_report_id
  FROM public.letta_reports
  WHERE workflow_id = v_workflow_id
    AND report_type = 'metadata'
    AND status = 'complete'
  ORDER BY created_at DESC
  LIMIT 1;

  -- Update the fields on the record being inserted/updated
  -- Only update if a report was found
  IF v_editorial_report_id IS NOT NULL THEN
    NEW.content_report_id := v_editorial_report_id;
  END IF;

  IF v_metadata_report_id IS NOT NULL THEN
    NEW.metadata_report_id := v_metadata_report_id;
  END IF;

  RETURN NEW;
END;
$function$;

-- Step 4: Create trigger that fires BEFORE editorial_record is inserted or updated
-- Using BEFORE allows us to modify NEW fields directly without an extra UPDATE statement
DROP TRIGGER IF EXISTS on_editorial_record_link_reports ON public.editorial_records;
CREATE TRIGGER on_editorial_record_link_reports
  BEFORE INSERT OR UPDATE ON public.editorial_records
  FOR EACH ROW
  EXECUTE FUNCTION public.link_letta_reports_to_editorial_record();

-- Step 5: Add comments
COMMENT ON FUNCTION public.link_letta_reports_to_editorial_record()
IS 'Automatically links the most recent complete letta_reports to editorial_records on save/update';
