"use server";

import { createClient } from "@/lib/supabase/server";
import { createVillaSubmission } from "@/lib/supabase/queries";
import { ALL_AMENITIES } from "@/lib/amenities";

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

export type SubmissionResult = { success: boolean; error?: string };

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

  if (!ownerName || !ownerEmail || !ownerPhone || !villaName || !location) {
    return {
      success: false,
      error:
        "Please fill in your name, email, phone, the property name, and its location.",
    };
  }

  if (!EMAIL.test(ownerEmail)) {
    return { success: false, error: "That email address doesn't look right." };
  }

  // Digits only — enough to catch a typo without rejecting +91, spaces, or
  // dashes, which people type in every combination imaginable.
  const phoneDigits = ownerPhone.replace(/\D/g, "");
  if (phoneDigits.length < 8 || phoneDigits.length > 15) {
    return {
      success: false,
      error: "That phone number doesn't look right. Include the country code.",
    };
  }

  const bedrooms = optionalInt(values.bedrooms, 1, 50);
  const bathrooms = optionalInt(values.bathrooms, 1, 50);
  const maxGuests = optionalInt(values.maxGuests, 1, 200);

  if (!bedrooms.ok || !bathrooms.ok || !maxGuests.ok) {
    return {
      success: false,
      error: "Bedrooms, bathrooms, and guests must be sensible whole numbers.",
    };
  }

  const pricePerNight = optionalMoney(values.pricePerNight);
  const weekendPrice = optionalMoney(values.weekendPrice);

  if (!pricePerNight.ok || !weekendPrice.ok) {
    return { success: false, error: "Please enter prices as plain numbers." };
  }

  // Only amenities we actually render anywhere get stored.
  const allowed = new Set(ALL_AMENITIES);
  const amenities = Array.isArray(values.amenities)
    ? [...new Set(values.amenities.filter((a) => allowed.has(a)))]
    : [];

  try {
    const supabase = await createClient();

    await createVillaSubmission(supabase, {
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

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Couldn't send your submission. Please try again.",
    };
  }
}
