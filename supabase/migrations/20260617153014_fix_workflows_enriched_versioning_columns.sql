-- Recreate workflows_enriched with ingestion version columns and workflow-based assignment.

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
    ir.version as active_ingestion_version,
    latest_ir.version as latest_ingestion_version,
    CASE
        WHEN w.latest_ingestion_record_id IS NULL THEN false
        ELSE w.ingestion_record_id IS DISTINCT FROM w.latest_ingestion_record_id
            AND COALESCE(latest_ir.version, 0) > COALESCE(ir.version, 0)
    END as has_pending_ingestion_update,
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
    w.assignee_id as workflow_assignee_id,
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
    -- Assignee: dedicated text column for sort + filter (RI-1146, now from workflows.assignee_id — RI-1340)
    p.email as assignee_email,
    CASE
        WHEN p.id IS NOT NULL THEN jsonb_build_object('email', p.email, 'role', p.role)
        ELSE NULL
    END as assignee_profile,
    -- Location (commune): editorial override first, ingestion fallback (RI-1146)
    COALESCE(
        (er.metadata::jsonb)->>'commune',
        (ir.metadata::jsonb)->>'commune'
    ) as commune,
    -- Modalités entrées/sorties: editorial override first, ingestion fallback (RI-1146)
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
    session_period.session_start_date,
    session_period.session_end_date,
    (ds_service.data->>'score_qualite')::numeric as quality_score,
    (ir.metadata::jsonb)->>'id' as external_id,
    -- Word count from ingestion markdown, stripping YAML frontmatter (RI-1172)
    array_length(
        regexp_split_to_array(
            NULLIF(
                trim(regexp_replace(COALESCE(ir.markdown, ''), '^---\n.*?\n---\n?', '', 's')),
                ''
            ),
            E'\\s+'
        ),
        1
    ) as ingestion_word_count
FROM workflows w
LEFT JOIN editorial_records er ON er.id = w.editorial_record_id
LEFT JOIN ingestion_records ir ON ir.id = w.ingestion_record_id
LEFT JOIN ingestion_records latest_ir ON latest_ir.id = COALESCE(w.latest_ingestion_record_id, w.ingestion_record_id)
LEFT JOIN profiles p ON p.id = w.assignee_id
LEFT JOIN di_structures ds_struct ON ds_struct.id = ir.di_structure_id
LEFT JOIN di_services ds_service ON ds_service.id = ir.di_service_id
LEFT JOIN LATERAL (
    SELECT
        MIN(
            CASE
                WHEN start_value ~ '^\d{8}$' THEN
                    CASE
                        WHEN to_char(to_date(start_value, 'YYYYMMDD'), 'YYYYMMDD') = start_value
                            THEN to_date(start_value, 'YYYYMMDD')
                        ELSE NULL
                    END
                ELSE NULL
            END
        ) as session_start_date,
        MAX(
            CASE
                WHEN end_value ~ '^\d{8}$' THEN
                    CASE
                        WHEN to_char(to_date(end_value, 'YYYYMMDD'), 'YYYYMMDD') = end_value
                            THEN to_date(end_value, 'YYYYMMDD')
                        ELSE NULL
                    END
                ELSE NULL
            END
        ) as session_end_date
    FROM (
        SELECT
            session_item #>> '{periode,debut}' as start_value,
            session_item #>> '{periode,fin}' as end_value
        FROM jsonb_array_elements(
            CASE
                WHEN ir.di_service_id IS NOT NULL
                    AND jsonb_typeof(ir.metadata::jsonb #> '{extra,action,session}') = 'array'
                    THEN ir.metadata::jsonb #> '{extra,action,session}'
                ELSE '[]'::jsonb
            END
        ) as sessions(session_item)
    ) session_values
) session_period ON true;

-- Re-grant access (view was recreated)
GRANT SELECT ON workflows_enriched TO authenticated;
GRANT SELECT ON workflows_enriched TO service_role;

COMMENT ON VIEW workflows_enriched IS
    'Enriched view of workflows combining computed statuses, presentation metadata, publication info, active/latest ingestion versions, and workflow assignment info.';
