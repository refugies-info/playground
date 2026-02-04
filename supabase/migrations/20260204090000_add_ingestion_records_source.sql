-- Add origin column to ingestion_records table
-- This distinguishes between RCO and DI ingestion origins

-- Add the origin column
ALTER TABLE public.ingestion_records
ADD COLUMN origin text NOT NULL DEFAULT 'RCO'
CHECK (origin IN ('RCO', 'DI'));

-- Add index for efficient filtering by origin
CREATE INDEX IF NOT EXISTS ingestion_records_origin_idx ON public.ingestion_records(origin);

-- Add comment explaining the column
COMMENT ON COLUMN public.ingestion_records.origin IS
  'Origin of the ingestion record: "RCO" for Répertoire Commun de l''Offre, "DI" for Data Inclusion';

-- Update RLS policies to include origin column (if needed in future)
-- For now, keeping existing policies as-is since origin doesn't affect access control
