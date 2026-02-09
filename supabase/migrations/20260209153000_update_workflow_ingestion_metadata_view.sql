-- Migration: Update workflow_ingestion_metadata view with External ID
-- Drop first because we are changing column types/logic
DROP VIEW IF EXISTS public.workflow_ingestion_metadata;

CREATE VIEW public.workflow_ingestion_metadata 
WITH (security_invoker = true)
AS
SELECT
  w.id as workflow_id,
  w.ingestion_record_id,
  -- Extract Title: Priority editorial > ingestion. 
  COALESCE(
    (er.metadata::jsonb)->>'title',
    (er.metadata::jsonb)->>'intitule-formation',
    (er.metadata::jsonb)->>'nom',
    (ir.metadata::jsonb)->>'title',
    (ir.metadata::jsonb)->>'intitule-formation',
    (ir.metadata::jsonb)->>'nom',
    'Untitled'
  ) as title,
  -- Structure Name: direct from di_structures
  COALESCE(ds_struct.data->>'nom', 'Structure inconnue') as structure_name,
  -- Session Start Date: first session
  TO_DATE(
    COALESCE(
      ir.metadata#>>'{extra,action,session,0,periode,debut}',
      ir.metadata#>>'{session,periode,debut}'
    ),
    'YYYYMMDD'
  ) as session_start_date,
  -- Quality Score: from di_services
  (ds_service.data->>'score_qualite')::numeric as quality_score,
  -- External ID: from ingestion metadata
  (ir.metadata::jsonb)->>'id' as external_id
FROM public.workflows w
JOIN public.ingestion_records ir ON ir.id = w.ingestion_record_id
LEFT JOIN public.editorial_records er ON er.id = w.editorial_record_id
LEFT JOIN public.di_structures ds_struct ON ds_struct.id = ir.di_structure_id
LEFT JOIN public.di_services ds_service ON ds_service.id = ir.di_service_id;

GRANT SELECT ON public.workflow_ingestion_metadata TO authenticated;
GRANT SELECT ON public.workflow_ingestion_metadata TO service_role;
