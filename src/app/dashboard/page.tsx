import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import BookingStatusBadge from "@/components/shared/BookingStatusBadge";
import SavedVillasGrid from "@/components/dashboard/SavedVillasGrid";
import DashboardProfile from "@/components/dashboard/DashboardProfile";
import { createClient } from "@/lib/supabase/server";
import {
  getBookingRequestsForCurrentUser,
  getProfile,
  getSavedVillas,
} from "@/lib/supabase/queries";
import { BookingRequestWithVilla } from "@/types";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Your account | StayVilla",
  description: "Your booking requests, saved villas, and profile.",
  robots: { index: false, follow: false },
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function BookingRow({ booking }: { booking: BookingRequestWithVilla }) {
  return (
    <li className="flex items-center gap-4 px-5 py-4">
      <div className="relative h-16 w-20 shrink-0 rounded-xl overflow-hidden bg-sandstone">
        {booking.villa_image && (
          <Image
            src={booking.villa_image}
            alt={booking.villa_name}
            fill
            sizes="80px"
            className="object-cover"
          />
        )}
      </div>

      <div className="min-w-0 flex-1">
        {booking.villa_slug ? (
          <Link
            href={`/villas/${booking.villa_slug}`}
            className="cursor-pointer text-sm text-charcoal hover:text-forest transition-colors duration-200 truncate block"
          >
            {booking.villa_name}
          </Link>
        ) : (
          <p className="text-sm text-charcoal truncate">{booking.villa_name}</p>
        )}
        <p className="mt-0.5 text-xs text-slate truncate">
          {formatDate(booking.check_in)} – {formatDate(booking.check_out)} ·{" "}
          {booking.guests} {booking.guests === 1 ? "guest" : "guests"}
        </p>
        <p className="mt-1 text-sm text-charcoal">
          ₹{booking.total_price.toLocaleString("en-IN")}
        </p>
      </div>

      <div className="shrink-0">
        <BookingStatusBadge status={booking.status} />
      </div>
    </li>
  );
}

export default async function DashboardPage() {
  const supabase = await createClient();

  // getUser() rather than getSession() — this decides whether the page renders
  // at all, so the token gets revalidated against the Auth server. Anonymous
  // sessions (created by the booking flow) don't count as signed in.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || user.is_anonymous) {
    redirect("/auth/login?redirect=%2Fdashboard");
  }

  const [profile, bookings, savedVillas] = await Promise.all([
    getProfile(supabase, user.id),
    getBookingRequestsForCurrentUser(supabase, user.id),
    getSavedVillas(supabase, user.id),
  ]);

  const displayName =
    profile?.full_name ??
    (typeof user.user_metadata?.full_name === "string"
      ? user.user_metadata.full_name
      : "") ??
    "";

  return (
    <>
      <Navbar transparent={false} />

      <main className="pt-18 min-h-screen">
        <div className="max-w-5xl mx-auto px-5 sm:px-8 py-10 sm:py-14">
          <h1 className="font-display font-normal text-4xl sm:text-5xl text-charcoal leading-[1.1]">
            {displayName ? `Hello, ${displayName.split(" ")[0]}` : "Your account"}
          </h1>
          <p className="mt-3 text-slate">
            Your booking requests, the villas you&apos;ve saved, and your
            details.
          </p>

          <nav className="mt-6 flex flex-wrap gap-2">
            {[
              { href: "#bookings", label: "My bookings" },
              { href: "#saved", label: "Saved villas" },
              { href: "#profile", label: "Profile" },
            ].map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="cursor-pointer rounded-xl border border-pebble bg-white px-4 py-2 text-sm text-charcoal transition-colors duration-200 hover:border-forest"
              >
                {item.label}
              </a>
            ))}
          </nav>

          <section id="bookings" className="scroll-mt-24 mt-12">
            <div className="flex items-baseline justify-between gap-4">
              <h2 className="font-display font-normal text-2xl sm:text-3xl text-charcoal">
                My bookings
              </h2>
              <span className="text-sm text-slate">
                {bookings.length}{" "}
                {bookings.length === 1 ? "request" : "requests"}
              </span>
            </div>

            {bookings.length === 0 ? (
              <div className="mt-5 rounded-2xl bg-white shadow-sm py-14 text-center">
                <p className="text-sm text-slate">
                  No booking requests yet.
                </p>
                <p className="mx-auto mt-2 max-w-sm text-xs text-slate leading-relaxed">
                  Requests you sent before creating this account aren&apos;t
                  linked to it — email us and we&apos;ll dig them out.
                </p>
                <Link
                  href="/villas"
                  className="cursor-pointer inline-block mt-5 rounded-xl bg-forest px-6 py-3 text-sm font-medium text-white transition-colors duration-200 hover:bg-forest-light"
                >
                  Find a villa
                </Link>
              </div>
            ) : (
              <ul className="mt-5 rounded-2xl bg-white shadow-sm divide-y divide-pebble overflow-hidden">
                {bookings.map((booking) => (
                  <BookingRow key={booking.id} booking={booking} />
                ))}
              </ul>
            )}
          </section>

          <section id="saved" className="scroll-mt-24 mt-14">
            <div className="flex items-baseline justify-between gap-4">
              <h2 className="font-display font-normal text-2xl sm:text-3xl text-charcoal">
                Saved villas
              </h2>
              <span className="text-sm text-slate">
                {savedVillas.length}{" "}
                {savedVillas.length === 1 ? "villa" : "villas"}
              </span>
            </div>

            <div className="mt-5">
              <SavedVillasGrid villas={savedVillas} />
            </div>
          </section>

          <section id="profile" className="scroll-mt-24 mt-14">
            <h2 className="font-display font-normal text-2xl sm:text-3xl text-charcoal">
              Profile
            </h2>
            <div className="mt-5">
              <DashboardProfile
                email={user.email ?? ""}
                initialName={displayName}
              />
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </>
  );
}
