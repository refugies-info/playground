-- Migration: Add notifications table
-- Rationale: the BOMO editorial team needs a per-user inbox over the events
-- already recorded in activity_logs. A notification is NOT a new event — it is
-- one recipient's view of an existing activity_logs row, carrying only the
-- per-user state (read / archived). All content (type, document, actor,
-- payload) is read by joining activity_logs, which stays the single source of
-- truth. Hence activity_log_id is NOT NULL: every notification is backed by a
-- log entry.
--
-- Fan-out is performed in application code (dispatchNotifications, in
-- packages/workflows/src/steps/common/notification.ts), not by a database
-- trigger: the recipient rules are business logic and belong where they can be
-- read, typed and tested. The UNIQUE constraint below is what makes that
-- dispatch safely replayable.
--
-- Column design:
--   - recipient_id    : who receives it. One activity_logs row fans out to N
--                       notifications rows, one per recipient.
--   - activity_log_id : the source event. ON DELETE CASCADE (unlike
--                       activity_logs' own FKs): a notification without its
--                       event is meaningless, whereas the audit log must
--                       survive deletions.
--   - read_at         : NULL = unread. Timestamp rather than boolean: same
--                       storage cost, keeps the "when", and toggling back to
--                       unread is a plain "set read_at = null".
--   - archived_at     : NULL = still in the inbox. Same reasoning.
--   - created_at      : denormalised from activity_logs.created_at. Redundant
--                       on purpose: without it the reverse-chronological sort
--                       per recipient cannot be served by a local index.

create table public.notifications (
  id uuid not null default gen_random_uuid(),
  recipient_id uuid not null,
  activity_log_id uuid not null,
  read_at timestamptz,
  archived_at timestamptz,
  created_at timestamptz not null default now(),
  primary key (id)
);

-- Both FKs cascade: a deleted user has no inbox, a deleted event has no notification.
alter table public.notifications
  add constraint notifications_recipient_id_fkey
  foreign key (recipient_id) references public.profiles(id)
  on update cascade on delete cascade;

alter table public.notifications
  add constraint notifications_activity_log_id_fkey
  foreign key (activity_log_id) references public.activity_logs(id)
  on update cascade on delete cascade;

-- Idempotency guard: replaying the fan-out for the same event can never
-- duplicate a recipient's notification. Both columns are NOT NULL, so unlike a
-- nullable unique this constraint is always enforced.
-- The backing index also serves lookups by activity_log_id (leading column).
alter table public.notifications
  add constraint notifications_activity_log_recipient_key
  unique (activity_log_id, recipient_id);

-- One partial index per panel tab. No index on the notification type: the
-- "filter by type" multiselect spans 5 values joined from activity_logs.action,
-- a post-filter is enough at this volume.
create index notifications_inbox_idx
  on public.notifications (recipient_id, created_at desc)
  where archived_at is null;

create index notifications_unread_idx
  on public.notifications (recipient_id)
  where read_at is null and archived_at is null;

create index notifications_archived_idx
  on public.notifications (recipient_id, created_at desc)
  where archived_at is not null;

-- Row Level Security: a notification is strictly private to its recipient.
alter table public.notifications enable row level security;

create policy "Users can read their own notifications"
  on public.notifications
  for select
  to authenticated
  using (recipient_id = (select auth.uid()));

create policy "Users can update their own notifications"
  on public.notifications
  for update
  to authenticated
  using (recipient_id = (select auth.uid()))
  with check (recipient_id = (select auth.uid()));

-- Column-level UPDATE grant: without it a user could rewrite activity_log_id
-- and pull another user's event into their own row. Only the two state columns
-- are ever mutable; everything else is fixed at insert time by the fan-out.
grant select on public.notifications to authenticated;
grant update (read_at, archived_at) on public.notifications to authenticated;

-- Writes go through dispatchNotifications, which uses the service-role client:
-- the inbox is never client-writable beyond the two state columns above.
grant select, insert, update, delete on public.notifications to service_role;