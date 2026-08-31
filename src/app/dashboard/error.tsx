"use client";

import Link from "next/link";
import { useEffect } from "react";
import { AlertTriangle, RotateCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SITE_CONTACT } from "@/lib/site";

/**
 * The dashboard reads three things per request — profile, booking requests,
 * saved villas — and any of them throwing takes the whole page down. Its own
 * boundary so the message can be about the guest's own data rather than the
 * generic "couldn't load this page".
 */
export default function DashboardError({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  useEffect(() => {
    console.error("[dashboard]", error);
  }, [error]);

  return (
    <main className="min-h-screen bg-linen flex items-center justify-center px-5 py-20">
      <div className="w-full max-w-md text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10 text-destructive">
          <AlertTriangle size={26} />
        </div>

        <h1 className="mt-5 font-display font-normal text-3xl text-charcoal">
          We couldn&apos;t load your account
        </h1>

        <p className="mt-3 text-sm text-slate leading-relaxed">
          Your booking requests and saved villas are still there — we just
          couldn&apos;t fetch them this time. Try again, or write to{" "}
          <a
            href={`mailto:${SITE_CONTACT.email}`}
            className="cursor-pointer text-forest hover:text-forest-light transition-colors duration-200"
          >
            {SITE_CONTACT.email}
          </a>{" "}
          if it keeps happening.
        </p>

        <div className="mt-7 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Button type="button" size="lg" onClick={() => unstable_retry()}>
            <RotateCw size={16} />
            Try again
          </Button>
          <Button variant="outline" size="lg" asChild>
            <Link href="/villas">Browse villas</Link>
          </Button>
        </div>

        {error.digest && (
          <p className="mt-6 text-xs text-slate">
            Reference: <code className="text-charcoal">{error.digest}</code>
          </p>
        )}
      </div>
    </main>
  );
}
