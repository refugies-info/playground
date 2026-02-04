create or replace view public.workflow_ingestion_metadata as
select
  w.id as workflow_id,
  w.ingestion_record_id,
  coalesce(
    ir.metadata #>> '{lheo,offres,formation,0,organisme-formation-responsable,nom-organisme}',
    ir.metadata #>> '{lheo,offres,formation,0,action,0,organisme-formateur,0,raison-sociale-formateur}'
  ) as structure_name,
  to_date(
    ir.metadata #>> '{lheo,offres,formation,0,action,0,session,0,periode,debut}',
    'YYYYMMDD'
  ) as session_start_date
from public.workflows w
left join public.ingestion_records ir on ir.id = w.ingestion_record_id;
grant select on public.workflow_ingestion_metadata to authenticated;
grant select on public.workflow_ingestion_metadata to service_role;
alter view public.workflow_ingestion_metadata set (security_invoker = true);
