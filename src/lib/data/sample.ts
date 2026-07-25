import { Villa, Destination } from "@/types";

const GENERIC_LIVING =
  "https://images.unsplash.com/photo-1724582586529-62622e50c0b3?q=80&w=1400&auto=format&fit=crop";
const GENERIC_BEDROOM =
  "https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?q=80&w=1400&auto=format&fit=crop";
const GENERIC_BATHROOM =
  "https://images.unsplash.com/photo-1750036015902-c6f5ebca924e?q=80&w=1400&auto=format&fit=crop";
const GENERIC_POOL =
  "https://images.unsplash.com/photo-1721989518229-3e84837fc398?q=80&w=1400&auto=format&fit=crop";

function gallery(hero: string): string[] {
  return [hero, GENERIC_LIVING, GENERIC_BEDROOM, GENERIC_BATHROOM, GENERIC_POOL];
}

const UNIVERSAL_AMENITIES = [
  "Free WiFi",
  "Fully-equipped kitchen",
  "Air conditioning",
  "Free parking",
  "Washing machine",
  "Smart TV",
  "Dedicated workspace",
  "BBQ grill",
  "24/7 caretaker",
  "Pet friendly",
];

export const allVillas: Villa[] = [
  {
    id: "1",
    name: "Casa Bela",
    slug: "casa-bela-candolim",
    location: "Candolim, Goa",
    destination: "Goa",
    description:
      "A whitewashed Portuguese-era villa with a private pool and a five-minute walk to the beach. Casa Bela pairs original azulejo tilework and high wooden ceilings with a fully modernised kitchen and bathrooms, so the charm of old Candolim comes with none of the compromises. The pool courtyard sits at the centre of the house, shaded by an old mango tree, and opens onto a covered veranda that's perfect for long lunches. Guests get the run of the whole property, with a caretaker on call rather than living on-site.",
    price_per_night: 18500,
    weekend_price: 21500,
    max_guests: 8,
    bedrooms: 4,
    bathrooms: 4,
    beds: 5,
    amenities: ["8 guests", "4 bedrooms", "Private pool", "Beachfront"],
    full_amenities: ["Private pool", "Beachfront", ...UNIVERSAL_AMENITIES],
    images: gallery(
      "https://images.unsplash.com/photo-1613490493576-7fde63acd811?q=80&w=1400&auto=format&fit=crop"
    ),
    rating: 4.92,
    review_count: 63,
    is_superhost: true,
    owner_whatsapp: "+919876543210",
    owner_name: "Meera Fernandes",
    host_since: "2019",
    is_active: true,
    created_at: "2025-01-01T00:00:00Z",
    reviews: [
      {
        id: "1-1",
        author: "Ananya R.",
        date: "March 2026",
        rating: 5,
        text: "The pool right off the living room was perfect for our kids, and Candolim beach really is a five-minute walk. Meera checked in on us daily without being intrusive.",
      },
      {
        id: "1-2",
        author: "Vikram S.",
        date: "January 2026",
        rating: 5,
        text: "Beautiful Portuguese architecture, spotless, and the caretaker had cold coconuts waiting when we arrived. Would book again.",
      },
      {
        id: "1-3",
        author: "Fatima K.",
        date: "November 2025",
        rating: 4,
        text: "Lovely villa, though the WiFi dropped a couple of times during our stay. Everything else was exactly as photographed.",
      },
    ],
  },
  {
    id: "2",
    name: "The Hilltop House",
    slug: "hilltop-house-lonavala",
    location: "Lonavala, Maharashtra",
    destination: "Lonavala",
    description:
      "Floor-to-ceiling glass walls looking straight into the Sahyadri valley, with an infinity-edge pool that seems to spill into the hillside beyond it. The Hilltop House was built specifically to be lived in from the outside in — every one of the five bedrooms faces the valley, and the open-plan living area slides fully open onto the pool deck. Best visited during or just after monsoon, when the waterfalls across the valley are running.",
    price_per_night: 24000,
    weekend_price: 27500,
    max_guests: 10,
    bedrooms: 5,
    bathrooms: 5,
    beds: 6,
    amenities: ["10 guests", "5 bedrooms", "Valley view", "Private pool"],
    full_amenities: ["Valley view", "Private pool", ...UNIVERSAL_AMENITIES],
    images: gallery(
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?q=80&w=1400&auto=format&fit=crop"
    ),
    rating: 4.87,
    review_count: 41,
    is_superhost: false,
    owner_whatsapp: "+919876543211",
    owner_name: "Arjun Deshmukh",
    host_since: "2021",
    is_active: true,
    created_at: "2025-01-01T00:00:00Z",
    reviews: [
      {
        id: "2-1",
        author: "Rohan M.",
        date: "February 2026",
        rating: 5,
        text: "Waking up to that valley view with the pool steaming in the cold morning air was unreal. Worth every rupee for a monsoon weekend.",
      },
      {
        id: "2-2",
        author: "Priya D.",
        date: "December 2025",
        rating: 4,
        text: "Stunning views and a great layout across five bedrooms. The road up is narrow so drive carefully after dark.",
      },
      {
        id: "2-3",
        author: "Karan V.",
        date: "October 2025",
        rating: 5,
        text: "Arjun was fantastic with directions and local recommendations. The glass walls make every room feel like you're floating over the valley.",
      },
    ],
  },
  {
    id: "3",
    name: "Haveli Noor",
    slug: "haveli-noor-udaipur",
    location: "Udaipur, Rajasthan",
    destination: "Udaipur",
    description:
      "A restored lakeside haveli with hand-painted frescoes, a rooftop pool, and views of the City Palace. Haveli Noor has been in the same family for four generations, and the restoration kept the original stone jaalis, courtyard, and stepwell intact while adding modern plumbing, air conditioning, and a small rooftop pool that looks straight across Lake Pichola. Each of the six bedrooms is different, furnished with period antiques sourced from around Mewar.",
    price_per_night: 32000,
    weekend_price: 37000,
    max_guests: 12,
    bedrooms: 6,
    bathrooms: 6,
    beds: 7,
    amenities: ["12 guests", "6 bedrooms", "Rooftop pool", "Lake view"],
    full_amenities: ["Rooftop pool", "Lake view", ...UNIVERSAL_AMENITIES],
    images: gallery(
      "https://images.unsplash.com/photo-1632641252948-ccbc2fb7d6e9?q=80&w=1400&auto=format&fit=crop"
    ),
    rating: 4.97,
    review_count: 89,
    is_superhost: true,
    owner_whatsapp: "+919876543212",
    owner_name: "Aditya Singh Rathore",
    host_since: "2018",
    is_active: true,
    created_at: "2025-01-01T00:00:00Z",
    reviews: [
      {
        id: "3-1",
        author: "Sara T.",
        date: "March 2026",
        rating: 5,
        text: "Genuinely one of the most beautiful places I've stayed in India. The frescoes are original, the rooftop pool looks straight at the City Palace, and breakfast on the terrace was magical.",
      },
      {
        id: "3-2",
        author: "Imran A.",
        date: "January 2026",
        rating: 5,
        text: "Aditya's family has owned this haveli for generations and it shows in every detail. Book the rooftop for sunset, non-negotiable.",
      },
      {
        id: "3-3",
        author: "Leela N.",
        date: "November 2025",
        rating: 5,
        text: "Six bedrooms and every single one had its own character. Perfect for our extended family reunion.",
      },
    ],
  },
  {
    id: "4",
    name: "Palm Cove Villa",
    slug: "palm-cove-villa-ashwem",
    location: "Ashwem, Goa",
    destination: "Goa",
    description:
      "Steps from Ashwem's quiet shoreline, with a plunge pool shaded by palms and daybeds facing the sea. Palm Cove is smaller and quieter than most north Goa villas, built for three bedrooms rather than a dozen guests, with an open kitchen-living space that opens directly onto the pool deck. Ashwem itself stays low-key even in peak season, so this suits couples and small groups over parties.",
    price_per_night: 14200,
    max_guests: 6,
    bedrooms: 3,
    bathrooms: 3,
    beds: 4,
    amenities: ["6 guests", "3 bedrooms", "Private pool", "Sea view"],
    full_amenities: ["Private pool", "Sea view", ...UNIVERSAL_AMENITIES],
    images: gallery(
      "https://images.unsplash.com/photo-1596178067639-5c6e68aea6dc?q=80&w=1400&auto=format&fit=crop"
    ),
    rating: 4.81,
    review_count: 27,
    is_superhost: false,
    owner_whatsapp: "+919876543213",
    owner_name: "Ligia D'Souza",
    host_since: "2022",
    is_active: true,
    created_at: "2025-01-01T00:00:00Z",
    reviews: [
      {
        id: "4-1",
        author: "Dev P.",
        date: "February 2026",
        rating: 5,
        text: "Ashwem is quieter than Candolim and this villa's plunge pool right by the sea-view daybeds was exactly what we needed.",
      },
      {
        id: "4-2",
        author: "Anjali M.",
        date: "December 2025",
        rating: 4,
        text: "Compact but well designed for three bedrooms. Ligia was quick to respond on WhatsApp about a late checkout.",
      },
      {
        id: "4-3",
        author: "Rahul B.",
        date: "September 2025",
        rating: 5,
        text: "The sunset from the daybeds is the best in north Goa. Already planning our next trip back.",
      },
    ],
  },
  {
    id: "5",
    name: "Misty Ridge Villa",
    slug: "misty-ridge-villa-lonavala",
    location: "Lonavala, Maharashtra",
    destination: "Lonavala",
    description:
      "An infinity pool cut into the hillside, looking straight down into the monsoon-green valley below. Misty Ridge is newer than most Lonavala villas, built low and wide across the ridge so all four bedrooms and the main living space share the same uninterrupted view. The pool deck is the obvious gathering point, with loungers on one side and a covered dining table on the other for when the weather turns.",
    price_per_night: 19800,
    max_guests: 8,
    bedrooms: 4,
    bathrooms: 4,
    beds: 5,
    amenities: ["8 guests", "4 bedrooms", "Valley view", "Private pool"],
    full_amenities: ["Valley view", "Private pool", ...UNIVERSAL_AMENITIES],
    images: gallery(
      "https://images.unsplash.com/photo-1716469880589-ba2a913bd79d?q=80&w=1400&auto=format&fit=crop"
    ),
    rating: 4.85,
    review_count: 34,
    is_superhost: true,
    owner_whatsapp: "+919876543214",
    owner_name: "Nikhil Kulkarni",
    host_since: "2020",
    is_active: true,
    created_at: "2025-01-01T00:00:00Z",
    reviews: [
      {
        id: "5-1",
        author: "Neha S.",
        date: "March 2026",
        rating: 5,
        text: "The infinity pool cut into the hillside is even better in person. We watched clouds roll through the valley below us at breakfast.",
      },
      {
        id: "5-2",
        author: "Amit J.",
        date: "January 2026",
        rating: 5,
        text: "Nikhil was a great host, very responsive. Four bedrooms was perfect for two families.",
      },
      {
        id: "5-3",
        author: "Divya R.",
        date: "October 2025",
        rating: 4,
        text: "Gorgeous villa, just know the last stretch of road is bumpy — fine in an SUV, tight in a sedan.",
      },
    ],
  },
  {
    id: "6",
    name: "Lake Palace Retreat",
    slug: "lake-palace-retreat-udaipur",
    location: "Udaipur, Rajasthan",
    destination: "Udaipur",
    description:
      "A restored royal guesthouse on the water's edge, with stone jaalis, a private jetty, and views across the lake to the City Palace. Lake Palace Retreat once housed extended royal family and staff, and the restoration has kept the original stonework, arched doorways, and courtyard fountain. Five bedrooms are spread across two floors, most with direct lake views, and the private jetty means boat transfers can be arranged directly from the property.",
    price_per_night: 28500,
    max_guests: 10,
    bedrooms: 5,
    bathrooms: 5,
    beds: 6,
    amenities: ["10 guests", "5 bedrooms", "Rooftop pool", "Lake view"],
    full_amenities: ["Rooftop pool", "Lake view", ...UNIVERSAL_AMENITIES],
    images: gallery(
      "https://images.unsplash.com/photo-1711707246899-cf0d1a5d0472?q=80&w=1400&auto=format&fit=crop"
    ),
    rating: 4.9,
    review_count: 52,
    is_superhost: false,
    owner_whatsapp: "+919876543215",
    owner_name: "Rani Kunwar",
    host_since: "2017",
    is_active: true,
    created_at: "2025-01-01T00:00:00Z",
    reviews: [
      {
        id: "6-1",
        author: "Farah I.",
        date: "February 2026",
        rating: 5,
        text: "The private jetty and the jaali screens make this feel like an actual royal guesthouse, because it is one. Rani was a wonderful host.",
      },
      {
        id: "6-2",
        author: "Sameer G.",
        date: "December 2025",
        rating: 5,
        text: "Views across the lake to the City Palace from our room were unbeatable. Five bedrooms, all beautifully restored.",
      },
      {
        id: "6-3",
        author: "Kavya L.",
        date: "September 2025",
        rating: 4,
        text: "Historic and stunning, though a couple of the bathrooms show their age. Would still recommend without hesitation.",
      },
    ],
  },
  {
    id: "7",
    name: "Konkan Breeze Villa",
    slug: "konkan-breeze-villa-alibaug",
    location: "Nagaon, Alibaug",
    destination: "Alibaug",
    description:
      "A minimalist concrete-and-glass villa two minutes from Nagaon beach, built around a 20-metre lap pool. Konkan Breeze is one of the newer builds in the area, designed to stay cool through peak Konkan summers with cross-ventilation and deep overhangs rather than relying purely on air conditioning. Four bedrooms open onto a shared courtyard, with the pool and an outdoor kitchen as the main gathering space.",
    price_per_night: 21000,
    max_guests: 8,
    bedrooms: 4,
    bathrooms: 4,
    beds: 5,
    amenities: ["8 guests", "4 bedrooms", "Private pool", "Sea view"],
    full_amenities: ["Private pool", "Sea view", ...UNIVERSAL_AMENITIES],
    images: gallery(
      "https://images.unsplash.com/photo-1673147056688-4df20283643b?q=80&w=1400&auto=format&fit=crop"
    ),
    rating: 4.88,
    review_count: 31,
    is_superhost: true,
    owner_whatsapp: "+919876543216",
    owner_name: "Farhan Sheikh",
    host_since: "2022",
    is_active: true,
    created_at: "2025-01-01T00:00:00Z",
    reviews: [
      {
        id: "7-1",
        author: "Yusuf H.",
        date: "March 2026",
        rating: 5,
        text: "Two minutes from Nagaon beach exactly as advertised. The 20-metre lap pool was the highlight for our group.",
      },
      {
        id: "7-2",
        author: "Meera V.",
        date: "January 2026",
        rating: 5,
        text: "Farhan's place is spotless and the concrete-and-glass design keeps it cool even in peak summer. Great for a quick Mumbai weekend escape.",
      },
      {
        id: "7-3",
        author: "Aakash T.",
        date: "November 2025",
        rating: 4,
        text: "Solid villa, modern and clean. Only note is the kitchen could use a few more utensils for a full group.",
      },
    ],
  },
  {
    id: "8",
    name: "Green Acre Farmhouse",
    slug: "green-acre-farmhouse-alibaug",
    location: "Kihim, Alibaug",
    destination: "Alibaug",
    description:
      "A working mango orchard farmhouse with a shaded pool deck, ten minutes from Kihim beach. Green Acre is the most laid-back of the Alibaug villas, set inside an active Alphonso mango orchard with three simple, comfortable bedrooms. The pool deck sits under the tree canopy, and guests are welcome to walk the orchard and, in season, pick fruit straight from the trees.",
    price_per_night: 11500,
    max_guests: 6,
    bedrooms: 3,
    bathrooms: 3,
    beds: 4,
    amenities: ["6 guests", "3 bedrooms", "Private pool", "Garden view"],
    full_amenities: ["Private pool", "Garden view", ...UNIVERSAL_AMENITIES],
    images: gallery(
      "https://images.unsplash.com/photo-1721989519334-40923a0ee1c0?q=80&w=1400&auto=format&fit=crop"
    ),
    rating: 4.76,
    review_count: 19,
    is_superhost: false,
    owner_whatsapp: "+919876543217",
    owner_name: "Sunita Patil",
    host_since: "2019",
    is_active: true,
    created_at: "2025-01-01T00:00:00Z",
    reviews: [
      {
        id: "8-1",
        author: "Ritu N.",
        date: "February 2026",
        rating: 5,
        text: "We picked mangoes straight off the trees in season. Sunita made us feel completely at home and the pool deck was perfect for lazy afternoons.",
      },
      {
        id: "8-2",
        author: "Sanjay P.",
        date: "December 2025",
        rating: 4,
        text: "Simple, charming farmhouse. Ten minutes from Kihim beach as promised. Great value for the price.",
      },
      {
        id: "8-3",
        author: "Ila C.",
        date: "October 2025",
        rating: 5,
        text: "Exactly the quiet green escape we were looking for from Mumbai. Already rebooked for next season.",
      },
    ],
  },
];

export const featuredVillas: Villa[] = allVillas.slice(0, 3);

export const sampleDestinations: Destination[] = [
  {
    id: "1",
    name: "Goa",
    slug: "goa",
    image:
      "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?q=80&w=1200&auto=format&fit=crop",
    villa_count: 42,
    meta_description:
      "Goa's coastline blends colonial-era architecture with some of India's most laid-back beaches. Expect swaying palms, seafood shacks, and a slower pace of life, whether you're based on the busier north coast or the quieter southern beaches.",
  },
  {
    id: "2",
    name: "Lonavala",
    slug: "lonavala",
    image:
      "https://images.unsplash.com/photo-1689172324767-f180880ccdec?q=80&w=1200&auto=format&fit=crop",
    villa_count: 27,
    meta_description:
      "Tucked into the Sahyadri hills two hours from Mumbai and Pune, Lonavala is where the Deccan plateau drops away into forested valleys and monsoon waterfalls. It's the region's go-to weekend escape for cooler air and hillside views.",
  },
  {
    id: "3",
    name: "Udaipur",
    slug: "udaipur",
    image:
      "https://images.unsplash.com/photo-1651478881270-6c3a0fc883f4?q=80&w=1200&auto=format&fit=crop",
    villa_count: 19,
    meta_description:
      "Built around the man-made lakes of the Mewar kingdom, Udaipur is a city of white marble palaces, narrow bazaar lanes, and water on every horizon. The City Palace and Lake Pichola anchor an old town that still feels lived-in rather than staged for tourists.",
  },
  {
    id: "4",
    name: "Alibaug",
    slug: "alibaug",
    image:
      "https://images.unsplash.com/photo-1610535791915-4d14316afc43?q=80&w=1200&auto=format&fit=crop",
    villa_count: 34,
    meta_description:
      "A short ferry ride across the harbour from Mumbai, Alibaug is Konkan coast living without the crowds of Goa: quiet beaches, coconut groves, and old Portuguese-Maratha forts scattered along the shoreline.",
  },
];
