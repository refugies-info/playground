ALTER TABLE di_services RENAME TO services;

CREATE TYPE origin AS ENUM (
  'RCO',
  'DI'
);

ALTER TABLE services
    ADD COLUMN origin origin NOT NULL DEFAULT 'DI';

ALTER TABLE services
    RENAME COLUMN di_id TO origin_id;

ALTER TABLE services
    RENAME COLUMN di_structure_id TO structure_id;

ALTER TABLE di_structures RENAME TO structures;

ALTER TABLE structures
    ADD COLUMN origin origin NOT NULL DEFAULT 'DI';

ALTER TABLE structures
    RENAME COLUMN di_id TO origin_id;

DROP VIEW public.di_structures_latest;
DROP VIEW public.di_services_latest;

CREATE VIEW public.structures_latest
WITH (security_invoker = true)
AS
SELECT DISTINCT ON (s.origin_id) s.*
FROM public.structures AS s
ORDER BY s.origin_id, s.version DESC;

CREATE VIEW public.services_latest
WITH (security_invoker = true)
AS
SELECT DISTINCT ON (s.origin_id) s.*
FROM public.services AS s
ORDER BY s.origin_id, s.version DESC;

GRANT SELECT ON public.structures_latest TO authenticated, postgres, service_role;
GRANT SELECT ON public.services_latest TO authenticated, postgres, service_role;

ALTER TABLE ingestion_records
    RENAME COLUMN di_service_id TO service_id;

ALTER TABLE ingestion_records
    RENAME COLUMN di_structure_id TO structure_id;

ALTER TABLE ingestion_records
    DROP COLUMN origin;

DROP VIEW IF EXISTS workflows_enriched;

ALTER TABLE workflows
    DROP COLUMN rco_record_id;

ALTER TABLE ingestion_records
    DROP COLUMN rco_record_id;

DROP TABLE rco_records;

DROP FUNCTION IF EXISTS public.handle_new_rco_record();

DROP TRIGGER IF EXISTS di_structures_set_version ON structures;
DROP TRIGGER IF EXISTS di_services_set_version ON services;
DROP FUNCTION IF EXISTS di_set_version();

CREATE FUNCTION set_version()
RETURNS TRIGGER AS $$
DECLARE
  max_ver integer;
BEGIN
  EXECUTE format(
    'SELECT COALESCE(MAX(version), 0) FROM %I WHERE origin_id = $1',
    TG_TABLE_NAME
  ) INTO max_ver USING NEW.data->>'id';

  NEW.version := max_ver + 1;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER structures_set_version
  BEFORE INSERT ON structures
  FOR EACH ROW EXECUTE FUNCTION set_version();

CREATE TRIGGER services_set_version
  BEFORE INSERT ON services
  FOR EACH ROW EXECUTE FUNCTION set_version();

CREATE OR REPLACE FUNCTION public.increment_ingestion_version()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    max_ver integer;
    new_origin_id text;
BEGIN
    IF NEW.service_id IS NOT NULL THEN
        SELECT s.origin_id INTO new_origin_id
        FROM public.services s
        WHERE s.id = NEW.service_id;

        SELECT COALESCE(MAX(ir.version), 0) INTO max_ver
        FROM public.ingestion_records ir
        JOIN public.services s ON ir.service_id = s.id
        WHERE s.origin_id = new_origin_id;

        NEW.version := max_ver + 1;
    END IF;
    RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.handle_new_ingestion_record()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    new_origin_id text;
    target_workflow_id uuid;
    target_has_editorial boolean;
BEGIN
    IF NEW.service_id IS NULL THEN
        INSERT INTO public.workflows (ingestion_record_id, latest_ingestion_record_id)
        VALUES (NEW.id, NEW.id);
        RETURN NEW;
    END IF;

    SELECT s.origin_id INTO new_origin_id
    FROM public.services s
    WHERE s.id = NEW.service_id;

    IF NEW.version = 1 THEN
        INSERT INTO public.workflows (ingestion_record_id, latest_ingestion_record_id)
        VALUES (NEW.id, NEW.id);
    ELSE
        SELECT w.id, (w.editorial_record_id IS NOT NULL)
        INTO target_workflow_id, target_has_editorial
        FROM public.workflows w
        JOIN public.ingestion_records linked_ir
          ON linked_ir.id = COALESCE(w.latest_ingestion_record_id, w.ingestion_record_id)
        JOIN public.services linked_s ON linked_s.id = linked_ir.service_id
        WHERE linked_s.origin_id = new_origin_id
        ORDER BY (w.editorial_record_id IS NOT NULL) DESC, w.updated_at DESC
        LIMIT 1;

        IF target_workflow_id IS NULL THEN
            INSERT INTO public.workflows (ingestion_record_id, latest_ingestion_record_id)
            VALUES (NEW.id, NEW.id);
        ELSIF target_has_editorial THEN
            UPDATE public.workflows
            SET latest_ingestion_record_id = NEW.id
            WHERE id = target_workflow_id;
        ELSE
            UPDATE public.workflows
            SET ingestion_record_id = NEW.id,
                latest_ingestion_record_id = NEW.id
            WHERE id = target_workflow_id;
        END IF;
    END IF;

    RETURN NEW;
END;
$$;

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
  WHERE ir.service_id = ANY(p_service_ids)
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

CREATE OR REPLACE FUNCTION public.claim_di_audit_targets(
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
  UPDATE public.ingestion_records ir
  SET compliance_status = NULL
  WHERE ir.compliance_status = 'pending'
    AND ir.updated_at < now() - timeout_interval
    AND ir.service_id = ANY(p_service_ids);

  RETURN QUERY
  WITH candidates AS (
    SELECT ir.id AS record_id
    FROM public.ingestion_records ir
    WHERE ir.service_id = ANY(p_service_ids)
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
    w.is_pending_update
  FROM public.ingestion_records ir
  INNER JOIN claimed cl ON cl.ingestion_record_id = ir.id
  INNER JOIN LATERAL (
    SELECT
      matched_w.id,
      (
        matched_w.latest_ingestion_record_id = ir.id
        AND matched_w.ingestion_record_id IS DISTINCT FROM matched_w.latest_ingestion_record_id
      ) AS is_pending_update
    FROM public.workflows matched_w
    WHERE matched_w.ingestion_record_id = ir.id
       OR matched_w.latest_ingestion_record_id = ir.id
    ORDER BY
      (
        matched_w.latest_ingestion_record_id = ir.id
        AND matched_w.ingestion_record_id IS DISTINCT FROM matched_w.latest_ingestion_record_id
      ) DESC,
      (matched_w.ingestion_record_id = ir.id) DESC,
      matched_w.updated_at DESC NULLS LAST,
      matched_w.id DESC
    LIMIT 1
  ) w ON true;
END;
$$;

-- Recreate workflows_enriched against the renamed services/structures tables,
-- exposing the source origin (RCO/DI) of the linked service

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
        (ir.metadata::jsonb)->>'commune'
    ) as commune,
    COALESCE(
        (er.metadata::jsonb)#>>'{extra,action,modalites-entrees-sorties}',
        (ir.metadata::jsonb)#>>'{extra,action,modalites-entrees-sorties}'
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
            session_item #>> '{periode,debut}' as start_value,
            session_item #>> '{periode,fin}' as end_value
        FROM jsonb_array_elements(
            CASE
                WHEN s_service.origin = 'DI'
                    AND jsonb_typeof(ir.metadata::jsonb #> '{extra,action,session}') = 'array'
                    THEN ir.metadata::jsonb #> '{extra,action,session}'
                ELSE '[]'::jsonb
            END
        ) as sessions(session_item)
    ) session_values
) session_period ON true;

GRANT SELECT ON workflows_enriched TO authenticated;
GRANT SELECT ON workflows_enriched TO service_role;

COMMENT ON VIEW workflows_enriched IS
    'Enriched view of workflows combining computed statuses, presentation metadata, publication info, derived archive date and its approximation flag (RI-1446), active/latest ingestion versions, service origin (RCO/DI), and workflow assignment info.';
