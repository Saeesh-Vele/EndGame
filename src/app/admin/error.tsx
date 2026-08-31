"use client";

import Link from "next/link";
import { useEffect } from "react";
import { AlertTriangle, RotateCw } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Fallback for every admin screen.
 *
 * Separate from the public one because the advice differs: an admin needs to
 * know whether their session died (in which case signing in again fixes it)
 * and that no write was applied, rather than being invited to browse villas.
 */
export default function AdminError({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  useEffect(() => {
    console.error("[admin:page]", error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] items-center justify-center px-5 py-16">
      <div className="w-full max-w-md text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10 text-destructive">
          <AlertTriangle size={26} />
        </div>

        <h1 className="mt-5 text-2xl font-medium text-charcoal">
          This screen couldn&apos;t load
        </h1>

        <p className="mt-3 text-sm text-slate leading-relaxed">
          The query behind it failed. Nothing was written, so no villa, booking,
          or submission has changed. Retry first — if it fails again, your admin
          session has most likely expired, so sign in and come back.
        </p>

        <div className="mt-7 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Button type="button" onClick={() => unstable_retry()}>
            <RotateCw size={16} />
            Try again
          </Button>
          <Button variant="outline" asChild>
            <Link href="/admin/login">Sign in again</Link>
          </Button>
        </div>

        {error.digest && (
          <p className="mt-6 text-xs text-slate">
            Server log reference:{" "}
            <code className="text-charcoal">{error.digest}</code>
          </p>
        )}
      </div>
    </div>
  );
}
