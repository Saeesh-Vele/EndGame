import { notFound } from "next/navigation";
import BookingDetailClient from "@/components/admin/bookings/BookingDetailClient";
import { createClient } from "@/lib/supabase/server";
import { getAdminBookingRequestById } from "@/lib/supabase/queries";

export default async function BookingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const booking = await getAdminBookingRequestById(supabase, id);

  if (!booking) notFound();

  return <BookingDetailClient booking={booking} />;
}
