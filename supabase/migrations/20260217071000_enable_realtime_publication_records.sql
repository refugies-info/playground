-- Enable Supabase Realtime for publication_records
-- This allows the frontend to subscribe to INSERT events
-- to detect both successful publications (status='published') and failures (status='failed')

alter publication supabase_realtime add table publication_records;
