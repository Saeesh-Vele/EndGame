"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ArrowLeft, Loader2, Mail, Phone, Trash2, Users } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import BookingStatusBadge from "@/components/shared/BookingStatusBadge";
import {
  deleteBooking,
  updateBookingNotes,
  updateBookingStatus,
} from "@/app/admin/actions";
import { BookingRequestWithVilla, BookingRequest } from "@/types";

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

export default function BookingDetailClient({
  booking,
}: {
  booking: BookingRequestWithVilla;
}) {
  const router = useRouter();
  const [notes, setNotes] = useState(booking.admin_notes ?? "");
  const [statusPending, startStatusUpdate] = useTransition();
  const [notesPending, startNotesUpdate] = useTransition();
  const [deletePending, startDelete] = useTransition();

  const nights = nightsBetween(booking.check_in, booking.check_out);
  const avgNightly = Math.round(booking.total_price / nights);

  const handleStatusChange = (value: string) => {
    startStatusUpdate(async () => {
      const result = await updateBookingStatus(
        booking.id,
        value as BookingRequest["status"]
      );
      if (result.success) {
        toast.success(`Marked as ${value}`);
        router.refresh();
      } else {
        toast.error(result.error ?? "Couldn't update the status.");
      }
    });
  };

  const handleSaveNotes = () => {
    startNotesUpdate(async () => {
      const result = await updateBookingNotes(booking.id, notes);
      if (result.success) {
        toast.success("Notes saved");
        router.refresh();
      } else {
        toast.error(result.error ?? "Couldn't save the notes.");
      }
    });
  };

  const handleDelete = () => {
    startDelete(async () => {
      const result = await deleteBooking(booking.id);
      if (result.success) {
        toast.success("Booking request deleted");
        router.push("/admin/bookings");
        router.refresh();
      } else {
        toast.error(result.error ?? "Couldn't delete the booking request.");
      }
    });
  };

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
        <BookingStatusBadge status={booking.status} />
      </div>

      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="rounded-2xl border border-pebble bg-white p-6">
          <h2 className="text-base font-medium text-charcoal mb-4">
            Guest details
          </h2>
          <div className="flex flex-col gap-3 text-sm">
            <a
              href={`mailto:${booking.guest_email}`}
              className="cursor-pointer flex items-center gap-2.5 text-charcoal hover:text-forest transition-colors duration-200"
            >
              <Mail size={15} className="text-slate" />
              {booking.guest_email}
            </a>
            {booking.guest_phone && (
              <a
                href={`tel:${booking.guest_phone}`}
                className="cursor-pointer flex items-center gap-2.5 text-charcoal hover:text-forest transition-colors duration-200"
              >
                <Phone size={15} className="text-slate" />
                {booking.guest_phone}
              </a>
            )}
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
          <Link
            href={`/admin/villas/${booking.villa_id}/edit`}
            className="cursor-pointer flex items-center gap-3 group"
          >
            {booking.villa_image && (
              <div className="relative h-14 w-18 shrink-0 rounded-lg overflow-hidden bg-sandstone">
                <Image
                  src={booking.villa_image}
                  alt={booking.villa_name}
                  fill
                  sizes="72px"
                  quality={60}
                  className="object-cover"
                />
              </div>
            )}
            <div className="min-w-0">
              <p className="text-sm text-charcoal group-hover:text-forest transition-colors duration-200 truncate">
                {booking.villa_name}
              </p>
              <p className="text-xs text-slate truncate">
                {booking.villa_location}
              </p>
            </div>
          </Link>

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
          disabled={statusPending}
          onValueChange={handleStatusChange}
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
          disabled={notesPending}
          onClick={handleSaveNotes}
        >
          {notesPending && <Loader2 size={16} className="animate-spin" />}
          {notesPending ? "Saving…" : "Save notes"}
        </Button>
      </div>

      <div className="mt-6 rounded-2xl border border-destructive/20 bg-white p-6">
        <h2 className="text-base font-medium text-charcoal">Danger zone</h2>
        <p className="mt-1 text-sm text-slate">
          Deleting removes this request permanently. Cancelling it instead
          keeps the record.
        </p>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              type="button"
              variant="destructive"
              className="mt-4"
              disabled={deletePending}
            >
              <Trash2 size={15} />
              Delete request
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                Delete this booking request?
              </AlertDialogTitle>
              <AlertDialogDescription>
                {booking.guest_name}&apos;s request for {booking.villa_name}{" "}
                will be removed permanently. This can&apos;t be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                variant="destructive"
                disabled={deletePending}
                onClick={handleDelete}
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
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
