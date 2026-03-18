-- Enable REPLICA IDENTITY FULL for letta_reports
-- Required for Supabase Realtime UPDATE events with row-level filters.
-- Without this, filtering by workflow_id on UPDATE events does not work.
-- Same pattern as publication_records and translation_records.

ALTER TABLE letta_reports REPLICA IDENTITY FULL;
