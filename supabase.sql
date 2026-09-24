-- BOSS RP account storage
-- Run this whole file in Supabase Dashboard -> SQL Editor.

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  player_id bigint generated always as identity unique,
  username text not null default 'BossRudenko',
  avatar_url text,
  premium boolean not null default true,
  balance bigint not null default 125000,
  coins integer not null default 1250,
  level integer not null default 3,
  xp integer not null default 124,
  played_hours integer not null default 0,
  jobs_completed integer not null default 0,
  vehicles integer not null default 0,
  properties integer not null default 0,
  reputation integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
revoke all on table public.profiles from anon, authenticated;
grant select on table public.profiles to authenticated;

drop policy if exists "Users can read own BOSS RP profile" on public.profiles;
create policy "Users can read own BOSS RP profile"
on public.profiles for select to authenticated
using ((select auth.uid()) = id);

create or replace function public.handle_new_boss_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  display_name text;
  avatar text;
begin
  display_name := coalesce(
    new.raw_user_meta_data ->> 'full_name',
    new.raw_user_meta_data ->> 'name',
    new.raw_user_meta_data ->> 'preferred_username',
    new.raw_user_meta_data ->> 'user_name',
    split_part(coalesce(new.email, 'player'), '@', 1)
  );
  avatar := new.raw_user_meta_data ->> 'avatar_url';

  insert into public.profiles (id, username, avatar_url)
  values (new.id, left(display_name, 40), avatar)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created_boss on auth.users;
create trigger on_auth_user_created_boss
after insert on auth.users
for each row execute procedure public.handle_new_boss_user();

create or replace function public.touch_boss_profile()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists boss_profile_updated on public.profiles;
create trigger boss_profile_updated
before update on public.profiles
for each row execute procedure public.touch_boss_profile();
