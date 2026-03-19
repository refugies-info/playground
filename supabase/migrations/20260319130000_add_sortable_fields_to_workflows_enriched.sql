-- Migration: Add sortable fields to workflows_enriched view (RI-1146)
--
-- Adds 3 new columns to enable server-side sorting and author filtering
-- on the /documents list page:
--
--   • author_email (text)       — via LEFT JOIN profiles (replaces correlated subquery)
--   • commune (text)            — COALESCE(editorial, ingestion) metadata->>'commune'
--   • modalites_entrees_sorties (text) — COALESCE(editorial, ingestion)
--                                        #>>'{extra,action,modalites-entrees-sorties}'
--                                        Values: "0" (permanent), "1" (dates fixes)
--
-- For commune and modalites_entrees_sorties, editorial_record takes priority
-- over ingestion_record (user overrides win), with NULL as fallback.
--
-- Note: DROP + CREATE required (vs CREATE OR REPLACE) because PostgreSQL does not
-- allow reordering or renaming existing view columns in place.

DROP VIEW IF EXISTS workflows_enriched;

CREATE VIEW workflows_enriched
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
    -- Author: dedicated text column for sort + filter (RI-1146)
    -- LEFT JOIN replaces the previous correlated subquery for better performance
    p.email as author_email,
    CASE
        WHEN p.id IS NOT NULL THEN jsonb_build_object('email', p.email, 'role', p.role)
        ELSE NULL
    END as author_profile,
    -- Location (commune): editorial override first, ingestion fallback (RI-1146)
    -- Root-level key in RCO ingestion metadata, e.g. "Blois", "Mantes-la-Jolie"
    COALESCE(
        (er.metadata::jsonb)->>'commune',
        (ir.metadata::jsonb)->>'commune'
    ) as commune,
    -- Modalités entrées/sorties: editorial override first, ingestion fallback (RI-1146)
    -- RCO path: extra.action.modalites-entrees-sorties
    -- Values: "0" (entrées permanentes), "1" (entrées à dates fixes)
    COALESCE(
        (er.metadata::jsonb)#>>'{extra,action,modalites-entrees-sorties}',
        (ir.metadata::jsonb)#>>'{extra,action,modalites-entrees-sorties}'
    ) as modalites_entrees_sorties,
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
LEFT JOIN profiles p ON p.id = er.author_id
LEFT JOIN di_structures ds_struct ON ds_struct.id = ir.di_structure_id
LEFT JOIN di_services ds_service ON ds_service.id = ir.di_service_id;

-- Re-grant access (view was recreated)
GRANT SELECT ON workflows_enriched TO authenticated;
GRANT SELECT ON workflows_enriched TO service_role;

COMMENT ON VIEW workflows_enriched IS
    'Enriched view of workflows combining computed statuses, presentation metadata, and publication info.
     Designed for list views and filtering operations.
     RI-1128: fixed invalid published/archived + to_process combinations.
     RI-1146: added author_email, commune, modalites_entrees_sorties for sort/filter support.';
