-- Migration: Fix compliance logic and remove DB triggers (RI-1117)
--
-- Previously, compliance_status was set by two DB triggers that ignored the
-- duplicate flag. Compliance is now handled entirely in TypeScript (audit-di-step.ts),
-- which has better visibility into all status cases (complete/error).
--
-- Rule: compliant iff metadata.compliant=true AND metadata.duplicate=false

-- 1. Drop triggers first (they reference the functions below)
DROP TRIGGER IF EXISTS on_ingestion_record_link_report ON public.ingestion_records;
DROP TRIGGER IF EXISTS on_letta_report_update_status ON public.letta_reports;

-- 2. Drop the trigger functions
DROP FUNCTION IF EXISTS public.update_workflow_status_from_ingestion_record();
DROP FUNCTION IF EXISTS public.update_workflow_status_from_letta_report();

-- 3. Fix existing records: mark as non_compliant if duplicate=true but currently compliant
UPDATE public.workflows w
SET compliance_status = 'non_compliant'
FROM public.ingestion_records ir
JOIN public.letta_reports lr ON ir.ingestion_report_id = lr.id
WHERE w.ingestion_record_id = ir.id
  AND w.compliance_status = 'compliant'
  AND lr.report_type = 'ingestion'
  AND (lr.metadata->>'duplicate')::boolean = true;
