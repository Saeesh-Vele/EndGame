"use server";

import { revalidatePath } from "next/cache";
import { after } from "next/server";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { isAdmin, signOut } from "@/lib/supabase/admin";
import {
  deleteVillaImagesByUrl,
  VillaImageCleanupError,
} from "@/lib/supabase/storage";
import { notifyBookingStatusChange } from "@/lib/notifications";
import { describeDbError, describeImageCleanupError } from "@/lib/errors";
import {
  countVillasInDestination,
  createDestination as insertDestination,
  createVilla as insertVilla,
  deleteBookingRequest,
  deleteDestination as removeDestination,
  deleteVilla as removeVilla,
  deleteVillaSubmission as removeSubmission,
  getVillaById,
  getVillaNotificationContext,
  updateBookingRequest,
  updateDestination as patchDestination,
  updateVilla as patchVilla,
  updateVillaSubmission as patchSubmission,
  type DestinationInput,
  type VillaInput,
} from "@/lib/supabase/queries";
import { BookingRequest, VillaSubmissionStatus } from "@/types";

/**
 * `warning` is for work that partly succeeded: the row was written, but a
 * follow-on step wasn't. Removing images from Storage is the only case today
 * — the villa is saved either way, so it must not read as a failed save, and
 * it must not read as a clean one either.
 */
export type ActionResult = {
  success: boolean;
  error?: string;
  warning?: string;
};

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

  // "Not authorized" covered two different problems. An expired cookie and an
  // account that was never an admin need different things done about them.
  const {
    data: { user },
  } = await client.auth.getUser();

  if (!user) {
    return {
      error:
        "Your admin session has expired, so nothing was saved. Sign in again and retry.",
    };
  }

  if (!(await isAdmin(client))) {
    return {
      error:
        "This account doesn't have admin access, so nothing was changed. Ask an existing admin to grant it.",
    };
  }

  return { client };
}

/**
 * Every catch below funnels through here.
 *
 * PostgrestError extends Error, so the previous `error.message` passthrough
 * put raw database text in the admin's toast — `duplicate key value violates
 * unique constraint "villas_slug_key"` instead of "that slug is taken".
 * describeDbError logs the full error and returns something actionable;
 * `byCode` is where a caller says what a given constraint means for it.
 */
function failure(
  error: unknown,
  fallback: string,
  options: { scope: string; byCode?: Record<string, string> }
): ActionResult {
  return {
    success: false,
    error: describeDbError(error, {
      fallback,
      scope: options.scope,
      byCode: options.byCode,
    }),
  };
}

/** Both villa writes hit the same unique index on `slug`. */
const VILLA_SLUG_TAKEN =
  "Another villa already uses that slug. Change it to something unique and save again.";

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
  owner_email: string;
  is_active: boolean;
}

/**
 * `is_active` is what the public queries filter on, so an active villa with no
 * images renders an empty card and an empty gallery. Drafts are allowed to have
 * none — the rule applies at the point of publishing.
 *
 * Enforced here as well as in the form because a Server Action is a public
 * endpoint: the client-side check is the good error message, this is the one
 * that actually holds.
 */
const NO_PHOTO_ERROR =
  "Add at least one photo before publishing this villa, or save it as a draft.";

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
    owner_email: values.owner_email,
    is_active: values.is_active,
  };
}

export async function createVilla(
  values: VillaFormValues
): Promise<ActionResult> {
  const { client, error } = await requireAdmin();
  if (!client) return { success: false, error };

  if (values.is_active && values.images.length === 0) {
    return { success: false, error: NO_PHOTO_ERROR };
  }

  try {
    await insertVilla(client, toVillaInput(values));
    revalidateVillas();
    return { success: true };
  } catch (err) {
    return failure(err, "Couldn't create the villa. Try again in a moment.", {
      scope: "admin:villa-create",
      byCode: {
        "23505": VILLA_SLUG_TAKEN,
        "23503":
          "That destination no longer exists. Pick another one and save again.",
      },
    });
  }
}

export async function updateVilla(
  id: string,
  values: VillaFormValues
): Promise<ActionResult> {
  const { client, error } = await requireAdmin();
  if (!client) return { success: false, error };

  if (values.is_active && values.images.length === 0) {
    return { success: false, error: NO_PHOTO_ERROR };
  }

  try {
    // Images the admin removed in this edit are dropped from Storage so the
    // bucket doesn't accumulate orphans. Read the old list first — after the
    // update there's no record of what was there.
    const existing = await getVillaById(client, id);
    const removed = (existing?.images ?? []).filter(
      (url) => !values.images.includes(url)
    );

    await patchVilla(client, id, toVillaInput(values));

    // The villa is saved at this point. A cleanup failure leaves orphaned
    // objects in the bucket, which is worth saying — but it can't turn a
    // completed save into an error, so it comes back as a warning.
    let warning: string | undefined;

    if (removed.length > 0) {
      try {
        await deleteVillaImagesByUrl(client, removed);
      } catch (cleanupError) {
        if (!(cleanupError instanceof VillaImageCleanupError)) throw cleanupError;
        warning = describeImageCleanupError(
          cleanupError.cause,
          cleanupError.count,
          "saved"
        );
      }
    }

    revalidateVillas(id);
    return { success: true, warning };
  } catch (err) {
    return failure(err, "Couldn't save the villa. Try again in a moment.", {
      scope: "admin:villa-update",
      byCode: {
        "23505": VILLA_SLUG_TAKEN,
        "23503":
          "That destination no longer exists. Pick another one and save again.",
        PGRST116:
          "This villa has been deleted — nothing was saved. Go back to the villa list.",
      },
    });
  }
}

export async function deleteVilla(id: string): Promise<ActionResult> {
  const { client, error } = await requireAdmin();
  if (!client) return { success: false, error };

  try {
    const villa = await getVillaById(client, id);

    await removeVilla(client, id);

    // Same as updateVilla: the row is gone whether or not its files went with
    // it, so a cleanup failure is reported alongside the success.
    let warning: string | undefined;

    if (villa?.images.length) {
      try {
        await deleteVillaImagesByUrl(client, villa.images);
      } catch (cleanupError) {
        if (!(cleanupError instanceof VillaImageCleanupError)) throw cleanupError;
        warning = describeImageCleanupError(
          cleanupError.cause,
          cleanupError.count,
          "deleted"
        );
      }
    }

    revalidateVillas();
    return { success: true, warning };
  } catch (err) {
    return failure(err, "Couldn't delete the villa. Try again in a moment.", {
      scope: "admin:villa-delete",
      byCode: {
        "23503":
          "This villa still has booking requests attached. Delete those first.",
      },
    });
  }
}

export async function toggleVillaActive(
  id: string,
  isActive: boolean
): Promise<ActionResult> {
  const { client, error } = await requireAdmin();
  if (!client) return { success: false, error };

  try {
    if (isActive) {
      const villa = await getVillaById(client, id);
      if (!villa?.images.length) {
        return {
          success: false,
          error:
            "This villa has no photos. Add one on its edit page before making it live.",
        };
      }
    }

    await patchVilla(client, id, { is_active: isActive });
    revalidateVillas(id);
    return { success: true };
  } catch (err) {
    return failure(err, "Couldn't update the villa's status. Try again in a moment.", {
      scope: "admin:villa-toggle",
    });
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
    const booking = await updateBookingRequest(client, id, { status });
    revalidateBookings(id);

    // Tell the guest, after the response. A mail failure must not make the
    // status change look like it didn't happen — it already has.
    after(async () => {
      try {
        const villa = await getVillaNotificationContext(
          client,
          booking.villa_id
        );
        if (!villa || !booking.guest_email) return;

        await notifyBookingStatusChange({
          status,
          guestEmail: booking.guest_email,
          villa,
          checkIn: booking.check_in,
          checkOut: booking.check_out,
        });
      } catch (mailError) {
        console.error("[email] booking status notification failed:", mailError);
      }
    });

    return { success: true };
  } catch (err) {
    return failure(err, "Couldn't update the booking status. Try again in a moment.", {
      scope: "admin:booking-status",
      byCode: {
        PGRST116:
          "This booking request no longer exists — it may have been deleted in another tab.",
        "23514":
          "That status isn't one this booking can move to. Reload the page and try again.",
      },
    });
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
    return failure(err, "Couldn't save the notes. Try again in a moment.", {
      scope: "admin:booking-notes",
      byCode: {
        "22001": "Those notes are longer than the field allows. Trim them and save again.",
        PGRST116: "This booking request no longer exists, so the notes weren't saved.",
      },
    });
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
    return failure(err, "Couldn't delete the booking request. Try again in a moment.", {
      scope: "admin:booking-delete",
    });
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
    return failure(err, "Couldn't add the destination. Try again in a moment.", {
      scope: "admin:destination-create",
      byCode: {
        "23505":
          "A destination with that name or slug already exists. Pick another.",
      },
    });
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
    return failure(err, "Couldn't save the destination. Try again in a moment.", {
      scope: "admin:destination-update",
      byCode: {
        "23505":
          "Another destination already uses that name or slug. Pick another.",
        PGRST116: "This destination has been deleted — nothing was saved.",
      },
    });
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
    return failure(err, "Couldn't delete the destination. Try again in a moment.", {
      scope: "admin:destination-delete",
      byCode: {
        "23503":
          "Something still references this destination. Move or delete those villas first.",
      },
    });
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
    return failure(err, "Couldn't update the submission status. Try again in a moment.", {
      scope: "admin:submission-status",
      byCode: {
        PGRST116:
          "This submission no longer exists — it may have been deleted in another tab.",
      },
    });
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
    return failure(err, "Couldn't save the notes. Try again in a moment.", {
      scope: "admin:submission-notes",
      byCode: {
        "22001": "Those notes are longer than the field allows. Trim them and save again.",
        PGRST116: "This submission no longer exists, so the notes weren't saved.",
      },
    });
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
    return failure(err, "Couldn't delete the submission. Try again in a moment.", {
      scope: "admin:submission-delete",
    });
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
