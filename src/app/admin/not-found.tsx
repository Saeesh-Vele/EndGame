"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowLeft, FileQuestion, LayoutDashboard } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * 404 for the admin area.
 *
 * Without this file, `notFound()` from a detail screen — a villa, booking, or
 * submission id that no longer resolves — falls through to the public
 * `app/not-found.tsx`, which drops the admin out of the shell and offers to
 * show them some villas. This boundary lives inside the admin segment, so
 * AdminShell (sidebar, mobile header, bottom nav) stays around the message and
 * the way back is the list the record belonged to.
 *
 * A client component on purpose: `not-found.tsx` takes no props, so the only
 * way to tell a missing booking from a missing submission is the pathname.
 */
const SECTIONS = [
  {
    prefix: "/admin/villas",
    record: "villa",
    listHref: "/admin/villas",
    listLabel: "Back to villas",
  },
  {
    prefix: "/admin/bookings",
    record: "booking request",
    listHref: "/admin/bookings",
    listLabel: "Back to bookings",
  },
  {
    prefix: "/admin/submissions",
    record: "submission",
    listHref: "/admin/submissions",
    listLabel: "Back to submissions",
  },
  {
    prefix: "/admin/destinations",
    record: "destination",
    listHref: "/admin/destinations",
    listLabel: "Back to destinations",
  },
] as const;

/** Anything outside the four sections — a bad id under a screen added later. */
const FALLBACK = {
  record: "record",
  listHref: "/admin",
  listLabel: "Back to dashboard",
} as const;

export default function AdminNotFound() {
  const pathname = usePathname();
  const section =
    SECTIONS.find((candidate) => pathname.startsWith(candidate.prefix)) ??
    FALLBACK;

  return (
    <div className="flex min-h-[60vh] items-center justify-center px-5 py-16">
      <div className="w-full max-w-md text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-charcoal/5 text-slate">
          <FileQuestion size={26} />
        </div>

        <h1 className="mt-5 text-2xl font-medium text-charcoal">
          This {section.record} doesn&apos;t exist
        </h1>

        <p className="mt-3 text-sm text-slate leading-relaxed">
          It was deleted, or the id in the URL is wrong. Nothing failed and
          nothing was changed — the {section.record} simply isn&apos;t in the
          database any more. If you reached this from a bookmark or an old
          email, the link is stale.
        </p>

        <div className="mt-7 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Button asChild>
            <Link href={section.listHref}>
              <ArrowLeft size={16} />
              {section.listLabel}
            </Link>
          </Button>
          {section.listHref !== "/admin" && (
            <Button variant="outline" asChild>
              <Link href="/admin">
                <LayoutDashboard size={16} />
                Dashboard
              </Link>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
