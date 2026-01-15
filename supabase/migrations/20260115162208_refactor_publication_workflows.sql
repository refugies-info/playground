-- Add publication_record_id to workflows table
alter table "public"."workflows" 
add column "publication_record_id" uuid references "public"."publication_records"("id") on update cascade;

-- Migrate existing data: Link workflows to their most recent publication_record
-- We use a temporary approach to update based on the existing workflow_id in publication_records before dropping it
update "public"."workflows" w
set "publication_record_id" = (
  select id 
  from "public"."publication_records" pr 
  where pr.workflow_id = w.id 
  order by pr.created_at desc 
  limit 1
);

-- Drop the old relationship
drop index if exists publication_records_workflow_id_idx;
alter table "public"."publication_records" drop column "workflow_id";

-- Add useful index on the new column
create index workflows_publication_record_id_idx on public.workflows using btree (publication_record_id);
