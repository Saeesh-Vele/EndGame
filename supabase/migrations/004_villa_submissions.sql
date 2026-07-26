-- Villa submissions
--
-- Backs the public /list-your-villa form. Owners submit their property
-- without an account, so this is the one table in the schema that accepts
-- writes from the anon role. Reads are admin-only — a submission carries the
-- owner's phone and email, and nothing about the form needs to read back what
-- it just wrote (the Server Action deliberately inserts without .select()).

create table if not exists public.villa_submissions (
  id uuid primary key default gen_random_uuid(),
  owner_name text not null,
  owner_email text not null,
  owner_phone text not null,
  villa_name text not null,
  location text not null,
  destination text,
  bedrooms integer,
  bathrooms integer,
  max_guests integer,
  description text,
  amenities text[] not null default '{}',
  price_per_night numeric(10, 2),
  weekend_price numeric(10, 2),
  message text,
  status text not null default 'pending'
    check (status in ('pending', 'reviewed', 'approved', 'rejected')),
  admin_notes text,
  created_at timestamptz not null default now()
);

create index if not exists villa_submissions_status_idx
  on public.villa_submissions (status);
create index if not exists villa_submissions_created_at_idx
  on public.villa_submissions (created_at desc);

-- ---------------------------------------------------------------------------
-- Row Level Security
--
-- insert: open to everyone, including unauthenticated visitors.
-- select/update/delete: admins only.
--
-- Note there is intentionally no select policy for non-admins. Postgres denies
-- by default, so an anon insert can't return the inserted row — see the
-- comment above.
-- ---------------------------------------------------------------------------

alter table public.villa_submissions enable row level security;

-- Postgres has no `create policy if not exists`, so drop first to keep this
-- file safe to re-run.
drop policy if exists "Anyone can submit a villa listing" on public.villa_submissions;
create policy "Anyone can submit a villa listing"
  on public.villa_submissions for insert
  with check (true);

drop policy if exists "Admins read villa submissions" on public.villa_submissions;
create policy "Admins read villa submissions"
  on public.villa_submissions for select
  using (public.is_admin());

drop policy if exists "Admins update villa submissions" on public.villa_submissions;
create policy "Admins update villa submissions"
  on public.villa_submissions for update
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "Admins delete villa submissions" on public.villa_submissions;
create policy "Admins delete villa submissions"
  on public.villa_submissions for delete
  using (public.is_admin());
