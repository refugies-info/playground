-- Migration: Add active_run_id to editorial_records
-- Stores the Vercel Workflow runId when an AI editorial rewrite is in progress.
-- Allows the frontend to resume the generation after a refresh or tab close.
-- NULL when idle, cleaned up by the API route on success/cancel/error.

ALTER TABLE editorial_records ADD COLUMN active_run_id text;

COMMENT ON COLUMN editorial_records.active_run_id IS
  'Vercel Workflow runId when an AI editorial rewrite is in progress. NULL when idle.';

-- Partial unique index :
--   * Performance : GET/DELETE /api/editorial-rewrite/[runId] font des lookups
--     `WHERE active_run_id = ?`. Sans index → seq scan sur toute la table.
--   * Intégrité  : un runId Vercel ne peut pas être associé à plusieurs
--     editorial_records (chaque POST démarre un workflow unique).
--   * Partial sur `IS NOT NULL` : la grande majorité des lignes sont idle,
--     pas besoin de les indexer (réduit la taille de l'index et le coût d'UPDATE).
CREATE UNIQUE INDEX idx_editorial_records_active_run_id
  ON editorial_records (active_run_id)
  WHERE active_run_id IS NOT NULL;
