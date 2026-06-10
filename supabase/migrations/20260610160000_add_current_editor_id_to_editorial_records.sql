-- Migration: Add current_editor_id to editorial_records
-- Tracks which user currently holds the edit lock for a fiche. Combined with
-- Supabase Realtime Presence on the frontend (to detect when the holder's
-- tab disconnects), this lets a second editor be warned and take over once
-- the first one leaves the page.

ALTER TABLE editorial_records ADD COLUMN current_editor_id uuid REFERENCES auth.users(id) ON DELETE SET NULL;

COMMENT ON COLUMN editorial_records.current_editor_id IS
  'User currently editing this fiche. NULL when no one holds the edit lock.';

CREATE INDEX idx_editorial_records_current_editor_id
  ON editorial_records (current_editor_id)
  WHERE current_editor_id IS NOT NULL;
