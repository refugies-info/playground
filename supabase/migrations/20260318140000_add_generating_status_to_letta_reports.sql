-- Add "generating" to the allowed statuses for letta_reports.
-- Used by forceMetadataReportStep to track in-progress generation:
--   1. INSERT with status="generating" at start (locks UI, guards concurrent calls)
--   2. UPDATE to status="complete" or "error" when done (unlocks UI via Realtime)

ALTER TABLE letta_reports
  DROP CONSTRAINT letta_reports_status_check;

ALTER TABLE letta_reports
  ADD CONSTRAINT letta_reports_status_check
  CHECK (status IN ('complete', 'incomplete', 'error', 'generating'));
