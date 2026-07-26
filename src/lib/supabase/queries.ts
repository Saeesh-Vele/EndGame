import type { SupabaseClient } from "@supabase/supabase-js";
import {
  AdminBookingRequest,
  BookingRequest,
  Destination,
  Review,
  Villa,
} from "@/types";

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
    destination_id: row.destination_id ?? undefined,
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

/** Deletes a booking request outright. Admin-only per RLS. */
export async function deleteBookingRequest(
  client: SupabaseClient,
  id: string
): Promise<void> {
  const { error } = await client
    .from("booking_requests")
    .delete()
    .eq("id", id);

  if (error) throw error;
}

// ---------------------------------------------------------------------------
// Admin CRUD — villas & destinations.
//
// Requires an authenticated session with a matching admin profile (see
// is_admin() and the RLS policies in the migration). Called from the Server
// Actions in src/app/admin/actions.ts, which re-check admin status before
// invoking any of these.
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

/** Every villa including inactive ones — the public getVillas() filters those out. */
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

/** Single villa by primary key, active or not. For the admin edit form. */
export async function getVillaById(
  client: SupabaseClient,
  id: string
): Promise<Villa | null> {
  const { data, error } = await client
    .from("villas")
    .select(VILLA_SELECT)
    .eq("id", id)
    .maybeSingle();

  if (error) throw error;
  return data ? mapVilla(data) : null;
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

// ---------------------------------------------------------------------------
// Admin reads that join across tables.
// ---------------------------------------------------------------------------

interface AdminBookingRow extends BookingRequestRow {
  villas: { name: string; location: string; images: string[] } | null;
}

const ADMIN_BOOKING_SELECT = "*, villas(name, location, images)";

function mapAdminBooking(row: AdminBookingRow): AdminBookingRequest {
  return {
    ...mapBookingRequest(row),
    villa_name: row.villas?.name ?? "Unknown villa",
    villa_location: row.villas?.location ?? "",
    villa_image: row.villas?.images?.[0] ?? null,
  };
}

/** All booking requests with their villa joined in, newest first. */
export async function getAdminBookingRequests(
  client: SupabaseClient,
  limit?: number
): Promise<AdminBookingRequest[]> {
  let query = client
    .from("booking_requests")
    .select(ADMIN_BOOKING_SELECT)
    .order("created_at", { ascending: false });

  if (limit !== undefined) query = query.limit(limit);

  const { data, error } = await query;

  if (error) throw error;
  return (data ?? []).map(mapAdminBooking);
}

export async function getAdminBookingRequestById(
  client: SupabaseClient,
  id: string
): Promise<AdminBookingRequest | null> {
  const { data, error } = await client
    .from("booking_requests")
    .select(ADMIN_BOOKING_SELECT)
    .eq("id", id)
    .maybeSingle();

  if (error) throw error;
  return data ? mapAdminBooking(data) : null;
}

/**
 * Live villa counts per destination id.
 *
 * destinations.villa_count is a stored column that nothing currently keeps in
 * sync, so the admin screens count the rows instead — and deleting a
 * destination checks this rather than trusting the column.
 */
export async function getVillaCountsByDestination(
  client: SupabaseClient
): Promise<Record<string, number>> {
  const { data, error } = await client
    .from("villas")
    .select("destination_id");

  if (error) throw error;

  const counts: Record<string, number> = {};
  for (const row of data ?? []) {
    const id = (row as { destination_id: string | null }).destination_id;
    if (id) counts[id] = (counts[id] ?? 0) + 1;
  }
  return counts;
}

/** Number of villas still pointing at a destination. Guards deletion. */
export async function countVillasInDestination(
  client: SupabaseClient,
  destinationId: string
): Promise<number> {
  const { count, error } = await client
    .from("villas")
    .select("id", { count: "exact", head: true })
    .eq("destination_id", destinationId);

  if (error) throw error;
  return count ?? 0;
}

/** Counts for the dashboard stat cards, in one round trip each. */
export async function getAdminDashboardStats(client: SupabaseClient): Promise<{
  villas: number;
  pendingBookings: number;
  inquiriesThisMonth: number;
  destinations: number;
}> {
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const [villas, pending, thisMonth, destinations] = await Promise.all([
    client.from("villas").select("id", { count: "exact", head: true }),
    client
      .from("booking_requests")
      .select("id", { count: "exact", head: true })
      .eq("status", "pending"),
    client
      .from("booking_requests")
      .select("id", { count: "exact", head: true })
      .gte("created_at", startOfMonth.toISOString()),
    client.from("destinations").select("id", { count: "exact", head: true }),
  ]);

  const firstError =
    villas.error ?? pending.error ?? thisMonth.error ?? destinations.error;
  if (firstError) throw firstError;

  return {
    villas: villas.count ?? 0,
    pendingBookings: pending.count ?? 0,
    inquiriesThisMonth: thisMonth.count ?? 0,
    destinations: destinations.count ?? 0,
  };
}
