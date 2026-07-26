/**
 * Contact details rendered on the About page, in the footer, and in the
 * legal pages.
 *
 * PLACEHOLDERS — replace these with the real inbox and support number before
 * launch. They're centralised here so that's one edit rather than a grep.
 */
export const SITE_CONTACT = {
  email: "hello@stayvilla.in",
  /** Display form, with spaces. */
  whatsapp: "+91 98765 43210",
  /** Digits only, for wa.me and tel: links. */
  whatsappDigits: "919876543210",
  /** Where the registered business sits — used in the legal pages. */
  jurisdiction: "Maharashtra, India",
} as const;

/** Also placeholders. Point these at the real accounts before launch. */
export const SITE_SOCIAL = {
  instagram: "https://instagram.com/stayvilla",
  x: "https://x.com/stayvilla",
} as const;

export const whatsappHref = (message?: string) =>
  `https://wa.me/${SITE_CONTACT.whatsappDigits}${
    message ? `?text=${encodeURIComponent(message)}` : ""
  }`;
