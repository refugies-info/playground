-- Migration: Drop workflow_ingestion_metadata view
-- This view is now replaced by workflows_enriched which includes all necessary fields

DROP VIEW IF EXISTS public.workflow_ingestion_metadata;

-- Clean up any remaining references (should be none, but just in case)
-- The view workflows_enriched now provides:
--   - title (COALESCE from editorial/ingestion metadata)
--   - structure_name (from di_structures)
--   - session_start_date (parsed from metadata)
--   - quality_score (from di_services)
--   - external_id (from ingestion metadata)
