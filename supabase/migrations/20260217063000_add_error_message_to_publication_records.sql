-- Add error_message column to publication_records
-- Used to track workflow errors (status='failed') so frontend can display them

alter table "public"."publication_records"
add column "error_message" text;

-- Add CHECK constraint to enforce valid status values
-- status can be: 'published' (success), 'failed' (workflow error), or 'archived' (content archived)
alter table "public"."publication_records"
add constraint publication_records_status_check
check (status in ('published', 'failed', 'archived'));
