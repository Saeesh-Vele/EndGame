-- Guest accounts
--
-- Adds everything the public-facing account flow needs: a display name on
-- profiles, and a saved_villas join table behind the heart button on villa
-- cards.
--
-- Context on anonymous sessions: the booking flow signs guests in
-- anonymously so booking_requests' "authenticated only" insert policy is
-- satisfied without forcing a signup (see src/app/villas/[slug]/actions.ts).
-- Those sessions have a real auth.uid(), so policies written as
-- `auth.uid() = user_id` would happily accept writes from them. The app
-- treats anonymous users as signed out, so any row they wrote would be
-- invisible and unreachable forever. The policies below exclude them.

-- ---------------------------------------------------------------------------
-- profiles.full_name
--
-- Collected at signup. Mirrored from raw_user_meta_data so it's readable
-- server-side without a round trip to the Auth admin API, and available
-- client-side from the session's user_metadata without querying at all.
-- ---------------------------------------------------------------------------

alter table public.profiles
  add column if not exists full_name text;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, nullif(trim(new.raw_user_meta_data ->> 'full_name'), ''));
  return new;
end;
$$;

-- Users may edit their own profile, but must not be able to grant themselves
-- admin. The column-level grant is what enforces that: the policy alone would
-- let an UPDATE touch is_admin.
-- Postgres has no `create policy if not exists`, so drop first to keep this
-- file safe to re-run.
drop policy if exists "Users update their own profile" on public.profiles;
create policy "Users update their own profile"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

revoke update on public.profiles from authenticated;
grant update (full_name) on public.profiles to authenticated;

-- ---------------------------------------------------------------------------
-- saved_villas
-- ---------------------------------------------------------------------------

create table if not exists public.saved_villas (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  villa_id uuid not null references public.villas (id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, villa_id)
);

create index if not exists saved_villas_user_id_idx
  on public.saved_villas (user_id);

alter table public.saved_villas enable row level security;

-- One FOR ALL policy: a user sees and manages only their own saves. Postgres
-- reuses the USING expression as the WITH CHECK when the latter is omitted,
-- but it's spelled out here so the insert path is obvious.
drop policy if exists "Users manage own saves" on public.saved_villas;
create policy "Users manage own saves"
  on public.saved_villas for all
  using (
    auth.uid() = user_id
    and coalesce((auth.jwt() ->> 'is_anonymous')::boolean, false) = false
  )
  with check (
    auth.uid() = user_id
    and coalesce((auth.jwt() ->> 'is_anonymous')::boolean, false) = false
  );
