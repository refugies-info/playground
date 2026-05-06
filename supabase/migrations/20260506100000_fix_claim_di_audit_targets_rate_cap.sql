-- Per-run rate cap: claim up to `max_editorial_backlog` records per cron execution,
-- regardless of how many records are already waiting for editorial work.

CREATE OR REPLACE FUNCTION public.claim_di_audit_targets(
  p_service_ids uuid[],
  max_editorial_backlog integer DEFAULT 50,
  timeout_interval interval DEFAULT '10 minutes'::interval
)
RETURNS TABLE(id uuid, markdown text, workflow_id uuid)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  -- Reclaim zombies: reset compliance_status for records stuck in 'pending'
  -- longer than timeout_interval (previous run crashed).
  UPDATE public.ingestion_records ir
  SET compliance_status = NULL
  WHERE ir.compliance_status = 'pending'
    AND ir.updated_at < now() - timeout_interval
    AND ir.di_service_id = ANY(p_service_ids);

  -- Atomically claim up to `max_editorial_backlog` candidates.
  RETURN QUERY
  WITH candidates AS (
    SELECT ir.id AS record_id
    FROM public.ingestion_records ir
    WHERE ir.di_service_id = ANY(p_service_ids)
      AND ir.ingestion_report_id IS NULL
      AND ir.compliance_status IS NULL
    ORDER BY ir.created_at ASC
    LIMIT max_editorial_backlog
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

COMMENT ON FUNCTION public.claim_di_audit_targets(uuid[], integer, interval) IS
    'Atomically claims up to `max_editorial_backlog` ingestion records per run for audit processing. Reclaims zombie records (stuck in pending > timeout) before claiming new ones.';

DROP FUNCTION IF EXISTS public.count_di_editorial_backlog(uuid[]);
