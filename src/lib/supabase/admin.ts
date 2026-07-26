import type { SupabaseClient, User } from "@supabase/supabase-js";
import { redirect } from "next/navigation";

export interface CurrentUser {
  user: User;
  isAdmin: boolean;
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
  // than an error — failing closed is the safe direction here.
  if (error) return { user, isAdmin: false };

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
  redirect("/admin/login");
}
