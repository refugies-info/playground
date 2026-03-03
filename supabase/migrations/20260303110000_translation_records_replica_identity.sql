-- Enable REPLICA IDENTITY FULL on translation_records
-- Required for Supabase Realtime UPDATE events to include all column values
-- in the payload (not just the primary key).
-- Without this, UPDATE events may not carry work_status / online_status,
-- causing the frontend topbar to not update in real-time.
ALTER TABLE translation_records REPLICA IDENTITY FULL;
