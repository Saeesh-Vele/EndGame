import type { Metadata } from "next";
import BookingsPageClient from "@/components/admin/bookings/BookingsPageClient";
import { createClient } from "@/lib/supabase/server";
import { getAdminBookingRequests } from "@/lib/supabase/queries";

export const metadata: Metadata = {
  title: "Bookings",
  description:
    "Review and manage incoming booking requests. Filter by status and check-in date range, then confirm, cancel, or complete a stay.",
};

export default async function AdminBookingsPage() {
  const supabase = await createClient();
  const bookings = await getAdminBookingRequests(supabase);

  return (
    <div>
      <h1 className="text-2xl font-medium text-charcoal">Bookings</h1>
      <p className="mt-1 text-sm text-slate">
        Review and manage booking requests.
      </p>

      <BookingsPageClient bookings={bookings} />
    </div>
  );
}
