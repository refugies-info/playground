-- Migration: Fix claim_di_audit_targets to limit based on editorial backlog
-- Issue: RI-1172
--
-- Problem: The RPC was counting records with compliance_status = 'pending'
-- (currently being processed by Letta), but the user wants to limit based on
-- the editorial backlog (records that already have Letta reports and are
-- waiting for editorial work).
--
-- Fix: Count records that have ingestion_report_id (already processed by Letta)
-- and are ready for editorial work (compliance_status = 'compliant').
--
-- Note: We must DROP the function first because PostgreSQL does not allow
-- changing parameter names with CREATE OR REPLACE FUNCTION.

-- Drop the existing function to allow parameter name change
DROP FUNCTION IF EXISTS public.claim_di_audit_targets(uuid[], integer, interval);

-- Replace claim_di_audit_targets() with corrected logic
CREATE FUNCTION public.claim_di_audit_targets(
  p_service_ids uuid[],
  max_editorial_backlog integer DEFAULT 50,
  timeout_interval interval DEFAULT '10 minutes'::interval
)
RETURNS TABLE(id uuid, markdown text, workflow_id uuid)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_editorial_backlog integer;
  v_slots_available integer;
BEGIN
  -- 1. Reclaim zombies: reset compliance_status for records stuck in 'pending'
  --    longer than timeout_interval (indicates a previous run crashed)
  UPDATE public.ingestion_records ir
  SET compliance_status = NULL
  WHERE ir.compliance_status = 'pending'
    AND ir.updated_at < now() - timeout_interval
    AND ir.di_service_id = ANY(p_service_ids);

  -- 2. Count the editorial backlog: records that already have Letta reports
  --    and are waiting for editorial work.
  --    This is the key fix: we limit based on how many records are already
  --    processed and waiting, not how many are currently being processed.
  --    Note: No join needed - ingestion_report_id IS NOT NULL is sufficient.
  SELECT count(*)::integer INTO v_editorial_backlog
  FROM public.ingestion_records ir
  WHERE ir.di_service_id = ANY(p_service_ids)
    AND ir.ingestion_report_id IS NOT NULL  -- Already has Letta report
    AND ir.compliance_status = 'compliant';  -- Ready for editorial work

  v_slots_available := max_editorial_backlog - v_editorial_backlog;

  IF v_slots_available <= 0 THEN
    RETURN;
  END IF;

  -- 3. Atomically claim available records by setting compliance_status = 'pending'
  --    and return them with their workflow_id for traceability
  RETURN QUERY
  WITH candidates AS (
    SELECT ir.id AS record_id
    FROM public.ingestion_records ir
    WHERE ir.di_service_id = ANY(p_service_ids)
      AND ir.ingestion_report_id IS NULL
      AND (ir.compliance_status IS NULL)
    ORDER BY ir.created_at ASC
    LIMIT v_slots_available
    FOR UPDATE OF ir SKIP LOCKED
  ),
  claimed AS (
    UPDATE public.ingestion_records ir
    SET compliance_status = 'pending',
        updated_at = now()
    FROM candidates c
    WHERE ir.id = c.record_id
    RETURNING ir.id AS ingestion_record_id
  )
  SELECT ir.id, ir.markdown, w.id AS workflow_id
  FROM public.ingestion_records ir
  INNER JOIN claimed cl ON cl.ingestion_record_id = ir.id
  INNER JOIN public.workflows w ON w.ingestion_record_id = ir.id;
END;
$$;

-- Update count_di_audit_candidates() to also count the editorial backlog
-- for reporting purposes
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
  -- Count records that are eligible for audit (no report yet)
  SELECT count(*)::integer INTO v_count
  FROM public.ingestion_records ir
  WHERE ir.di_service_id = ANY(p_service_ids)
    AND ir.ingestion_report_id IS NULL
    AND (ir.compliance_status IS NULL OR ir.compliance_status = 'pending');

  RETURN v_count;
END;
$$;

-- Add a new function to count the editorial backlog for monitoring
-- Note: No join needed - ingestion_report_id IS NOT NULL is sufficient
CREATE OR REPLACE FUNCTION public.count_di_editorial_backlog(
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
  -- Count records that have Letta reports and are waiting for editorial work
  SELECT count(*)::integer INTO v_count
  FROM public.ingestion_records ir
  WHERE ir.di_service_id = ANY(p_service_ids)
    AND ir.ingestion_report_id IS NOT NULL
    AND ir.compliance_status = 'compliant';

  RETURN v_count;
END;
$$;

COMMENT ON FUNCTION public.claim_di_audit_targets(uuid[], integer, interval) IS
    'Atomically claims ingestion records for audit processing.
     Limits claims based on editorial backlog (records with Letta reports waiting for editorial work),
     not on concurrent Letta processing. This prevents accumulating unprocessed records in the editorial queue.';

COMMENT ON FUNCTION public.count_di_editorial_backlog(uuid[]) IS
    'Counts records that have Letta reports and are waiting for editorial work (compliance_status = compliant).';
