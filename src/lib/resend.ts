import { Resend } from "resend";

/**
 * Transactional email, via Resend.
 *
 * Server-only. RESEND_API_KEY has no NEXT_PUBLIC_ prefix, so importing this
 * module from a Client Component would fail to find a key rather than leaking
 * one — but every caller should still be a Server Action or Route Handler.
 */

const apiKey = process.env.RESEND_API_KEY;
const fromEmail = process.env.RESEND_FROM_EMAIL;

const DEFAULT_FROM = "StayVilla <onboarding@resend.dev>";

/**
 * Null when RESEND_API_KEY is unset. That's a supported state, not an error:
 * the app runs, and sends are skipped. Constructing a Resend instance with an
 * empty key would defer the failure to send time, once per email, which is
 * noisier and harder to read.
 */
export const resend = apiKey ? new Resend(apiKey) : null;

/** Warn once per process rather than on every attempted send. */
let warnedAboutMissingKey = false;

function warnOnce() {
  if (warnedAboutMissingKey) return;
  warnedAboutMissingKey = true;
  console.warn(
    "[email] RESEND_API_KEY is not set — outgoing email is disabled. " +
      "Set it in .env.local to enable notifications (see .env.local.example)."
  );
}

export interface SendEmailResult {
  sent: boolean;
  /** Present when a send was attempted and failed. */
  error?: string;
}

/**
 * Sends one email and never throws.
 *
 * Every caller runs inside a booking, submission, or status change that has
 * already succeeded — a bounced notification must not turn that into a failure
 * the user sees. Failures are logged and returned instead.
 */
export async function sendEmail(
  to: string | string[],
  subject: string,
  html: string
): Promise<SendEmailResult> {
  if (!resend) {
    warnOnce();
    console.info(`[email] skipped "${subject}" → ${formatTo(to)}`);
    return { sent: false, error: "RESEND_API_KEY is not configured" };
  }

  const recipients = (Array.isArray(to) ? to : [to])
    .map((address) => address.trim())
    .filter(Boolean);

  if (recipients.length === 0) {
    return { sent: false, error: "No recipients" };
  }

  try {
    const { data, error } = await resend.emails.send({
      from: fromEmail || DEFAULT_FROM,
      to: recipients,
      subject,
      html,
    });

    // Resend reports delivery problems in the response body rather than by
    // throwing, so this branch is the common failure path, not the catch.
    if (error) {
      console.error(
        `[email] failed "${subject}" → ${formatTo(recipients)}: ${error.message}`
      );
      return { sent: false, error: error.message };
    }

    console.info(
      `[email] sent "${subject}" → ${formatTo(recipients)}${
        data?.id ? ` (${data.id})` : ""
      }`
    );
    return { sent: true };
  } catch (thrown) {
    // Network failure, DNS, a Resend outage.
    const message =
      thrown instanceof Error ? thrown.message : "Unknown email error";
    console.error(
      `[email] threw sending "${subject}" → ${formatTo(recipients)}: ${message}`
    );
    return { sent: false, error: message };
  }
}

function formatTo(to: string | string[]) {
  return (Array.isArray(to) ? to : [to]).join(", ");
}
