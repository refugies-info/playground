-- Create a table for public profiles aligned with Supabase best practices
create table if not exists public.profiles (
  id uuid not null references auth.users on delete cascade,
  email text,
  role text,
  first_name text,
  last_name text,
  full_name text,
  avatar_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  last_sign_in_at timestamptz,
  primary key (id)
);

-- Enable RLS
alter table public.profiles enable row level security;

-- Create policies
create policy "Public profiles are viewable by everyone"
  on public.profiles for select
  using ( true );

create policy "Users can insert their own profile"
  on public.profiles for insert
  with check ( auth.uid() = id );

create policy "Users can update own profile"
  on public.profiles for update
  using ( auth.uid() = id );

-- Create a trigger to sync auth.users with public.profiles
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, role, first_name, last_name, full_name, avatar_url, created_at, last_sign_in_at)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'role',
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
    last_sign_in_at = excluded.last_sign_in_at,
    updated_at = now();
  return new;
end;
$$ language plpgsql security definer;

-- Trigger on insert/update of auth.users
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert or update on auth.users
  for each row execute procedure public.handle_new_user();

-- Backfill existing users (SAFE: ON CONFLICT DO UPDATE handles existing records)
insert into public.profiles (id, email, role, first_name, last_name, full_name, avatar_url, created_at, last_sign_in_at)
select
  id,
  email,
  raw_user_meta_data->>'role',
  raw_user_meta_data->>'first_name',
  raw_user_meta_data->>'last_name',
  raw_user_meta_data->>'full_name',
  raw_user_meta_data->>'avatar_url',
  created_at,
  last_sign_in_at
from auth.users
on conflict (id) do update
set
  email = excluded.email,
  role = excluded.role,
  last_sign_in_at = excluded.last_sign_in_at,
  updated_at = now();

-- Drop the old view if it exists (might need CASCADE if dependent objects exist, but we are updating code)
drop view if exists public.user_profiles;
