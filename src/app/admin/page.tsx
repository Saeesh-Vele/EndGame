import Link from "next/link";
import {
  LayoutDashboard,
  ClipboardList,
  CalendarClock,
  MapPin,
} from "lucide-react";
import StatCard from "@/components/admin/StatCard";
import { formatRelativeTime } from "@/lib/format-relative-time";
import { createClient } from "@/lib/supabase/server";
import {
  getAdminBookingRequests,
  getAdminDashboardStats,
} from "@/lib/supabase/queries";
import { BookingRequest } from "@/types";

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
      <h1 className="text-2xl font-medium text-charcoal">Dashboard</h1>
      <p className="mt-1 text-sm text-slate">
        An overview of villas, bookings, and recent activity.
      </p>

      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total villas"
          value={stats.villas}
          icon={LayoutDashboard}
        />
        <StatCard
          label="Pending requests"
          value={stats.pendingBookings}
          icon={ClipboardList}
        />
        <StatCard
          label="This month's inquiries"
          value={stats.inquiriesThisMonth}
          icon={CalendarClock}
        />
        <StatCard
          label="Destinations"
          value={stats.destinations}
          icon={MapPin}
        />
      </div>

      <div className="mt-8 rounded-2xl border border-pebble bg-white">
        <div className="px-5 py-4 border-b border-pebble">
          <h2 className="text-base font-medium text-charcoal">
            Recent activity
          </h2>
        </div>

        {recentActivity.length === 0 ? (
          <p className="px-5 py-8 text-center text-sm text-slate">
            No booking requests yet.
          </p>
        ) : (
          <ul className="divide-y divide-pebble">
            {recentActivity.map((booking) => (
              <li key={booking.id}>
                <Link
                  href={`/admin/bookings/${booking.id}`}
                  className="cursor-pointer px-5 py-4 flex items-center justify-between gap-4 text-sm hover:bg-sandstone/50 transition-colors duration-200"
                >
                  <p className="text-charcoal">
                    <span className="font-medium">{booking.guest_name}</span>{" "}
                    {activityVerb(booking.status)}{" "}
                    <span className="font-medium">{booking.villa_name}</span>
                  </p>
                  <span className="shrink-0 text-xs text-slate">
                    {formatRelativeTime(booking.created_at)}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
