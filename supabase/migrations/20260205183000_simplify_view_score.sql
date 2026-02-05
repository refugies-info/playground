-- Migration: Final simplify view (DI only, direct score)
CREATE OR REPLACE VIEW public.workflow_ingestion_metadata AS
SELECT
  w.id as workflow_id,
  w.ingestion_record_id,
  -- Structure Name: direct from di_structures
  ds_struct.data->>'nom' as structure_name,
  -- Session Start Date: mapped to date_maj from di_services
  -- TODO: find a way to get the actual date_maj from di_services
  NULL::date as session_start_date,
  -- Quality Score: from di_services
  (ds_service.data->>'score_qualite')::numeric as quality_score
FROM public.workflows w
JOIN public.ingestion_records ir ON ir.id = w.ingestion_record_id
LEFT JOIN public.di_structures ds_struct ON ds_struct.id = ir.di_structure_id
LEFT JOIN public.di_services ds_service ON ds_service.id = ir.di_service_id;

GRANT SELECT ON public.workflow_ingestion_metadata TO authenticated;
GRANT SELECT ON public.workflow_ingestion_metadata TO service_role;
