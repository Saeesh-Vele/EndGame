-- Seed data mirroring the mock content the app shipped with, so a fresh
-- Supabase project (after `supabase db reset` or running the migration)
-- immediately looks identical to the hardcoded version of the site.
--
-- Uses fixed UUIDs so villas/reviews/bookings can reference destinations
-- and villas by id within this same script.

-- ---------------------------------------------------------------------------
-- destinations
-- ---------------------------------------------------------------------------

insert into public.destinations (id, name, slug, image_url, villa_count, meta_title, meta_description)
values
  (
    '10000000-0000-0000-0000-000000000001', 'Goa', 'goa',
    'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?q=80&w=1200&auto=format&fit=crop',
    42, null,
    'Goa''s coastline blends colonial-era architecture with some of India''s most laid-back beaches. Expect swaying palms, seafood shacks, and a slower pace of life, whether you''re based on the busier north coast or the quieter southern beaches.'
  ),
  (
    '10000000-0000-0000-0000-000000000002', 'Lonavala', 'lonavala',
    'https://images.unsplash.com/photo-1689172324767-f180880ccdec?q=80&w=1200&auto=format&fit=crop',
    27, null,
    'Tucked into the Sahyadri hills two hours from Mumbai and Pune, Lonavala is where the Deccan plateau drops away into forested valleys and monsoon waterfalls. It''s the region''s go-to weekend escape for cooler air and hillside views.'
  ),
  (
    '10000000-0000-0000-0000-000000000003', 'Udaipur', 'udaipur',
    'https://images.unsplash.com/photo-1651478881270-6c3a0fc883f4?q=80&w=1200&auto=format&fit=crop',
    19, null,
    'Built around the man-made lakes of the Mewar kingdom, Udaipur is a city of white marble palaces, narrow bazaar lanes, and water on every horizon. The City Palace and Lake Pichola anchor an old town that still feels lived-in rather than staged for tourists.'
  ),
  (
    '10000000-0000-0000-0000-000000000004', 'Alibaug', 'alibaug',
    'https://images.unsplash.com/photo-1610535791915-4d14316afc43?q=80&w=1200&auto=format&fit=crop',
    34, null,
    'A short ferry ride across the harbour from Mumbai, Alibaug is Konkan coast living without the crowds of Goa: quiet beaches, coconut groves, and old Portuguese-Maratha forts scattered along the shoreline.'
  )
on conflict (id) do nothing;

-- ---------------------------------------------------------------------------
-- villas
-- ---------------------------------------------------------------------------

insert into public.villas (
  id, destination_id, name, slug, description, location,
  price_per_night, weekend_price, max_guests, bedrooms, bathrooms, beds,
  amenities, full_amenities, images, rating, review_count, is_superhost,
  owner_whatsapp, owner_name, host_since, is_active
)
values
  (
    '20000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001',
    'Casa Bela', 'casa-bela-candolim',
    'A whitewashed Portuguese-era villa with a private pool and a five-minute walk to the beach. Casa Bela pairs original azulejo tilework and high wooden ceilings with a fully modernised kitchen and bathrooms, so the charm of old Candolim comes with none of the compromises. The pool courtyard sits at the centre of the house, shaded by an old mango tree, and opens onto a covered veranda that''s perfect for long lunches. Guests get the run of the whole property, with a caretaker on call rather than living on-site.',
    'Candolim, Goa',
    18500, 21500, 8, 4, 4, 5,
    array['8 guests', '4 bedrooms', 'Private pool', 'Beachfront'],
    array['Private pool', 'Beachfront', 'Free WiFi', 'Fully-equipped kitchen', 'Air conditioning', 'Free parking', 'Washing machine', 'Smart TV', 'Dedicated workspace', 'BBQ grill', '24/7 caretaker', 'Pet friendly'],
    array[
      'https://images.unsplash.com/photo-1613490493576-7fde63acd811?q=80&w=1400&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1724582586529-62622e50c0b3?q=80&w=1400&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?q=80&w=1400&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1750036015902-c6f5ebca924e?q=80&w=1400&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1721989518229-3e84837fc398?q=80&w=1400&auto=format&fit=crop'
    ],
    4.92, 63, true, '+919876543210', 'Meera Fernandes', '2019', true
  ),
  (
    '20000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000002',
    'The Hilltop House', 'hilltop-house-lonavala',
    'Floor-to-ceiling glass walls looking straight into the Sahyadri valley, with an infinity-edge pool that seems to spill into the hillside beyond it. The Hilltop House was built specifically to be lived in from the outside in — every one of the five bedrooms faces the valley, and the open-plan living area slides fully open onto the pool deck. Best visited during or just after monsoon, when the waterfalls across the valley are running.',
    'Lonavala, Maharashtra',
    24000, 27500, 10, 5, 5, 6,
    array['10 guests', '5 bedrooms', 'Valley view', 'Private pool'],
    array['Valley view', 'Private pool', 'Free WiFi', 'Fully-equipped kitchen', 'Air conditioning', 'Free parking', 'Washing machine', 'Smart TV', 'Dedicated workspace', 'BBQ grill', '24/7 caretaker', 'Pet friendly'],
    array[
      'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?q=80&w=1400&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1724582586529-62622e50c0b3?q=80&w=1400&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?q=80&w=1400&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1750036015902-c6f5ebca924e?q=80&w=1400&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1721989518229-3e84837fc398?q=80&w=1400&auto=format&fit=crop'
    ],
    4.87, 41, false, '+919876543211', 'Arjun Deshmukh', '2021', true
  ),
  (
    '20000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000003',
    'Haveli Noor', 'haveli-noor-udaipur',
    'A restored lakeside haveli with hand-painted frescoes, a rooftop pool, and views of the City Palace. Haveli Noor has been in the same family for four generations, and the restoration kept the original stone jaalis, courtyard, and stepwell intact while adding modern plumbing, air conditioning, and a small rooftop pool that looks straight across Lake Pichola. Each of the six bedrooms is different, furnished with period antiques sourced from around Mewar.',
    'Udaipur, Rajasthan',
    32000, 37000, 12, 6, 6, 7,
    array['12 guests', '6 bedrooms', 'Rooftop pool', 'Lake view'],
    array['Rooftop pool', 'Lake view', 'Free WiFi', 'Fully-equipped kitchen', 'Air conditioning', 'Free parking', 'Washing machine', 'Smart TV', 'Dedicated workspace', 'BBQ grill', '24/7 caretaker', 'Pet friendly'],
    array[
      'https://images.unsplash.com/photo-1632641252948-ccbc2fb7d6e9?q=80&w=1400&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1724582586529-62622e50c0b3?q=80&w=1400&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?q=80&w=1400&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1750036015902-c6f5ebca924e?q=80&w=1400&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1721989518229-3e84837fc398?q=80&w=1400&auto=format&fit=crop'
    ],
    4.97, 89, true, '+919876543212', 'Aditya Singh Rathore', '2018', true
  ),
  (
    '20000000-0000-0000-0000-000000000004', '10000000-0000-0000-0000-000000000001',
    'Palm Cove Villa', 'palm-cove-villa-ashwem',
    'Steps from Ashwem''s quiet shoreline, with a plunge pool shaded by palms and daybeds facing the sea. Palm Cove is smaller and quieter than most north Goa villas, built for three bedrooms rather than a dozen guests, with an open kitchen-living space that opens directly onto the pool deck. Ashwem itself stays low-key even in peak season, so this suits couples and small groups over parties.',
    'Ashwem, Goa',
    14200, null, 6, 3, 3, 4,
    array['6 guests', '3 bedrooms', 'Private pool', 'Sea view'],
    array['Private pool', 'Sea view', 'Free WiFi', 'Fully-equipped kitchen', 'Air conditioning', 'Free parking', 'Washing machine', 'Smart TV', 'Dedicated workspace', 'BBQ grill', '24/7 caretaker', 'Pet friendly'],
    array[
      'https://images.unsplash.com/photo-1596178067639-5c6e68aea6dc?q=80&w=1400&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1724582586529-62622e50c0b3?q=80&w=1400&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?q=80&w=1400&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1750036015902-c6f5ebca924e?q=80&w=1400&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1721989518229-3e84837fc398?q=80&w=1400&auto=format&fit=crop'
    ],
    4.81, 27, false, '+919876543213', 'Ligia D''Souza', '2022', true
  ),
  (
    '20000000-0000-0000-0000-000000000005', '10000000-0000-0000-0000-000000000002',
    'Misty Ridge Villa', 'misty-ridge-villa-lonavala',
    'An infinity pool cut into the hillside, looking straight down into the monsoon-green valley below. Misty Ridge is newer than most Lonavala villas, built low and wide across the ridge so all four bedrooms and the main living space share the same uninterrupted view. The pool deck is the obvious gathering point, with loungers on one side and a covered dining table on the other for when the weather turns.',
    'Lonavala, Maharashtra',
    19800, null, 8, 4, 4, 5,
    array['8 guests', '4 bedrooms', 'Valley view', 'Private pool'],
    array['Valley view', 'Private pool', 'Free WiFi', 'Fully-equipped kitchen', 'Air conditioning', 'Free parking', 'Washing machine', 'Smart TV', 'Dedicated workspace', 'BBQ grill', '24/7 caretaker', 'Pet friendly'],
    array[
      'https://images.unsplash.com/photo-1716469880589-ba2a913bd79d?q=80&w=1400&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1724582586529-62622e50c0b3?q=80&w=1400&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?q=80&w=1400&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1750036015902-c6f5ebca924e?q=80&w=1400&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1721989518229-3e84837fc398?q=80&w=1400&auto=format&fit=crop'
    ],
    4.85, 34, true, '+919876543214', 'Nikhil Kulkarni', '2020', true
  ),
  (
    '20000000-0000-0000-0000-000000000006', '10000000-0000-0000-0000-000000000003',
    'Lake Palace Retreat', 'lake-palace-retreat-udaipur',
    'A restored royal guesthouse on the water''s edge, with stone jaalis, a private jetty, and views across the lake to the City Palace. Lake Palace Retreat once housed extended royal family and staff, and the restoration has kept the original stonework, arched doorways, and courtyard fountain. Five bedrooms are spread across two floors, most with direct lake views, and the private jetty means boat transfers can be arranged directly from the property.',
    'Udaipur, Rajasthan',
    28500, null, 10, 5, 5, 6,
    array['10 guests', '5 bedrooms', 'Rooftop pool', 'Lake view'],
    array['Rooftop pool', 'Lake view', 'Free WiFi', 'Fully-equipped kitchen', 'Air conditioning', 'Free parking', 'Washing machine', 'Smart TV', 'Dedicated workspace', 'BBQ grill', '24/7 caretaker', 'Pet friendly'],
    array[
      'https://images.unsplash.com/photo-1711707246899-cf0d1a5d0472?q=80&w=1400&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1724582586529-62622e50c0b3?q=80&w=1400&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?q=80&w=1400&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1750036015902-c6f5ebca924e?q=80&w=1400&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1721989518229-3e84837fc398?q=80&w=1400&auto=format&fit=crop'
    ],
    4.90, 52, false, '+919876543215', 'Rani Kunwar', '2017', true
  ),
  (
    '20000000-0000-0000-0000-000000000007', '10000000-0000-0000-0000-000000000004',
    'Konkan Breeze Villa', 'konkan-breeze-villa-alibaug',
    'A minimalist concrete-and-glass villa two minutes from Nagaon beach, built around a 20-metre lap pool. Konkan Breeze is one of the newer builds in the area, designed to stay cool through peak Konkan summers with cross-ventilation and deep overhangs rather than relying purely on air conditioning. Four bedrooms open onto a shared courtyard, with the pool and an outdoor kitchen as the main gathering space.',
    'Nagaon, Alibaug',
    21000, null, 8, 4, 4, 5,
    array['8 guests', '4 bedrooms', 'Private pool', 'Sea view'],
    array['Private pool', 'Sea view', 'Free WiFi', 'Fully-equipped kitchen', 'Air conditioning', 'Free parking', 'Washing machine', 'Smart TV', 'Dedicated workspace', 'BBQ grill', '24/7 caretaker', 'Pet friendly'],
    array[
      'https://images.unsplash.com/photo-1673147056688-4df20283643b?q=80&w=1400&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1724582586529-62622e50c0b3?q=80&w=1400&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?q=80&w=1400&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1750036015902-c6f5ebca924e?q=80&w=1400&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1721989518229-3e84837fc398?q=80&w=1400&auto=format&fit=crop'
    ],
    4.88, 31, true, '+919876543216', 'Farhan Sheikh', '2022', true
  ),
  (
    '20000000-0000-0000-0000-000000000008', '10000000-0000-0000-0000-000000000004',
    'Green Acre Farmhouse', 'green-acre-farmhouse-alibaug',
    'A working mango orchard farmhouse with a shaded pool deck, ten minutes from Kihim beach. Green Acre is the most laid-back of the Alibaug villas, set inside an active Alphonso mango orchard with three simple, comfortable bedrooms. The pool deck sits under the tree canopy, and guests are welcome to walk the orchard and, in season, pick fruit straight from the trees.',
    'Kihim, Alibaug',
    11500, null, 6, 3, 3, 4,
    array['6 guests', '3 bedrooms', 'Private pool', 'Garden view'],
    array['Private pool', 'Garden view', 'Free WiFi', 'Fully-equipped kitchen', 'Air conditioning', 'Free parking', 'Washing machine', 'Smart TV', 'Dedicated workspace', 'BBQ grill', '24/7 caretaker', 'Pet friendly'],
    array[
      'https://images.unsplash.com/photo-1721989519334-40923a0ee1c0?q=80&w=1400&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1724582586529-62622e50c0b3?q=80&w=1400&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?q=80&w=1400&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1750036015902-c6f5ebca924e?q=80&w=1400&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1721989518229-3e84837fc398?q=80&w=1400&auto=format&fit=crop'
    ],
    4.76, 19, false, '+919876543217', 'Sunita Patil', '2019', true
  )
on conflict (id) do nothing;

-- ---------------------------------------------------------------------------
-- reviews
-- ---------------------------------------------------------------------------

insert into public.reviews (villa_id, guest_name, rating, text, created_at)
values
  ('20000000-0000-0000-0000-000000000001', 'Ananya R.', 5, 'The pool right off the living room was perfect for our kids, and Candolim beach really is a five-minute walk. Meera checked in on us daily without being intrusive.', '2026-03-01'),
  ('20000000-0000-0000-0000-000000000001', 'Vikram S.', 5, 'Beautiful Portuguese architecture, spotless, and the caretaker had cold coconuts waiting when we arrived. Would book again.', '2026-01-01'),
  ('20000000-0000-0000-0000-000000000001', 'Fatima K.', 4, 'Lovely villa, though the WiFi dropped a couple of times during our stay. Everything else was exactly as photographed.', '2025-11-01'),

  ('20000000-0000-0000-0000-000000000002', 'Rohan M.', 5, 'Waking up to that valley view with the pool steaming in the cold morning air was unreal. Worth every rupee for a monsoon weekend.', '2026-02-01'),
  ('20000000-0000-0000-0000-000000000002', 'Priya D.', 4, 'Stunning views and a great layout across five bedrooms. The road up is narrow so drive carefully after dark.', '2025-12-01'),
  ('20000000-0000-0000-0000-000000000002', 'Karan V.', 5, 'Arjun was fantastic with directions and local recommendations. The glass walls make every room feel like you''re floating over the valley.', '2025-10-01'),

  ('20000000-0000-0000-0000-000000000003', 'Sara T.', 5, 'Genuinely one of the most beautiful places I''ve stayed in India. The frescoes are original, the rooftop pool looks straight at the City Palace, and breakfast on the terrace was magical.', '2026-03-01'),
  ('20000000-0000-0000-0000-000000000003', 'Imran A.', 5, 'Aditya''s family has owned this haveli for generations and it shows in every detail. Book the rooftop for sunset, non-negotiable.', '2026-01-01'),
  ('20000000-0000-0000-0000-000000000003', 'Leela N.', 5, 'Six bedrooms and every single one had its own character. Perfect for our extended family reunion.', '2025-11-01'),

  ('20000000-0000-0000-0000-000000000004', 'Dev P.', 5, 'Ashwem is quieter than Candolim and this villa''s plunge pool right by the sea-view daybeds was exactly what we needed.', '2026-02-01'),
  ('20000000-0000-0000-0000-000000000004', 'Anjali M.', 4, 'Compact but well designed for three bedrooms. Ligia was quick to respond on WhatsApp about a late checkout.', '2025-12-01'),
  ('20000000-0000-0000-0000-000000000004', 'Rahul B.', 5, 'The sunset from the daybeds is the best in north Goa. Already planning our next trip back.', '2025-09-01'),

  ('20000000-0000-0000-0000-000000000005', 'Neha S.', 5, 'The infinity pool cut into the hillside is even better in person. We watched clouds roll through the valley below us at breakfast.', '2026-03-01'),
  ('20000000-0000-0000-0000-000000000005', 'Amit J.', 5, 'Nikhil was a great host, very responsive. Four bedrooms was perfect for two families.', '2026-01-01'),
  ('20000000-0000-0000-0000-000000000005', 'Divya R.', 4, 'Gorgeous villa, just know the last stretch of road is bumpy — fine in an SUV, tight in a sedan.', '2025-10-01'),

  ('20000000-0000-0000-0000-000000000006', 'Farah I.', 5, 'The private jetty and the jaali screens make this feel like an actual royal guesthouse, because it is one. Rani was a wonderful host.', '2026-02-01'),
  ('20000000-0000-0000-0000-000000000006', 'Sameer G.', 5, 'Views across the lake to the City Palace from our room were unbeatable. Five bedrooms, all beautifully restored.', '2025-12-01'),
  ('20000000-0000-0000-0000-000000000006', 'Kavya L.', 4, 'Historic and stunning, though a couple of the bathrooms show their age. Would still recommend without hesitation.', '2025-09-01'),

  ('20000000-0000-0000-0000-000000000007', 'Yusuf H.', 5, 'Two minutes from Nagaon beach exactly as advertised. The 20-metre lap pool was the highlight for our group.', '2026-03-01'),
  ('20000000-0000-0000-0000-000000000007', 'Meera V.', 5, 'Farhan''s place is spotless and the concrete-and-glass design keeps it cool even in peak summer. Great for a quick Mumbai weekend escape.', '2026-01-01'),
  ('20000000-0000-0000-0000-000000000007', 'Aakash T.', 4, 'Solid villa, modern and clean. Only note is the kitchen could use a few more utensils for a full group.', '2025-11-01'),

  ('20000000-0000-0000-0000-000000000008', 'Ritu N.', 5, 'We picked mangoes straight off the trees in season. Sunita made us feel completely at home and the pool deck was perfect for lazy afternoons.', '2026-02-01'),
  ('20000000-0000-0000-0000-000000000008', 'Sanjay P.', 4, 'Simple, charming farmhouse. Ten minutes from Kihim beach as promised. Great value for the price.', '2025-12-01'),
  ('20000000-0000-0000-0000-000000000008', 'Ila C.', 5, 'Exactly the quiet green escape we were looking for from Mumbai. Already rebooked for next season.', '2025-10-01');

-- ---------------------------------------------------------------------------
-- booking_requests
-- ---------------------------------------------------------------------------

insert into public.booking_requests (
  villa_id, guest_name, guest_email, guest_phone, check_in, check_out,
  guests, total_price, status, message, admin_notes, created_at
)
values
  ('20000000-0000-0000-0000-000000000001', 'Ananya Rao', 'ananya.rao@example.com', '+919845012345', '2026-08-14', '2026-08-17', 6, 55500, 'pending', 'Celebrating a birthday, would love a late checkout if possible.', null, '2026-07-20 09:12:00+00'),
  ('20000000-0000-0000-0000-000000000003', 'Imran Ali', 'imran.ali@example.com', '+919845012346', '2026-09-02', '2026-09-06', 10, 128000, 'confirmed', 'Family reunion, six of us have stayed here before.', 'Repeat guest — confirmed via phone call on 18 Jul.', '2026-07-18 14:30:00+00'),
  ('20000000-0000-0000-0000-000000000002', 'Priya Deshmukh', 'priya.d@example.com', '+919845012347', '2026-08-21', '2026-08-23', 8, 55000, 'pending', null, null, '2026-07-22 11:05:00+00'),
  ('20000000-0000-0000-0000-000000000007', 'Yusuf Hakim', 'yusuf.hakim@example.com', '+919845012348', '2026-07-30', '2026-08-02', 6, 63000, 'confirmed', null, null, '2026-07-10 08:45:00+00'),
  ('20000000-0000-0000-0000-000000000005', 'Neha Sharma', 'neha.sharma@example.com', '+919845012349', '2026-07-18', '2026-07-20', 5, 39600, 'cancelled', 'Might need to reschedule depending on work travel.', 'Guest cancelled due to a change in travel plans. Refund processed.', '2026-07-05 16:20:00+00'),
  ('20000000-0000-0000-0000-000000000004', 'Dev Patel', 'dev.patel@example.com', '+919845012350', '2026-07-25', '2026-07-28', 4, 42600, 'pending', null, null, '2026-06-28 10:15:00+00'),
  ('20000000-0000-0000-0000-000000000006', 'Farah Irani', 'farah.irani@example.com', '+919845012351', '2026-07-10', '2026-07-14', 9, 114000, 'confirmed', null, 'Requested early check-in — approved.', '2026-06-15 13:40:00+00'),
  ('20000000-0000-0000-0000-000000000008', 'Ritu Nair', 'ritu.nair@example.com', '+919845012352', '2026-06-05', '2026-06-08', 6, 34500, 'completed', null, null, '2026-05-20 09:00:00+00'),
  ('20000000-0000-0000-0000-000000000001', 'Vikram Singh', 'vikram.singh@example.com', '+919845012353', '2026-05-20', '2026-05-23', 7, 55500, 'confirmed', null, null, '2026-05-02 12:25:00+00'),
  ('20000000-0000-0000-0000-000000000003', 'Sara Thomas', 'sara.thomas@example.com', '+919845012354', '2026-05-01', '2026-05-04', 11, 96000, 'cancelled', 'Group size might change closer to the date.', 'Cancelled — group could not confirm final numbers in time.', '2026-04-18 15:50:00+00'),
  ('20000000-0000-0000-0000-000000000002', 'Karan Verma', 'karan.verma@example.com', '+919845012355', '2026-04-10', '2026-04-13', 9, 72000, 'completed', null, null, '2026-04-02 09:30:00+00'),
  ('20000000-0000-0000-0000-000000000007', 'Meera Verma', 'meera.verma@example.com', '+919845012356', '2026-08-08', '2026-08-10', 5, 42000, 'pending', 'Do you allow early check-in around 10am?', null, '2026-07-24 18:05:00+00');
