-- RBAC: profiles as single source of truth for role and language
--
-- Architecture:
--   profiles.role / .language (written by users.ts via service_role)
--   → get_my_role() queries profiles directly (used by RLS policies)
--   → getUserProfile() queries profiles (used by server components/actions)
--
-- Why this approach:
-- - profiles is a real SQL table: auditable, editable in Studio, with constraints
-- - get_my_role() uses auth.uid() from the verified JWT (unforgeable)
-- - profiles.role is only writable server-side (service_role key)
-- - No user can escalate their own role (unlike user_metadata)
-- - No dependency on Custom Access Token Hook (unreliable in local dev)

-- ─────────────────────────────────────────────
-- 1. Add language column to profiles
-- ─────────────────────────────────────────────
alter table public.profiles
  add column if not exists language text;

-- ─────────────────────────────────────────────
-- 2. get_my_role() — query profiles directly
--
--    security definer is required to bypass RLS on profiles
--    (RLS check itself calls get_my_role, which would create infinite recursion).
--    auth.uid() comes from the verified JWT sub claim — cannot be forged.
-- ─────────────────────────────────────────────
create or replace function public.get_my_role()
returns text
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce(
    (select role from public.profiles where id = auth.uid()),
    'none'
  );
$$;

-- ─────────────────────────────────────────────
-- 3. get_my_language() — same pattern
-- ─────────────────────────────────────────────
create or replace function public.get_my_language()
returns text
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce(
    (select language from public.profiles where id = auth.uid()),
    'none'
  );
$$;

-- ─────────────────────────────────────────────
-- 4. Fix handle_new_user trigger
--
--    Problem: the trigger fires on every login (Supabase updates last_sign_in_at).
--    It was overwriting profiles.role with user_metadata.role (often null),
--    resetting any manually-set role.
--
--    Fix: role and language are managed exclusively by server actions (users.ts).
--    The trigger only handles non-sensitive display fields.
-- ─────────────────────────────────────────────
create or replace function public.handle_new_user()
returns trigger as $$
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
$$ language plpgsql security definer;

-- ─────────────────────────────────────────────
-- 5. Data migration: populate profiles.role and profiles.language
--    from existing auth.users metadata (handles fresh install + existing users)
-- ─────────────────────────────────────────────
update public.profiles p
set
  role     = coalesce(p.role,     u.raw_app_meta_data->>'role',     u.raw_user_meta_data->>'role'),
  language = coalesce(p.language, u.raw_app_meta_data->>'language', u.raw_user_meta_data->>'language')
from auth.users u
where p.id = u.id;
