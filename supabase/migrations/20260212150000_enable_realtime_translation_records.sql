-- Enable Supabase Realtime for translation_records
-- This allows the frontend to subscribe to UPDATE events
-- when a translation workflow completes (status changes from pending → to_process/error)

alter publication supabase_realtime add table translation_records;
