-- Migration: Add 'error' to letta_reports status check constraint
--
-- The LettaReportResult TypeScript type allows 'complete' | 'error' | 'incomplete'
-- but the DB constraint only allowed 'complete' | 'incomplete'.
-- Aligning the DB constraint with the TypeScript type.

ALTER TABLE public.letta_reports
  DROP CONSTRAINT letta_reports_status_check;

ALTER TABLE public.letta_reports
  ADD CONSTRAINT letta_reports_status_check
  CHECK (status IN ('complete', 'incomplete', 'error'));
