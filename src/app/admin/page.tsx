import type { Metadata } from "next";
import Link from "next/link";
import {
  LayoutDashboard,
  ClipboardList,
  CalendarClock,
  Inbox,
  MapPin,
  MessageCircle,
  ArrowRight,
  Activity,
} from "lucide-react";
import StatCard from "@/components/admin/StatCard";
import { formatRelativeTime } from "@/lib/format-relative-time";
import { createClient } from "@/lib/supabase/server";
import {
  getAdminBookingRequests,
  getAdminDashboardStats,
} from "@/lib/supabase/queries";
import { BookingRequest } from "@/types";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Admin Dashboard | StayVilla Admin",
  description:
    "Live operations overview: villa inventory, pending booking requests, monthly inquiry volume, and the latest guest activity.",
};

function activityVerb(status: BookingRequest["status"]) {
  switch (status) {
    case "pending":
      return "requested a stay at";
    case "confirmed":
      return "had a booking confirmed for";
    case "cancelled":
      return "cancelled a booking for";
    case "completed":
      return "completed a stay at";
  }
}

export default async function AdminDashboardPage() {
  const supabase = await createClient();

  const [stats, recentActivity] = await Promise.all([
    getAdminDashboardStats(supabase),
    getAdminBookingRequests(supabase, 10),
  ]);

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-pebble pb-6 mb-8">
        <div>
          <span className="text-xs font-semibold uppercase tracking-widest text-slate">
            Operations Control
          </span>
          <h1 className="font-display font-normal text-3xl sm:text-4xl text-charcoal mt-0.5">
            Admin Dashboard
          </h1>
          <p className="mt-1 text-slate text-sm sm:text-base">
            Live overview of villa inventory, booking request queues, and recent inquiries.
          </p>
        </div>

        <Button size="lg" asChild className="font-medium shadow-xs self-start sm:self-auto">
          <Link href="/admin/bookings">Manage Bookings</Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        <StatCard
          label="Total Villas"
          value={stats.villas}
          icon={LayoutDashboard}
        />
        <StatCard
          label="Pending Requests"
          value={stats.pendingBookings}
          icon={ClipboardList}
        />
        <StatCard
          label="Inquiries This Month"
          value={stats.inquiriesThisMonth}
          icon={CalendarClock}
        />
        <StatCard
          label="WhatsApp Inquiries"
          value={stats.whatsappInquiriesThisMonth}
          icon={MessageCircle}
        />
        <Link href="/admin/submissions" className="cursor-pointer">
          <StatCard
            label="New Submissions"
            value={stats.pendingSubmissions}
            icon={Inbox}
          />
        </Link>
        <StatCard
          label="Destinations"
          value={stats.destinations}
          icon={MapPin}
        />
      </div>

      <Card className="mt-10 border border-pebble/80 bg-card shadow-xs rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-pebble/60 flex items-center justify-between bg-sandstone/30">
          <div className="flex items-center gap-2">
            <Activity size={18} className="text-forest" />
            <h2 className="font-semibold text-base text-charcoal">
              Recent Activity Feed
            </h2>
          </div>
          <Button variant="ghost" size="sm" asChild className="text-xs text-forest hover:text-forest-light gap-1">
            <Link href="/admin/bookings">
              View all <ArrowRight size={13} />
            </Link>
          </Button>
        </div>

        {recentActivity.length === 0 ? (
          <p className="px-6 py-12 text-center text-sm text-slate">
            No booking activity recorded yet.
          </p>
        ) : (
          <div className="divide-y divide-pebble/40">
            {recentActivity.map((booking) => (
              <Link
                key={booking.id}
                href={`/admin/bookings/${booking.id}`}
                className="cursor-pointer px-6 py-4 flex items-center justify-between gap-4 text-sm hover:bg-sandstone/40 transition-colors duration-150"
              >
                <div className="min-w-0">
                  <p className="text-charcoal truncate">
                    <span className="font-semibold">{booking.guest_name}</span>{" "}
                    <span className="text-slate">{activityVerb(booking.status)}</span>{" "}
                    <span className="font-semibold">{booking.villa_name}</span>
                  </p>
                  <p className="text-xs text-slate mt-0.5 font-medium">
                    ₹{booking.total_price.toLocaleString("en-IN")} · {booking.guests} guests
                  </p>
                </div>
                <span className="shrink-0 text-xs font-medium text-slate bg-sandstone px-2.5 py-1 rounded-md border border-pebble/60">
                  {formatRelativeTime(booking.created_at)}
                </span>
              </Link>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

