"use server";

import { after } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createContactMessage } from "@/lib/supabase/queries";
import { notifyContactMessage } from "@/lib/notifications";
import { describeDbError } from "@/lib/errors";
import { SITE_CONTACT } from "@/lib/site";

export interface ContactFormValues {
  name: string;
  email: string;
  message: string;
}

/** Which input a rejection belongs to, so the form can mark and focus it. */
export type ContactField = keyof ContactFormValues;

export type ContactResult =
  | { success: true }
  | { success: false; error: string; field?: ContactField };

// Reachable by anyone, like the villa submission form. RLS lets the insert
// through unconditionally, so every constraint on what lands in the table is
// here: required fields, a plausible email, and hard length caps.

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const LIMITS = { name: 120, email: 200, message: 4000 } as const;

function clean(value: unknown, max: number): string {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

export async function submitContactMessage(
  values: ContactFormValues
): Promise<ContactResult> {
  const name = clean(values.name, LIMITS.name);
  const email = clean(values.email, LIMITS.email);
  const message = clean(values.message, LIMITS.message);

  // One failure per field, each naming what that field needs — a single
  // "please fill in your name, email and a message" makes the sender re-read
  // three inputs to find the one that's actually wrong.
  if (!name) {
    return { success: false, field: "name", error: "Tell us who to reply to." };
  }

  if (!email) {
    return {
      success: false,
      field: "email",
      error: "We need an email address to reply to.",
    };
  }

  if (!EMAIL.test(email)) {
    return {
      success: false,
      field: "email",
      error: "That email address doesn't look right — check for a typo.",
    };
  }

  if (!message) {
    return {
      success: false,
      field: "message",
      error: "Add a message — tell us what you're looking for.",
    };
  }

  if (message.length < 10) {
    return {
      success: false,
      field: "message",
      error: "Could you add a little more detail? At least a sentence.",
    };
  }

  try {
    const supabase = await createClient();
    await createContactMessage(supabase, { name, email, message });

    // After the response: the message is already stored, so a mail failure
    // shouldn't tell the sender their message didn't go through.
    after(async () => {
      try {
        await notifyContactMessage({ name, email, message });
      } catch (mailError) {
        console.error("[email] contact notification failed:", mailError);
      }
    });

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: describeDbError(error, {
        scope: "contact:insert",
        byCode: {
          "22001":
            "That message is longer than we can store. Trim it and send again.",
        },
        fallback: `Couldn't send your message just now. Try again in a moment, or email us at ${SITE_CONTACT.email}.`,
      }),
    };
  }
}
