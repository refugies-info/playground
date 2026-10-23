-- Where an interrupted run (e.g. RCO rate limit) stopped, so it can resume.
ALTER TABLE public.ingestion_runs ADD COLUMN checkpoint jsonb;

CREATE INDEX ingestion_runs_status_created_at_idx
    ON public.ingestion_runs (status, created_at DESC);
