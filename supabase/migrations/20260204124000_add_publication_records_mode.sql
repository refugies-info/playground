alter table public.publication_records
add column if not exists mode text not null default 'publish';