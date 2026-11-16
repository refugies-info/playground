-- The table now serves every source: drop the DI-specific constraint name.
ALTER TABLE public.ingestion_runs DROP CONSTRAINT di_ingestion_runs_status_check;
ALTER TABLE public.ingestion_runs ADD CONSTRAINT ingestion_runs_status_check
    CHECK (status IN ('running', 'completed', 'failed', 'rolled_back'));
