-- Enable REPLICA IDENTITY FULL on publication_records
-- Required for Supabase Realtime column filters on non-primary-key columns
-- (e.g. `translation_record_id=eq.X`).
-- Without this, only the primary key is included in the WAL, and server-side
-- filters on other columns are silently not evaluated.
ALTER TABLE publication_records REPLICA IDENTITY FULL;
