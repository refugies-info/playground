-- RI-1690: "Source" column of the Importer tab. A fiche keeps its workflow
-- when its source changes (RCO reuses the DI origin_id), so the date of the
-- switch is read from the services history of that origin_id.

-- First version in the active source after the last version in another one,
-- up to the active version (a newer one may still be pending); null when the
-- fiche never changed source. Versions are per origin_id across sources
-- (set_version), served by the unique index di_services_di_id_version_idx.
CREATE OR REPLACE FUNCTION public.workflow_source_migrated_at(
    service_origin_id text,
    service_origin public.origin,
    service_version integer
) RETURNS timestamptz
LANGUAGE sql STABLE
AS $$
    SELECT MIN(active_source.created_at)
    FROM public.services active_source
    WHERE active_source.origin_id = service_origin_id
      AND active_source.origin = service_origin
      AND active_source.version <= service_version
      AND active_source.version > (
          SELECT MAX(previous_source.version)
          FROM public.services previous_source
          WHERE previous_source.origin_id = service_origin_id
            AND previous_source.origin <> service_origin
            AND previous_source.version < service_version
      )
$$;

GRANT EXECUTE ON FUNCTION public.workflow_source_migrated_at(text, public.origin, integer)
TO authenticated, service_role;

CREATE OR REPLACE VIEW workflows_enriched
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
    public.markdown_word_count(ir.markdown) AS ingestion_word_count,
    public.workflow_source_migrated_at(s_service.origin_id, s_service.origin, s_service.version) AS source_migrated_at
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
