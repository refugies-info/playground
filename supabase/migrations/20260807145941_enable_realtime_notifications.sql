-- Enable Supabase Realtime for notifications.
-- Drives the live sidebar badge: INSERT events push new notifications, UPDATE
-- events push read/archived state changes made from another tab or device.
--
-- Clients subscribe with a recipient_id=eq.<uid> row filter. RLS still applies
-- on top — the filter is an optimisation, not the security boundary.

do $$
begin
  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'notifications'
  ) then
    alter publication supabase_realtime add table public.notifications;
end if;
end $$;

-- REPLICA IDENTITY FULL is required for the recipient_id row filter to work on
-- UPDATE events: with the default identity the old record carries only the
-- primary key, so Realtime cannot evaluate the filter and drops the event.
-- Same pattern as letta_reports, publication_records and translation_records.
alter table public.notifications replica identity full;