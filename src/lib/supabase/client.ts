import { createBrowserClient } from "@supabase/ssr";

// These must be written as full static member expressions. Next.js inlines
// NEXT_PUBLIC_* vars into the client bundle by matching the literal text
// `process.env.NEXT_PUBLIC_FOO` at build time — there is no real process.env
// in the browser to look up at runtime, so a dynamic `process.env[name]`
// reads undefined no matter how the environment is configured.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

function requireEnv(value: string | undefined, name: string): string {
  if (!value) {
    throw new Error(
      `Missing ${name}. Copy .env.local.example to .env.local and fill in your Supabase project credentials.`
    );
  }
  return value;
}

/**
 * Creates a Supabase client for use in Client Components ("use client").
 * Call this once per component/hook that needs it — it's cheap to create.
 */
export function createClient() {
  return createBrowserClient(
    requireEnv(supabaseUrl, "NEXT_PUBLIC_SUPABASE_URL"),
    requireEnv(supabaseAnonKey, "NEXT_PUBLIC_SUPABASE_ANON_KEY")
  );
}
