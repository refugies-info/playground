create or replace function public.handle_new_rco_record()
returns trigger
language plpgsql
security definer
as $$
begin
  insert into public.workflows (rco_record_id, progress, status)
  values (new.id, 'to_process', 'unknown');
  return new;
end;
$$;

create or replace function public.handle_new_ingestion_record()
returns trigger
language plpgsql
security definer
as $$
begin
  update public.workflows
  set
    ingestion_record_id = new.id,
    progress = 'to_process'
  where rco_record_id = new.rco_record_id;
  return new;
end;
$$;