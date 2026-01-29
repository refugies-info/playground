-- Rename di_ingestion_runs to ingestion_runs and add source column
-- This makes the table reusable for other ingestion sources (RCO, etc.)

-- Step 1: Drop foreign keys referencing the old table
ALTER TABLE public.di_structures
  DROP CONSTRAINT IF EXISTS di_structures_ingestion_run_id_fkey;

ALTER TABLE public.di_services
  DROP CONSTRAINT IF EXISTS di_services_ingestion_run_id_fkey;

-- Step 2: Rename the table
ALTER TABLE public.di_ingestion_runs RENAME TO ingestion_runs;

-- Step 3: Add source column with default 'di' for existing rows
ALTER TABLE public.ingestion_runs
  ADD COLUMN source text NOT NULL DEFAULT 'di';

-- Remove default after backfilling (new rows must specify source)
ALTER TABLE public.ingestion_runs
  ALTER COLUMN source DROP DEFAULT;

-- Step 4: Update type check constraint to be more flexible
-- Remove old constraint
ALTER TABLE public.ingestion_runs
  DROP CONSTRAINT IF EXISTS di_ingestion_runs_type_check;

-- Add new constraint (no restriction - let application handle valid types per source)
-- Alternatively, we could use: CHECK (type IS NOT NULL AND length(type) > 0)

-- Step 5: Rename the index
ALTER INDEX IF EXISTS di_ingestion_runs_type_created_at_idx
  RENAME TO ingestion_runs_source_type_created_at_idx;

-- Add source to the index for better query performance
DROP INDEX IF EXISTS ingestion_runs_source_type_created_at_idx;
CREATE INDEX ingestion_runs_source_type_created_at_idx
  ON public.ingestion_runs (source, type, created_at DESC);

-- Step 6: Recreate foreign keys with new table name
ALTER TABLE public.di_structures
  ADD CONSTRAINT di_structures_ingestion_run_id_fkey
  FOREIGN KEY (ingestion_run_id) REFERENCES public.ingestion_runs(id);

ALTER TABLE public.di_services
  ADD CONSTRAINT di_services_ingestion_run_id_fkey
  FOREIGN KEY (ingestion_run_id) REFERENCES public.ingestion_runs(id);

-- Step 7: Update grants
GRANT SELECT ON public.ingestion_runs TO authenticated;
GRANT ALL ON public.ingestion_runs TO postgres, service_role;
