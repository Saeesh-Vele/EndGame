"use server";

import { after } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  createBookingRequest,
  getVillaNotificationContext,
  logWhatsappClick,
} from "@/lib/supabase/queries";
import { notifyNewBooking } from "@/lib/notifications";

export interface SubmitBookingRequestInput {
  villaId: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  totalPrice: number;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  message?: string;
}

export async function submitBookingRequest(input: SubmitBookingRequestInput) {
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
      return { success: false as const, error: signInError.message };
    }
  }

  try {
    const booking = await createBookingRequest(supabase, {
      villa_id: input.villaId,
      guest_name: input.guestName,
      guest_email: input.guestEmail,
      guest_phone: input.guestPhone,
      check_in: input.checkIn,
      check_out: input.checkOut,
      guests: input.guests,
      total_price: input.totalPrice,
      message: input.message,
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
          input.villaId
        );
        if (!villa) return;

        await notifyNewBooking({
          bookingId: booking.id,
          villa,
          guestName: input.guestName,
          guestEmail: input.guestEmail,
          guestPhone: input.guestPhone,
          checkIn: input.checkIn,
          checkOut: input.checkOut,
          guests: input.guests,
          totalPrice: input.totalPrice,
          message: input.message,
        });
      } catch (error) {
        console.error("[email] new booking notification failed:", error);
      }
    });

    return { success: true as const };
  } catch (error) {
    return {
      success: false as const,
      error: error instanceof Error ? error.message : "Something went wrong.",
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
