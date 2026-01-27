-- Create a helper view to see user roles and languages in Supabase Studio
create or replace view public.user_profiles as
select
  id,
  email,
  raw_user_meta_data->>'role' as role,
  raw_user_meta_data->>'language' as language,
  last_sign_in_at,
  created_at
from auth.users;

-- Secure the view: only accessible via Supabase Studio (super-admin)
-- Revoking all permissions for anon and authenticated roles
revoke all on public.user_profiles from anon, authenticated;
-- No need to grant to service_role/postgres as they have full access by default.

-- Helper functions to get user role and language from JWT
create or replace function public.get_my_role()
returns text 
language sql 
stable
set search_path = ''
as $$
  select coalesce(nullif(current_setting('request.jwt.claims', true)::jsonb -> 'user_metadata' ->> 'role', ''), 'none');
$$;

create or replace function public.get_my_language()
returns text 
language sql 
stable
set search_path = ''
as $$
  select coalesce(nullif(current_setting('request.jwt.claims', true)::jsonb -> 'user_metadata' ->> 'language', ''), 'none');
$$;

-- Generic update_at trigger function
create or replace function public.set_updated_at()
returns trigger 
language plpgsql
stable
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Create translation_records table
create table if not exists "public"."translation_records" (
  "id" uuid not null default gen_random_uuid(),
  "created_at" timestamp with time zone not null default now(),
  "updated_at" timestamp with time zone not null default now(),
  "editorial_record_id" uuid not null references "public"."editorial_records"("id") on update cascade,
  "language" text not null,
  "status" text not null default 'draft', -- draft, published
  "markdown" text, -- Renamed from content for consistency
  "metadata" jsonb, -- Restored for consistency
  primary key ("id")
);

-- Trigger for updated_at
create trigger set_updated_at
  before update on public.translation_records
  for each row
  execute function public.set_updated_at();

-- Add translation_record_id AND editorial_record_id link to publication_records
do $$
begin
  if not exists (select 1 from information_schema.columns where table_name='publication_records' and column_name='translation_record_id') then
    alter table "public"."publication_records" 
    add column "translation_record_id" uuid references "public"."translation_records"("id") on delete set null;
  end if;

  if not exists (select 1 from information_schema.columns where table_name='publication_records' and column_name='editorial_record_id') then
    alter table "public"."publication_records" 
    add column "editorial_record_id" uuid references "public"."editorial_records"("id") on delete set null;
  end if;

  -- Add translation_record_id to workflows (Bi-directional link)
  if not exists (select 1 from information_schema.columns where table_name='workflows' and column_name='translation_record_id') then
    alter table "public"."workflows" 
    add column "translation_record_id" uuid references "public"."translation_records"("id") on delete set null;
  end if;
end $$;

-- Consistency Triggers for updated_at
create trigger set_updated_at_publication_records
  before update on public.publication_records
  for each row
  execute function public.set_updated_at();

create trigger set_updated_at_workflows
  before update on public.workflows
  for each row
  execute function public.set_updated_at();

-- Enable RLS on translation_records
alter table "public"."translation_records" enable row level security;

-- Indexes
create index if not exists translation_records_editorial_record_id_idx on public.translation_records (editorial_record_id);
create index if not exists translation_records_language_idx on public.translation_records (language);

-- Missing FK Indexes (Performance Fixes)
create index if not exists editorial_records_content_report_id_idx on public.editorial_records (content_report_id);
create index if not exists editorial_records_ingestion_record_id_idx on public.editorial_records (ingestion_record_id);
create index if not exists editorial_records_metadata_report_id_idx on public.editorial_records (metadata_report_id);
-- rco_ingestion_record_id constraint uses ingestion_record_id, already indexed above.

create index if not exists ingestion_records_ingestion_report_id_idx on public.ingestion_records (ingestion_report_id);
create index if not exists ingestion_records_rco_record_id_idx on public.ingestion_records (rco_record_id);

create index if not exists publication_records_translation_record_id_idx on public.publication_records (translation_record_id);
create index if not exists publication_records_editorial_record_id_idx on public.publication_records (editorial_record_id);
create index if not exists publication_records_published_by_idx on public.publication_records (published_by);

create index if not exists workflows_editorial_record_id_idx on public.workflows (editorial_record_id);
create index if not exists workflows_ingestion_record_id_idx on public.workflows (ingestion_record_id);
create index if not exists workflows_rco_record_id_idx on public.workflows (rco_record_id);
create index if not exists workflows_translation_record_id_idx on public.workflows (translation_record_id);


-- RESET RLS POLICIES (Drop existing permissive policies)

-- Editorial Records Drops
drop policy if exists "Enable read access for authenticated users" on public.editorial_records;
drop policy if exists "Enable insert for authenticated users only" on public.editorial_records;
drop policy if exists "Enable update for authenticated users only" on public.editorial_records;
drop policy if exists "Authenticated users can read" on public.editorial_records; -- Potential variant
drop policy if exists "Admins and Editors have full access" on public.editorial_records;
drop policy if exists "Translators can view all editorial records" on public.editorial_records;
drop policy if exists "editorial_records_modify_policy" on public.editorial_records;
drop policy if exists "editorial_records_select_policy" on public.editorial_records;


-- Ingestion/Letta Drops
drop policy if exists "Enable read access for authenticated users" on public.ingestion_records;
drop policy if exists "Enable read access for authenticated users" on public.letta_reports;

-- Workflow Drops
drop policy if exists "Enable update access for authenticated users" on public.workflows;
drop policy if exists "Enable read access for authenticated users" on public.workflows;
drop policy if exists "Authenticated users can read" on public.workflows; -- Potential variant
drop policy if exists "Admins and Editors have full access to workflows" on public.workflows;
drop policy if exists "Translators can view workflows" on public.workflows;
drop policy if exists "workflows_modify_policy" on public.workflows;
drop policy if exists "workflows_select_policy" on public.workflows;

-- Translation Records Drops
drop policy if exists "Admins and Editors have full access to translations" on public.translation_records;
drop policy if exists "Translators can view translations in their language" on public.translation_records;
drop policy if exists "Translators can update translations in their language" on public.translation_records;
drop policy if exists "translation_records_insert_delete_policy" on public.translation_records;
drop policy if exists "translation_records_select_policy" on public.translation_records;
drop policy if exists "translation_records_update_policy" on public.translation_records;


-- Publication Records Drops
drop policy if exists "Authenticated users can view publication_records" on public.publication_records;
drop policy if exists "Authenticated users can insert publication_records" on public.publication_records;
drop policy if exists "Authenticated users can update publication_records" on public.publication_records;
drop policy if exists "Admins and Editors have full access to publications" on public.publication_records;
drop policy if exists "Translators can view publications (own)" on public.publication_records;
drop policy if exists "Translators can publish (insert)" on public.publication_records;
drop policy if exists "Translators can update own publications" on public.publication_records;
drop policy if exists "publication_records_select_policy" on public.publication_records;
drop policy if exists "publication_records_insert_policy" on public.publication_records;
drop policy if exists "publication_records_update_policy" on public.publication_records;
drop policy if exists "publication_records_delete_policy" on public.publication_records;


-- 1. Editorial Records Policies
create policy "editorial_records_select_policy" 
  on public.editorial_records 
  for select 
  to authenticated 
  using (
    (select public.get_my_role()) in ('admin', 'editor', 'translator')
  );

create policy "editorial_records_insert_policy" 
  on public.editorial_records 
  for insert 
  to authenticated 
  with check (
    (select public.get_my_role()) in ('admin', 'editor')
  );

create policy "editorial_records_update_policy" 
  on public.editorial_records 
  for update 
  to authenticated 
  using (
    (select public.get_my_role()) in ('admin', 'editor')
  )
  with check (
    (select public.get_my_role()) in ('admin', 'editor')
  );

create policy "editorial_records_delete_policy" 
  on public.editorial_records 
  for delete 
  to authenticated 
  using (
    (select public.get_my_role()) in ('admin', 'editor')
  );


-- 2. Workflow Policies
create policy "workflows_select_policy" 
  on public.workflows 
  for select 
  to authenticated 
  using (
    (select public.get_my_role()) in ('admin', 'editor', 'translator')
  );

create policy "workflows_insert_policy" 
  on public.workflows 
  for insert 
  to authenticated 
  with check (
    (select public.get_my_role()) in ('admin', 'editor')
  );

create policy "workflows_update_policy" 
  on public.workflows 
  for update 
  to authenticated 
  using (
    (select public.get_my_role()) in ('admin', 'editor')
  )
  with check (
    (select public.get_my_role()) in ('admin', 'editor')
  );

create policy "workflows_delete_policy" 
  on public.workflows 
  for delete 
  to authenticated 
  using (
    (select public.get_my_role()) in ('admin', 'editor')
  );


-- 3. Translation Records Policies
create policy "translation_records_select_policy" 
  on public.translation_records 
  for select 
  to authenticated 
  using (
    -- Admin/Editor can see all
    (select public.get_my_role()) in ('admin', 'editor')
    OR
    -- Translator can see match
    (
      (select public.get_my_role()) = 'translator' 
      AND 
      language = (select public.get_my_language())
    )
  );

create policy "translation_records_insert_policy" 
  on public.translation_records 
  for insert 
  to authenticated 
  with check (
    (select public.get_my_role()) in ('admin', 'editor')
  );

create policy "translation_records_update_policy" 
  on public.translation_records 
  for update 
  to authenticated 
  using (
    (select public.get_my_role()) in ('admin', 'editor')
    OR
    (
      (select public.get_my_role()) = 'translator' 
      AND 
      language = (select public.get_my_language())
    )
  )
  with check (
    (select public.get_my_role()) in ('admin', 'editor')
    OR
    (
      (select public.get_my_role()) = 'translator' 
      AND 
      language = (select public.get_my_language())
    )
  );

create policy "translation_records_delete_policy" 
  on public.translation_records 
  for delete 
  to authenticated 
  using (
    (select public.get_my_role()) in ('admin', 'editor')
  );


-- 4. Publication Records Policies
create policy "publication_records_select_policy" 
  on public.publication_records 
  for select 
  to authenticated 
  using (
    (select public.get_my_role()) in ('admin', 'editor')
    OR
    (
      (select public.get_my_role()) = 'translator' 
      AND (
        published_by = (select auth.uid())
        OR EXISTS (
          select 1 from public.translation_records tr 
          where tr.id = translation_record_id 
          and tr.language = (select public.get_my_language())
        )
      )
    )
  );

create policy "publication_records_insert_policy" 
  on public.publication_records 
  for insert 
  to authenticated 
  with check (
    (select public.get_my_role()) in ('admin', 'editor', 'translator')
  );

create policy "publication_records_update_policy" 
  on public.publication_records 
  for update 
  to authenticated 
  using (
    (select public.get_my_role()) in ('admin', 'editor')
    OR
    (
      (select public.get_my_role()) = 'translator' 
      AND 
      published_by = (select auth.uid())
    )
  )
  with check (
    (select public.get_my_role()) in ('admin', 'editor')
    OR
    (
      (select public.get_my_role()) = 'translator' 
      AND 
      published_by = (select auth.uid())
    )
  );
  
create policy "publication_records_delete_policy" 
  on public.publication_records 
  for delete 
  to authenticated 
  using (
    (select public.get_my_role()) in ('admin', 'editor')
  );


-- SECURITY FIXES FOR FUNCTIONS
-- Fix mutable search_path issues reported by linter
ALTER FUNCTION public.handle_new_editorial_record() SET search_path = '';
ALTER FUNCTION public.handle_new_ingestion_record() SET search_path = '';
ALTER FUNCTION public.handle_new_rco_record() SET search_path = '';
ALTER FUNCTION public.link_letta_reports_to_editorial_record() SET search_path = '';
