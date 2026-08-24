-- RI-1446 : les fiches archivees n'avaient pas toutes de date d'archivage,
-- contrairement aux fiches publiees dont la date vient du registre append-only
-- publication_records. Le filtre « Archivage » du picker de dates excluait donc
-- silencieusement la majorite des fiches archivees, faussant les statistiques de
-- production editoriale. On derive archived_at depuis l'historique disponible
-- plutot que de dependre de la seule colonne editorial_records.archived_at.
-- Recreate workflows_enriched to derive archived_at (used by the documents list)
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
    -- Date d'archivage derivee (RI-1446), cf. le LATERAL archive_date plus bas.
    COALESCE(archive_date.exact_at, archive_date.approximate_at) AS archived_at,
    -- true quand la date affichee n'est qu'une approximation : l'UI la prefixe
    -- alors d'un « ~ » pour que l'edito ne la prenne pas pour une date certaine.
    (archive_date.exact_at IS NULL AND archive_date.approximate_at IS NOT NULL)
        AS archived_at_is_approximate,
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
        WHEN p.id IS NOT NULL THEN jsonb_build_object('email', p.email, 'role', p.role, 'avatar_url', p.avatar_url)
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
    -- Date d'archivage (RI-1446).
    -- editorial_records.archived_at n'existe que depuis 20260707100000 et son
    -- backfill n'a pu remonter qu'un historique tres partiel :
    --   - activity_logs n'existe que depuis 20260617084727, et l'enum valait
    --     'archivage' au lieu de 'archive' jusqu'a 20260626150000 : les inserts
    --     echouaient silencieusement (recordActivity avale l'erreur) ;
    --   - publication_records ne couvre que les fiches publiees PUIS archivees.
    -- S'y ajoute un trou structurel : une fiche archivee par le seul fallback de
    -- conformite (online_status NULL + compliance_status non_compliant) ne passe
    -- jamais par editorial_records, donc archived_at y reste NULL par
    -- construction, y compris pour les fiches a venir.
    -- On derive donc la date ici, et seulement tant que la fiche est
    -- effectivement archivee : toggle-status remet archived_at a NULL a la
    -- republication, on ne doit pas ressusciter une date perimee via
    -- l'historique.
    SELECT
        -- Dates certaines, de la plus fiable a la moins directe. Pour un
        -- archivage automatique pour non-conformite, le trigger suit le rapport
        -- d'arbitrage : arbitrated_at EST la date d'archivage.
        CASE
            WHEN er.online_status = 'archived'
                THEN COALESCE(er.archived_at, src.logged_at, src.pushed_at)
            WHEN er.online_status IS NULL AND ir.compliance_status = 'non_compliant'
                THEN COALESCE(er.archived_at, src.logged_at, src.pushed_at, src.arbitrated_at)
            ELSE NULL
        END AS exact_at,
        -- Repli approximatif, reserve a l'archivage explicite sans trace (avant
        -- 20260626150000). On n'utilise pas arbitrated_at ici : l'arbitrage
        -- precede l'archivage explicite de 4 a 45 jours sur les fiches ou les
        -- deux dates sont connues, alors que updated_at ne bouge quasiment plus
        -- une fois la fiche dans son etat terminal.
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
    'Enriched view of workflows combining computed statuses, presentation metadata, publication info, derived archive date and its approximation flag (RI-1446), active/latest ingestion versions, and workflow assignment info.';

