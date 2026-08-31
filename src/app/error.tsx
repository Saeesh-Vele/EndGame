"use client";

import Link from "next/link";
import { useEffect } from "react";
import { AlertTriangle, RotateCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SITE_CONTACT } from "@/lib/site";

/**
 * Fallback for the public site.
 *
 * Every page here is `force-dynamic` and reads from Supabase at request time,
 * and the query helpers throw on error — so a database blip used to land the
 * visitor on Next's bare "Application error" screen with no way back. This
 * says what failed, offers the retry, and keeps the site's navigation.
 *
 * `error.message` is generic in production for Server Component errors, so we
 * deliberately don't render it. The digest is what matches our server logs.
 */
export default function PublicError({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  useEffect(() => {
    console.error("[page]", error);
  }, [error]);

  return (
    <main className="min-h-screen bg-linen flex items-center justify-center px-5 py-20">
      <div className="w-full max-w-md text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10 text-destructive">
          <AlertTriangle size={26} />
        </div>

        <h1 className="mt-5 font-display font-normal text-3xl text-charcoal">
          We couldn&apos;t load this page
        </h1>

        <p className="mt-3 text-sm text-slate leading-relaxed">
          Our villa database didn&apos;t answer in time. Nothing you did caused
          this, and nothing you were doing has been lost — try again, and if it
          keeps happening, email us at{" "}
          <a
            href={`mailto:${SITE_CONTACT.email}`}
            className="cursor-pointer text-forest hover:text-forest-light transition-colors duration-200"
          >
            {SITE_CONTACT.email}
          </a>
          .
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
            Quote this if you get in touch:{" "}
            <code className="text-charcoal">{error.digest}</code>
          </p>
        )}
      </div>
    </main>
  );
}
