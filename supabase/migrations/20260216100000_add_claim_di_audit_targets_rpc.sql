-- Migration: Add claim_di_audit_targets RPC function
-- This function atomically claims ingestion records for audit processing,
-- handling race conditions and zombie reclamation.

CREATE OR REPLACE FUNCTION public.claim_di_audit_targets(
  p_service_ids uuid[],
  max_total_pending integer DEFAULT 50,
  timeout_interval interval DEFAULT '10 minutes'::interval
)
RETURNS TABLE(id uuid, markdown text, workflow_id uuid)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_current_pending integer;
  v_slots_available integer;
BEGIN
  -- 1. Reclaim zombies: reset compliance_status for records stuck in 'pending'
  --    longer than timeout_interval (indicates a previous run crashed)
  UPDATE public.workflows w
  SET compliance_status = NULL
  WHERE w.compliance_status = 'pending'
    AND w.updated_at < now() - timeout_interval
    AND w.ingestion_record_id IN (
      SELECT ir.id FROM public.ingestion_records ir
      WHERE ir.di_service_id = ANY(p_service_ids)
    );

  -- 2. Count how many records are currently pending (being processed)
  SELECT count(*)::integer INTO v_current_pending
  FROM public.workflows w
  WHERE w.compliance_status = 'pending';

  v_slots_available := max_total_pending - v_current_pending;

  IF v_slots_available <= 0 THEN
    RETURN;
  END IF;

  -- 3. Atomically claim available records by setting compliance_status = 'pending'
  --    and return them
  RETURN QUERY
  WITH candidates AS (
    SELECT ir.id AS record_id
    FROM public.ingestion_records ir
    INNER JOIN public.workflows w ON w.ingestion_record_id = ir.id
    WHERE ir.di_service_id = ANY(p_service_ids)
      AND ir.ingestion_report_id IS NULL
      AND (w.compliance_status IS NULL)
    ORDER BY ir.created_at ASC
    LIMIT v_slots_available
    FOR UPDATE OF w SKIP LOCKED
  ),
  claimed AS (
    UPDATE public.workflows w
    SET compliance_status = 'pending',
        updated_at = now()
    FROM candidates c
    WHERE w.ingestion_record_id = c.record_id
    RETURNING w.ingestion_record_id, w.id AS wf_id
  )
  SELECT ir.id, ir.markdown, cl.wf_id
  FROM public.ingestion_records ir
  INNER JOIN claimed cl ON cl.ingestion_record_id = ir.id;
END;
$$;

-- Count audit candidates (records eligible for auditing) for given service IDs.
-- Uses a body-parameter RPC to avoid PostgREST URL length limits when
-- the service ID list is large (1000+ UUIDs).
CREATE OR REPLACE FUNCTION public.count_di_audit_candidates(
  p_service_ids uuid[]
)
RETURNS integer
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_count integer;
BEGIN
  SELECT count(*)::integer INTO v_count
  FROM public.workflows w
  INNER JOIN public.ingestion_records ir ON ir.id = w.ingestion_record_id
  WHERE ir.di_service_id = ANY(p_service_ids)
    AND ir.ingestion_report_id IS NULL
    AND (w.compliance_status IS NULL OR w.compliance_status = 'pending');

  RETURN v_count;
END;
$$;
