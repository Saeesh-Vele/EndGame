import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(
      `Missing ${name}. Copy .env.local.example to .env.local and fill in your Supabase project credentials.`
    );
  }
  return value;
}

/**
 * Creates a Supabase client for use in Server Components, Server Actions,
 * and Route Handlers. Must be created fresh per request (it reads the
 * request's cookies), so call this inside each function that needs it
 * rather than sharing a single instance.
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    requireEnv("NEXT_PUBLIC_SUPABASE_URL"),
    requireEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY"),
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            for (const { name, value, options } of cookiesToSet) {
              cookieStore.set(name, value, options);
            }
          } catch {
            // Called from a Server Component during render, where cookies
            // can't be set. Safe to ignore as long as middleware is
            // refreshing sessions on navigation.
          }
        },
      },
    }
  );
}
