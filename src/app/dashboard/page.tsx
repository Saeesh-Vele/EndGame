import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import { Calendar, Heart, User, Sparkles, CalendarX, ArrowRight, ShieldCheck } from "lucide-react";
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
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Your Account",
  description: "Manage your booking requests, saved villas, and personal details.",
  robots: { index: false, follow: false },
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function BookingCardRow({ booking }: { booking: BookingRequestWithVilla }) {
  return (
    <Card className="p-5 border border-pebble/80 bg-card shadow-xs rounded-2xl transition-all duration-200 hover:border-pebble">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="relative h-20 w-24 shrink-0 rounded-xl overflow-hidden bg-sandstone border border-pebble/40">
            {booking.villa_image ? (
              <Image
                src={booking.villa_image}
                alt={booking.villa_name}
                fill
                sizes="96px"
                quality={60}
                className="object-cover"
              />
            ) : (
              <div className="h-full w-full flex items-center justify-center text-slate text-xs">
                No image
              </div>
            )}
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              {booking.villa_slug ? (
                <Link
                  href={`/villas/${booking.villa_slug}`}
                  className="cursor-pointer font-semibold text-base text-charcoal hover:text-forest transition-colors duration-150 truncate"
                >
                  {booking.villa_name}
                </Link>
              ) : (
                <span className="font-semibold text-base text-charcoal truncate">
                  {booking.villa_name}
                </span>
              )}
            </div>
            <p className="mt-1 text-xs font-medium text-slate">
              {formatDate(booking.check_in)} – {formatDate(booking.check_out)} ·{" "}
              {booking.guests} {booking.guests === 1 ? "guest" : "guests"}
            </p>
            <p className="mt-2 text-sm font-bold text-charcoal">
              ₹{booking.total_price.toLocaleString("en-IN")}
            </p>
          </div>
        </div>

        <div className="flex sm:flex-col items-center sm:items-end justify-between gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-pebble/40">
          <BookingStatusBadge status={booking.status} />
          {booking.villa_slug && (
            <Button variant="ghost" size="sm" asChild className="text-xs text-forest hover:text-forest-light gap-1 p-0 h-auto">
              <Link href={`/villas/${booking.villa_slug}`}>
                View villa <ArrowRight size={13} />
              </Link>
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}

export default async function DashboardPage() {
  const supabase = await createClient();

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

  const firstName = displayName ? displayName.split(" ")[0] : "Guest";

  return (
    <>
      <Navbar transparent={false} />

      <main className="pt-18 min-h-screen bg-sandstone/30">
        <div className="max-w-6xl mx-auto px-5 sm:px-8 py-8 sm:py-12">
          {/* Executive Dashboard Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-pebble pb-8">
            <div>
              <span className="text-xs font-semibold uppercase tracking-widest text-slate">
                Guest Dashboard
              </span>
              <h1 className="font-display font-normal text-3xl sm:text-5xl text-charcoal mt-1">
                Welcome back, {firstName}
              </h1>
              <p className="mt-2 text-slate text-sm sm:text-base">
                Manage your stays, view booking status, and update account details.
              </p>
            </div>

            <Button size="lg" asChild className="self-start sm:self-auto font-medium shadow-xs">
              <Link href="/villas">Explore Villas</Link>
            </Button>
          </div>

          {/* Metric Overview Cards */}
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
            <Card className="p-5 border border-pebble/80 bg-card shadow-xs rounded-2xl flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate">
                  Booking Requests
                </p>
                <p className="text-3xl font-bold text-charcoal mt-1">
                  {bookings.length}
                </p>
                <p className="text-xs text-slate mt-1 font-medium">
                  {bookings.filter((b) => b.status === "pending").length} pending host review
                </p>
              </div>
              <div className="h-12 w-12 rounded-xl bg-forest/10 text-forest flex items-center justify-center shrink-0">
                <Calendar size={22} />
              </div>
            </Card>

            <Card className="p-5 border border-pebble/80 bg-card shadow-xs rounded-2xl flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate">
                  Saved Villas
                </p>
                <p className="text-3xl font-bold text-charcoal mt-1">
                  {savedVillas.length}
                </p>
                <p className="text-xs text-slate mt-1 font-medium">
                  Bookmarked sanctuaries
                </p>
              </div>
              <div className="h-12 w-12 rounded-xl bg-forest/10 text-forest flex items-center justify-center shrink-0">
                <Heart size={22} />
              </div>
            </Card>

            <Card className="p-5 border border-pebble/80 bg-card shadow-xs rounded-2xl flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate">
                  Account Status
                </p>
                <div className="flex items-center gap-1.5 mt-1 text-forest font-semibold text-base">
                  <ShieldCheck size={18} />
                  Verified Member
                </div>
                <p className="text-xs text-slate mt-1 truncate max-w-[160px]">
                  {user.email}
                </p>
              </div>
              <div className="h-12 w-12 rounded-xl bg-forest/10 text-forest flex items-center justify-center shrink-0">
                <User size={22} />
              </div>
            </Card>
          </div>

          {/* Quick Jump Anchors */}
          <nav className="mt-8 flex flex-wrap gap-2">
            {[
              { href: "#bookings", label: `Bookings (${bookings.length})` },
              { href: "#saved", label: `Saved Villas (${savedVillas.length})` },
              { href: "#profile", label: "Profile & Security" },
            ].map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="cursor-pointer rounded-xl border border-pebble bg-card px-4 py-2 text-xs font-semibold text-charcoal shadow-xs transition-colors duration-150 hover:bg-sandstone"
              >
                {item.label}
              </a>
            ))}
          </nav>

          {/* My Bookings Section */}
          <section id="bookings" className="scroll-mt-24 mt-12">
            <div className="flex items-baseline justify-between gap-4 mb-5">
              <div>
                <span className="text-xs font-semibold uppercase tracking-widest text-slate">
                  Activity
                </span>
                <h2 className="font-display font-normal text-2xl sm:text-3xl text-charcoal mt-0.5">
                  My Bookings
                </h2>
              </div>
              <span className="text-xs font-semibold text-slate bg-sandstone px-3 py-1 rounded-md border border-pebble">
                {bookings.length} {bookings.length === 1 ? "request" : "requests"}
              </span>
            </div>

            {bookings.length === 0 ? (
              <Card className="py-14 px-6 text-center border-pebble bg-card shadow-xs rounded-2xl">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-forest/10 text-forest mb-4">
                  <CalendarX size={28} />
                </div>
                <h3 className="font-display font-normal text-2xl text-charcoal">
                  No booking requests yet
                </h3>
                <p className="mt-2 text-sm text-slate max-w-md mx-auto leading-relaxed">
                  Start planning your getaway by exploring our handpicked luxury villas across India.
                </p>
                <p className="mt-3 text-xs text-slate">
                  Note: Requests sent prior to creating an account aren&apos;t automatically linked. Write to us to link past inquiries.
                </p>
                <Button size="lg" asChild className="mt-6 font-medium">
                  <Link href="/villas">Browse Villas</Link>
                </Button>
              </Card>
            ) : (
              <div className="flex flex-col gap-4">
                {bookings.map((booking) => (
                  <BookingCardRow key={booking.id} booking={booking} />
                ))}
              </div>
            )}
          </section>

          {/* Saved Villas Section */}
          <section id="saved" className="scroll-mt-24 mt-14">
            <div className="flex items-baseline justify-between gap-4 mb-5">
              <div>
                <span className="text-xs font-semibold uppercase tracking-widest text-slate">
                  Favorites
                </span>
                <h2 className="font-display font-normal text-2xl sm:text-3xl text-charcoal mt-0.5">
                  Saved Villas
                </h2>
              </div>
              <span className="text-xs font-semibold text-slate bg-sandstone px-3 py-1 rounded-md border border-pebble">
                {savedVillas.length} {savedVillas.length === 1 ? "villa" : "villas"}
              </span>
            </div>

            <SavedVillasGrid villas={savedVillas} />
          </section>

          {/* Profile Section */}
          <section id="profile" className="scroll-mt-24 mt-14">
            <div className="mb-5">
              <span className="text-xs font-semibold uppercase tracking-widest text-slate">
                Settings
              </span>
              <h2 className="font-display font-normal text-2xl sm:text-3xl text-charcoal mt-0.5">
                Profile & Security
              </h2>
            </div>

            <DashboardProfile
              email={user.email ?? ""}
              initialName={displayName}
            />
          </section>
        </div>
      </main>

      <Footer />
    </>
  );
}

