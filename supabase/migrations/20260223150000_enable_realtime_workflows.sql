-- Migration: Enable Realtime on workflows table
-- This allows the frontend to receive live updates when workflows change

alter publication supabase_realtime add table workflows;

-- Add comment explaining the change
comment on table workflows is 'Workflows table with Realtime enabled for live list updates';
