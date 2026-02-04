create or replace function public.handle_new_editorial_record()
returns trigger
language plpgsql
security definer
as $$
begin
  update public.workflows
  set
    editorial_record_id = new.id,
    progress = 'draft'
  where ingestion_record_id = new.ingestion_record_id;
  return new;
end;
$$;