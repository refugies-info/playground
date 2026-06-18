-- Migration: Split active vs latest ingestion records on workflows (RI-1242)
--
-- Context
-- -------
-- Before RI-1242, `workflows.ingestion_record_id` was automatically repointed
-- to every new DI ingestion version. That worked while a fiche had no editorial
-- work, but became ambiguous once an `editorial_record` existed: the workflow
-- could point to DI v4 while the editorial content, metadata overrides and source
-- panel were still based on DI v1.
--
-- New model
-- ---------
-- - workflows.ingestion_record_id        = ACTIVE / accepted ingestion source
-- - workflows.latest_ingestion_record_id = latest DI ingestion source available
--
-- When no editorial work exists, active follows latest automatically. Once an
-- editorial_record exists, new DI versions only update `latest_ingestion_record_id`.
-- A future explicit “accept update” action will move `ingestion_record_id` to the
-- latest value.

-- =============================================================================
-- 1. Schema: store the latest available ingestion separately from active source
-- =============================================================================
ALTER TABLE public.workflows
ADD COLUMN IF NOT EXISTS latest_ingestion_record_id uuid
REFERENCES public.ingestion_records(id) ON UPDATE CASCADE ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS workflows_latest_ingestion_record_id_idx
  ON public.workflows (latest_ingestion_record_id);

COMMENT ON COLUMN public.workflows.ingestion_record_id IS
  'Active/accepted ingestion_record used by the workflow. For DI records this may be older than the latest available version when editorial work already exists.';

COMMENT ON COLUMN public.workflows.latest_ingestion_record_id IS
  'Latest ingestion_record available for this workflow. For DI records this advances when Data Inclusion publishes a new version, even if the active workflow source is not yet updated.';

-- =============================================================================
-- 2. Data backfill: restore coherent active source, then compute latest source
-- =============================================================================
-- If editorial work exists, the active workflow source must be the ingestion
-- record that served as the editorial baseline. This reverses the previous
-- automatic repointing behaviour for historical rows while preserving the latest
-- available version in `latest_ingestion_record_id` below.
UPDATE public.workflows w
SET ingestion_record_id = er.ingestion_record_id
FROM public.editorial_records er
WHERE w.editorial_record_id = er.id
  AND er.ingestion_record_id IS NOT NULL
  AND w.ingestion_record_id IS DISTINCT FROM er.ingestion_record_id;

-- Safe fallback for all workflows (DI and non-DI): latest starts as active.
UPDATE public.workflows
SET latest_ingestion_record_id = ingestion_record_id
WHERE latest_ingestion_record_id IS NULL
  AND ingestion_record_id IS NOT NULL;

-- For DI workflows without editorial work, the active source should follow the
-- latest available DI version automatically. Only consider strictly higher
-- version numbers: historical dumps can contain several ingestion_records with
-- the same broken version number, and those must not appear as fake "1/1"
-- pending updates.
WITH unedited_workflow_latest AS (
  SELECT
    w.id AS workflow_id,
    latest_ir.id AS latest_ingestion_record_id
  FROM public.workflows w
  JOIN public.ingestion_records active_ir ON active_ir.id = w.ingestion_record_id
  JOIN public.di_services active_ds ON active_ds.id = active_ir.di_service_id
  JOIN LATERAL (
    SELECT ir2.id
    FROM public.ingestion_records ir2
    JOIN public.di_services ds2 ON ds2.id = ir2.di_service_id
    WHERE ds2.di_id = active_ds.di_id
      AND COALESCE(ir2.version, 0) > COALESCE(active_ir.version, 0)
    ORDER BY COALESCE(ir2.version, 0) DESC, ir2.created_at DESC, ir2.id DESC
    LIMIT 1
  ) latest_ir ON true
  WHERE w.editorial_record_id IS NULL
)
UPDATE public.workflows w
SET ingestion_record_id = uwl.latest_ingestion_record_id,
    latest_ingestion_record_id = uwl.latest_ingestion_record_id
FROM unedited_workflow_latest uwl
WHERE w.id = uwl.workflow_id
  AND (
    w.ingestion_record_id IS DISTINCT FROM uwl.latest_ingestion_record_id
    OR w.latest_ingestion_record_id IS DISTINCT FROM uwl.latest_ingestion_record_id
  );

-- For DI workflows with editorial work, keep active on the editorial baseline
-- but expose a pending update when a strictly newer DI version exists.
WITH edited_workflow_latest AS (
  SELECT
    w.id AS workflow_id,
    latest_ir.id AS latest_ingestion_record_id
  FROM public.workflows w
  JOIN public.ingestion_records active_ir ON active_ir.id = w.ingestion_record_id
  JOIN public.di_services active_ds ON active_ds.id = active_ir.di_service_id
  JOIN LATERAL (
    SELECT ir2.id
    FROM public.ingestion_records ir2
    JOIN public.di_services ds2 ON ds2.id = ir2.di_service_id
    WHERE ds2.di_id = active_ds.di_id
      AND COALESCE(ir2.version, 0) > COALESCE(active_ir.version, 0)
    ORDER BY COALESCE(ir2.version, 0) DESC, ir2.created_at DESC, ir2.id DESC
    LIMIT 1
  ) latest_ir ON true
  WHERE w.editorial_record_id IS NOT NULL
)
UPDATE public.workflows w
SET latest_ingestion_record_id = ewl.latest_ingestion_record_id
FROM edited_workflow_latest ewl
WHERE w.id = ewl.workflow_id
  AND w.latest_ingestion_record_id IS DISTINCT FROM ewl.latest_ingestion_record_id;

-- =============================================================================
-- 3. Trigger: new DI versions update latest, but not active once edited
-- =============================================================================
CREATE OR REPLACE FUNCTION public.handle_new_ingestion_record()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    new_di_id text;
    target_workflow_id uuid;
    target_has_editorial boolean;
BEGIN
    -- Non-DI records (legacy/RCO/manual ingestion) keep the historical behaviour:
    -- create a workflow whose active source and latest source are the same row.
    IF NEW.di_service_id IS NULL THEN
        INSERT INTO public.workflows (ingestion_record_id, latest_ingestion_record_id)
        VALUES (NEW.id, NEW.id);
        RETURN NEW;
    END IF;

    -- Retrieve the stable Data Inclusion ID for the new service version.
    SELECT ds.di_id INTO new_di_id
    FROM public.di_services ds
    WHERE ds.id = NEW.di_service_id;

    IF NEW.version = 1 THEN
        -- First DI version: active and latest are identical.
        INSERT INTO public.workflows (ingestion_record_id, latest_ingestion_record_id)
        VALUES (NEW.id, NEW.id);
    ELSE
        -- Updated DI service (version > 1): find the workflow already associated
        -- with this stable DI ID. We match through latest first when available,
        -- falling back to active to support rows created before RI-1242.
        SELECT w.id, (w.editorial_record_id IS NOT NULL)
        INTO target_workflow_id, target_has_editorial
        FROM public.workflows w
        JOIN public.ingestion_records linked_ir
          ON linked_ir.id = COALESCE(w.latest_ingestion_record_id, w.ingestion_record_id)
        JOIN public.di_services linked_ds ON linked_ds.id = linked_ir.di_service_id
        WHERE linked_ds.di_id = new_di_id
        ORDER BY (w.editorial_record_id IS NOT NULL) DESC, w.updated_at DESC
        LIMIT 1;

        IF target_workflow_id IS NULL THEN
            -- Defensive fallback: if no workflow exists for this DI ID, create one.
            INSERT INTO public.workflows (ingestion_record_id, latest_ingestion_record_id)
            VALUES (NEW.id, NEW.id);
        ELSIF target_has_editorial THEN
            -- Editorial work already exists: do NOT move the active source.
            -- The new DI version becomes a pending update until explicitly accepted.
            UPDATE public.workflows
            SET latest_ingestion_record_id = NEW.id
            WHERE id = target_workflow_id;
        ELSE
            -- No editorial work yet: automatically follow the latest DI version.
            UPDATE public.workflows
            SET ingestion_record_id = NEW.id,
                latest_ingestion_record_id = NEW.id
            WHERE id = target_workflow_id;
        END IF;
    END IF;

    RETURN NEW;
END;
$$;

COMMENT ON FUNCTION public.handle_new_ingestion_record() IS
  'Creates/updates workflows for new ingestion_records. RI-1242: workflows.ingestion_record_id is the active accepted source; workflows.latest_ingestion_record_id tracks the latest DI version. Existing editorial work prevents automatic active-source repointing.';

-- Trigger function only: it should not be callable through exposed APIs.
REVOKE EXECUTE ON FUNCTION public.handle_new_ingestion_record() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.handle_new_ingestion_record() FROM anon;
REVOKE EXECUTE ON FUNCTION public.handle_new_ingestion_record() FROM authenticated;

-- =============================================================================
-- 4. View: expose active/latest versions while reading content from active source
-- =============================================================================
DROP VIEW IF EXISTS workflows_enriched;

CREATE VIEW workflows_enriched
WITH (security_invoker = on)
AS
SELECT
    w.id,
    active_ir.compliance_status,
    w.updated_at,
    w.rco_record_id,
    w.editorial_record_id,
    w.ingestion_record_id,
    w.created_at,
    -- Version tracking (RI-1242)
    -- The main view content below intentionally uses active_ir. latest_ir is only
    -- used to detect and display pending DI updates.
    active_ir.version as active_ingestion_version,
    latest_ir.version as latest_ingestion_version,
    CASE
        WHEN w.latest_ingestion_record_id IS NULL THEN false
        ELSE w.ingestion_record_id IS DISTINCT FROM w.latest_ingestion_record_id
            AND COALESCE(latest_ir.version, 0) > COALESCE(active_ir.version, 0)
    END as has_pending_ingestion_update,
    -- Computed work_status: editorial_record.work_status OR fallback logic
    CASE
        WHEN er.work_status IS NOT NULL THEN er.work_status
        -- Terminal states: published/archived documents have no pending work (RI-1128)
        WHEN er.online_status IN ('published', 'archived') THEN NULL
        WHEN active_ir.compliance_status = 'compliant' THEN 'to_process'::text
        ELSE NULL
    END AS computed_work_status,
    -- Computed online_status: editorial_record.online_status OR fallback logic
    CASE
        WHEN er.online_status IS NOT NULL THEN er.online_status
        WHEN active_ir.compliance_status = 'non_compliant' THEN 'archived'::text
        ELSE NULL
    END AS computed_online_status,
    -- Raw values for reference
    er.work_status as raw_work_status,
    er.online_status as raw_online_status,
    -- Content sources: active ingestion is the source of truth for the current UI.
    er.markdown as editorial_markdown,
    er.metadata as editorial_metadata,
    NULL::uuid as editorial_assignee_id,
    active_ir.markdown as ingestion_markdown,
    active_ir.metadata as ingestion_metadata,
    active_ir.created_at as ingestion_created_at,
    active_ir.ingestion_report_id,
    -- Report date for date_added calculation
    (SELECT MAX(lr.created_at) FROM letta_reports lr WHERE lr.id = active_ir.ingestion_report_id) as report_created_at,
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
    NULL::text as assignee_email,
    NULL::jsonb as assignee_profile,
    -- Location (commune): editorial override first, active ingestion fallback (RI-1146)
    -- Root-level key in RCO ingestion metadata, e.g. "Blois", "Mantes-la-Jolie"
    COALESCE(
        (er.metadata::jsonb)->>'commune',
        (active_ir.metadata::jsonb)->>'commune'
    ) as commune,
    -- Modalités entrées/sorties: editorial override first, active ingestion fallback (RI-1146)
    -- RCO path: extra.action.modalites-entrees-sorties
    -- Values: "0" (entrées permanentes), "1" (entrées à dates fixes)
    COALESCE(
        (er.metadata::jsonb)#>>'{extra,action,modalites-entrees-sorties}',
        (active_ir.metadata::jsonb)#>>'{extra,action,modalites-entrees-sorties}'
    ) as modalites_entrees_sorties,
    -- Presentation metadata (from ingestion_metadata view logic)
    COALESCE(
        (er.metadata::jsonb)->>'title',
        (er.metadata::jsonb)->>'intitule-formation',
        (er.metadata::jsonb)->>'nom',
        (active_ir.metadata::jsonb)->>'title',
        (active_ir.metadata::jsonb)->>'intitule-formation',
        (active_ir.metadata::jsonb)->>'nom',
        'Untitled'
    ) as title,
    COALESCE(ds_struct.data->>'nom', 'Structure inconnue') as structure_name,
    session_period.session_start_date,
    session_period.session_end_date,
    (ds_service.data->>'score_qualite')::numeric as quality_score,
    (active_ir.metadata::jsonb)->>'id' as external_id,
    -- Word count from active ingestion markdown, stripping YAML frontmatter (RI-1172)
    -- 1. regexp_replace with 's' flag (dot-all) strips ^---\n...\n--- block
    -- 2. NULLIF guards against empty string after strip (frontmatter-only docs)
    --    without it regexp_split_to_array('', '\s+') → {''} → count 1 instead of NULL
    -- 3. regexp_split_to_array splits remaining text by whitespace
    array_length(
        regexp_split_to_array(
            NULLIF(
                trim(regexp_replace(COALESCE(active_ir.markdown, ''), '^---\n.*?\n---\n?', '', 's')),
                ''
            ),
            E'\\s+'
        ),
        1
    ) as ingestion_word_count
FROM workflows w
LEFT JOIN editorial_records er ON er.id = w.editorial_record_id
LEFT JOIN ingestion_records active_ir ON active_ir.id = w.ingestion_record_id
LEFT JOIN ingestion_records latest_ir ON latest_ir.id = COALESCE(w.latest_ingestion_record_id, w.ingestion_record_id)
LEFT JOIN di_structures ds_struct ON ds_struct.id = active_ir.di_structure_id
LEFT JOIN di_services ds_service ON ds_service.id = active_ir.di_service_id
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
                WHEN active_ir.di_service_id IS NOT NULL
                    AND jsonb_typeof(active_ir.metadata::jsonb #> '{extra,action,session}') = 'array'
                    THEN active_ir.metadata::jsonb #> '{extra,action,session}'
                ELSE '[]'::jsonb
            END
        ) as sessions(session_item)
    ) session_values
) session_period ON true;

-- Re-grant access (view was recreated)
GRANT SELECT ON workflows_enriched TO authenticated;
GRANT SELECT ON workflows_enriched TO service_role;
REVOKE SELECT ON workflows_enriched FROM anon;

COMMENT ON VIEW workflows_enriched IS
    'Enriched view of workflows combining computed statuses, presentation metadata, publication info, and ingestion version tracking.
     Designed for list views and filtering operations.
     RI-1128: fixed invalid published/archived + to_process combinations.
     RI-1146: added assignee_email, commune, modalites_entrees_sorties for sort/filter support.
     RI-1172: added ingestion_word_count for "Mots" column with server-side sorting.
     Added DI-only session_start_date/session_end_date period.
     RI-1242: workflows.ingestion_record_id is active/accepted; workflows.latest_ingestion_record_id is latest available; version fields expose active/latest state.';
