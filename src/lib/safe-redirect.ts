/**
 * Sanitises a `?redirect=` value before it's used to navigate.
 *
 * Only same-origin paths are allowed. A value starting with `//` is
 * protocol-relative — the browser reads `//evil.example` as an absolute URL —
 * so it's rejected alongside anything that isn't rooted at `/`. Without this,
 * a link to /auth/login?redirect=//evil.example would bounce a freshly
 * signed-in user off the site.
 */
export function safeRedirect(
  value: string | null | undefined,
  fallback = "/"
): string {
  if (typeof value !== "string") return fallback;
  if (!value.startsWith("/")) return fallback;
  if (value.startsWith("//")) return fallback;
  // Backslashes are normalised to forward slashes by some browsers, which
  // turns /\evil.example into //evil.example.
  if (value.startsWith("/\\")) return fallback;
  return value;
}
