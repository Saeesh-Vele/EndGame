-- StayVilla initial schema
-- Tables, triggers, and row-level security policies.
--
-- Note on scope: the task brief listed a minimum set of columns per table.
-- A few columns are added beyond that list where the already-built frontend
-- depends on them (villas.beds/owner_name/host_since/full_amenities,
-- booking_requests.admin_notes) so the schema is a real drop-in backend for
-- the existing app, not just a literal transcription of the brief.

-- ---------------------------------------------------------------------------
-- Extensions
-- ---------------------------------------------------------------------------

create extension if not exists "pgcrypto"; -- gen_random_uuid()

-- ---------------------------------------------------------------------------
-- profiles
--
-- Supabase Auth owns auth.users, but RLS policies need a way to check
-- "is this user an admin?". That flag lives here, on a one-row-per-user
-- table that's automatically populated when someone signs up.
-- ---------------------------------------------------------------------------

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  is_admin boolean not null default false,
  created_at timestamptz not null default now()
);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id) values (new.id);
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- security definer so this can be called from inside RLS policies on other
-- tables without those policies needing their own access to read profiles.
create or replace function public.is_admin()
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and is_admin = true
  );
$$;

-- ---------------------------------------------------------------------------
-- destinations
-- ---------------------------------------------------------------------------

create table if not exists public.destinations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  image_url text,
  villa_count integer not null default 0,
  meta_title text,
  meta_description text,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- villas
-- ---------------------------------------------------------------------------

create table if not exists public.villas (
  id uuid primary key default gen_random_uuid(),
  destination_id uuid references public.destinations (id) on delete set null,
  name text not null,
  slug text not null unique,
  description text,
  location text not null,
  price_per_night numeric(10, 2) not null,
  weekend_price numeric(10, 2),
  seasonal_price numeric(10, 2),
  max_guests integer not null default 1,
  bedrooms integer not null default 1,
  bathrooms integer not null default 1,
  beds integer,
  amenities text[] not null default '{}',
  full_amenities text[] not null default '{}',
  images text[] not null default '{}',
  rating numeric(3, 2) not null default 0,
  review_count integer not null default 0,
  is_superhost boolean not null default false,
  owner_whatsapp text,
  owner_name text,
  host_since text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists villas_destination_id_idx on public.villas (destination_id);
create index if not exists villas_is_active_idx on public.villas (is_active);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists villas_set_updated_at on public.villas;
create trigger villas_set_updated_at
  before update on public.villas
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- booking_requests
-- ---------------------------------------------------------------------------

create table if not exists public.booking_requests (
  id uuid primary key default gen_random_uuid(),
  villa_id uuid not null references public.villas (id) on delete cascade,
  user_id uuid references auth.users (id) on delete set null default auth.uid(),
  guest_name text not null,
  guest_email text not null,
  guest_phone text,
  check_in date not null,
  check_out date not null,
  guests integer not null default 1,
  total_price numeric(10, 2) not null,
  status text not null default 'pending'
    check (status in ('pending', 'confirmed', 'cancelled', 'completed')),
  message text,
  admin_notes text,
  created_at timestamptz not null default now(),
  constraint booking_requests_dates_check check (check_out > check_in)
);

create index if not exists booking_requests_villa_id_idx on public.booking_requests (villa_id);
create index if not exists booking_requests_status_idx on public.booking_requests (status);
create index if not exists booking_requests_user_id_idx on public.booking_requests (user_id);

-- ---------------------------------------------------------------------------
-- blocked_dates
-- ---------------------------------------------------------------------------

create table if not exists public.blocked_dates (
  id uuid primary key default gen_random_uuid(),
  villa_id uuid not null references public.villas (id) on delete cascade,
  date date not null,
  reason text,
  unique (villa_id, date)
);

create index if not exists blocked_dates_villa_id_idx on public.blocked_dates (villa_id);

-- ---------------------------------------------------------------------------
-- pricing_rules
-- ---------------------------------------------------------------------------

create table if not exists public.pricing_rules (
  id uuid primary key default gen_random_uuid(),
  villa_id uuid not null references public.villas (id) on delete cascade,
  rule_type text not null check (rule_type in ('weekend', 'seasonal', 'special')),
  start_date date,
  end_date date,
  day_of_week integer[],
  multiplier numeric(4, 2),
  flat_price numeric(10, 2),
  created_at timestamptz not null default now(),
  constraint pricing_rules_dates_check check (
    start_date is null or end_date is null or end_date >= start_date
  )
);

create index if not exists pricing_rules_villa_id_idx on public.pricing_rules (villa_id);

-- ---------------------------------------------------------------------------
-- reviews
-- ---------------------------------------------------------------------------

create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  villa_id uuid not null references public.villas (id) on delete cascade,
  guest_name text not null,
  rating integer not null check (rating between 1 and 5),
  text text,
  created_at timestamptz not null default now()
);

create index if not exists reviews_villa_id_idx on public.reviews (villa_id);

-- ---------------------------------------------------------------------------
-- Row Level Security
--
-- Summary:
--   - destinations, reviews:  public read.        writes admin-only.
--   - villas:                 public read of active villas (admins see all).
--                              writes admin-only.
--   - booking_requests:       insert requires an authenticated session
--                              (StayVilla signs guests in anonymously before
--                              submitting a request — see createBookingRequest
--                              in src/lib/supabase/queries.ts). Guests can
--                              read their own requests; everything else is
--                              admin-only.
--   - blocked_dates, pricing_rules, profiles: admin-only, full stop.
-- ---------------------------------------------------------------------------

alter table public.profiles enable row level security;
alter table public.destinations enable row level security;
alter table public.villas enable row level security;
alter table public.booking_requests enable row level security;
alter table public.blocked_dates enable row level security;
alter table public.pricing_rules enable row level security;
alter table public.reviews enable row level security;

-- profiles ---------------------------------------------------------------

create policy "Users can read their own profile"
  on public.profiles for select
  using (auth.uid() = id or public.is_admin());

create policy "Admins manage profiles"
  on public.profiles for all
  using (public.is_admin())
  with check (public.is_admin());

-- destinations -------------------------------------------------------------

create policy "Destinations are publicly readable"
  on public.destinations for select
  using (true);

create policy "Admins manage destinations"
  on public.destinations for insert
  with check (public.is_admin());

create policy "Admins update destinations"
  on public.destinations for update
  using (public.is_admin())
  with check (public.is_admin());

create policy "Admins delete destinations"
  on public.destinations for delete
  using (public.is_admin());

-- villas ---------------------------------------------------------------------

create policy "Active villas are publicly readable"
  on public.villas for select
  using (is_active = true or public.is_admin());

create policy "Admins create villas"
  on public.villas for insert
  with check (public.is_admin());

create policy "Admins update villas"
  on public.villas for update
  using (public.is_admin())
  with check (public.is_admin());

create policy "Admins delete villas"
  on public.villas for delete
  using (public.is_admin());

-- booking_requests -------------------------------------------------------

create policy "Authenticated users can create booking requests"
  on public.booking_requests for insert
  with check (auth.role() = 'authenticated');

create policy "Guests read their own requests, admins read all"
  on public.booking_requests for select
  using (auth.uid() = user_id or public.is_admin());

create policy "Admins update booking requests"
  on public.booking_requests for update
  using (public.is_admin())
  with check (public.is_admin());

create policy "Admins delete booking requests"
  on public.booking_requests for delete
  using (public.is_admin());

-- blocked_dates ------------------------------------------------------------

create policy "Admins manage blocked dates"
  on public.blocked_dates for all
  using (public.is_admin())
  with check (public.is_admin());

-- pricing_rules --------------------------------------------------------------

create policy "Admins manage pricing rules"
  on public.pricing_rules for all
  using (public.is_admin())
  with check (public.is_admin());

-- reviews ------------------------------------------------------------------

create policy "Reviews are publicly readable"
  on public.reviews for select
  using (true);

create policy "Admins manage reviews"
  on public.reviews for insert
  with check (public.is_admin());

create policy "Admins update reviews"
  on public.reviews for update
  using (public.is_admin())
  with check (public.is_admin());

create policy "Admins delete reviews"
  on public.reviews for delete
  using (public.is_admin());
