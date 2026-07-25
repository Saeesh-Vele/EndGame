"use client";

import { LayoutDashboard, ClipboardList, CalendarClock, MapPin } from "lucide-react";
import { useAdminData } from "@/components/admin/AdminDataProvider";
import StatCard from "@/components/admin/StatCard";
import { formatRelativeTime } from "@/lib/format-relative-time";
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

export default function AdminDashboardPage() {
  const { villas, bookings, destinations } = useAdminData();

  const pendingCount = bookings.filter((b) => b.status === "pending").length;

  const now = new Date();
  const thisMonthCount = bookings.filter((b) => {
    const created = new Date(b.created_at);
    return (
      created.getMonth() === now.getMonth() &&
      created.getFullYear() === now.getFullYear()
    );
  }).length;

  const recentActivity = [...bookings]
    .sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )
    .slice(0, 8);

  const villaName = (id: string) =>
    villas.find((v) => v.id === id)?.name ?? "a villa";

  return (
    <div>
      <h1 className="text-2xl font-medium text-charcoal">Dashboard</h1>
      <p className="mt-1 text-sm text-slate">
        An overview of villas, bookings, and recent activity.
      </p>

      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total villas" value={villas.length} icon={LayoutDashboard} />
        <StatCard
          label="Pending requests"
          value={pendingCount}
          icon={ClipboardList}
        />
        <StatCard
          label="This month's inquiries"
          value={thisMonthCount}
          icon={CalendarClock}
        />
        <StatCard
          label="Destinations"
          value={destinations.length}
          icon={MapPin}
        />
      </div>

      <div className="mt-8 rounded-2xl border border-pebble bg-white">
        <div className="px-5 py-4 border-b border-pebble">
          <h2 className="text-base font-medium text-charcoal">
            Recent activity
          </h2>
        </div>
        <ul className="divide-y divide-pebble">
          {recentActivity.map((booking) => (
            <li
              key={booking.id}
              className="px-5 py-4 flex items-center justify-between gap-4 text-sm"
            >
              <p className="text-charcoal">
                <span className="font-medium">{booking.guest_name}</span>{" "}
                {activityVerb(booking.status)}{" "}
                <span className="font-medium">
                  {villaName(booking.villa_id)}
                </span>
              </p>
              <span className="shrink-0 text-xs text-slate">
                {formatRelativeTime(booking.created_at)}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
