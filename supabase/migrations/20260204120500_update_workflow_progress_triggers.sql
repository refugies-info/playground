-- Simplified trigger for DI-only ingestion
-- Creates a new workflow for each ingestion record
create or replace function public.handle_new_ingestion_record()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.workflows (ingestion_record_id, progress, status)
  values (new.id, 'to_process', 'unknown');
  return new;
end;
$$;