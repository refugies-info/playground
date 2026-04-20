-- Migration: Add composite index on publication_records (RI-1172)
--
-- The workflows_enriched view runs two correlated subqueries per workflow row:
--   1. EXISTS (... WHERE pr.workflow_id = w.id)
--   2. SELECT ... WHERE pr.workflow_id = w.id AND pr.status = 'published' ORDER BY ...
--
-- The existing single-column index (workflow_id) forces PostgreSQL to filter
-- status in-heap for query #2. This composite index covers both queries and
-- avoids redundant heap fetches at scale (5k+ workflows).

CREATE INDEX IF NOT EXISTS publication_records_workflow_status_idx
    ON public.publication_records (workflow_id, status);
