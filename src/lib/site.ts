/**
 * Contact details rendered on the About page, in the footer, and in the
 * legal pages.
 *
 * PLACEHOLDERS — replace these with the real inbox and support number before
 * launch. They're centralised here so that's one edit rather than a grep.
 */
/**
 * Display form, with spaces. The single source of truth for the support
 * number — the digits used in links are derived from it below.
 */
const WHATSAPP_DISPLAY = "+91 95615 92734";

export const SITE_CONTACT = {
  email: "saeeshvele@gmail.com",
  whatsapp: WHATSAPP_DISPLAY,
  /**
   * Digits only, for wa.me and tel: links. Derived rather than written out a
   * second time: these two were previously maintained by hand and had drifted
   * apart, so the site displayed one number and messaged a different one.
   */
  whatsappDigits: WHATSAPP_DISPLAY.replace(/\D/g, ""),
  /** Where the registered business sits — used in the legal pages. */
  jurisdiction: "Maharashtra, India",
} as const;

/**
 * Inbox that receives operational notifications: new booking requests, villa
 * submissions, and contact-form messages.
 *
 * Kept separate from SITE_CONTACT.email (the address published on the site) so
 * the two can diverge without one silently changing the other.
 */
export const ADMIN_EMAIL = SITE_CONTACT.email;

/**
 * Origin the site is served from, without a trailing slash.
 *
 * Emails are read outside the browser, so every link in them has to be
 * absolute — a relative href in an inbox goes nowhere. The env var is read as
 * a literal member expression so Next inlines it at build time.
 */
export function siteUrl(): string {
  return (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(
    /\/+$/,
    "",
  );
}

/** Turns an app path into a full URL for use in email templates. */
export function absoluteUrl(path: string): string {
  return `${siteUrl()}${path.startsWith("/") ? path : `/${path}`}`;
}

/** Also placeholders. Point these at the real accounts before launch. */
export const SITE_SOCIAL = {
  instagram: "https://instagram.com/stayvilla",
  x: "https://x.com/stayvilla",
} as const;

export const whatsappHref = (message?: string) =>
  `https://wa.me/${SITE_CONTACT.whatsappDigits}${message ? `?text=${encodeURIComponent(message)}` : ""
  }`;
