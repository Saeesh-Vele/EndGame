"use server";

import { after } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createContactMessage } from "@/lib/supabase/queries";
import { notifyContactMessage } from "@/lib/notifications";

export interface ContactFormValues {
  name: string;
  email: string;
  message: string;
}

export type ContactResult = { success: boolean; error?: string };

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

  if (!name || !email || !message) {
    return {
      success: false,
      error: "Please fill in your name, email, and a message.",
    };
  }

  if (!EMAIL.test(email)) {
    return { success: false, error: "That email address doesn't look right." };
  }

  if (message.length < 10) {
    return {
      success: false,
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
      error:
        error instanceof Error
          ? error.message
          : "Couldn't send your message. Please try again.",
    };
  }
}
