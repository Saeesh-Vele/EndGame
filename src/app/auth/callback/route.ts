import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { safeRedirect } from "@/lib/safe-redirect";

/**
 * Where Supabase sends people after they click a confirmation or magic link.
 *
 * The link carries a one-time `code`; exchanging it here sets the session
 * cookies on our domain, which is the whole point of doing it in a Route
 * Handler rather than client-side.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const code = searchParams.get("code");
  const next = safeRedirect(searchParams.get("redirect"), "/dashboard");

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      return NextResponse.redirect(new URL(next, origin));
    }
  }

  // Expired link, already-used code, or a hand-crafted URL. Send them back to
  // sign in rather than leaving them on a blank route.
  return NextResponse.redirect(
    new URL("/auth/login?error=link-invalid", origin)
  );
}
