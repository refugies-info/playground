-- RI-1642: last DROP of workflows_enriched.
-- Business rules move into functions with stable signatures, so the next
-- change is a CREATE OR REPLACE FUNCTION and the view no longer moves.
-- From now on the view is append-only (see documentation/database/migrations.md).
-- Also drops 6 columns nothing reads: has_publication_history, raw_work_status,
-- raw_online_status, workflow_assignee_id, ingestion_report_id, quality_score.
--
-- No SET search_path on these functions: it would stop Postgres from inlining
-- them into the view's query plan. Tables are schema-qualified instead.

CREATE OR REPLACE FUNCTION public.workflow_commune(
    origin text,
    editorial_metadata jsonb,
    ingestion_metadata jsonb
) RETURNS text
LANGUAGE sql IMMUTABLE
AS $$
    SELECT COALESCE(
        editorial_metadata->>'commune',
        CASE origin
            WHEN 'RCO' THEN ingestion_metadata#>>'{sessions,0,lieu_formation,0,ville}'
            ELSE ingestion_metadata->>'commune'
        END
    )
$$;

CREATE OR REPLACE FUNCTION public.workflow_modalites_entrees_sorties(
    origin text,
    editorial_metadata jsonb,
    ingestion_metadata jsonb
) RETURNS text
LANGUAGE sql IMMUTABLE
AS $$
    SELECT COALESCE(
        editorial_metadata#>>'{extra,action,modalites-entrees-sorties}',
        CASE origin
            WHEN 'RCO' THEN
                CASE ingestion_metadata->>'modalites_entrees_sorties'
                    WHEN 'true' THEN '1'
                    WHEN 'false' THEN '0'
                END
            ELSE ingestion_metadata#>>'{extra,action,modalites-entrees-sorties}'
        END
    )
$$;

CREATE OR REPLACE FUNCTION public.workflow_session_period(
    origin text,
    ingestion_metadata jsonb
) RETURNS TABLE (session_start_date date, session_end_date date)
LANGUAGE sql STABLE
AS $$
    SELECT
        MIN(CASE
            WHEN start_value ~ '^\d{8}$'
                AND to_char(to_date(start_value, 'YYYYMMDD'), 'YYYYMMDD') = start_value
                THEN to_date(start_value, 'YYYYMMDD')
        END),
        MAX(CASE
            WHEN end_value ~ '^\d{8}$'
                AND to_char(to_date(end_value, 'YYYYMMDD'), 'YYYYMMDD') = end_value
                THEN to_date(end_value, 'YYYYMMDD')
        END)
    FROM (
        SELECT
            -- RCO dates are YYYY-MM-DD, DI ones YYYYMMDD.
            CASE origin
                WHEN 'RCO' THEN replace(session_item->>'date_debut', '-', '')
                ELSE session_item#>>'{periode,debut}'
            END AS start_value,
            CASE origin
                WHEN 'RCO' THEN replace(session_item->>'date_fin', '-', '')
                ELSE session_item#>>'{periode,fin}'
            END AS end_value
        FROM jsonb_array_elements(
            CASE
                WHEN origin = 'DI'
                    AND jsonb_typeof(ingestion_metadata#>'{extra,action,session}') = 'array'
                    THEN ingestion_metadata#>'{extra,action,session}'
                WHEN origin = 'RCO'
                    AND jsonb_typeof(ingestion_metadata->'sessions') = 'array'
                    THEN ingestion_metadata->'sessions'
                ELSE '[]'::jsonb
            END
        ) AS sessions(session_item)
    ) session_values
$$;

-- Exact date from the archive log, the archive publication or (non-compliant
-- fiches) the arbitration; else editorial_records.updated_at, flagged approximate.
CREATE OR REPLACE FUNCTION public.workflow_archive_date(
    workflow_id uuid,
    online_status text,
    compliance_status text,
    editorial_archived_at timestamptz,
    editorial_updated_at timestamptz,
    ingestion_report_id uuid
) RETURNS TABLE (archived_at timestamptz, archived_at_is_approximate boolean)
LANGUAGE sql STABLE
AS $$
    SELECT
        COALESCE(exact_at, approximate_at),
        exact_at IS NULL AND approximate_at IS NOT NULL
    FROM (
        SELECT
            CASE
                WHEN online_status = 'archived'
                    THEN COALESCE(editorial_archived_at, src.logged_at, src.pushed_at)
                WHEN online_status IS NULL AND compliance_status = 'non_compliant'
                    THEN COALESCE(editorial_archived_at, src.logged_at, src.pushed_at, src.arbitrated_at)
            END AS exact_at,
            CASE WHEN online_status = 'archived' THEN editorial_updated_at END AS approximate_at
        FROM (
            SELECT
                (SELECT MAX(al.created_at) FROM public.activity_logs al
                 WHERE al.workflow_id = workflow_archive_date.workflow_id
                 AND al.action = 'archive') AS logged_at,
                (SELECT MAX(pr.created_at) FROM public.publication_records pr
                 WHERE pr.workflow_id = workflow_archive_date.workflow_id
                 AND pr.status = 'archived') AS pushed_at,
                (SELECT MAX(lr.created_at) FROM public.letta_reports lr
                 WHERE lr.id = workflow_archive_date.ingestion_report_id) AS arbitrated_at
        ) src
    ) archive_date
$$;

CREATE OR REPLACE FUNCTION public.markdown_word_count(markdown text)
RETURNS integer
LANGUAGE sql IMMUTABLE
AS $$
    -- Frontmatter is not counted.
    SELECT array_length(
        regexp_split_to_array(
            NULLIF(trim(regexp_replace(COALESCE(markdown, ''), '^---\n.*?\n---\n?', '', 's')), ''),
            E'\\s+'
        ),
        1
    )
$$;

-- The view is security_invoker: callers need EXECUTE on what it calls.
REVOKE EXECUTE ON FUNCTION
    public.workflow_commune(text, jsonb, jsonb),
    public.workflow_modalites_entrees_sorties(text, jsonb, jsonb),
    public.workflow_session_period(text, jsonb),
    public.workflow_archive_date(uuid, text, text, timestamptz, timestamptz, uuid),
    public.markdown_word_count(text)
FROM public, anon;
GRANT EXECUTE ON FUNCTION
    public.workflow_commune(text, jsonb, jsonb),
    public.workflow_modalites_entrees_sorties(text, jsonb, jsonb),
    public.workflow_session_period(text, jsonb),
    public.workflow_archive_date(uuid, text, text, timestamptz, timestamptz, uuid),
    public.markdown_word_count(text)
TO authenticated, service_role;

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
    ir.version AS active_ingestion_version,
    latest_ir.version AS latest_ingestion_version,
    CASE
        WHEN w.latest_ingestion_record_id IS NULL THEN false
        ELSE w.ingestion_record_id IS DISTINCT FROM w.latest_ingestion_record_id
            AND COALESCE(latest_ir.version, 0) > COALESCE(ir.version, 0)
    END AS has_pending_ingestion_update,
    CASE
        WHEN er.work_status IS NOT NULL THEN er.work_status
        WHEN er.online_status IN ('published', 'archived') THEN NULL
        WHEN ir.compliance_status = 'compliant' THEN 'to_process'::text
    END AS computed_work_status,
    CASE
        WHEN er.online_status IS NOT NULL THEN er.online_status
        WHEN ir.compliance_status = 'non_compliant' THEN 'archived'::text
    END AS computed_online_status,
    archive_date.archived_at,
    archive_date.archived_at_is_approximate,
    er.markdown AS editorial_markdown,
    er.metadata AS editorial_metadata,
    ir.markdown AS ingestion_markdown,
    ir.metadata AS ingestion_metadata,
    ir.created_at AS ingestion_created_at,
    (SELECT MAX(lr.created_at) FROM letta_reports lr WHERE lr.id = ir.ingestion_report_id) AS report_created_at,
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
    ) AS latest_publication,
    p.email AS assignee_email,
    CASE
        WHEN p.id IS NOT NULL THEN jsonb_build_object('email', p.email, 'role', p.role, 'avatar_url', p.avatar_url)
    END AS assignee_profile,
    public.workflow_commune(s_service.origin::text, er.metadata, ir.metadata) AS commune,
    public.workflow_modalites_entrees_sorties(s_service.origin::text, er.metadata, ir.metadata) AS modalites_entrees_sorties,
    COALESCE(
        er.metadata->>'title',
        er.metadata->>'intitule-formation',
        er.metadata->>'nom',
        ir.metadata->>'title',
        ir.metadata->>'intitule-formation',
        ir.metadata->>'nom',
        'Untitled'
    ) AS title,
    COALESCE(s_struct.data->>'nom', 'Structure inconnue') AS structure_name,
    session_period.session_start_date,
    session_period.session_end_date,
    ir.metadata->>'id' AS external_id,
    public.markdown_word_count(ir.markdown) AS ingestion_word_count
FROM workflows w
LEFT JOIN editorial_records er ON er.id = w.editorial_record_id
LEFT JOIN ingestion_records ir ON ir.id = w.ingestion_record_id
LEFT JOIN ingestion_records latest_ir ON latest_ir.id = COALESCE(w.latest_ingestion_record_id, w.ingestion_record_id)
LEFT JOIN profiles p ON p.id = w.assignee_id
LEFT JOIN structures s_struct ON s_struct.id = ir.structure_id
LEFT JOIN services s_service ON s_service.id = ir.service_id
LEFT JOIN LATERAL public.workflow_archive_date(
    w.id, er.online_status, ir.compliance_status, er.archived_at, er.updated_at, ir.ingestion_report_id
) archive_date ON true
LEFT JOIN LATERAL public.workflow_session_period(s_service.origin::text, ir.metadata) session_period ON true;

GRANT SELECT ON workflows_enriched TO authenticated;
GRANT SELECT ON workflows_enriched TO service_role;

COMMENT ON VIEW workflows_enriched IS
    'Enriched view of workflows: computed statuses, presentation metadata, publication info, archive date (RI-1446), active/latest ingestion versions, service origin (RCO/DI), assignee. Append-only: add columns at the end with CREATE OR REPLACE VIEW; business rules live in the workflow_* functions.';
