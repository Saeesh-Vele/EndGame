import type { SupabaseClient } from "@supabase/supabase-js";
import type { VillaRates } from "@/lib/pricing";
import {
  BookingRequest,
  BookingRequestWithVilla,
  Destination,
  Profile,
  Review,
  Villa,
  VillaSubmission,
  VillaSubmissionStatus,
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
  owner_email: string | null;
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

/**
 * Row → Villa for the public site.
 *
 * Deliberately drops owner_email. A Villa is serialised into the HTML of every
 * villa card and detail page, so anything mapped here is readable by anyone
 * who views source — owner_whatsapp is in because the WhatsApp CTA is the
 * point of a listing; an owner's email address is not. Admin screens that
 * genuinely need it use mapVillaForAdmin instead.
 *
 * Note this controls what *we* return, not what the table permits: RLS in
 * Postgres is row-level, so a hand-crafted PostgREST query could still select
 * the column. Add column grants (as migration 005 does for profiles.is_admin)
 * if that gap matters.
 */
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

/** Row → Villa including owner_email, for the admin villa screens. */
function mapVillaForAdmin(row: VillaRow): Villa {
  return { ...mapVilla(row), owner_email: row.owner_email ?? undefined };
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

/**
 * Destinations with `villa_count` replaced by a live count.
 *
 * The stored destinations.villa_count column has nothing keeping it in sync.
 * Public callers see counts of *active* villas only, because the villas select
 * policy hides inactive rows from non-admins.
 */
export async function getDestinationsWithCounts(
  client: SupabaseClient
): Promise<Destination[]> {
  const [destinations, counts] = await Promise.all([
    getDestinations(client),
    getVillaCountsByDestination(client),
  ]);

  return destinations.map((destination) => ({
    ...destination,
    villa_count: counts[destination.id] ?? 0,
  }));
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
 * The rate and capacity columns the booking action prices a stay against.
 *
 * Deliberately narrow: this is the authoritative read that decides what a
 * booking costs, so it selects the rate columns straight from the row rather
 * than trusting anything the browser sent. The public select policy hides
 * inactive villas from non-admins, so an unpublished villa comes back null —
 * which the caller reports as "not taking requests".
 */
export interface VillaBookingRates extends VillaRates {
  id: string;
  name: string;
  max_guests: number;
}

export async function getVillaBookingRates(
  client: SupabaseClient,
  villaId: string
): Promise<VillaBookingRates | null> {
  const { data, error } = await client
    .from("villas")
    .select("id, name, price_per_night, weekend_price, max_guests")
    .eq("id", villaId)
    .eq("is_active", true)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  return {
    id: data.id as string,
    name: data.name as string,
    price_per_night: Number(data.price_per_night),
    weekend_price:
      data.weekend_price != null ? Number(data.weekend_price) : undefined,
    max_guests: Number(data.max_guests),
  };
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
  owner_email?: string;
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
  return (data ?? []).map(mapVillaForAdmin);
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
  return data ? mapVillaForAdmin(data) : null;
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
  return mapVillaForAdmin(data);
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
  return mapVillaForAdmin(data);
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

interface BookingWithVillaRow extends BookingRequestRow {
  villas: {
    name: string;
    slug: string;
    location: string;
    images: string[];
  } | null;
}

const BOOKING_WITH_VILLA_SELECT = "*, villas(name, slug, location, images)";

function mapBookingWithVilla(row: BookingWithVillaRow): BookingRequestWithVilla {
  return {
    ...mapBookingRequest(row),
    villa_name: row.villas?.name ?? "Unknown villa",
    villa_slug: row.villas?.slug ?? "",
    villa_location: row.villas?.location ?? "",
    villa_image: row.villas?.images?.[0] ?? null,
  };
}

/**
 * All booking requests with their villa joined in, newest first.
 *
 * RLS decides the scope, not this function: admins get every row, a signed-in
 * guest gets only their own. The dashboard relies on that — see
 * getBookingRequestsForCurrentUser.
 */
export async function getAdminBookingRequests(
  client: SupabaseClient,
  limit?: number
): Promise<BookingRequestWithVilla[]> {
  let query = client
    .from("booking_requests")
    .select(BOOKING_WITH_VILLA_SELECT)
    .order("created_at", { ascending: false });

  if (limit !== undefined) query = query.limit(limit);

  const { data, error } = await query;

  if (error) throw error;
  return (data ?? []).map(mapBookingWithVilla);
}

export async function getAdminBookingRequestById(
  client: SupabaseClient,
  id: string
): Promise<BookingRequestWithVilla | null> {
  const { data, error } = await client
    .from("booking_requests")
    .select(BOOKING_WITH_VILLA_SELECT)
    .eq("id", id)
    .maybeSingle();

  if (error) throw error;
  return data ? mapBookingWithVilla(data) : null;
}

/**
 * The signed-in guest's own booking requests.
 *
 * Filtered explicitly on user_id as well as relying on RLS — belt and braces,
 * and it keeps the query honest if an admin ever loads their own dashboard.
 */
export async function getBookingRequestsForCurrentUser(
  client: SupabaseClient,
  userId: string
): Promise<BookingRequestWithVilla[]> {
  const { data, error } = await client
    .from("booking_requests")
    .select(BOOKING_WITH_VILLA_SELECT)
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []).map(mapBookingWithVilla);
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
  whatsappInquiriesThisMonth: number;
  pendingSubmissions: number;
  destinations: number;
}> {
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const [villas, pending, thisMonth, whatsapp, submissions, destinations] =
    await Promise.all([
      client.from("villas").select("id", { count: "exact", head: true }),
      client
        .from("booking_requests")
        .select("id", { count: "exact", head: true })
        .eq("status", "pending"),
      client
        .from("booking_requests")
        .select("id", { count: "exact", head: true })
        .gte("created_at", startOfMonth.toISOString()),
      client
        .from("whatsapp_clicks")
        .select("id", { count: "exact", head: true })
        .gte("created_at", startOfMonth.toISOString()),
      client
        .from("villa_submissions")
        .select("id", { count: "exact", head: true })
        .eq("status", "pending"),
      client.from("destinations").select("id", { count: "exact", head: true }),
    ]);

  const firstError =
    villas.error ??
    pending.error ??
    thisMonth.error ??
    whatsapp.error ??
    submissions.error ??
    destinations.error;
  if (firstError) throw firstError;

  return {
    villas: villas.count ?? 0,
    pendingBookings: pending.count ?? 0,
    inquiriesThisMonth: thisMonth.count ?? 0,
    whatsappInquiriesThisMonth: whatsapp.count ?? 0,
    pendingSubmissions: submissions.count ?? 0,
    destinations: destinations.count ?? 0,
  };
}

// ---------------------------------------------------------------------------
// Villa submissions — the public /list-your-villa form.
// ---------------------------------------------------------------------------

interface VillaSubmissionRow {
  id: string;
  owner_name: string;
  owner_email: string;
  owner_phone: string;
  villa_name: string;
  location: string;
  destination: string | null;
  bedrooms: number | null;
  bathrooms: number | null;
  max_guests: number | null;
  description: string | null;
  amenities: string[];
  price_per_night: number | null;
  weekend_price: number | null;
  message: string | null;
  status: VillaSubmissionStatus;
  admin_notes: string | null;
  created_at: string;
}

function mapVillaSubmission(row: VillaSubmissionRow): VillaSubmission {
  return {
    id: row.id,
    owner_name: row.owner_name,
    owner_email: row.owner_email,
    owner_phone: row.owner_phone,
    villa_name: row.villa_name,
    location: row.location,
    destination: row.destination ?? undefined,
    bedrooms: row.bedrooms ?? undefined,
    bathrooms: row.bathrooms ?? undefined,
    max_guests: row.max_guests ?? undefined,
    description: row.description ?? undefined,
    amenities: row.amenities ?? [],
    price_per_night:
      row.price_per_night != null ? Number(row.price_per_night) : undefined,
    weekend_price:
      row.weekend_price != null ? Number(row.weekend_price) : undefined,
    message: row.message ?? undefined,
    status: row.status,
    admin_notes: row.admin_notes ?? undefined,
    created_at: row.created_at,
  };
}

export interface VillaSubmissionInput {
  owner_name: string;
  owner_email: string;
  owner_phone: string;
  villa_name: string;
  location: string;
  destination?: string;
  bedrooms?: number;
  bathrooms?: number;
  max_guests?: number;
  description?: string;
  amenities: string[];
  price_per_night?: number;
  weekend_price?: number;
  message?: string;
}

/**
 * Inserts a submission from the public form and returns its id.
 *
 * Deliberately no `.select()`: the insert policy is open to everyone, but
 * there is no select policy for non-admins, so asking for the row back would
 * make the whole statement fail under RLS. The id is therefore generated here
 * rather than read back — the admin notification email needs it to link to
 * /admin/submissions/{id}.
 */
export async function createVillaSubmission(
  client: SupabaseClient,
  input: VillaSubmissionInput
): Promise<string> {
  const id = crypto.randomUUID();
  const { error } = await client
    .from("villa_submissions")
    .insert({ id, ...input });

  if (error) throw error;
  return id;
}

/** Admin-only per RLS. */
export async function getVillaSubmissions(
  client: SupabaseClient
): Promise<VillaSubmission[]> {
  const { data, error } = await client
    .from("villa_submissions")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []).map(mapVillaSubmission);
}

export async function getVillaSubmissionById(
  client: SupabaseClient,
  id: string
): Promise<VillaSubmission | null> {
  const { data, error } = await client
    .from("villa_submissions")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) throw error;
  return data ? mapVillaSubmission(data) : null;
}

export async function updateVillaSubmission(
  client: SupabaseClient,
  id: string,
  updates: Partial<Pick<VillaSubmission, "status" | "admin_notes">>
): Promise<void> {
  const { error } = await client
    .from("villa_submissions")
    .update(updates)
    .eq("id", id);

  if (error) throw error;
}

export async function deleteVillaSubmission(
  client: SupabaseClient,
  id: string
): Promise<void> {
  const { error } = await client
    .from("villa_submissions")
    .delete()
    .eq("id", id);

  if (error) throw error;
}

export async function countPendingVillaSubmissions(
  client: SupabaseClient
): Promise<number> {
  const { count, error } = await client
    .from("villa_submissions")
    .select("id", { count: "exact", head: true })
    .eq("status", "pending");

  if (error) throw error;
  return count ?? 0;
}

// ---------------------------------------------------------------------------
// Notification support
// ---------------------------------------------------------------------------

export interface VillaNotificationContext {
  name: string;
  slug: string;
  owner_name?: string;
  owner_whatsapp?: string;
  owner_email?: string;
}

/**
 * The few villa fields the notification emails need.
 *
 * Its own query rather than getVillaById because the booking flow runs under
 * the guest's session, where the public VILLA_SELECT deliberately omits
 * owner_email. This asks for it explicitly, and the address is only ever used
 * as a send target — it isn't returned to the browser.
 */
export async function getVillaNotificationContext(
  client: SupabaseClient,
  villaId: string
): Promise<VillaNotificationContext | null> {
  const { data, error } = await client
    .from("villas")
    .select("name, slug, owner_name, owner_whatsapp, owner_email")
    .eq("id", villaId)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  return {
    name: data.name,
    slug: data.slug,
    owner_name: data.owner_name ?? undefined,
    owner_whatsapp: data.owner_whatsapp ?? undefined,
    owner_email: data.owner_email ?? undefined,
  };
}

// ---------------------------------------------------------------------------
// WhatsApp inquiry tracking
//
// Guests leave the site when they open WhatsApp, so a click on that link is
// the last signal we get and the closest thing to a conversion metric here.
// ---------------------------------------------------------------------------

/** Records one click. Insert is open to everyone; reads are admin-only. */
export async function logWhatsappClick(
  client: SupabaseClient,
  villaId: string,
  userId?: string
): Promise<void> {
  const { error } = await client
    .from("whatsapp_clicks")
    .insert({ villa_id: villaId, user_id: userId ?? null });

  if (error) throw error;
}

/** Total clicks per villa id. Admin-only per RLS. */
export async function getWhatsappClickCountsByVilla(
  client: SupabaseClient
): Promise<Record<string, number>> {
  const { data, error } = await client
    .from("whatsapp_clicks")
    .select("villa_id");

  if (error) throw error;

  const counts: Record<string, number> = {};
  for (const row of data ?? []) {
    const id = (row as { villa_id: string }).villa_id;
    counts[id] = (counts[id] ?? 0) + 1;
  }
  return counts;
}

// ---------------------------------------------------------------------------
// Contact messages — the form on /about.
// ---------------------------------------------------------------------------

export interface ContactMessageInput {
  name: string;
  email: string;
  message: string;
}

/**
 * Inserts a contact message.
 *
 * No `.select()`, for the same reason as createVillaSubmission: insert is open
 * to everyone but there's no select policy for non-admins, so asking for the
 * row back would fail the whole statement under RLS.
 */
export async function createContactMessage(
  client: SupabaseClient,
  input: ContactMessageInput
): Promise<void> {
  const { error } = await client.from("contact_messages").insert(input);
  if (error) throw error;
}

// ---------------------------------------------------------------------------
// Guest accounts — profile and saved villas.
// ---------------------------------------------------------------------------

export async function getProfile(
  client: SupabaseClient,
  userId: string
): Promise<Profile | null> {
  const { data, error } = await client
    .from("profiles")
    .select("id, full_name, is_admin")
    .eq("id", userId)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  return {
    id: data.id,
    full_name: data.full_name ?? undefined,
    is_admin: data.is_admin === true,
  };
}

/** Just the villa ids, for deciding which hearts render filled. */
export async function getSavedVillaIds(
  client: SupabaseClient
): Promise<string[]> {
  const { data, error } = await client
    .from("saved_villas")
    .select("villa_id");

  if (error) throw error;
  return (data ?? []).map((row) => (row as { villa_id: string }).villa_id);
}

/** The full villa rows behind a user's saves, newest save first. */
export async function getSavedVillas(
  client: SupabaseClient,
  userId: string
): Promise<Villa[]> {
  const { data, error } = await client
    .from("saved_villas")
    .select(`villa_id, created_at, villas(${VILLA_SELECT})`)
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw error;

  // A save whose villa was since deleted or deactivated comes back with a null
  // join (villas RLS hides inactive rows from non-admins), so drop those.
  return (data ?? [])
    .map((row) => (row as unknown as { villas: VillaRow | null }).villas)
    .filter((villa): villa is VillaRow => villa != null)
    .map(mapVilla);
}

export async function saveVilla(
  client: SupabaseClient,
  userId: string,
  villaId: string
): Promise<void> {
  const { error } = await client
    .from("saved_villas")
    .upsert(
      { user_id: userId, villa_id: villaId },
      { onConflict: "user_id,villa_id", ignoreDuplicates: true }
    );

  if (error) throw error;
}

export async function unsaveVilla(
  client: SupabaseClient,
  userId: string,
  villaId: string
): Promise<void> {
  const { error } = await client
    .from("saved_villas")
    .delete()
    .eq("user_id", userId)
    .eq("villa_id", villaId);

  if (error) throw error;
}
