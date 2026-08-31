/**
 * Turns the errors our data layer throws into something a person can act on.
 *
 * Supabase's PostgrestError, AuthError, and StorageApiError all extend Error,
 * so the `error instanceof Error ? error.message : fallback` shape that used to
 * live in every Server Action put raw database text in front of guests —
 * `duplicate key value violates unique constraint "villas_slug_key"`, or
 * `new row violates row-level security policy for table "booking_requests"`.
 * Everything user-facing goes through here instead: the full error is logged
 * for us, and the caller decides the wording for the cases it can anticipate.
 */

/** Postgres/PostgREST/Storage error codes we can say something specific about. */
type CodeMap = Record<string, string>;

interface DescribeOptions {
  /** Shown when nothing more specific applies. Always write this one. */
  fallback: string;
  /** Per-code overrides — the caller knows which constraint means what. */
  byCode?: CodeMap;
  /** Prefix for the server log line, e.g. "booking" or "admin:villa". */
  scope?: string;
}

function codeOf(error: unknown): string {
  if (typeof error !== "object" || error === null) return "";

  const record = error as Record<string, unknown>;
  // PostgrestError/AuthError put it on `code`; StorageApiError uses
  // `statusCode` and carries an HTTP status string ("403", "413").
  const raw = record.code ?? record.statusCode ?? record.status;
  return typeof raw === "string" || typeof raw === "number" ? String(raw) : "";
}

function messageOf(error: unknown): string {
  return error instanceof Error
    ? error.message
    : typeof error === "string"
      ? error
      : "";
}

/**
 * True for the browser's "the request never left" errors. Worth its own
 * message: nothing the user typed is wrong, and retrying usually works.
 */
export function isNetworkError(error: unknown): boolean {
  const message = messageOf(error).toLowerCase();
  return (
    error instanceof TypeError ||
    codeOf(error) === "AuthRetryableFetchError" ||
    (error as { name?: string })?.name === "AuthRetryableFetchError" ||
    message.includes("failed to fetch") ||
    message.includes("networkerror") ||
    message.includes("network request failed") ||
    message.includes("load failed")
  );
}

const OFFLINE =
  "Couldn't reach StayVilla — check your internet connection and try again.";

/**
 * Generic-but-honest wording for the database conditions that reach a user.
 * Anything not listed falls through to the caller's `fallback`, which is why
 * every call site passes a sentence about what specifically failed.
 */
const DB_MESSAGES: CodeMap = {
  // unique_violation — callers override this with the field that clashed.
  "23505": "One of these values is already used by another record.",
  "23503": "Something this record points at no longer exists. Reload and try again.",
  "23502": "A required field came through empty. Fill everything in and try again.",
  "23514": "One of these values is outside the range we accept. Check the numbers and try again.",
  "22001": "One of these values is too long. Shorten it and try again.",
  "22003": "That number is too large for this field.",
  "22007": "That date isn't in a format we recognise.",
  "22P02": "One of these values isn't in a format we recognise.",
  // RLS / grants — in practice this is an expired or non-admin session.
  "42501": "Your session doesn't have permission to do that. Sign in again and retry.",
  PGRST301: "Your session has expired. Sign in again and retry.",
  PGRST116: "That record no longer exists — it may have been deleted in another tab.",
  "57014": "The database took too long to respond. Try again in a moment.",
  "40001": "Someone else changed this record at the same time. Reload and try again.",
};

export function describeDbError(
  error: unknown,
  options: DescribeOptions
): string {
  console.error(`[${options.scope ?? "db"}]`, error);

  if (isNetworkError(error)) return OFFLINE;

  const code = codeOf(error);
  return options.byCode?.[code] ?? DB_MESSAGES[code] ?? options.fallback;
}

/**
 * Supabase Auth errors.
 *
 * Deliberately keeps the vague wording for bad credentials — the sign-in form
 * must not become a way to test which email addresses have accounts.
 */
const AUTH_MESSAGES: CodeMap = {
  invalid_credentials: "Wrong email or password.",
  email_not_confirmed:
    "Confirm your email first — check your inbox for the link we sent.",
  user_already_exists:
    "An account already exists for that email. Sign in instead, or reset your password.",
  email_exists:
    "An account already exists for that email. Sign in instead, or reset your password.",
  weak_password:
    "That password is too easy to guess. Use at least 8 characters, mixing letters and numbers.",
  same_password: "That's already your current password. Pick a different one.",
  validation_failed: "That email address doesn't look right.",
  email_address_invalid: "That email address doesn't look right.",
  over_email_send_rate_limit:
    "Too many emails sent to that address just now. Wait a minute and try again.",
  over_request_rate_limit:
    "Too many attempts. Wait about a minute and try again.",
  signup_disabled: "New accounts are closed at the moment. Get in touch and we'll help.",
  session_not_found: "Your session has expired. Sign in again.",
  refresh_token_not_found: "Your session has expired. Sign in again.",
  user_not_found: "We couldn't find that account.",
  anonymous_provider_disabled:
    "We couldn't start a guest session. Reload the page and try again.",
};

export function describeAuthError(
  error: unknown,
  options: DescribeOptions
): string {
  console.error(`[${options.scope ?? "auth"}]`, error);

  if (isNetworkError(error)) return OFFLINE;

  const code = codeOf(error);
  if (options.byCode?.[code]) return options.byCode[code];
  if (AUTH_MESSAGES[code]) return AUTH_MESSAGES[code];

  // Older supabase-js releases (and a few endpoints still) return no `code`,
  // only prose. Match the handful we care about rather than echoing it.
  const message = messageOf(error).toLowerCase();
  if (message.includes("invalid login credentials")) {
    return AUTH_MESSAGES.invalid_credentials;
  }
  if (message.includes("already registered")) {
    return AUTH_MESSAGES.user_already_exists;
  }
  if (message.includes("email not confirmed")) {
    return AUTH_MESSAGES.email_not_confirmed;
  }
  if (message.includes("rate limit")) {
    return AUTH_MESSAGES.over_request_rate_limit;
  }
  if (message.includes("password should be")) {
    return AUTH_MESSAGES.weak_password;
  }

  return options.fallback;
}

/**
 * Failed deletes from the villa-images bucket.
 *
 * Phrased around the consequence the admin actually cares about: the row was
 * written, the files weren't removed, and the bucket now holds orphans.
 */
export function describeImageCleanupError(
  error: unknown,
  count: number,
  /** What did succeed, so the message can lead with it. */
  outcome: "saved" | "deleted"
): string {
  console.error("[storage] image cleanup failed:", error);

  const photos = count === 1 ? "1 photo" : `${count} photos`;
  const done = outcome === "saved" ? "Villa saved" : "Villa deleted";
  const retry =
    outcome === "saved"
      ? "Save the villa again to retry."
      : "The files are still in the bucket — remove them from Supabase Storage when you get a chance.";

  if (isNetworkError(error)) {
    return `${done}, but ${photos} couldn't be removed from storage — the connection dropped. ${retry}`;
  }

  switch (codeOf(error)) {
    case "401":
    case "403":
    case "Unauthorized":
    case "InvalidJWT":
      return `${done}, but ${photos} couldn't be removed from storage — your admin session expired. Sign in again, then ${
        outcome === "saved" ? "save once more" : "clear them from Storage"
      }.`;
    default:
      return `${done}, but ${photos} couldn't be removed from storage and are still taking up space. ${retry}`;
  }
}

/** Supabase Storage uploads — mostly size, type, and session problems. */
export function describeUploadError(error: unknown, fileName: string): string {
  console.error("[storage]", error);

  if (isNetworkError(error)) {
    return `${fileName} didn't upload — check your connection and try again.`;
  }

  switch (codeOf(error)) {
    case "413":
    case "PayloadTooLarge":
      return `${fileName} is too large for the storage bucket.`;
    case "401":
    case "403":
    case "Unauthorized":
    case "InvalidJWT":
      return `${fileName} wasn't uploaded — your admin session expired. Sign in again.`;
    case "409":
    case "Duplicate":
      return `${fileName} clashed with an existing file. Try uploading it again.`;
    case "415":
      return `${fileName} isn't an image format we can store. Use JPG, PNG, or WebP.`;
    default:
      return `${fileName} failed to upload. Try again, or pick a different file.`;
  }
}
