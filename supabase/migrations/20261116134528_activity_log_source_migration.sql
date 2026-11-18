-- RI-1690: "Ce dispositif a été migré de l'API … vers l'API …" in the activity
-- journal, logged when the fiche's active version switches source (same rule
-- as workflows_enriched.source_migrated_at). A version waiting for acceptance
-- is not a migration yet: it is logged once accepted.

CREATE OR REPLACE FUNCTION public.log_workflow_source_migration()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
    INSERT INTO public.activity_logs (action, workflow_id, activity)
    SELECT
        'source_migration',
        NEW.id,
        jsonb_build_object('from', previous_service.origin, 'to', active_service.origin)
    FROM public.ingestion_records previous_record
    JOIN public.services previous_service ON previous_service.id = previous_record.service_id
    CROSS JOIN public.ingestion_records active_record
    JOIN public.services active_service ON active_service.id = active_record.service_id
    WHERE previous_record.id = OLD.ingestion_record_id
      AND active_record.id = NEW.ingestion_record_id
      AND previous_service.origin <> active_service.origin;

    RETURN NEW;
END;
$$;

CREATE TRIGGER on_workflow_active_ingestion_change_log_source_migration
    AFTER UPDATE OF ingestion_record_id ON public.workflows
    FOR EACH ROW
    WHEN (OLD.ingestion_record_id IS DISTINCT FROM NEW.ingestion_record_id)
    EXECUTE FUNCTION public.log_workflow_source_migration();

-- Backfill the fiches that already switched source, dated like the Source column.
INSERT INTO public.activity_logs (action, workflow_id, activity, created_at)
SELECT
    'source_migration',
    w.id,
    jsonb_build_object('from', previous_service.origin, 'to', active_service.origin),
    public.workflow_source_migrated_at(active_service.origin_id, active_service.origin, active_service.version)
FROM public.workflows w
JOIN public.ingestion_records active_record ON active_record.id = w.ingestion_record_id
JOIN public.services active_service ON active_service.id = active_record.service_id
JOIN LATERAL (
    SELECT s.origin
    FROM public.services s
    WHERE s.origin_id = active_service.origin_id
      AND s.origin <> active_service.origin
      AND s.version < active_service.version
    ORDER BY s.version DESC
    LIMIT 1
) previous_service ON true
WHERE public.workflow_source_migrated_at(active_service.origin_id, active_service.origin, active_service.version) IS NOT NULL;
