import { absoluteUrl } from "@/lib/site";
import {
  ctaButton,
  detailTable,
  emailLayout,
  formatDate,
  formatINR,
  paragraph,
  quotedBlock,
  type EmailTemplate,
} from "./layout";

export interface AdminNewBookingData {
  bookingId: string;
  villaName: string;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  totalPrice: number;
  message?: string;
}

/** Sent to the admin inbox the moment a guest submits a booking request. */
export function adminNewBooking(data: AdminNewBookingData): EmailTemplate {
  const body = [
    paragraph(
      `${data.guestName} has requested a stay at ${data.villaName}. Their details are below.`
    ),
    detailTable([
      ["Guest", data.guestName],
      ["Email", data.guestEmail],
      ["Phone", data.guestPhone],
      ["Villa", data.villaName],
      ["Check in", formatDate(data.checkIn)],
      ["Check out", formatDate(data.checkOut)],
      ["Guests", data.guests],
      ["Total", formatINR(data.totalPrice)],
    ]),
    data.message ? quotedBlock("Message from guest", data.message) : "",
    ctaButton(
      absoluteUrl(`/admin/bookings/${data.bookingId}`),
      "View in dashboard"
    ),
  ].join("");

  return {
    subject: `New booking request — ${data.villaName}`,
    html: emailLayout({
      heading: "New booking request",
      preheader: `${data.guestName} · ${formatDate(data.checkIn)}–${formatDate(
        data.checkOut
      )} · ${formatINR(data.totalPrice)}`,
      body,
    }),
  };
}
