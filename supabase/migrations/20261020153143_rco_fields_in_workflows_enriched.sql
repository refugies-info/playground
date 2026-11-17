-- RCO stores city, session dates and entry mode in its own shape
-- (sessions[].lieu_formation, ISO date_debut/date_fin, boolean
-- modalites_entrees_sorties): map them onto the DI-shaped columns.

DROP VIEW IF EXISTS workflows_enriched;

CREATE VIEW workflows_enriched
            WITH (security_invoker = on)
AS
SELECT
    w.id,
    ir.compliance_status,
    w.updated_at,
    s_service.origin,
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
    CASE
        WHEN er.work_status IS NOT NULL THEN er.work_status
        WHEN er.online_status IN ('published', 'archived') THEN NULL
        WHEN ir.compliance_status = 'compliant' THEN 'to_process'::text
        ELSE NULL
END AS computed_work_status,
    CASE
        WHEN er.online_status IS NOT NULL THEN er.online_status
        WHEN ir.compliance_status = 'non_compliant' THEN 'archived'::text
        ELSE NULL
END AS computed_online_status,
    er.work_status as raw_work_status,
    er.online_status as raw_online_status,
    COALESCE(archive_date.exact_at, archive_date.approximate_at) AS archived_at,
    (archive_date.exact_at IS NULL AND archive_date.approximate_at IS NOT NULL)
        AS archived_at_is_approximate,
    er.markdown as editorial_markdown,
    er.metadata as editorial_metadata,
    w.assignee_id as workflow_assignee_id,
    ir.markdown as ingestion_markdown,
    ir.metadata as ingestion_metadata,
    ir.created_at as ingestion_created_at,
    ir.ingestion_report_id,
    (SELECT MAX(lr.created_at) FROM letta_reports lr WHERE lr.id = ir.ingestion_report_id) as report_created_at,
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
    p.email as assignee_email,
    CASE
        WHEN p.id IS NOT NULL THEN jsonb_build_object('email', p.email, 'role', p.role, 'avatar_url', p.avatar_url)
        ELSE NULL
END as assignee_profile,
    COALESCE(
        (er.metadata::jsonb)->>'commune',
        CASE s_service.origin
            WHEN 'RCO' THEN (ir.metadata::jsonb)#>>'{sessions,0,lieu_formation,0,ville}'
            ELSE (ir.metadata::jsonb)->>'commune'
        END
    ) as commune,
    COALESCE(
        (er.metadata::jsonb)#>>'{extra,action,modalites-entrees-sorties}',
        CASE s_service.origin
            WHEN 'RCO' THEN
                CASE (ir.metadata::jsonb)->>'modalites_entrees_sorties'
                    WHEN 'true' THEN '1'
                    WHEN 'false' THEN '0'
                END
            ELSE (ir.metadata::jsonb)#>>'{extra,action,modalites-entrees-sorties}'
        END
    ) as modalites_entrees_sorties,
    COALESCE(
        (er.metadata::jsonb)->>'title',
        (er.metadata::jsonb)->>'intitule-formation',
        (er.metadata::jsonb)->>'nom',
        (ir.metadata::jsonb)->>'title',
        (ir.metadata::jsonb)->>'intitule-formation',
        (ir.metadata::jsonb)->>'nom',
        'Untitled'
    ) as title,
    COALESCE(s_struct.data->>'nom', 'Structure inconnue') as structure_name,
    session_period.session_start_date,
    session_period.session_end_date,
    (s_service.data->>'score_qualite')::numeric as quality_score,
    (ir.metadata::jsonb)->>'id' as external_id,
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
LEFT JOIN structures s_struct ON s_struct.id = ir.structure_id
LEFT JOIN services s_service ON s_service.id = ir.service_id
LEFT JOIN LATERAL (
    SELECT
        CASE
            WHEN er.online_status = 'archived'
                THEN COALESCE(er.archived_at, src.logged_at, src.pushed_at)
            WHEN er.online_status IS NULL AND ir.compliance_status = 'non_compliant'
                THEN COALESCE(er.archived_at, src.logged_at, src.pushed_at, src.arbitrated_at)
            ELSE NULL
        END AS exact_at,
        CASE
            WHEN er.online_status = 'archived' THEN er.updated_at
            ELSE NULL
        END AS approximate_at
    FROM LATERAL (
        SELECT
            (
                SELECT MAX(al.created_at)
                FROM activity_logs al
                WHERE al.workflow_id = w.id
                AND al.action = 'archive'
            ) AS logged_at,
            (
                SELECT MAX(pr.created_at)
                FROM publication_records pr
                WHERE pr.workflow_id = w.id
                AND pr.status = 'archived'
            ) AS pushed_at,
            (
                SELECT MAX(lr.created_at)
                FROM letta_reports lr
                WHERE lr.id = ir.ingestion_report_id
            ) AS arbitrated_at
    ) src
) archive_date ON true
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
            -- RCO dates are YYYY-MM-DD, DI ones YYYYMMDD.
            CASE s_service.origin
                WHEN 'RCO' THEN replace(session_item ->> 'date_debut', '-', '')
                ELSE session_item #>> '{periode,debut}'
            END as start_value,
            CASE s_service.origin
                WHEN 'RCO' THEN replace(session_item ->> 'date_fin', '-', '')
                ELSE session_item #>> '{periode,fin}'
            END as end_value
        FROM jsonb_array_elements(
            CASE
                WHEN s_service.origin = 'DI'
                    AND jsonb_typeof(ir.metadata::jsonb #> '{extra,action,session}') = 'array'
                    THEN ir.metadata::jsonb #> '{extra,action,session}'
                WHEN s_service.origin = 'RCO'
                    AND jsonb_typeof(ir.metadata::jsonb -> 'sessions') = 'array'
                    THEN ir.metadata::jsonb -> 'sessions'
                ELSE '[]'::jsonb
            END
        ) as sessions(session_item)
    ) session_values
) session_period ON true;

GRANT SELECT ON workflows_enriched TO authenticated;
GRANT SELECT ON workflows_enriched TO service_role;

COMMENT ON VIEW workflows_enriched IS
    'Enriched view of workflows combining computed statuses, presentation metadata, publication info, derived archive date and its approximation flag (RI-1446), active/latest ingestion versions, service origin (RCO/DI), and workflow assignment info.';
