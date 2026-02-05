-- Migration: Update workflow_ingestion_metadata view with Title extraction
-- Drop first because we are changing column order/names
DROP VIEW IF EXISTS public.workflow_ingestion_metadata;

CREATE VIEW public.workflow_ingestion_metadata AS
SELECT
  w.id as workflow_id,
  w.ingestion_record_id,
  -- Extract Title: Priority editorial > ingestion. 
  -- Checks direct fields (title, intitule-formation, nom), then nested LHEO structures
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
  ds_struct.data->>'nom' as structure_name,
  -- Session Start Date: currently NULL for DI
  NULL::date as session_start_date,
  -- Quality Score: from di_services
  (ds_service.data->>'score_qualite')::numeric as quality_score
FROM public.workflows w
JOIN public.ingestion_records ir ON ir.id = w.ingestion_record_id
LEFT JOIN public.editorial_records er ON er.id = w.editorial_record_id
LEFT JOIN public.di_structures ds_struct ON ds_struct.id = ir.di_structure_id
LEFT JOIN public.di_services ds_service ON ds_service.id = ir.di_service_id;

GRANT SELECT ON public.workflow_ingestion_metadata TO authenticated;
GRANT SELECT ON public.workflow_ingestion_metadata TO service_role;
