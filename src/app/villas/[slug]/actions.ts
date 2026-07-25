"use server";

import { createClient } from "@/lib/supabase/server";
import { createBookingRequest } from "@/lib/supabase/queries";

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
    await createBookingRequest(supabase, {
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
    return { success: true as const };
  } catch (error) {
    return {
      success: false as const,
      error: error instanceof Error ? error.message : "Something went wrong.",
    };
  }
}
