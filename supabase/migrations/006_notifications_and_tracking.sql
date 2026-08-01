-- Notifications and inquiry tracking
--
-- Three things:
--   1. villas.owner_email — optional, so owners can be emailed about new
--      inquiries alongside the WhatsApp link.
--   2. whatsapp_clicks — how often the WhatsApp CTA is used per villa.
--   3. contact_messages — the contact form on /about.
--
-- whatsapp_clicks and contact_messages both accept writes from the anon role,
-- like villa_submissions in 004. In every case insert is open and select is
-- admin-only, so a visitor can write a row but never read one back.

-- ---------------------------------------------------------------------------
-- villas.owner_email
--
-- WhatsApp stays the primary channel for owners; this is a nullable extra so
-- the owner-new-inquiry email has somewhere to go when it's known. Nothing
-- breaks when it's null — the send is simply skipped.
-- ---------------------------------------------------------------------------

alter table public.villas
  add column if not exists owner_email text;

-- ---------------------------------------------------------------------------
-- whatsapp_clicks
--
-- One row per click on the "message on WhatsApp" link on a villa page. Guests
-- leave for WhatsApp at that point, so this is the last signal we get — it's
-- the closest thing to a conversion metric the site has.
-- ---------------------------------------------------------------------------

create table if not exists public.whatsapp_clicks (
  id uuid primary key default gen_random_uuid(),
  villa_id uuid not null references public.villas (id) on delete cascade,
  user_id uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists whatsapp_clicks_villa_id_idx
  on public.whatsapp_clicks (villa_id);
create index if not exists whatsapp_clicks_created_at_idx
  on public.whatsapp_clicks (created_at desc);

alter table public.whatsapp_clicks enable row level security;

-- Postgres has no `create policy if not exists`, so drop first to keep this
-- file safe to re-run.
drop policy if exists "Anyone can log a WhatsApp click" on public.whatsapp_clicks;
create policy "Anyone can log a WhatsApp click"
  on public.whatsapp_clicks for insert
  with check (true);

drop policy if exists "Admins read WhatsApp clicks" on public.whatsapp_clicks;
create policy "Admins read WhatsApp clicks"
  on public.whatsapp_clicks for select
  using (public.is_admin());

-- ---------------------------------------------------------------------------
-- contact_messages
-- ---------------------------------------------------------------------------

create table if not exists public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  message text not null,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists contact_messages_created_at_idx
  on public.contact_messages (created_at desc);

alter table public.contact_messages enable row level security;

drop policy if exists "Anyone can send a contact message" on public.contact_messages;
create policy "Anyone can send a contact message"
  on public.contact_messages for insert
  with check (true);

drop policy if exists "Admins read contact messages" on public.contact_messages;
create policy "Admins read contact messages"
  on public.contact_messages for select
  using (public.is_admin());

drop policy if exists "Admins update contact messages" on public.contact_messages;
create policy "Admins update contact messages"
  on public.contact_messages for update
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "Admins delete contact messages" on public.contact_messages;
create policy "Admins delete contact messages"
  on public.contact_messages for delete
  using (public.is_admin());
