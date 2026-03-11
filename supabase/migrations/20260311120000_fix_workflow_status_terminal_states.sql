-- Migration: Fix invalid status combinations in workflows_enriched view (RI-1128)
--
-- Bug: documents with online_status='published' or online_status='archived'
-- were incorrectly showing computed_work_status='to_process'.
--
-- Root cause: the computed_work_status CASE expression fell through to the
-- compliance_status='compliant' → 'to_process' fallback without first checking
-- whether the document was already in a terminal state.
--
-- Fix: add a terminal-state guard before the compliance fallback.

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
        -- Terminal states: published/archived documents have no pending work (RI-1128)
        WHEN er.online_status IN ('published', 'archived') THEN NULL
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

-- Re-grant access (view was recreated)
GRANT SELECT ON workflows_enriched TO authenticated;
GRANT SELECT ON workflows_enriched TO service_role;

COMMENT ON VIEW workflows_enriched IS
    'Enriched view of workflows combining computed statuses, presentation metadata, and publication info.
     Designed for list views and filtering operations.
     RI-1128: fixed invalid published/archived + to_process combinations.';
