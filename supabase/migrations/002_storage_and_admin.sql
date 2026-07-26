-- StayVilla — villa image storage
--
-- Creates the public "villa-images" bucket the admin dashboard uploads to,
-- and the row-level policies that gate it: anyone can read (villa photos are
-- shown on the public site), only admins can write.
--
-- Admin accounts are created separately — see 003_seed_admin.sql.

-- ---------------------------------------------------------------------------
-- Bucket
--
-- public = true means objects are served from the unauthenticated CDN route
-- (/storage/v1/object/public/villa-images/...), which is what
-- getPublicUrl() in src/lib/supabase/storage.ts returns and what next/image
-- loads. The read policy below is still required for the storage API itself.
-- ---------------------------------------------------------------------------

insert into storage.buckets (id, name, public)
values ('villa-images', 'villa-images', true)
on conflict (id) do update set public = true;

-- ---------------------------------------------------------------------------
-- Policies on storage.objects, scoped to this bucket
--
-- public.is_admin() is the security-definer helper from 001_initial_schema.sql
-- — it resolves auth.uid() against public.profiles.is_admin.
-- ---------------------------------------------------------------------------

drop policy if exists "Villa images are publicly readable" on storage.objects;
create policy "Villa images are publicly readable"
  on storage.objects for select
  using (bucket_id = 'villa-images');

drop policy if exists "Admins upload villa images" on storage.objects;
create policy "Admins upload villa images"
  on storage.objects for insert
  with check (bucket_id = 'villa-images' and public.is_admin());

drop policy if exists "Admins update villa images" on storage.objects;
create policy "Admins update villa images"
  on storage.objects for update
  using (bucket_id = 'villa-images' and public.is_admin())
  with check (bucket_id = 'villa-images' and public.is_admin());

drop policy if exists "Admins delete villa images" on storage.objects;
create policy "Admins delete villa images"
  on storage.objects for delete
  using (bucket_id = 'villa-images' and public.is_admin());
