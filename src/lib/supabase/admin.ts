import type { SupabaseClient, User } from "@supabase/supabase-js";
import { redirect } from "next/navigation";

export interface CurrentUser {
  user: User;
  isAdmin: boolean;
  /**
   * True when the profiles lookup itself failed, so `isAdmin: false` means
   * "we couldn't check" rather than "this account isn't an admin". Callers
   * still fail closed — but they can say which of the two happened.
   */
  adminCheckFailed?: boolean;
}

/**
 * Reads the signed-in user and their admin flag in one go.
 *
 * Always resolves the user with `auth.getUser()` rather than `getSession()`
 * — getSession trusts whatever is in the cookie, getUser revalidates it
 * against the Auth server, which is what you want before making an
 * authorization decision.
 */
export async function getCurrentUser(
  client: SupabaseClient
): Promise<CurrentUser | null> {
  const {
    data: { user },
  } = await client.auth.getUser();

  if (!user) return null;

  const { data, error } = await client
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .maybeSingle();

  // A missing or unreadable profile row is treated as "not an admin" rather
  // than an error — failing closed is the safe direction here. The flag lets
  // the caller explain a transient failure instead of telling a real admin
  // their account has no access.
  if (error) {
    console.error("[admin] profile lookup failed:", error);
    return { user, isAdmin: false, adminCheckFailed: true };
  }

  return { user, isAdmin: data?.is_admin === true };
}

/** True only for a signed-in user whose profile has is_admin = true. */
export async function isAdmin(client: SupabaseClient): Promise<boolean> {
  const current = await getCurrentUser(client);
  return current?.isAdmin === true;
}

/**
 * Signs the current user out and sends them to the login page.
 *
 * Call from a Server Action or Route Handler — `redirect()` throws to unwind,
 * and the sign-out needs a request context where auth cookies can be cleared.
 */
export async function signOut(client: SupabaseClient): Promise<never> {
  await client.auth.signOut();
  // The notice is what confirms it worked — otherwise the admin just finds
  // themselves back at a login form, which is also what a failure looks like.
  redirect("/admin/login?notice=admin-signed-out");
}
