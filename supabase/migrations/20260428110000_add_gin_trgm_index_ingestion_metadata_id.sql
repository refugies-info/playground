-- Add pg_trgm extension (required for gin_trgm_ops)
-- This enables trigram indexing for ILIKE queries with leading wildcards
create extension if not exists pg_trgm;

-- GIN trigram index on the Carif-Oref ID stored in ingestion_records.metadata->>'id'
-- This makes the ilike query in getDocuments() (searchId filter) use an index
-- instead of doing a full table scan, which was causing statement timeouts on prod.
create index if not exists ingestion_records_metadata_id_trgm_idx
  on public.ingestion_records
  using gin ((metadata->>'id') gin_trgm_ops);
