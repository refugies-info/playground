-- Migration: Add active_run_id to editorial_records
-- Stores the Vercel Workflow runId when an AI editorial rewrite is in progress.
-- Allows the frontend to resume the generation after a refresh or tab close.
-- NULL when idle, cleaned up by the API route on success/cancel/error.

ALTER TABLE editorial_records ADD COLUMN active_run_id text;

COMMENT ON COLUMN editorial_records.active_run_id IS
  'Vercel Workflow runId when an AI editorial rewrite is in progress. NULL when idle.';
