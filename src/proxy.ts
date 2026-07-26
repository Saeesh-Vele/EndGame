import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// Next.js 16 renamed the `middleware` file convention to `proxy` (the
// middleware name is deprecated). Same execution model: this runs on the
// server before /admin/* routes render.
//
// This is the outer gate. It is *not* the only check — every Server Action in
// src/app/admin/actions.ts re-verifies admin status, and RLS in Postgres
// rejects non-admin writes regardless of what the app layer does.

const LOGIN_PATH = "/admin/login";

/** Carries any refreshed Supabase auth cookies onto a redirect response. */
function withAuthCookies(target: NextResponse, source: NextResponse) {
  for (const cookie of source.cookies.getAll()) {
    target.cookies.set(cookie);
  }
  return target;
}

function redirectTo(
  request: NextRequest,
  pathname: string,
  search: string,
  carrier: NextResponse
) {
  const url = request.nextUrl.clone();
  url.pathname = pathname;
  url.search = search;
  return withAuthCookies(NextResponse.redirect(url), carrier);
}

export async function proxy(request: NextRequest) {
  // Reassigned inside setAll — @supabase/ssr writes refreshed session cookies
  // by handing them back here, so the response must be rebuilt to carry them.
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          for (const { name, value } of cookiesToSet) {
            request.cookies.set(name, value);
          }
          response = NextResponse.next({ request });
          for (const { name, value, options } of cookiesToSet) {
            response.cookies.set(name, value, options);
          }
        },
      },
    }
  );

  const isLoginRoute = request.nextUrl.pathname === LOGIN_PATH;

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    if (isLoginRoute) return response;
    return redirectTo(request, LOGIN_PATH, "", response);
  }

  // One profiles read per request — the proxy runs once per navigation, so
  // this is already the per-request cache the rest of the request can't share
  // (proxy state is deliberately isolated from render code in Next 16).
  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .maybeSingle();

  const admin = profile?.is_admin === true;

  if (!admin) {
    // Signed in, but not an admin. Anonymous sessions land here too — the
    // public booking flow signs guests in anonymously, and they may later
    // wander to /admin. The login page stays reachable so they can sign in
    // with real admin credentials.
    if (isLoginRoute) return response;
    return redirectTo(request, LOGIN_PATH, "?error=access-denied", response);
  }

  // An admin who is already signed in has no business on the login page.
  if (isLoginRoute) {
    return redirectTo(request, "/admin", "", response);
  }

  return response;
}

export const config = {
  matcher: ["/admin/:path*"],
};
