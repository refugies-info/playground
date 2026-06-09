-- Migration: Audit pending DI ingestion updates (RI-1242)
--
-- `workflows.ingestion_record_id` is now the active/accepted source, while
-- `workflows.latest_ingestion_record_id` tracks the newest DI version available.
-- This means a new DI ingestion version can be pending (latest != active) and
-- still needs an audit report before it is accepted.
--
-- The audit claim RPC now returns records linked through either active or latest.
-- It also tells the workflow whether the claimed record is a pending update.
-- Metadata is still generated for every compliant record, including pending
-- updates, and is linked back to the exact ingestion_record it describes.

ALTER TABLE public.ingestion_records
ADD COLUMN IF NOT EXISTS metadata_report_id uuid
REFERENCES public.letta_reports(id) ON UPDATE CASCADE ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS ingestion_records_metadata_report_id_idx
  ON public.ingestion_records (metadata_report_id);

COMMENT ON COLUMN public.ingestion_records.metadata_report_id IS
  'Metadata letta_report generated for this exact ingestion_record. Used to keep metadata for pending DI updates separate from the workflow active source.';

-- Historical backfill for edited fiches.
-- Existing data stores the metadata report on editorial_records. Although new
-- ingestion metadata reports are linked directly to ingestion_records below, the
-- current production dump shows editorial_records.metadata_report_id reliably
-- points to the latest complete metadata report of the owning workflow. Use that
-- existing link once to preserve metadata display for the editorial baseline.
UPDATE public.ingestion_records ir
SET metadata_report_id = er.metadata_report_id
FROM public.editorial_records er
JOIN public.letta_reports lr ON lr.id = er.metadata_report_id
WHERE er.ingestion_record_id = ir.id
  AND er.metadata_report_id IS NOT NULL
  AND ir.metadata_report_id IS NULL
  AND lr.report_type = 'metadata'
  AND lr.status = 'complete';

-- Backfill metadata reports for workflows that have not entered the editorial
-- pipeline yet. In that state, active and latest are the same source, so the
-- latest complete workflow metadata report describes the active ingestion.
WITH unedited_active_metadata_reports AS (
  SELECT
    active_ir.id AS ingestion_record_id,
    metadata_report.id AS metadata_report_id
  FROM public.workflows w
  JOIN public.ingestion_records active_ir ON active_ir.id = w.ingestion_record_id
  JOIN LATERAL (
    SELECT lr.id
    FROM public.letta_reports lr
    WHERE lr.workflow_id = w.id
      AND lr.report_type = 'metadata'
      AND lr.status = 'complete'
    ORDER BY lr.created_at DESC
    LIMIT 1
  ) metadata_report ON true
  WHERE w.editorial_record_id IS NULL
    AND active_ir.metadata_report_id IS NULL
)
UPDATE public.ingestion_records ir
SET metadata_report_id = uamr.metadata_report_id
FROM unedited_active_metadata_reports uamr
WHERE ir.id = uamr.ingestion_record_id;

-- Best-effort backfill for pending DI updates that already had a metadata report
-- generated before active/latest sources were split. In the old model, workflows
-- were repointed to the newest DI ingestion automatically, so the latest complete
-- workflow-level metadata report usually describes `latest_ingestion_record_id`.
WITH pending_metadata_reports AS (
  SELECT
    latest_ir.id AS ingestion_record_id,
    metadata_report.id AS metadata_report_id
  FROM public.workflows w
  JOIN public.ingestion_records active_ir ON active_ir.id = w.ingestion_record_id
  JOIN public.ingestion_records latest_ir ON latest_ir.id = w.latest_ingestion_record_id
  JOIN LATERAL (
    SELECT lr.id, lr.created_at
    FROM public.letta_reports lr
    WHERE lr.workflow_id = w.id
      AND lr.report_type = 'metadata'
      AND lr.status = 'complete'
      AND lr.id IS DISTINCT FROM active_ir.metadata_report_id
      -- Avoid assigning the active/editorial baseline metadata report to a newer
      -- pending ingestion. A pending report should have been generated after the
      -- pending ingestion became available.
      AND lr.created_at >= latest_ir.created_at
    ORDER BY lr.created_at DESC
    LIMIT 1
  ) metadata_report ON true
  WHERE w.editorial_record_id IS NOT NULL
    AND w.ingestion_record_id IS DISTINCT FROM w.latest_ingestion_record_id
    AND latest_ir.metadata_report_id IS NULL
)
UPDATE public.ingestion_records ir
SET metadata_report_id = pmr.metadata_report_id
FROM pending_metadata_reports pmr
WHERE ir.id = pmr.ingestion_record_id;

-- Keep the reporting count aligned with the claim query: only count records that
-- can be attached to a workflow via active or latest ingestion.
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
  FROM public.ingestion_records ir
  WHERE ir.di_service_id = ANY(p_service_ids)
    AND ir.ingestion_report_id IS NULL
    AND (ir.compliance_status IS NULL OR ir.compliance_status = 'pending')
    AND EXISTS (
      SELECT 1
      FROM public.workflows w
      WHERE w.ingestion_record_id = ir.id
         OR w.latest_ingestion_record_id = ir.id
    );

  RETURN v_count;
END;
$$;

COMMENT ON FUNCTION public.count_di_audit_candidates(uuid[]) IS
  'Counts DI ingestion records eligible for audit and linked to a workflow through either active or latest ingestion source.';

REVOKE EXECUTE ON FUNCTION public.count_di_audit_candidates(uuid[]) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.count_di_audit_candidates(uuid[]) FROM anon;
REVOKE EXECUTE ON FUNCTION public.count_di_audit_candidates(uuid[]) FROM authenticated;
GRANT EXECUTE ON FUNCTION public.count_di_audit_candidates(uuid[]) TO service_role;

-- Return type changes (adds is_pending_update), so the function must be dropped
-- before being recreated.
DROP FUNCTION IF EXISTS public.claim_di_audit_targets(uuid[], integer, interval);

CREATE FUNCTION public.claim_di_audit_targets(
  p_service_ids uuid[],
  max_editorial_backlog integer DEFAULT 50,
  timeout_interval interval DEFAULT '10 minutes'::interval
)
RETURNS TABLE(
  id uuid,
  markdown text,
  workflow_id uuid,
  is_pending_update boolean
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  -- Reclaim zombies: reset records stuck in 'pending' longer than the timeout.
  -- Pending update records are included because they also live in ingestion_records.
  UPDATE public.ingestion_records ir
  SET compliance_status = NULL
  WHERE ir.compliance_status = 'pending'
    AND ir.updated_at < now() - timeout_interval
    AND ir.di_service_id = ANY(p_service_ids);

  -- Claim only records that can be associated with a workflow. Without the EXISTS
  -- guard, an orphan ingestion_record could be marked pending but never returned
  -- to the caller for processing.
  RETURN QUERY
  WITH candidates AS (
    SELECT ir.id AS record_id
    FROM public.ingestion_records ir
    WHERE ir.di_service_id = ANY(p_service_ids)
      AND ir.ingestion_report_id IS NULL
      AND ir.compliance_status IS NULL
      AND EXISTS (
        SELECT 1
        FROM public.workflows w
        WHERE w.ingestion_record_id = ir.id
           OR w.latest_ingestion_record_id = ir.id
      )
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
  SELECT
    ir.id,
    ir.markdown,
    w.id AS workflow_id,
    (
      w.latest_ingestion_record_id = ir.id
      AND w.ingestion_record_id IS DISTINCT FROM w.latest_ingestion_record_id
    ) AS is_pending_update
  FROM public.ingestion_records ir
  INNER JOIN claimed cl ON cl.ingestion_record_id = ir.id
  INNER JOIN public.workflows w
    ON w.ingestion_record_id = ir.id
    OR w.latest_ingestion_record_id = ir.id;
END;
$$;

COMMENT ON FUNCTION public.claim_di_audit_targets(uuid[], integer, interval) IS
  'Atomically claims up to max_editorial_backlog DI ingestion records per run for audit processing. Records may be linked through workflows.ingestion_record_id (active) or workflows.latest_ingestion_record_id (pending update). Compliant pending updates still generate metadata, linked to their ingestion_record.';

REVOKE EXECUTE ON FUNCTION public.claim_di_audit_targets(uuid[], integer, interval) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.claim_di_audit_targets(uuid[], integer, interval) FROM anon;
REVOKE EXECUTE ON FUNCTION public.claim_di_audit_targets(uuid[], integer, interval) FROM authenticated;
GRANT EXECUTE ON FUNCTION public.claim_di_audit_targets(uuid[], integer, interval) TO service_role;
