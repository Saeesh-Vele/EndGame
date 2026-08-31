"use server";

import { after } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createVillaSubmission } from "@/lib/supabase/queries";
import { notifyNewSubmission } from "@/lib/notifications";
import { ALL_AMENITIES } from "@/lib/amenities";
import { describeDbError } from "@/lib/errors";
import { SITE_CONTACT } from "@/lib/site";

export interface VillaSubmissionFormValues {
  ownerName: string;
  ownerEmail: string;
  ownerPhone: string;
  villaName: string;
  location: string;
  destination: string;
  bedrooms: string;
  bathrooms: string;
  maxGuests: string;
  description: string;
  amenities: string[];
  pricePerNight: string;
  weekendPrice: string;
  message: string;
}

/** Which input a rejection belongs to, so the form can mark and focus it. */
export type SubmissionField = keyof VillaSubmissionFormValues;

export type SubmissionResult =
  | { success: true }
  | { success: false; error: string; field?: SubmissionField };

// This action is reachable by anyone — it's the one write path in the app with
// no session behind it. RLS lets the insert through unconditionally, so
// everything that keeps junk out of the table is here. Every field is length-
// capped, every number range-checked, and amenities are matched against the
// canonical list rather than stored as given.

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const LIMITS = {
  ownerName: 120,
  ownerEmail: 200,
  ownerPhone: 40,
  villaName: 160,
  location: 160,
  destination: 120,
  description: 4000,
  message: 2000,
} as const;

function clean(value: unknown, max: number): string {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

/** Parses an optional integer field, returning undefined for blank/invalid. */
function optionalInt(value: string, min: number, max: number) {
  const trimmed = value.trim();
  if (!trimmed) return { ok: true as const, value: undefined };

  const parsed = Number.parseInt(trimmed, 10);
  if (!Number.isFinite(parsed) || parsed < min || parsed > max) {
    return { ok: false as const };
  }
  return { ok: true as const, value: parsed };
}

function optionalMoney(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return { ok: true as const, value: undefined };

  const parsed = Number.parseFloat(trimmed);
  if (!Number.isFinite(parsed) || parsed < 0 || parsed > 10_000_000) {
    return { ok: false as const };
  }
  // Two decimals to match numeric(10, 2).
  return { ok: true as const, value: Math.round(parsed * 100) / 100 };
}

export async function submitVillaListing(
  values: VillaSubmissionFormValues
): Promise<SubmissionResult> {
  const ownerName = clean(values.ownerName, LIMITS.ownerName);
  const ownerEmail = clean(values.ownerEmail, LIMITS.ownerEmail);
  const ownerPhone = clean(values.ownerPhone, LIMITS.ownerPhone);
  const villaName = clean(values.villaName, LIMITS.villaName);
  const location = clean(values.location, LIMITS.location);

  // One rejection per field. This form is long enough that a combined
  // "fill in your name, email, phone, property name and location" leaves the
  // owner scanning five inputs for the one that's empty.
  if (!ownerName) {
    return { success: false, field: "ownerName", error: "Tell us who to talk to." };
  }

  if (!ownerEmail) {
    return {
      success: false,
      field: "ownerEmail",
      error: "We need an email address to send the review to.",
    };
  }

  if (!EMAIL.test(ownerEmail)) {
    return {
      success: false,
      field: "ownerEmail",
      error: "That email address doesn't look right — check for a typo.",
    };
  }

  if (!ownerPhone) {
    return {
      success: false,
      field: "ownerPhone",
      error: "Add a WhatsApp number — it's how we arrange the property visit.",
    };
  }

  // Digits only — enough to catch a typo without rejecting +91, spaces, or
  // dashes, which people type in every combination imaginable.
  const phoneDigits = ownerPhone.replace(/\D/g, "");
  if (phoneDigits.length < 8 || phoneDigits.length > 15) {
    return {
      success: false,
      field: "ownerPhone",
      error: "That phone number doesn't look right. Include the country code.",
    };
  }

  if (!villaName) {
    return {
      success: false,
      field: "villaName",
      error: "What's the property called? A working name is fine.",
    };
  }

  if (!location) {
    return {
      success: false,
      field: "location",
      error: "Where is it? A city or area is enough.",
    };
  }

  const bedrooms = optionalInt(values.bedrooms, 1, 50);
  if (!bedrooms.ok) {
    return {
      success: false,
      field: "bedrooms",
      error: "Bedrooms has to be a whole number between 1 and 50.",
    };
  }

  const bathrooms = optionalInt(values.bathrooms, 1, 50);
  if (!bathrooms.ok) {
    return {
      success: false,
      field: "bathrooms",
      error: "Bathrooms has to be a whole number between 1 and 50.",
    };
  }

  const maxGuests = optionalInt(values.maxGuests, 1, 200);
  if (!maxGuests.ok) {
    return {
      success: false,
      field: "maxGuests",
      error: "Maximum guests has to be a whole number between 1 and 200.",
    };
  }

  const pricePerNight = optionalMoney(values.pricePerNight);
  if (!pricePerNight.ok) {
    return {
      success: false,
      field: "pricePerNight",
      error: "Enter the nightly price as plain digits — no ₹ sign or commas.",
    };
  }

  const weekendPrice = optionalMoney(values.weekendPrice);
  if (!weekendPrice.ok) {
    return {
      success: false,
      field: "weekendPrice",
      error: "Enter the weekend price as plain digits — no ₹ sign or commas.",
    };
  }

  // Only amenities we actually render anywhere get stored.
  const allowed = new Set(ALL_AMENITIES);
  const amenities = Array.isArray(values.amenities)
    ? [...new Set(values.amenities.filter((a) => allowed.has(a)))]
    : [];

  try {
    const supabase = await createClient();

    const submissionId = await createVillaSubmission(supabase, {
      owner_name: ownerName,
      owner_email: ownerEmail,
      owner_phone: ownerPhone,
      villa_name: villaName,
      location,
      destination: clean(values.destination, LIMITS.destination) || undefined,
      bedrooms: bedrooms.value,
      bathrooms: bathrooms.value,
      max_guests: maxGuests.value,
      description: clean(values.description, LIMITS.description) || undefined,
      amenities,
      price_per_night: pricePerNight.value,
      weekend_price: weekendPrice.value,
      message: clean(values.message, LIMITS.message) || undefined,
    });

    // Admin only — the owner already sees a confirmation in the UI, so there's
    // no acknowledgement email to send them. Runs after the response so a mail
    // failure can't discard a submission that's already saved.
    after(async () => {
      try {
        await notifyNewSubmission({
          submissionId,
          villaName,
          ownerName,
          ownerEmail,
          ownerPhone,
          location,
          bedrooms: bedrooms.value,
          maxGuests: maxGuests.value,
          pricePerNight: pricePerNight.value,
        });
      } catch (mailError) {
        console.error("[email] new submission notification failed:", mailError);
      }
    });

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: describeDbError(error, {
        scope: "submission:insert",
        byCode: {
          "22001":
            "One of these entries is longer than we can store — the description most likely. Trim it and submit again.",
        },
        fallback: `Couldn't send your submission just now. Try again in a moment, or email the details to ${SITE_CONTACT.email}.`,
      }),
    };
  }
}
