-- Migration: Optimize database indexes (RI-1121)
--
-- Addresses Supabase linter findings:
-- 1. Add indexes on 8 unindexed foreign key columns (slow JOINs/cascades)
-- 2. Drop 23 unused speculative indexes (wasted storage + write overhead)
--
-- FK-covering indexes that are technically unused but protect against
-- future queries and CASCADE operations are intentionally kept.

-- ============================================================
-- PART 1: Add missing foreign key indexes
-- ============================================================

-- di_services.ingestion_run_id (queried in packages/di/src/ingest/records.ts)
CREATE INDEX di_services_ingestion_run_id_idx
  ON public.di_services (ingestion_run_id);

-- di_structures.ingestion_run_id (queried in packages/di/src/ingest/records.ts)
CREATE INDEX di_structures_ingestion_run_id_idx
  ON public.di_structures (ingestion_run_id);

-- editorial_records.author_id (used in workflows_enriched view)
CREATE INDEX editorial_records_author_id_idx
  ON public.editorial_records (author_id);

-- ingestion_records.di_service_id (used in workflows_enriched view + claim_di_audit_targets RPC)
CREATE INDEX ingestion_records_di_service_id_idx
  ON public.ingestion_records (di_service_id);

-- ingestion_records.di_structure_id (used in workflows_enriched view)
CREATE INDEX ingestion_records_di_structure_id_idx
  ON public.ingestion_records (di_structure_id);

-- publication_records.author_id (FK coverage)
CREATE INDEX publication_records_author_id_idx
  ON public.publication_records (author_id);

-- translation_records.author_id (queried in permission-helper.ts)
CREATE INDEX translation_records_author_id_idx
  ON public.translation_records (author_id);

-- translation_records.workflow_id (queried in permission-helper.ts, document-actions.ts)
CREATE INDEX translation_records_workflow_id_idx
  ON public.translation_records (workflow_id);

-- ============================================================
-- PART 2: Drop unused speculative indexes
-- ============================================================

-- di_services: JSONB field indexes created at table creation, never scanned.
-- The di_id and di_structure_id generated columns supersede data->>'id' etc.
DROP INDEX IF EXISTS public.di_services_data_gin_idx;
DROP INDEX IF EXISTS public.di_services_data_id_idx;
DROP INDEX IF EXISTS public.di_services_data_source_idx;
DROP INDEX IF EXISTS public.di_services_data_structure_id_idx;
DROP INDEX IF EXISTS public.di_services_data_commune_idx;
DROP INDEX IF EXISTS public.di_services_data_code_postal_idx;
DROP INDEX IF EXISTS public.di_services_data_date_maj_idx;
DROP INDEX IF EXISTS public.di_services_di_structure_id_idx;

-- di_structures: Same pattern — speculative JSONB field indexes, never scanned.
DROP INDEX IF EXISTS public.di_structures_data_gin_idx;
DROP INDEX IF EXISTS public.di_structures_data_id_idx;
DROP INDEX IF EXISTS public.di_structures_data_siret_idx;
DROP INDEX IF EXISTS public.di_structures_data_commune_idx;
DROP INDEX IF EXISTS public.di_structures_data_code_postal_idx;
DROP INDEX IF EXISTS public.di_structures_data_date_maj_idx;

-- Metadata GIN indexes (jsonb_path_ops) — no queries use @> containment operator.
DROP INDEX IF EXISTS public.editorial_records_metadata_path_ops_idx;
DROP INDEX IF EXISTS public.ingestion_records_metadata_path_ops_idx;
DROP INDEX IF EXISTS public.letta_reports_metadata_path_ops_idx;
DROP INDEX IF EXISTS public.rco_records_metadata_idx;

-- rco_records: RCO integration indexes, no active queries use them.
DROP INDEX IF EXISTS public.rco_records_source_updated_at_idx;
DROP INDEX IF EXISTS public.rco_records_training_action_id_idx;
DROP INDEX IF EXISTS public.rco_records_training_offer_id_idx;
DROP INDEX IF EXISTS public.rco_records_updated_at_idx;

-- ingestion_runs: composite index never scanned.
DROP INDEX IF EXISTS public.ingestion_runs_source_type_created_at_idx;
