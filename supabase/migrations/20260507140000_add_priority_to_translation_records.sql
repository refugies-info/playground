-- Add priority column to translation_records
-- Used to mark translations as urgent for the editorial team.
-- Values: 'urgent' | NULL

ALTER TABLE public.translation_records
  ADD COLUMN IF NOT EXISTS priority text NULL;

COMMENT ON COLUMN public.translation_records.priority
  IS 'Translation priority — "urgent" or null. Set at publication time when the editor checks the Urgent toggle.';
