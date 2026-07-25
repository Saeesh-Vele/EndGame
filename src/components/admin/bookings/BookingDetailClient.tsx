"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { toast } from "sonner";
import { ArrowLeft, Mail, Phone, Users } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import StatusBadge from "@/components/admin/StatusBadge";
import { useAdminData } from "@/components/admin/AdminDataProvider";
import { BookingRequest } from "@/types";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function nightsBetween(checkIn: string, checkOut: string) {
  const ms = new Date(checkOut).getTime() - new Date(checkIn).getTime();
  return Math.max(1, Math.round(ms / 86_400_000));
}

const STATUS_OPTIONS: BookingRequest["status"][] = [
  "pending",
  "confirmed",
  "cancelled",
  "completed",
];

export default function BookingDetailClient({ id }: { id: string }) {
  const { bookings, villas, updateBooking } = useAdminData();
  const booking = bookings.find((b) => b.id === id);
  const villa = villas.find((v) => v.id === booking?.villa_id);

  const [notes, setNotes] = useState(booking?.admin_notes ?? "");

  if (!booking) {
    return (
      <div>
        <BackLink />
        <p className="mt-6 text-sm text-slate">Booking not found.</p>
      </div>
    );
  }

  const nights = nightsBetween(booking.check_in, booking.check_out);
  const avgNightly = Math.round(booking.total_price / nights);

  return (
    <div className="max-w-3xl">
      <BackLink />

      <div className="mt-3 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-medium text-charcoal">
            {booking.guest_name}
          </h1>
          <p className="mt-1 text-sm text-slate">
            Requested {formatDate(booking.created_at)}
          </p>
        </div>
        <StatusBadge status={booking.status} />
      </div>

      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="rounded-2xl border border-pebble bg-white p-6">
          <h2 className="text-base font-medium text-charcoal mb-4">
            Guest details
          </h2>
          <div className="flex flex-col gap-3 text-sm">
            <p className="flex items-center gap-2.5 text-charcoal">
              <Mail size={15} className="text-slate" />
              {booking.guest_email}
            </p>
            <p className="flex items-center gap-2.5 text-charcoal">
              <Phone size={15} className="text-slate" />
              {booking.guest_phone}
            </p>
            <p className="flex items-center gap-2.5 text-charcoal">
              <Users size={15} className="text-slate" />
              {booking.guests} guests
            </p>
          </div>
          {booking.message && (
            <div className="mt-4 pt-4 border-t border-pebble">
              <p className="text-xs font-medium text-slate mb-1.5">
                Message from guest
              </p>
              <p className="text-sm text-charcoal leading-relaxed">
                {booking.message}
              </p>
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-pebble bg-white p-6">
          <h2 className="text-base font-medium text-charcoal mb-4">Villa</h2>
          {villa ? (
            <Link
              href={`/admin/villas/${villa.id}/edit`}
              className="cursor-pointer flex items-center gap-3 group"
            >
              <div className="relative h-14 w-18 shrink-0 rounded-lg overflow-hidden bg-sandstone">
                <Image
                  src={villa.images[0]}
                  alt={villa.name}
                  fill
                  sizes="72px"
                  className="object-cover"
                  unoptimized={villa.images[0]?.startsWith("blob:")}
                />
              </div>
              <div className="min-w-0">
                <p className="text-sm text-charcoal group-hover:text-forest transition-colors duration-200 truncate">
                  {villa.name}
                </p>
                <p className="text-xs text-slate truncate">{villa.location}</p>
              </div>
            </Link>
          ) : (
            <p className="text-sm text-slate">Villa not found.</p>
          )}

          <div className="mt-4 pt-4 border-t border-pebble flex flex-col gap-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-slate">Check in</span>
              <span className="text-charcoal">
                {formatDate(booking.check_in)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate">Check out</span>
              <span className="text-charcoal">
                {formatDate(booking.check_out)}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-pebble bg-white p-6">
        <h2 className="text-base font-medium text-charcoal mb-4">
          Price breakdown
        </h2>
        <div className="flex flex-col gap-2.5 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-slate">
              ₹{avgNightly.toLocaleString("en-IN")} × {nights}{" "}
              {nights === 1 ? "night" : "nights"} (avg.)
            </span>
            <span className="text-charcoal">
              ₹{booking.total_price.toLocaleString("en-IN")}
            </span>
          </div>
          <div className="flex items-center justify-between pt-2.5 border-t border-pebble font-medium text-charcoal">
            <span>Total</span>
            <span>₹{booking.total_price.toLocaleString("en-IN")}</span>
          </div>
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-pebble bg-white p-6">
        <h2 className="text-base font-medium text-charcoal mb-4">Status</h2>
        <Select
          value={booking.status}
          onValueChange={(value) => {
            updateBooking(booking.id, {
              status: value as BookingRequest["status"],
            });
            toast.success(`Marked as ${value}`);
          }}
        >
          <SelectTrigger className="w-full sm:w-56">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {STATUS_OPTIONS.map((status) => (
              <SelectItem key={status} value={status} className="capitalize">
                {status}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="mt-6 rounded-2xl border border-pebble bg-white p-6">
        <h2 className="text-base font-medium text-charcoal mb-4">
          Internal notes
        </h2>
        <Textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Notes visible only to the StayVilla team..."
          rows={4}
        />
        <Button
          type="button"
          className="mt-3"
          onClick={() => {
            updateBooking(booking.id, { admin_notes: notes });
            toast.success("Notes saved");
          }}
        >
          Save notes
        </Button>
      </div>
    </div>
  );
}

function BackLink() {
  return (
    <Link
      href="/admin/bookings"
      className="cursor-pointer inline-flex items-center gap-1.5 text-sm text-slate hover:text-charcoal transition-colors duration-200"
    >
      <ArrowLeft size={15} />
      Back to bookings
    </Link>
  );
}
