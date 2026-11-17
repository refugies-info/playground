-- Published workflows whose latest RCO service version has no ingestion
-- record (first RCO version of a DI action, or sessions-only change):
-- checked before republishing updated session dates.
CREATE VIEW public.rco_session_updates_pending
WITH (security_invoker = true)
AS
SELECT
    w.id AS workflow_id,
    latest.origin_id,
    latest.data->>'numero_action' AS numero_action,
    latest.data->>'nom' AS title,
    active_service.origin AS active_origin,
    active_service.version AS active_service_version,
    COALESCE(
        active_service.data->'sessions',
        active_service.data #> '{extra,action,session}'
    ) AS active_sessions,
    latest.id AS latest_service_id,
    latest.version AS latest_service_version,
    latest.data->'sessions' AS latest_sessions,
    latest.created_at AS ingested_at
FROM public.workflows w
JOIN public.ingestion_records ir ON ir.id = w.ingestion_record_id
JOIN public.services active_service ON active_service.id = ir.service_id
JOIN public.services_latest latest ON latest.origin_id = active_service.origin_id
JOIN public.editorial_records er ON er.id = w.editorial_record_id
WHERE latest.origin = 'RCO'
  AND latest.version > active_service.version
  AND er.online_status = 'published'
  AND NOT EXISTS (
      SELECT 1 FROM public.ingestion_records pending
      WHERE pending.service_id = latest.id
  );

GRANT SELECT ON public.rco_session_updates_pending TO authenticated, service_role;
