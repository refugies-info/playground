-- Migration: Move compliance_status from workflows to ingestion_records (RI-1093)
--
-- Rationale: compliance_status logically describes ingestion data quality,
-- not workflow state. Moving it to ingestion_records simplifies the data model.

-- Step 1: Add compliance_status to ingestion_records with same constraint
ALTER TABLE public.ingestion_records
  ADD COLUMN compliance_status text
    CHECK (compliance_status IS NULL OR compliance_status IN ('pending', 'compliant', 'non_compliant', 'error'));

-- Step 2: Copy existing data from workflows
UPDATE public.ingestion_records ir
SET compliance_status = w.compliance_status
FROM public.workflows w
WHERE w.ingestion_record_id = ir.id
  AND w.compliance_status IS NOT NULL;

-- Step 3: Replace claim_di_audit_targets() to use ingestion_records.compliance_status
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
  UPDATE public.ingestion_records ir
  SET compliance_status = NULL
  WHERE ir.compliance_status = 'pending'
    AND ir.updated_at < now() - timeout_interval
    AND ir.di_service_id = ANY(p_service_ids);

  -- 2. Count how many records are currently pending (being processed)
  SELECT count(*)::integer INTO v_current_pending
  FROM public.ingestion_records ir
  WHERE ir.compliance_status = 'pending';

  v_slots_available := max_total_pending - v_current_pending;

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

-- Step 4: Replace count_di_audit_candidates() to use ingestion_records.compliance_status
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
    AND (ir.compliance_status IS NULL OR ir.compliance_status = 'pending');

  RETURN v_count;
END;
$$;

-- Step 5: Update workflows_enriched view to source compliance_status from ingestion_records
CREATE OR REPLACE VIEW workflows_enriched
WITH (security_invoker = on)
AS
SELECT
    w.id,
    ir.compliance_status,
    w.updated_at,
    w.rco_record_id,
    w.editorial_record_id,
    w.ingestion_record_id,
    w.created_at,
    -- Computed work_status: editorial_record.work_status OR fallback logic
    CASE
        WHEN er.work_status IS NOT NULL THEN er.work_status
        WHEN ir.compliance_status = 'compliant' THEN 'to_process'::text
        ELSE NULL
    END AS computed_work_status,
    -- Computed online_status: editorial_record.online_status OR fallback logic
    CASE
        WHEN er.online_status IS NOT NULL THEN er.online_status
        WHEN ir.compliance_status = 'non_compliant' THEN 'archived'::text
        ELSE NULL
    END AS computed_online_status,
    -- Raw values for reference
    er.work_status as raw_work_status,
    er.online_status as raw_online_status,
    -- Content sources
    er.markdown as editorial_markdown,
    er.metadata as editorial_metadata,
    er.author_id as editorial_author_id,
    ir.markdown as ingestion_markdown,
    ir.metadata as ingestion_metadata,
    ir.created_at as ingestion_created_at,
    ir.ingestion_report_id,
    -- Report date for date_added calculation
    (SELECT MAX(lr.created_at) FROM letta_reports lr WHERE lr.id = ir.ingestion_report_id) as report_created_at,
    -- Publication info
    EXISTS (
        SELECT 1 FROM publication_records pr
        WHERE pr.workflow_id = w.id
    ) AS has_publication_history,
    (
        SELECT jsonb_build_object(
            'remote_id', pr.remote_id,
            'status', pr.status,
            'updated_at', pr.updated_at,
            'created_at', pr.created_at
        )
        FROM publication_records pr
        WHERE pr.workflow_id = w.id
        AND pr.status = 'published'
        ORDER BY pr.updated_at DESC NULLS LAST, pr.created_at DESC NULLS LAST
        LIMIT 1
    ) as latest_publication,
    -- Author profile
    (
        SELECT jsonb_build_object(
            'email', p.email,
            'role', p.role
        )
        FROM profiles p
        WHERE p.id = er.author_id
        LIMIT 1
    ) as author_profile,
    -- Presentation metadata (from ingestion_metadata view logic)
    COALESCE(
        (er.metadata::jsonb)->>'title',
        (er.metadata::jsonb)->>'intitule-formation',
        (er.metadata::jsonb)->>'nom',
        (ir.metadata::jsonb)->>'title',
        (ir.metadata::jsonb)->>'intitule-formation',
        (ir.metadata::jsonb)->>'nom',
        'Untitled'
    ) as title,
    COALESCE(ds_struct.data->>'nom', 'Structure inconnue') as structure_name,
    TO_DATE(
        COALESCE(
            ir.metadata#>>'{extra,action,session,0,periode,debut}',
            ir.metadata#>>'{session,periode,debut}'
        ),
        'YYYYMMDD'
    ) as session_start_date,
    (ds_service.data->>'score_qualite')::numeric as quality_score,
    (ir.metadata::jsonb)->>'id' as external_id
FROM workflows w
LEFT JOIN editorial_records er ON er.id = w.editorial_record_id
LEFT JOIN ingestion_records ir ON ir.id = w.ingestion_record_id
LEFT JOIN di_structures ds_struct ON ds_struct.id = ir.di_structure_id
LEFT JOIN di_services ds_service ON ds_service.id = ir.di_service_id;

-- Grant access (view was recreated)
GRANT SELECT ON workflows_enriched TO authenticated;
GRANT SELECT ON workflows_enriched TO service_role;

COMMENT ON VIEW workflows_enriched IS
    'Enriched view of workflows combining computed statuses, presentation metadata, and publication info.
     Designed for list views and filtering operations.';

-- Step 6: Drop compliance_status from workflows table
ALTER TABLE public.workflows DROP COLUMN compliance_status;
