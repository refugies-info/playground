-- ============================================
-- DI Ingestion Versioning Enhancement
-- ============================================
-- Adds version tracking, content hashing, and ingestion run tracking
-- to di_structures and di_services tables.

-- ============================================
-- PART 1: Add columns to di_structures
-- ============================================

ALTER TABLE public.di_structures
  ADD COLUMN di_id text GENERATED ALWAYS AS (data->>'id') STORED,
  ADD COLUMN content_hash text,
  ADD COLUMN version integer NOT NULL DEFAULT 1,
  ADD COLUMN ingestion_run_id uuid;

-- Unique constraint: one version per di_id
CREATE UNIQUE INDEX di_structures_di_id_version_idx
  ON public.di_structures (di_id, version);

-- Fast lookup for latest version
CREATE INDEX di_structures_di_id_created_at_idx
  ON public.di_structures (di_id, created_at DESC);

-- ============================================
-- PART 2: Add columns to di_services
-- ============================================

ALTER TABLE public.di_services
  ADD COLUMN di_id text GENERATED ALWAYS AS (data->>'id') STORED,
  ADD COLUMN di_structure_id text GENERATED ALWAYS AS (data->>'structure_id') STORED,
  ADD COLUMN content_hash text,
  ADD COLUMN version integer NOT NULL DEFAULT 1,
  ADD COLUMN ingestion_run_id uuid;

-- Unique constraint: one version per di_id
CREATE UNIQUE INDEX di_services_di_id_version_idx
  ON public.di_services (di_id, version);

-- Fast lookup for latest version
CREATE INDEX di_services_di_id_created_at_idx
  ON public.di_services (di_id, created_at DESC);

-- Join services to structures efficiently
CREATE INDEX di_services_di_structure_id_idx
  ON public.di_services (di_structure_id);

-- ============================================
-- PART 3: Ingestion runs tracking table
-- ============================================

CREATE TABLE public.di_ingestion_runs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz,
  type text NOT NULL CHECK (type IN ('structures', 'services')),
  status text NOT NULL DEFAULT 'running' CHECK (status IN ('running', 'completed', 'failed', 'rolled_back')),

  -- Stats
  total_fetched integer NOT NULL DEFAULT 0,
  total_inserted integer NOT NULL DEFAULT 0,
  total_updated integer NOT NULL DEFAULT 0,
  total_unchanged integer NOT NULL DEFAULT 0,
  total_errors integer NOT NULL DEFAULT 0,

  -- Metadata
  options jsonb,
  error_details jsonb
);

ALTER TABLE public.di_ingestion_runs ENABLE ROW LEVEL SECURITY;

-- Index for querying recent runs
CREATE INDEX di_ingestion_runs_type_created_at_idx
  ON public.di_ingestion_runs (type, created_at DESC);

-- Grant permissions
GRANT SELECT ON public.di_ingestion_runs TO authenticated;
GRANT ALL ON public.di_ingestion_runs TO postgres, service_role;

-- ============================================
-- PART 4: Foreign keys to ingestion_runs
-- ============================================

ALTER TABLE public.di_structures
  ADD CONSTRAINT di_structures_ingestion_run_id_fkey
  FOREIGN KEY (ingestion_run_id) REFERENCES public.di_ingestion_runs(id);

ALTER TABLE public.di_services
  ADD CONSTRAINT di_services_ingestion_run_id_fkey
  FOREIGN KEY (ingestion_run_id) REFERENCES public.di_ingestion_runs(id);

-- ============================================
-- PART 5: Trigger for auto-incrementing version
-- ============================================

CREATE OR REPLACE FUNCTION di_set_version()
RETURNS TRIGGER AS $$
DECLARE
  max_ver integer;
BEGIN
  -- Get current max version for this di_id
  EXECUTE format(
    'SELECT COALESCE(MAX(version), 0) FROM %I WHERE di_id = $1',
    TG_TABLE_NAME
  ) INTO max_ver USING NEW.data->>'id';

  NEW.version := max_ver + 1;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER di_structures_set_version
  BEFORE INSERT ON public.di_structures
  FOR EACH ROW EXECUTE FUNCTION di_set_version();

CREATE TRIGGER di_services_set_version
  BEFORE INSERT ON public.di_services
  FOR EACH ROW EXECUTE FUNCTION di_set_version();

-- ============================================
-- PART 6: Views for latest versions
-- ============================================

CREATE VIEW public.di_structures_latest AS
SELECT DISTINCT ON (di_id) *
FROM public.di_structures
ORDER BY di_id, version DESC;

CREATE VIEW public.di_services_latest AS
SELECT DISTINCT ON (di_id) *
FROM public.di_services
ORDER BY di_id, version DESC;

-- Grant read access to views
GRANT SELECT ON public.di_structures_latest TO authenticated, postgres, service_role;
GRANT SELECT ON public.di_services_latest TO authenticated, postgres, service_role;
