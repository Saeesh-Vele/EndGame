import { absoluteUrl } from "@/lib/site";
import { BookingRequest } from "@/types";
import {
  ctaButton,
  detailTable,
  emailLayout,
  formatDate,
  paragraph,
  type EmailTemplate,
} from "./layout";

export interface GuestBookingStatusUpdateData {
  status: BookingRequest["status"];
  villaName: string;
  checkIn: string;
  checkOut: string;
  ownerName?: string;
  /** wa.me link to the owner, if the villa has a number on file. */
  ownerWhatsappUrl?: string;
}

const HEADINGS: Record<BookingRequest["status"], string> = {
  pending: "Your request is back under review",
  confirmed: "Your stay is confirmed",
  cancelled: "Your booking request wasn't confirmed",
  completed: "Thanks for staying with us",
};

/** Sent to the guest whenever an admin moves their request to a new status. */
export function guestBookingStatusUpdate(
  data: GuestBookingStatusUpdateData
): EmailTemplate {
  const host = data.ownerName ?? "the host";
  const parts: string[] = [];

  switch (data.status) {
    case "confirmed":
      parts.push(
        paragraph(
          `Good news — your stay at ${data.villaName} is confirmed. Here's ${host}'s WhatsApp for check-in details.`
        )
      );
      break;
    case "cancelled":
      parts.push(
        paragraph(
          `Unfortunately your booking request for ${data.villaName} was not confirmed. Sorry about that — there are plenty of other villas worth a look.`
        )
      );
      break;
    case "completed":
      parts.push(
        paragraph(
          `Your stay at ${data.villaName} is marked complete. We hope it was a good one.`
        )
      );
      break;
    default:
      parts.push(
        paragraph(
          `Your booking request for ${data.villaName} is back under review. We'll be in touch shortly.`
        )
      );
  }

  parts.push(
    detailTable([
      ["Villa", data.villaName],
      ["Check in", formatDate(data.checkIn)],
      ["Check out", formatDate(data.checkOut)],
      ["Status", data.status],
    ])
  );

  if (data.status === "confirmed" && data.ownerWhatsappUrl) {
    parts.push(ctaButton(data.ownerWhatsappUrl, `Message ${host} on WhatsApp`));
  }

  if (data.status === "cancelled") {
    parts.push(ctaButton(absoluteUrl("/villas"), "Browse other villas"));
  }

  return {
    subject: `Booking update — ${data.villaName}`,
    html: emailLayout({
      heading: HEADINGS[data.status],
      preheader: `${data.villaName} · ${formatDate(
        data.checkIn
      )}–${formatDate(data.checkOut)}`,
      body: parts.join(""),
    }),
  };
}
