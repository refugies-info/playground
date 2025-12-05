-- Path-optimized GIN indexes for JSONB columns to accelerate jsonb_path_query/containment.
create index if not exists ingestion_records_metadata_path_ops_idx
  on public.ingestion_records
  using gin (metadata jsonb_path_ops);

create index if not exists ingestion_reports_metadata_path_ops_idx
  on public.ingestion_reports
  using gin (metadata jsonb_path_ops);
