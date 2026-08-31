import type { SupabaseClient } from "@supabase/supabase-js";

export const VILLA_IMAGES_BUCKET = "villa-images";

const PUBLIC_URL_MARKER = `/storage/v1/object/public/${VILLA_IMAGES_BUCKET}/`;

/** CDN URL for an object in the villa-images bucket. */
export function getPublicUrl(client: SupabaseClient, path: string): string {
  return client.storage.from(VILLA_IMAGES_BUCKET).getPublicUrl(path).data
    .publicUrl;
}

function extensionOf(fileName: string): string {
  const ext = fileName.split(".").pop()?.toLowerCase();
  return ext && /^[a-z0-9]{2,5}$/.test(ext) ? ext : "jpg";
}

/**
 * Uploads one image and returns its public URL.
 *
 * Object names are randomly generated rather than derived from the original
 * filename — two villas both uploading "pool.jpg" must not collide, and user
 * supplied names don't belong in a URL path.
 *
 * Writes are gated by the storage policies in
 * supabase/migrations/002_storage_and_admin.sql, so this only succeeds for a
 * session whose profile has is_admin = true.
 */
export async function uploadVillaImage(
  client: SupabaseClient,
  file: File
): Promise<string> {
  const path = `${crypto.randomUUID()}.${extensionOf(file.name)}`;

  const { error } = await client.storage
    .from(VILLA_IMAGES_BUCKET)
    .upload(path, file, {
      cacheControl: "31536000",
      contentType: file.type || undefined,
      upsert: false,
    });

  if (error) throw error;

  return getPublicUrl(client, path);
}

/** Removes an object by its in-bucket path (not its URL). */
export async function deleteVillaImage(
  client: SupabaseClient,
  path: string
): Promise<void> {
  const { error } = await client.storage
    .from(VILLA_IMAGES_BUCKET)
    .remove([path]);

  if (error) throw error;
}

/**
 * Recovers the in-bucket path from a stored public URL.
 *
 * Villas store fully-qualified image URLs, and some of those are external
 * (the seed data points at Unsplash). Returns null for anything that isn't
 * ours, which is the caller's signal to leave it alone.
 */
export function storagePathFromUrl(url: string): string | null {
  const index = url.indexOf(PUBLIC_URL_MARKER);
  if (index === -1) return null;

  const path = url.slice(index + PUBLIC_URL_MARKER.length).split("?")[0];
  return path ? decodeURIComponent(path) : null;
}

/**
 * Thrown when objects that should have been removed are still in the bucket.
 *
 * Carries the paths so the failure can be logged precisely, and `count` so the
 * caller can phrase a message without re-deriving it. Separate from a plain
 * Error because callers treat it differently from a failed write: the villa
 * row has already been saved or deleted by the time this can throw, so it
 * degrades a success into a success-with-a-warning, never into a failure.
 */
export class VillaImageCleanupError extends Error {
  readonly paths: string[];
  readonly cause: unknown;

  constructor(paths: string[], cause: unknown) {
    super(
      `Failed to remove ${paths.length} object(s) from ${VILLA_IMAGES_BUCKET}: ${paths.join(", ")}`
    );
    this.name = "VillaImageCleanupError";
    this.paths = paths;
    this.cause = cause;
  }

  get count(): number {
    return this.paths.length;
  }
}

/**
 * Removes images that are no longer referenced by a villa.
 *
 * This used to swallow every storage failure, on the reasoning that an
 * orphaned object is a smaller problem than an edit that looks like it failed.
 * The orphan is still the smaller problem — but silence meant nobody ever
 * learned the bucket was accumulating them, and a failure here is usually an
 * expired admin session, which is worth telling the admin about. So it throws
 * VillaImageCleanupError and lets the caller decide; the callers in
 * src/app/admin/actions.ts turn it into a warning on an otherwise successful
 * result rather than reporting the save as failed.
 *
 * URLs that don't point at our bucket (the seed data links to Unsplash) are
 * skipped, not failed.
 */
export async function deleteVillaImagesByUrl(
  client: SupabaseClient,
  urls: string[]
): Promise<void> {
  const paths = urls
    .map(storagePathFromUrl)
    .filter((path): path is string => path !== null);

  if (paths.length === 0) return;

  let error: unknown;

  try {
    ({ error } = await client.storage.from(VILLA_IMAGES_BUCKET).remove(paths));
  } catch (thrown) {
    // A dropped connection rejects rather than returning an error.
    error = thrown;
  }

  if (error) {
    console.error(
      `[storage] could not remove ${paths.length} object(s) from ${VILLA_IMAGES_BUCKET}:`,
      { paths, urls, error }
    );
    throw new VillaImageCleanupError(paths, error);
  }
}
