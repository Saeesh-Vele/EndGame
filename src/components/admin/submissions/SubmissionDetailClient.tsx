"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  ArrowLeft,
  BedDouble,
  Bath,
  Loader2,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  Trash2,
  Users,
} from "lucide-react";
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
import SubmissionStatusBadge from "@/components/admin/SubmissionStatusBadge";
import {
  deleteSubmission,
  updateSubmissionNotes,
  updateSubmissionStatus,
} from "@/app/admin/actions";
import { VillaSubmission, VillaSubmissionStatus } from "@/types";

const STATUS_OPTIONS: VillaSubmissionStatus[] = [
  "pending",
  "reviewed",
  "approved",
  "rejected",
];

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatINR(amount: number) {
  return `₹${amount.toLocaleString("en-IN")}`;
}

function Stat({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Users;
  label: string;
  value?: number;
}) {
  return (
    <div className="flex items-center gap-2.5 text-sm">
      <Icon size={15} className="text-slate shrink-0" />
      <span className="text-charcoal">
        {value != null ? `${value} ${label}` : `${label} not given`}
      </span>
    </div>
  );
}

export default function SubmissionDetailClient({
  submission,
}: {
  submission: VillaSubmission;
}) {
  const router = useRouter();
  const [notes, setNotes] = useState(submission.admin_notes ?? "");
  const [statusPending, startStatusUpdate] = useTransition();
  const [notesPending, startNotesUpdate] = useTransition();
  const [deletePending, startDelete] = useTransition();

  const whatsappHref = `https://wa.me/${submission.owner_phone.replace(
    /\D/g,
    ""
  )}?text=${encodeURIComponent(
    `Hi ${submission.owner_name}, this is StayVilla getting back to you about ${submission.villa_name}.`
  )}`;

  const handleStatusChange = (value: string) => {
    startStatusUpdate(async () => {
      const result = await updateSubmissionStatus(
        submission.id,
        value as VillaSubmissionStatus
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
      const result = await updateSubmissionNotes(submission.id, notes);
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
      const result = await deleteSubmission(submission.id);
      if (result.success) {
        toast.success("Submission deleted");
        router.push("/admin/submissions");
        router.refresh();
      } else {
        toast.error(result.error ?? "Couldn't delete the submission.");
      }
    });
  };

  return (
    <div className="max-w-3xl">
      <Link
        href="/admin/submissions"
        className="cursor-pointer inline-flex items-center gap-1.5 text-sm text-slate hover:text-charcoal transition-colors duration-200"
      >
        <ArrowLeft size={15} />
        Back to submissions
      </Link>

      <div className="mt-3 flex items-center justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-2xl font-medium text-charcoal truncate">
            {submission.villa_name}
          </h1>
          <p className="mt-1 text-sm text-slate">
            Received {formatDate(submission.created_at)}
          </p>
        </div>
        <SubmissionStatusBadge status={submission.status} />
      </div>

      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="rounded-2xl border border-pebble bg-white p-6">
          <h2 className="text-base font-medium text-charcoal mb-4">Owner</h2>
          <div className="flex flex-col gap-3 text-sm">
            <p className="text-charcoal">{submission.owner_name}</p>
            <a
              href={`mailto:${submission.owner_email}`}
              className="cursor-pointer flex items-center gap-2.5 text-charcoal hover:text-forest transition-colors duration-200"
            >
              <Mail size={15} className="text-slate" />
              {submission.owner_email}
            </a>
            <a
              href={`tel:${submission.owner_phone}`}
              className="cursor-pointer flex items-center gap-2.5 text-charcoal hover:text-forest transition-colors duration-200"
            >
              <Phone size={15} className="text-slate" />
              {submission.owner_phone}
            </a>
            <a
              href={whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              className="cursor-pointer flex items-center gap-2.5 text-forest hover:text-forest-light transition-colors duration-200"
            >
              <MessageCircle size={15} />
              Message on WhatsApp
            </a>
          </div>
        </div>

        <div className="rounded-2xl border border-pebble bg-white p-6">
          <h2 className="text-base font-medium text-charcoal mb-4">Property</h2>
          <div className="flex flex-col gap-3">
            <p className="flex items-center gap-2.5 text-sm text-charcoal">
              <MapPin size={15} className="text-slate shrink-0" />
              {submission.location}
              {submission.destination && (
                <span className="text-slate">· {submission.destination}</span>
              )}
            </p>
            <Stat icon={BedDouble} label="bedrooms" value={submission.bedrooms} />
            <Stat icon={Bath} label="bathrooms" value={submission.bathrooms} />
            <Stat icon={Users} label="guests max" value={submission.max_guests} />
          </div>

          <div className="mt-4 pt-4 border-t border-pebble flex flex-col gap-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-slate">Asking / night</span>
              <span className="text-charcoal">
                {submission.price_per_night != null
                  ? formatINR(submission.price_per_night)
                  : "—"}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate">Weekend</span>
              <span className="text-charcoal">
                {submission.weekend_price != null
                  ? formatINR(submission.weekend_price)
                  : "—"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {submission.description && (
        <div className="mt-6 rounded-2xl border border-pebble bg-white p-6">
          <h2 className="text-base font-medium text-charcoal mb-3">
            Description
          </h2>
          <p className="text-sm text-charcoal leading-relaxed whitespace-pre-line">
            {submission.description}
          </p>
        </div>
      )}

      <div className="mt-6 rounded-2xl border border-pebble bg-white p-6">
        <h2 className="text-base font-medium text-charcoal mb-3">Amenities</h2>
        {submission.amenities.length === 0 ? (
          <p className="text-sm text-slate">None selected.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {submission.amenities.map((amenity) => (
              <span
                key={amenity}
                className="rounded-xl bg-sandstone px-3 py-1.5 text-xs text-charcoal"
              >
                {amenity}
              </span>
            ))}
          </div>
        )}
      </div>

      {submission.message && (
        <div className="mt-6 rounded-2xl border border-pebble bg-white p-6">
          <h2 className="text-base font-medium text-charcoal mb-3">
            Message from the owner
          </h2>
          <p className="text-sm text-charcoal leading-relaxed whitespace-pre-line">
            {submission.message}
          </p>
        </div>
      )}

      <div className="mt-6 rounded-2xl border border-pebble bg-white p-6">
        <h2 className="text-base font-medium text-charcoal mb-4">Status</h2>
        <Select
          value={submission.status}
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
          placeholder="Visit scheduled for the 14th, owner wants to block December…"
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
          Deleting removes this submission permanently. Marking it rejected
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
              Delete submission
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete this submission?</AlertDialogTitle>
              <AlertDialogDescription>
                {submission.owner_name}&apos;s submission for{" "}
                {submission.villa_name} will be removed permanently. This
                can&apos;t be undone.
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
