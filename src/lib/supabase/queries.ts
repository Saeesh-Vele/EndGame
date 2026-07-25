import type { SupabaseClient } from "@supabase/supabase-js";
import { BookingRequest, Destination, Review, Villa } from "@/types";

// ---------------------------------------------------------------------------
// Raw row shapes, matching supabase/migrations/001_initial_schema.sql.
// Kept separate from the app-facing types in src/types, which are shaped
// around what components render rather than how the schema is normalized
// (e.g. villas store a destination_id FK, but components want a
// destination *name* string).
// ---------------------------------------------------------------------------

interface DestinationRow {
  id: string;
  name: string;
  slug: string;
  image_url: string | null;
  villa_count: number;
  meta_title: string | null;
  meta_description: string | null;
  created_at: string;
}

interface VillaRow {
  id: string;
  destination_id: string | null;
  name: string;
  slug: string;
  description: string | null;
  location: string;
  price_per_night: number;
  weekend_price: number | null;
  seasonal_price: number | null;
  max_guests: number;
  bedrooms: number;
  bathrooms: number;
  beds: number | null;
  amenities: string[];
  full_amenities: string[];
  images: string[];
  rating: number;
  review_count: number;
  is_superhost: boolean;
  owner_whatsapp: string | null;
  owner_name: string | null;
  host_since: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  destinations: { name: string } | null;
}

interface ReviewRow {
  id: string;
  villa_id: string;
  guest_name: string;
  rating: number;
  text: string | null;
  created_at: string;
}

interface BookingRequestRow {
  id: string;
  villa_id: string;
  user_id: string | null;
  guest_name: string;
  guest_email: string;
  guest_phone: string | null;
  check_in: string;
  check_out: string;
  guests: number;
  total_price: number;
  status: BookingRequest["status"];
  message: string | null;
  admin_notes: string | null;
  created_at: string;
}

const VILLA_SELECT = "*, destinations(name)";

function mapDestination(row: DestinationRow): Destination {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    image: row.image_url ?? "",
    villa_count: row.villa_count,
    meta_title: row.meta_title ?? undefined,
    meta_description: row.meta_description ?? undefined,
  };
}

function mapVilla(row: VillaRow): Villa {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    location: row.location,
    destination: row.destinations?.name ?? "",
    description: row.description ?? "",
    price_per_night: Number(row.price_per_night),
    weekend_price:
      row.weekend_price != null ? Number(row.weekend_price) : undefined,
    seasonal_price:
      row.seasonal_price != null ? Number(row.seasonal_price) : undefined,
    max_guests: row.max_guests,
    bedrooms: row.bedrooms,
    bathrooms: row.bathrooms,
    beds: row.beds ?? undefined,
    amenities: row.amenities ?? [],
    full_amenities: row.full_amenities?.length ? row.full_amenities : undefined,
    images: row.images ?? [],
    rating: Number(row.rating),
    review_count: row.review_count,
    is_superhost: row.is_superhost,
    owner_whatsapp: row.owner_whatsapp ?? "",
    owner_name: row.owner_name ?? undefined,
    host_since: row.host_since ?? undefined,
    is_active: row.is_active,
    created_at: row.created_at,
  };
}

function mapReview(row: ReviewRow): Review {
  return {
    id: row.id,
    author: row.guest_name,
    date: new Date(row.created_at).toLocaleDateString("en-IN", {
      month: "long",
      year: "numeric",
    }),
    rating: row.rating,
    text: row.text ?? "",
  };
}

function mapBookingRequest(row: BookingRequestRow): BookingRequest {
  return {
    id: row.id,
    villa_id: row.villa_id,
    user_id: row.user_id ?? undefined,
    guest_name: row.guest_name,
    guest_email: row.guest_email,
    guest_phone: row.guest_phone ?? "",
    check_in: row.check_in,
    check_out: row.check_out,
    guests: row.guests,
    total_price: Number(row.total_price),
    status: row.status,
    message: row.message ?? undefined,
    admin_notes: row.admin_notes ?? undefined,
    created_at: row.created_at,
  };
}

// ---------------------------------------------------------------------------
// Public reads — used by the marketing site.
// ---------------------------------------------------------------------------

export async function getDestinations(
  client: SupabaseClient
): Promise<Destination[]> {
  const { data, error } = await client
    .from("destinations")
    .select("*")
    .order("name");

  if (error) throw error;
  return (data ?? []).map(mapDestination);
}

export async function getDestinationBySlug(
  client: SupabaseClient,
  slug: string
): Promise<Destination | null> {
  const { data, error } = await client
    .from("destinations")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();

  if (error) throw error;
  return data ? mapDestination(data) : null;
}

/** All active villas, newest first. Destination/price/amenity filtering
 * happens client-side in VillasPageClient against this full list. */
export async function getVillas(client: SupabaseClient): Promise<Villa[]> {
  const { data, error } = await client
    .from("villas")
    .select(VILLA_SELECT)
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []).map(mapVilla);
}

export async function getFeaturedVillas(
  client: SupabaseClient,
  limit = 3
): Promise<Villa[]> {
  const { data, error } = await client
    .from("villas")
    .select(VILLA_SELECT)
    .eq("is_active", true)
    .order("is_superhost", { ascending: false })
    .order("rating", { ascending: false })
    .limit(limit);

  if (error) throw error;
  return (data ?? []).map(mapVilla);
}

export async function getVillaBySlug(
  client: SupabaseClient,
  slug: string
): Promise<Villa | null> {
  const { data, error } = await client
    .from("villas")
    .select(VILLA_SELECT)
    .eq("slug", slug)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  const { data: reviewRows, error: reviewsError } = await client
    .from("reviews")
    .select("*")
    .eq("villa_id", data.id)
    .order("created_at", { ascending: false });

  if (reviewsError) throw reviewsError;

  return {
    ...mapVilla(data),
    reviews: (reviewRows ?? []).map(mapReview),
  };
}

/** Other active villas in the same destination — for the "More villas in
 * X" section on a villa detail page. */
export async function getSimilarVillas(
  client: SupabaseClient,
  destinationName: string,
  excludeVillaId: string,
  limit = 6
): Promise<Villa[]> {
  const villas = await getVillas(client);
  return villas
    .filter((v) => v.destination === destinationName && v.id !== excludeVillaId)
    .slice(0, limit);
}

// ---------------------------------------------------------------------------
// Booking requests
// ---------------------------------------------------------------------------

export interface CreateBookingRequestInput {
  villa_id: string;
  guest_name: string;
  guest_email: string;
  guest_phone: string;
  check_in: string;
  check_out: string;
  guests: number;
  total_price: number;
  message?: string;
}

/**
 * Inserts a booking request. RLS requires an authenticated session to
 * write to booking_requests — callers should sign the guest in
 * anonymously first if there's no session yet (see
 * src/app/villas/[slug]/actions.ts for the Server Action that does this).
 */
export async function createBookingRequest(
  client: SupabaseClient,
  input: CreateBookingRequestInput
): Promise<BookingRequest> {
  const { data, error } = await client
    .from("booking_requests")
    .insert({
      villa_id: input.villa_id,
      guest_name: input.guest_name,
      guest_email: input.guest_email,
      guest_phone: input.guest_phone,
      check_in: input.check_in,
      check_out: input.check_out,
      guests: input.guests,
      total_price: input.total_price,
      message: input.message,
    })
    .select()
    .single();

  if (error) throw error;
  return mapBookingRequest(data);
}

export async function getBookingRequests(
  client: SupabaseClient
): Promise<BookingRequest[]> {
  const { data, error } = await client
    .from("booking_requests")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []).map(mapBookingRequest);
}

export async function updateBookingRequest(
  client: SupabaseClient,
  id: string,
  updates: Partial<Pick<BookingRequest, "status" | "admin_notes">>
): Promise<BookingRequest> {
  const { data, error } = await client
    .from("booking_requests")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return mapBookingRequest(data);
}

// ---------------------------------------------------------------------------
// Admin CRUD — villas & destinations.
//
// Requires an authenticated session with a matching admin profile (see
// is_admin() and the RLS policies in the migration). The admin dashboard
// currently runs on local mock state (src/components/admin/AdminDataProvider)
// pending an admin login flow; these are ready for that follow-up to wire
// up against.
// ---------------------------------------------------------------------------

export interface VillaInput {
  name: string;
  slug: string;
  destination_id: string;
  description?: string;
  location: string;
  price_per_night: number;
  weekend_price?: number;
  seasonal_price?: number;
  max_guests: number;
  bedrooms: number;
  bathrooms: number;
  beds?: number;
  amenities: string[];
  full_amenities?: string[];
  images: string[];
  owner_whatsapp?: string;
  owner_name?: string;
  is_active: boolean;
}

export async function getVillasForAdmin(
  client: SupabaseClient
): Promise<Villa[]> {
  const { data, error } = await client
    .from("villas")
    .select(VILLA_SELECT)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []).map(mapVilla);
}

export async function createVilla(
  client: SupabaseClient,
  input: VillaInput
): Promise<Villa> {
  const { data, error } = await client
    .from("villas")
    .insert(input)
    .select(VILLA_SELECT)
    .single();

  if (error) throw error;
  return mapVilla(data);
}

export async function updateVilla(
  client: SupabaseClient,
  id: string,
  input: Partial<VillaInput>
): Promise<Villa> {
  const { data, error } = await client
    .from("villas")
    .update(input)
    .eq("id", id)
    .select(VILLA_SELECT)
    .single();

  if (error) throw error;
  return mapVilla(data);
}

export async function deleteVilla(
  client: SupabaseClient,
  id: string
): Promise<void> {
  const { error } = await client.from("villas").delete().eq("id", id);
  if (error) throw error;
}

export interface DestinationInput {
  name: string;
  slug: string;
  image_url: string;
  meta_title?: string;
  meta_description?: string;
}

export async function createDestination(
  client: SupabaseClient,
  input: DestinationInput
): Promise<Destination> {
  const { data, error } = await client
    .from("destinations")
    .insert(input)
    .select()
    .single();

  if (error) throw error;
  return mapDestination(data);
}

export async function updateDestination(
  client: SupabaseClient,
  id: string,
  input: Partial<DestinationInput>
): Promise<Destination> {
  const { data, error } = await client
    .from("destinations")
    .update(input)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return mapDestination(data);
}

export async function deleteDestination(
  client: SupabaseClient,
  id: string
): Promise<void> {
  const { error } = await client.from("destinations").delete().eq("id", id);
  if (error) throw error;
}
