import Link from "next/link";
import { Compass, MapPin } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { SITE_CONTACT } from "@/lib/site";

/**
 * Same launch set as the footer, and hardcoded for the same reason: this page
 * renders for unmatched URLs and shouldn't need the database to say something
 * useful. An unknown ?destination is ignored by /villas.
 */
const DESTINATIONS = [
  { label: "Goa", href: "/villas?destination=goa" },
  { label: "Lonavala", href: "/villas?destination=lonavala" },
  { label: "Udaipur", href: "/villas?destination=udaipur" },
  { label: "Alibaug", href: "/villas?destination=alibaug" },
];

/**
 * Root 404. Next renders this both for `notFound()` thrown inside a segment —
 * a villa slug that no longer resolves — and for any URL the app doesn't match
 * at all, so it has to read as a normal page of the site rather than a dead
 * end: navbar, footer, and somewhere obvious to go next.
 *
 * A stale or mistyped villa link is the likeliest way to land here, so the
 * primary action is the listings rather than the home page.
 *
 * No `metadata` export here — Next only reads one from layout.js and page.js,
 * so the tab keeps the root layout's default title, and Next adds `noindex`
 * on its own for anything served with a 404.
 */
export default function NotFound() {
  return (
    <>
      <Navbar transparent={false} />

      <main className="pt-18">
        <div className="max-w-xl mx-auto px-5 sm:px-8 py-20 sm:py-28 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-forest/10 text-forest">
            <Compass size={26} />
          </div>

          <p className="mt-6 text-xs uppercase tracking-[0.18em] text-slate">
            Error 404
          </p>

          <h1 className="mt-3 font-display font-normal text-4xl sm:text-5xl text-charcoal leading-[1.1]">
            This one&apos;s off the map
          </h1>

          <p className="mt-5 text-base text-slate leading-relaxed">
            The page you were after has moved, or the villa it pointed to is no
            longer listed. Nothing is broken on your side — the collection is
            still right where you left it.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button size="lg" asChild>
              <Link href="/villas">Browse all villas</Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link href="/">Back to home</Link>
            </Button>
          </div>

          <div className="mt-14 border-t border-pebble pt-8">
            <p className="text-sm text-charcoal">Or start with a destination</p>
            <ul className="mt-4 flex flex-wrap items-center justify-center gap-2">
              {DESTINATIONS.map((destination) => (
                <li key={destination.href}>
                  <Link
                    href={destination.href}
                    className="inline-flex items-center gap-1.5 rounded-full border border-pebble bg-white px-4 py-2 text-sm text-charcoal transition-colors duration-200 hover:border-forest hover:text-forest focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest focus-visible:ring-offset-2"
                  >
                    <MapPin size={14} className="text-driftwood" />
                    {destination.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <p className="mt-10 text-sm text-slate leading-relaxed">
            Think this page should exist? Tell us at{" "}
            <a
              href={`mailto:${SITE_CONTACT.email}`}
              className="cursor-pointer text-forest hover:text-forest-light transition-colors duration-200"
            >
              {SITE_CONTACT.email}
            </a>
            .
          </p>
        </div>
      </main>

      <Footer />
    </>
  );
}
