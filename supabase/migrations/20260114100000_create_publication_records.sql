-- Create publication_records table
-- Stores records of documents published to external platforms (refugies.info, etc.)

create table "public"."publication_records" (
  "id" uuid not null default gen_random_uuid(),
  "created_at" timestamp with time zone not null default now(),
  "updated_at" timestamp with time zone not null default now(),
  "workflow_id" uuid not null,
  "target" text not null,              -- 'refugies_info_staging', 'refugies_info_prod', etc.
  "remote_id" text not null,           -- ID du dispositif créé (MongoDB ObjectId)
  "status" text not null default 'published',
  "payload" jsonb,
  "published_by" uuid,
  primary key ("id"),
  foreign key ("workflow_id") references "public"."workflows"("id") on update cascade
);

alter table "public"."publication_records" enable row level security;

-- Index pour retrouver les publications d'un workflow
create index publication_records_workflow_id_idx on public.publication_records using btree (workflow_id);

-- Index pour filtrer par environnement
create index publication_records_target_idx on public.publication_records using btree (target);

-- Grants for authenticated and service_role only (no anon access)
grant select on table "public"."publication_records" to "authenticated";
grant insert on table "public"."publication_records" to "authenticated";
grant update on table "public"."publication_records" to "authenticated";

grant delete on table "public"."publication_records" to "service_role";
grant insert on table "public"."publication_records" to "service_role";
grant references on table "public"."publication_records" to "service_role";
grant select on table "public"."publication_records" to "service_role";
grant trigger on table "public"."publication_records" to "service_role";
grant truncate on table "public"."publication_records" to "service_role";
grant update on table "public"."publication_records" to "service_role";

-- RLS Policies

-- Authenticated users can view all publication history
-- Rationale: Workflows are collaborative, so history should be visible to all editors
create policy "Authenticated users can view publication_records"
  on public.publication_records for select to authenticated using (true);

-- Authenticated users can create new publication records
-- Rationale: Any authorized editor can publish a version
create policy "Authenticated users can insert publication_records"
  on public.publication_records for insert to authenticated with check (true);


