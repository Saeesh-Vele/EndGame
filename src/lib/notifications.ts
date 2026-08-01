import { ADMIN_EMAIL } from "@/lib/site";
import { sendEmail } from "@/lib/resend";
import { adminContactMessage } from "@/lib/email-templates/admin-contact-message";
import { adminNewBooking } from "@/lib/email-templates/admin-new-booking";
import { adminNewSubmission } from "@/lib/email-templates/admin-new-submission";
import { guestBookingConfirmation } from "@/lib/email-templates/guest-booking-confirmation";
import { guestBookingStatusUpdate } from "@/lib/email-templates/guest-booking-status-update";
import { ownerNewInquiry } from "@/lib/email-templates/owner-new-inquiry";
import type { VillaNotificationContext } from "@/lib/supabase/queries";
import type { BookingRequest } from "@/types";

/**
 * Composes templates and hands them to Resend.
 *
 * Every function here is best-effort and never throws. They're called from
 * `after()` inside Server Actions whose mutation has already committed — an
 * email problem must not surface as a failed booking. sendEmail already
 * swallows and logs; allSettled covers anything that slips past it.
 */

async function dispatch(
  label: string,
  sends: Promise<unknown>[]
): Promise<void> {
  const results = await Promise.allSettled(sends);
  for (const result of results) {
    if (result.status === "rejected") {
      console.error(`[email] ${label} dispatch rejected:`, result.reason);
    }
  }
}

/** wa.me link to the villa owner, if the villa has a number on file. */
function ownerWhatsappUrl(
  villa: VillaNotificationContext,
  message: string
): string | undefined {
  const digits = villa.owner_whatsapp?.replace(/\D/g, "");
  if (!digits) return undefined;
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}

export interface NewBookingNotification {
  bookingId: string;
  villa: VillaNotificationContext;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  totalPrice: number;
  message?: string;
}

/** Admin + guest, plus the owner when the villa has an email on file. */
export async function notifyNewBooking(
  data: NewBookingNotification
): Promise<void> {
  const whatsappUrl = ownerWhatsappUrl(
    data.villa,
    `Hi! I've just sent a booking request for ${data.villa.name} on StayVilla.`
  );

  const admin = adminNewBooking({
    bookingId: data.bookingId,
    villaName: data.villa.name,
    guestName: data.guestName,
    guestEmail: data.guestEmail,
    guestPhone: data.guestPhone,
    checkIn: data.checkIn,
    checkOut: data.checkOut,
    guests: data.guests,
    totalPrice: data.totalPrice,
    message: data.message,
  });

  const guest = guestBookingConfirmation({
    villaName: data.villa.name,
    villaSlug: data.villa.slug,
    checkIn: data.checkIn,
    checkOut: data.checkOut,
    guests: data.guests,
    totalPrice: data.totalPrice,
    ownerName: data.villa.owner_name,
    ownerWhatsappUrl: whatsappUrl,
  });

  const sends = [
    sendEmail(ADMIN_EMAIL, admin.subject, admin.html),
    sendEmail(data.guestEmail, guest.subject, guest.html),
  ];

  // Optional third recipient. WhatsApp is still the primary owner channel, so
  // this is skipped silently when there's no address rather than warned about.
  if (data.villa.owner_email) {
    const owner = ownerNewInquiry({
      villaName: data.villa.name,
      villaSlug: data.villa.slug,
      ownerName: data.villa.owner_name,
      guestName: data.guestName,
      guestEmail: data.guestEmail,
      guestPhone: data.guestPhone,
      checkIn: data.checkIn,
      checkOut: data.checkOut,
      guests: data.guests,
      totalPrice: data.totalPrice,
      message: data.message,
    });
    sends.push(sendEmail(data.villa.owner_email, owner.subject, owner.html));
  }

  await dispatch("new booking", sends);
}

export interface BookingStatusNotification {
  status: BookingRequest["status"];
  guestEmail: string;
  villa: VillaNotificationContext;
  checkIn: string;
  checkOut: string;
}

export async function notifyBookingStatusChange(
  data: BookingStatusNotification
): Promise<void> {
  const template = guestBookingStatusUpdate({
    status: data.status,
    villaName: data.villa.name,
    checkIn: data.checkIn,
    checkOut: data.checkOut,
    ownerName: data.villa.owner_name,
    ownerWhatsappUrl: ownerWhatsappUrl(
      data.villa,
      `Hi! My StayVilla booking for ${data.villa.name} is confirmed — could you share the check-in details?`
    ),
  });

  await dispatch("booking status", [
    sendEmail(data.guestEmail, template.subject, template.html),
  ]);
}

export interface NewSubmissionNotification {
  submissionId: string;
  villaName: string;
  ownerName: string;
  ownerEmail: string;
  ownerPhone: string;
  location: string;
  bedrooms?: number;
  maxGuests?: number;
  pricePerNight?: number;
}

export async function notifyNewSubmission(
  data: NewSubmissionNotification
): Promise<void> {
  const template = adminNewSubmission(data);
  await dispatch("new submission", [
    sendEmail(ADMIN_EMAIL, template.subject, template.html),
  ]);
}

export interface ContactMessageNotification {
  name: string;
  email: string;
  message: string;
}

export async function notifyContactMessage(
  data: ContactMessageNotification
): Promise<void> {
  const template = adminContactMessage(data);
  await dispatch("contact message", [
    sendEmail(ADMIN_EMAIL, template.subject, template.html),
  ]);
}
