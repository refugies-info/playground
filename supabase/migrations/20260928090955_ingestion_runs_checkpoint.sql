-- Provider-specific run totals (e.g. RCO change breakdown), read by the latest run card.
ALTER TABLE public.ingestion_runs ADD COLUMN checkpoint jsonb;

CREATE INDEX ingestion_runs_status_created_at_idx
    ON public.ingestion_runs (status, created_at DESC);
