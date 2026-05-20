-- Enable Realtime updates for ingestion_records.
-- /workflow reads compliance_status through workflows_enriched, but manual
-- arbitration updates ingestion_records directly.
do $$
begin
  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'ingestion_records'
  ) then
    alter publication supabase_realtime add table public.ingestion_records;
  end if;
end $$;
