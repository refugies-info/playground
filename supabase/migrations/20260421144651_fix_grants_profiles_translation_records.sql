-- Fix missing GRANTs on profiles and translation_records
--
-- Problem: getUserProfile() queries profiles with the user's client (authenticated role),
-- but the authenticated role had no SELECT GRANT on profiles.
-- Similarly, translation_records was missing SELECT/INSERT/UPDATE for authenticated.
--
-- These GRANTs were already applied manually on production (2026-04-21).
-- This migration ensures all environments (preview, local, future prod) are consistent.

-- profiles: SELECT for reading role/language, column-restricted UPDATE for display fields only.
-- role and language are written exclusively via service_role (users.ts).
grant select on public.profiles to authenticated;
revoke update on public.profiles from authenticated;
grant update (first_name, last_name, full_name, avatar_url) on public.profiles to authenticated;

-- translation_records: translators need SELECT, INSERT, UPDATE for their work.
grant select, insert, update on public.translation_records to authenticated;

-- Fix handle_new_user: add set search_path = '' (security definer without it
-- is vulnerable to search_path injection — flagged by Supabase linter).
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, email, first_name, last_name, full_name, avatar_url, created_at, last_sign_in_at)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'first_name',
    new.raw_user_meta_data->>'last_name',
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url',
    new.created_at,
    new.last_sign_in_at
  )
  on conflict (id) do update
  set
    email           = excluded.email,
    last_sign_in_at = excluded.last_sign_in_at,
    updated_at      = now();
    -- NOTE: role and language are intentionally excluded.
    -- They are written by users.ts (createUser/updateUser) and must not
    -- be overwritten by login events or auth.users updates.
  return new;
end;
$$;
