"use server";

import { after } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  createBookingRequest,
  getVillaBookingRates,
  getVillaNotificationContext,
  logWhatsappClick,
} from "@/lib/supabase/queries";
import { notifyNewBooking } from "@/lib/notifications";
import { describeAuthError, describeDbError } from "@/lib/errors";
import { quoteStay } from "@/lib/pricing";

/**
 * What the browser sends.
 *
 * Note what isn't here: a price. The total is computed on this side from the
 * villa's own rate columns (see `quoteStay`), so a tampered payload has
 * nothing to tamper with — an extra `totalPrice` property would simply never
 * be read. The card shows the same quote because it runs the same function
 * over the same rates, not because the two exchange a number.
 */
export interface SubmitBookingRequestInput {
  villaId: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  message?: string;
}

/** Which input a failure belongs to, so the form can mark it and focus it. */
export type BookingField = "name" | "email" | "phone" | "dates" | "guests";

export type BookingResult =
  | { success: true }
  | { success: false; error: string; field?: BookingField };

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
const UUID =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Longest stay we'll take through the form; anything more is a conversation. */
const MAX_NIGHTS = 90;

function clean(value: unknown, max: number): string {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

/**
 * The same rules the form applies, applied again here.
 *
 * A Server Action is a public endpoint — the client-side copy exists to give
 * fast, field-level feedback, this one is what actually holds. Each failure
 * names the field so the form can highlight it rather than showing one banner
 * for five different problems.
 */
function validate(
  input: SubmitBookingRequestInput
): { ok: true; values: SubmitBookingRequestInput } | { ok: false; error: string; field: BookingField } {
  const guestName = clean(input.guestName, 120);
  const guestEmail = clean(input.guestEmail, 200);
  const guestPhone = clean(input.guestPhone, 40);

  if (!guestName) {
    return { ok: false, field: "name", error: "Enter the name the booking is under." };
  }

  if (!guestEmail) {
    return { ok: false, field: "email", error: "Enter an email so the host can confirm." };
  }

  if (!EMAIL.test(guestEmail)) {
    return {
      ok: false,
      field: "email",
      error: "That email address doesn't look right — check for a typo.",
    };
  }

  const phoneDigits = guestPhone.replace(/\D/g, "");
  if (phoneDigits.length < 8 || phoneDigits.length > 15) {
    return {
      ok: false,
      field: "phone",
      error: "That phone number doesn't look right. Include the country code.",
    };
  }

  if (!ISO_DATE.test(input.checkIn) || !ISO_DATE.test(input.checkOut)) {
    return { ok: false, field: "dates", error: "Pick a check-in and a check-out date." };
  }

  if (input.checkIn < todayIso()) {
    return { ok: false, field: "dates", error: "Check-in can't be in the past." };
  }

  const nights = Math.round(
    (new Date(input.checkOut).getTime() - new Date(input.checkIn).getTime()) /
      86_400_000
  );

  if (!Number.isFinite(nights) || nights <= 0) {
    return {
      ok: false,
      field: "dates",
      error: "Check-out has to be at least one night after check-in.",
    };
  }

  if (nights > MAX_NIGHTS) {
    return {
      ok: false,
      field: "dates",
      error: `Stays over ${MAX_NIGHTS} nights are arranged directly — message the host on WhatsApp.`,
    };
  }

  if (!Number.isInteger(input.guests) || input.guests < 1 || input.guests > 200) {
    return { ok: false, field: "guests", error: "Choose how many guests are staying." };
  }

  if (!UUID.test(input.villaId)) {
    return {
      ok: false,
      field: "dates",
      error: "We couldn't tell which villa this request is for. Reload the page and try again.",
    };
  }

  return {
    ok: true,
    values: {
      ...input,
      guestName,
      guestEmail,
      guestPhone,
      message: clean(input.message, 2000) || undefined,
    },
  };
}

export async function submitBookingRequest(
  input: SubmitBookingRequestInput
): Promise<BookingResult> {
  const checked = validate(input);
  if (!checked.ok) {
    return { success: false, error: checked.error, field: checked.field };
  }
  const values = checked.values;

  const supabase = await createClient();

  // booking_requests only accepts inserts from an authenticated session
  // (see the RLS policy in the migration). Guests don't have accounts, so
  // sign them in anonymously first — this is transparent to them, there's
  // no login step in the booking flow.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    const { error: signInError } = await supabase.auth.signInAnonymously();
    if (signInError) {
      return {
        success: false,
        error: describeAuthError(signInError, {
          scope: "booking:anon-session",
          fallback:
            "We couldn't start your booking session. Reload the page and try again — your dates will need re-picking.",
        }),
      };
    }
  }

  try {
    // The price is decided here, from the villa's own rate columns. Whatever
    // the browser was showing — or a crafted payload was claiming — has no
    // bearing on what gets stored.
    const villa = await getVillaBookingRates(supabase, values.villaId);

    if (!villa) {
      return {
        success: false,
        error:
          "This villa isn't taking requests any more. Refresh the page to see its current status.",
      };
    }

    if (values.guests > villa.max_guests) {
      return {
        success: false,
        field: "guests",
        error: `${villa.name} sleeps ${villa.max_guests}. Reduce the guest count, or message the host about a second villa.`,
      };
    }

    const quote = quoteStay(values.checkIn, values.checkOut, villa);

    if (!quote) {
      return {
        success: false,
        field: "dates",
        error:
          "We couldn't price those dates. Reselect check-in and check-out and try again.",
      };
    }

    const booking = await createBookingRequest(supabase, {
      villa_id: values.villaId,
      guest_name: values.guestName,
      guest_email: values.guestEmail,
      guest_phone: values.guestPhone,
      check_in: values.checkIn,
      check_out: values.checkOut,
      guests: values.guests,
      total_price: quote.total,
      message: values.message,
    });

    // Notifications run after the response is flushed, so the guest sees
    // "request sent" without waiting on Resend. after() also means a slow or
    // failing mail provider can't turn a saved booking into an error — and
    // unlike a floating promise, the work is guaranteed to be awaited rather
    // than cut off when the function returns.
    after(async () => {
      try {
        const villa = await getVillaNotificationContext(
          supabase,
          values.villaId
        );
        if (!villa) return;

        await notifyNewBooking({
          bookingId: booking.id,
          villa,
          guestName: values.guestName,
          guestEmail: values.guestEmail,
          guestPhone: values.guestPhone,
          checkIn: values.checkIn,
          checkOut: values.checkOut,
          guests: values.guests,
          totalPrice: quote.total,
          message: values.message,
        });
      } catch (error) {
        console.error("[email] new booking notification failed:", error);
      }
    });

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: describeDbError(error, {
        scope: "booking:insert",
        byCode: {
          // The villa was unpublished or deleted while the form was open.
          "23503":
            "This villa isn't taking requests any more. Refresh the page to see its current status.",
          "23514":
            "Those dates weren't accepted. Check that check-out is after check-in and try again.",
          "42501":
            "We couldn't save your request — reload the page and send it again.",
          PGRST301:
            "We couldn't save your request — reload the page and send it again.",
        },
        fallback:
          "We couldn't send your request just now. Try again, or message the host on WhatsApp below.",
      }),
    };
  }
}

/**
 * Records that a guest opened the WhatsApp link on a villa page.
 *
 * Called fire-and-forget from BookingCard: the browser follows the wa.me link
 * regardless, so this must never block or surface an error. Insert is open to
 * everyone per RLS; reads are admin-only.
 */
export async function logWhatsappInquiry(villaId: string): Promise<void> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // Anonymous booking sessions have a real uid but aren't accounts. Storing
    // it would imply a user who can never be looked up, so leave it null.
    const userId = user && !user.is_anonymous ? user.id : undefined;

    await logWhatsappClick(supabase, villaId, userId);
  } catch (error) {
    console.error("[tracking] WhatsApp click not recorded:", error);
  }
}
