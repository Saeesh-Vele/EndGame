import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import LoginForm from "@/components/admin/LoginForm";

// Deliberately lives in the (admin-auth) route group rather than under
// src/app/admin/. Route groups don't affect the URL — this still serves
// /admin/login — but it keeps the login page outside src/app/admin/layout.tsx,
// which redirects everyone who isn't an admin to this page. Nesting it there
// would be a redirect loop.

export const metadata: Metadata = {
  title: "Admin Sign In",
  description: "Sign in to manage villas, bookings, and destinations.",
  robots: { index: false, follow: false },
};

const ERRORS: Record<string, string> = {
  "access-denied":
    "That account is valid but has no admin access. Ask an existing admin to grant it.",
  "check-failed":
    "We couldn't verify your admin access just now — the database didn't answer. Sign in again in a moment.",
};

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <div className="min-h-screen bg-linen flex flex-col">
      <div className="px-5 sm:px-8 py-6">
        <Link
          href="/"
          className="cursor-pointer inline-flex items-center gap-1.5 text-sm text-slate hover:text-charcoal transition-colors duration-200"
        >
          <ArrowLeft size={15} />
          Back to StayVilla
        </Link>
      </div>

      <div className="flex-1 flex items-start sm:items-center justify-center px-5 pb-16">
        <div className="w-full max-w-sm">
          <div className="text-center">
            <p className="text-xs uppercase tracking-[0.18em] text-slate">
              StayVilla
            </p>
            <h1 className="mt-2 font-display text-4xl text-charcoal">
              Admin sign in
            </h1>
            <p className="mt-2 text-sm text-slate">
              Manage villas, bookings, and destinations.
            </p>
          </div>

          <div className="mt-8 rounded-2xl border border-pebble bg-white p-6 sm:p-7">
            <LoginForm initialError={error ? ERRORS[error] : undefined} />
          </div>

          <p className="mt-5 text-center text-xs text-slate leading-relaxed">
            Admin accounts are created in Supabase — see{" "}
            <code className="text-charcoal">
              supabase/migrations/003_seed_admin.sql
            </code>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
