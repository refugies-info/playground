-- Migration: Add fetch_di_metadata_candidates RPC function
-- This function selects ingestion records that do not have a metadata report yet.
-- Scoped to DI origin via JOIN on di_services (no service_ids param needed).

CREATE OR REPLACE FUNCTION public.fetch_di_metadata_candidates(
  p_limit integer DEFAULT 50
)
RETURNS TABLE(id uuid, markdown text, workflow_id uuid)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  RETURN QUERY
  SELECT ir.id, ir.markdown, w.id AS workflow_id
  FROM public.ingestion_records ir
  JOIN public.workflows w ON w.ingestion_record_id = ir.id
  -- Scope to DI records by joining against the di_services table
  JOIN public.di_services ds ON ds.id = ir.di_service_id
  WHERE NOT EXISTS (
    SELECT 1 FROM public.letta_reports lr
    WHERE lr.workflow_id = w.id
    AND lr.report_type = 'metadata'
  )
  ORDER BY ir.created_at DESC
  LIMIT p_limit;
END;
$$;
