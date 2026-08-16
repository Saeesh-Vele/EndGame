/**
 * Meta descriptions that come out of the database — a villa's prose
 * description, a destination's `meta_description` — are written by whoever
 * filled the admin form, so their length is not under the app's control.
 * Search engines truncate around 155–160 characters, and a hard `slice()`
 * leaves a word cut in half at the boundary.
 *
 * `MAX` is 155 rather than 160 so the result is always *under* 160 even after
 * the ellipsis is appended.
 */
const MAX = 155;

/**
 * Collapses whitespace and clamps `text` to at most `MAX` characters, cutting
 * at the last word boundary rather than mid-word. Returns the text unchanged
 * when it already fits.
 *
 * Falls back to `fallback` when there is no usable text, so a villa or
 * destination with an empty description still gets a description tag.
 */
export function truncateForMeta(
  text: string | null | undefined,
  fallback: string,
): string {
  const clean = (text ?? "").replace(/\s+/g, " ").trim();
  if (!clean) return fallback;
  if (clean.length <= MAX) return clean;

  const cut = clean.slice(0, MAX);
  const lastSpace = cut.lastIndexOf(" ");
  // A single word longer than MAX has no space to break on — keep the slice.
  const body = lastSpace > 0 ? cut.slice(0, lastSpace) : cut;

  return `${body.replace(/[,;:.\-–—]$/, "")}…`;
}
