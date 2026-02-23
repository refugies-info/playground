-- Add username column to profiles table
alter table public.profiles add column if not exists username text;

-- Create unique index for username (optional, if you want unique usernames)
-- create unique index if not exists idx_profiles_username on public.profiles(username);

-- Update the trigger function to sync username from auth.users
CREATE OR REPLACE FUNCTION public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, role, username, first_name, last_name, full_name, avatar_url, created_at, last_sign_in_at)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'role',
    new.raw_user_meta_data->>'username',
    new.raw_user_meta_data->>'first_name',
    new.raw_user_meta_data->>'last_name',
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url',
    new.created_at,
    new.last_sign_in_at
  )
  on conflict (id) do update
  set
    email = excluded.email,
    role = excluded.role,
    username = excluded.username,
    last_sign_in_at = excluded.last_sign_in_at,
    updated_at = now();
  return new;
end;
$$ language plpgsql security definer;

-- Backfill existing users with username from user_metadata
update public.profiles p
set username = u.raw_user_meta_data->>'username',
    updated_at = now()
from auth.users u
where p.id = u.id
  and p.username is null
  and u.raw_user_meta_data->>'username' is not null;
