-- Add source column to ingestion_records table
-- This distinguishes between RCO and DI ingestion sources

-- Add the source column
ALTER TABLE public.ingestion_records
ADD COLUMN source text NOT NULL DEFAULT 'RCO'
CHECK (source IN ('RCO', 'DI'));

-- Add index for efficient filtering by source
CREATE INDEX IF NOT EXISTS ingestion_records_source_idx ON public.ingestion_records(source);

-- Add comment explaining the column
COMMENT ON COLUMN public.ingestion_records.source IS
  'Source of the ingestion record: "RCO" for Répertoire Commun de l''Offre, "DI" for Data Inclusion';

-- Update RLS policies to include source column (if needed in future)
-- For now, keeping existing policies as-is since source doesn't affect access control
