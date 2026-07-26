"use server";

import { revalidatePath } from "next/cache";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { isAdmin, signOut } from "@/lib/supabase/admin";
import { deleteVillaImagesByUrl } from "@/lib/supabase/storage";
import {
  countVillasInDestination,
  createDestination as insertDestination,
  createVilla as insertVilla,
  deleteBookingRequest,
  deleteDestination as removeDestination,
  deleteVilla as removeVilla,
  deleteVillaSubmission as removeSubmission,
  getVillaById,
  updateBookingRequest,
  updateDestination as patchDestination,
  updateVilla as patchVilla,
  updateVillaSubmission as patchSubmission,
  type DestinationInput,
  type VillaInput,
} from "@/lib/supabase/queries";
import { BookingRequest, VillaSubmissionStatus } from "@/types";

export type ActionResult = { success: boolean; error?: string };

/**
 * Every mutation below re-verifies admin status here rather than trusting
 * src/proxy.ts.
 *
 * Server Actions are POSTs to whichever route rendered the form, so a proxy
 * matcher change — or moving a form to a route outside /admin — would
 * silently drop that protection. Next's own docs call this out. RLS in
 * Postgres is the third layer; it rejects these writes for non-admins even if
 * both app-level checks were removed.
 */
async function requireAdmin(): Promise<
  { client: SupabaseClient; error?: undefined } | { client?: undefined; error: string }
> {
  const client = await createClient();

  if (!(await isAdmin(client))) {
    return { error: "Not authorized. Sign in as an admin and try again." };
  }

  return { client };
}

function failure(error: unknown, fallback: string): ActionResult {
  return {
    success: false,
    error: error instanceof Error ? error.message : fallback,
  };
}

/** Refreshes every admin screen that could be showing the mutated row. */
function revalidateVillas(id?: string) {
  revalidatePath("/admin");
  revalidatePath("/admin/villas");
  if (id) revalidatePath(`/admin/villas/${id}/edit`);
}

// ---------------------------------------------------------------------------
// Villas
// ---------------------------------------------------------------------------

export interface VillaFormValues {
  name: string;
  slug: string;
  destination_id: string;
  location: string;
  description: string;
  price_per_night: number;
  weekend_price?: number;
  seasonal_price?: number;
  max_guests: number;
  bedrooms: number;
  bathrooms: number;
  beds: number;
  amenities: string[];
  full_amenities: string[];
  /** Public URLs — images are uploaded to Storage client-side before submit. */
  images: string[];
  owner_name: string;
  owner_whatsapp: string;
  is_active: boolean;
}

function toVillaInput(values: VillaFormValues): VillaInput {
  return {
    name: values.name,
    slug: values.slug,
    destination_id: values.destination_id,
    description: values.description,
    location: values.location,
    price_per_night: values.price_per_night,
    weekend_price: values.weekend_price,
    seasonal_price: values.seasonal_price,
    max_guests: values.max_guests,
    bedrooms: values.bedrooms,
    bathrooms: values.bathrooms,
    beds: values.beds,
    amenities: values.amenities,
    full_amenities: values.full_amenities,
    images: values.images,
    owner_name: values.owner_name,
    owner_whatsapp: values.owner_whatsapp,
    is_active: values.is_active,
  };
}

export async function createVilla(
  values: VillaFormValues
): Promise<ActionResult> {
  const { client, error } = await requireAdmin();
  if (!client) return { success: false, error };

  try {
    await insertVilla(client, toVillaInput(values));
    revalidateVillas();
    return { success: true };
  } catch (err) {
    return failure(err, "Couldn't create the villa.");
  }
}

export async function updateVilla(
  id: string,
  values: VillaFormValues
): Promise<ActionResult> {
  const { client, error } = await requireAdmin();
  if (!client) return { success: false, error };

  try {
    // Images the admin removed in this edit are dropped from Storage so the
    // bucket doesn't accumulate orphans. Read the old list first — after the
    // update there's no record of what was there.
    const existing = await getVillaById(client, id);
    const removed = (existing?.images ?? []).filter(
      (url) => !values.images.includes(url)
    );

    await patchVilla(client, id, toVillaInput(values));

    if (removed.length > 0) {
      await deleteVillaImagesByUrl(client, removed);
    }

    revalidateVillas(id);
    return { success: true };
  } catch (err) {
    return failure(err, "Couldn't save the villa.");
  }
}

export async function deleteVilla(id: string): Promise<ActionResult> {
  const { client, error } = await requireAdmin();
  if (!client) return { success: false, error };

  try {
    const villa = await getVillaById(client, id);

    await removeVilla(client, id);

    if (villa?.images.length) {
      await deleteVillaImagesByUrl(client, villa.images);
    }

    revalidateVillas();
    return { success: true };
  } catch (err) {
    return failure(err, "Couldn't delete the villa.");
  }
}

export async function toggleVillaActive(
  id: string,
  isActive: boolean
): Promise<ActionResult> {
  const { client, error } = await requireAdmin();
  if (!client) return { success: false, error };

  try {
    await patchVilla(client, id, { is_active: isActive });
    revalidateVillas(id);
    return { success: true };
  } catch (err) {
    return failure(err, "Couldn't update the villa's status.");
  }
}

// ---------------------------------------------------------------------------
// Bookings
// ---------------------------------------------------------------------------

function revalidateBookings(id?: string) {
  revalidatePath("/admin");
  revalidatePath("/admin/bookings");
  if (id) revalidatePath(`/admin/bookings/${id}`);
}

export async function updateBookingStatus(
  id: string,
  status: BookingRequest["status"]
): Promise<ActionResult> {
  const { client, error } = await requireAdmin();
  if (!client) return { success: false, error };

  try {
    await updateBookingRequest(client, id, { status });
    revalidateBookings(id);
    return { success: true };
  } catch (err) {
    return failure(err, "Couldn't update the booking status.");
  }
}

export async function updateBookingNotes(
  id: string,
  notes: string
): Promise<ActionResult> {
  const { client, error } = await requireAdmin();
  if (!client) return { success: false, error };

  try {
    await updateBookingRequest(client, id, { admin_notes: notes });
    revalidateBookings(id);
    return { success: true };
  } catch (err) {
    return failure(err, "Couldn't save the notes.");
  }
}

export async function deleteBooking(id: string): Promise<ActionResult> {
  const { client, error } = await requireAdmin();
  if (!client) return { success: false, error };

  try {
    await deleteBookingRequest(client, id);
    revalidateBookings();
    return { success: true };
  } catch (err) {
    return failure(err, "Couldn't delete the booking request.");
  }
}

// ---------------------------------------------------------------------------
// Destinations
// ---------------------------------------------------------------------------

export interface DestinationFormValues {
  name: string;
  slug: string;
  image_url: string;
  meta_title?: string;
  meta_description?: string;
}

function toDestinationInput(
  values: DestinationFormValues
): DestinationInput {
  return {
    name: values.name,
    slug: values.slug,
    image_url: values.image_url,
    meta_title: values.meta_title,
    meta_description: values.meta_description,
  };
}

function revalidateDestinations() {
  revalidatePath("/admin");
  revalidatePath("/admin/destinations");
  // Villa screens render the destination name and the villa form's picker.
  revalidatePath("/admin/villas");
}

export async function createDestination(
  values: DestinationFormValues
): Promise<ActionResult> {
  const { client, error } = await requireAdmin();
  if (!client) return { success: false, error };

  try {
    await insertDestination(client, toDestinationInput(values));
    revalidateDestinations();
    return { success: true };
  } catch (err) {
    return failure(err, "Couldn't add the destination.");
  }
}

export async function updateDestination(
  id: string,
  values: DestinationFormValues
): Promise<ActionResult> {
  const { client, error } = await requireAdmin();
  if (!client) return { success: false, error };

  try {
    await patchDestination(client, id, toDestinationInput(values));
    revalidateDestinations();
    return { success: true };
  } catch (err) {
    return failure(err, "Couldn't save the destination.");
  }
}

export async function deleteDestination(id: string): Promise<ActionResult> {
  const { client, error } = await requireAdmin();
  if (!client) return { success: false, error };

  try {
    // villas.destination_id is ON DELETE SET NULL, so Postgres would happily
    // orphan every villa in this destination. Refuse instead.
    const villaCount = await countVillasInDestination(client, id);

    if (villaCount > 0) {
      return {
        success: false,
        error: `${villaCount} ${
          villaCount === 1 ? "villa is" : "villas are"
        } still in this destination. Move or delete them first.`,
      };
    }

    await removeDestination(client, id);
    revalidateDestinations();
    return { success: true };
  } catch (err) {
    return failure(err, "Couldn't delete the destination.");
  }
}

// ---------------------------------------------------------------------------
// Villa submissions
//
// Owners submit through the public /list-your-villa form, which is the only
// unauthenticated write in the app. Everything past that point — reading a
// submission, changing its status, deleting it — is admin-only, enforced both
// here and by RLS.
// ---------------------------------------------------------------------------

function revalidateSubmissions(id?: string) {
  revalidatePath("/admin");
  revalidatePath("/admin/submissions");
  if (id) revalidatePath(`/admin/submissions/${id}`);
}

export async function updateSubmissionStatus(
  id: string,
  status: VillaSubmissionStatus
): Promise<ActionResult> {
  const { client, error } = await requireAdmin();
  if (!client) return { success: false, error };

  try {
    await patchSubmission(client, id, { status });
    revalidateSubmissions(id);
    return { success: true };
  } catch (err) {
    return failure(err, "Couldn't update the submission status.");
  }
}

export async function updateSubmissionNotes(
  id: string,
  notes: string
): Promise<ActionResult> {
  const { client, error } = await requireAdmin();
  if (!client) return { success: false, error };

  try {
    await patchSubmission(client, id, { admin_notes: notes });
    revalidateSubmissions(id);
    return { success: true };
  } catch (err) {
    return failure(err, "Couldn't save the notes.");
  }
}

export async function deleteSubmission(id: string): Promise<ActionResult> {
  const { client, error } = await requireAdmin();
  if (!client) return { success: false, error };

  try {
    await removeSubmission(client, id);
    revalidateSubmissions();
    return { success: true };
  } catch (err) {
    return failure(err, "Couldn't delete the submission.");
  }
}

// ---------------------------------------------------------------------------
// Session
// ---------------------------------------------------------------------------

/** Clears the session cookies and returns to the login page. */
export async function signOutAction(): Promise<never> {
  const client = await createClient();
  return signOut(client);
}
