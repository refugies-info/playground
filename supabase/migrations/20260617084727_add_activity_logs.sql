-- Migration: Add activity_logs table
-- Rationale: persistent audit trail of user/system actions on documents.
-- The log is append-only and must survive deletion of the referenced actor,
-- target user, or workflow — hence every FK uses ON DELETE SET NULL rather than
-- CASCADE (deleting a user must never erase the history of what they did).
--
-- Column design:
--   - author_id        : who performed the action (the actor).
--   - target_profile_id: optional second party — e.g. the assignee in an
--                        assignation event. NULL for actions with no target.
--   - workflow_id      : optional document spine the action relates to. The
--                        workflow is 1:1 with a document and links everything
--                        (ingestion/rco/editorial records), so it is enough to
--                        scope a log entry to a document. NULL for global actions.
--   - action           : machine-readable event type, used for filtering/stats.
--   - activity         : free-form JSONB payload (before/after snapshots, extra
--                        metadata). Kept open for future event shapes.
--   - letta_report_id  : optional link to the letta_reports row that produced
--                        this action. letta_reports is the table holding every
--                        LLM interaction, so AI cost/model metadata (token_cost,
--                        model_name — added below) live there, not on the log.
--                        Join activity_logs -> letta_reports on this FK to read
--                        them. NULL for non-AI actions.

create table public.activity_logs (
  id uuid not null default gen_random_uuid(),
  author_id uuid,
  target_profile_id uuid,
  workflow_id uuid,
  letta_report_id uuid,
  action varchar(200) not null,
  activity jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  primary key (id)
);

-- AI cost/model metadata belongs on letta_reports (the LLM-interaction table),
-- so it can be aggregated per report regardless of how many log rows reference it.
alter table public.letta_reports
  add column token_cost integer,
  add column model varchar(200);

-- Foreign keys (all SET NULL: preserve the log row when a referenced entity is deleted)
alter table public.activity_logs
  add constraint activity_logs_author_id_fkey
  foreign key (author_id) references public.profiles(id)
  on update cascade on delete set null;

alter table public.activity_logs
  add constraint activity_logs_target_profile_id_fkey
  foreign key (target_profile_id) references public.profiles(id)
  on update cascade on delete set null;

alter table public.activity_logs
  add constraint activity_logs_workflow_id_fkey
  foreign key (workflow_id) references public.workflows(id)
  on update cascade on delete set null;

alter table public.activity_logs
  add constraint activity_logs_letta_report_id_fkey
  foreign key (letta_report_id) references public.letta_reports(id)
  on update cascade on delete set null;

-- Indexes for the common access paths: per-document timeline, per-actor history,
-- target lookups (assignations), and event-type filtering for stats.
create index activity_logs_workflow_id_idx on public.activity_logs (workflow_id);
create index activity_logs_author_id_idx on public.activity_logs (author_id);
create index activity_logs_target_profile_id_idx on public.activity_logs (target_profile_id);
create index activity_logs_letta_report_id_idx on public.activity_logs (letta_report_id);
create index activity_logs_action_idx on public.activity_logs (action);
create index activity_logs_created_at_idx on public.activity_logs (created_at desc);
-- GIN index for querying inside the JSONB payload when stats need it.
create index activity_logs_activity_gin_idx on public.activity_logs using gin (activity);

-- Row Level Security
alter table public.activity_logs enable row level security;

-- Authenticated users can read the activity history.
create policy "Activity logs are viewable by authenticated users"
  on public.activity_logs
  for select
  to authenticated
  using (true);

-- Writes go through the server (service_role) only — the log is not client-writable.
grant select, insert, update, delete on public.activity_logs to service_role;
grant select on public.activity_logs to authenticated;