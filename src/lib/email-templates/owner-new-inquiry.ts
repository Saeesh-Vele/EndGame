import { absoluteUrl } from "@/lib/site";
import {
  ctaButton,
  detailTable,
  emailLayout,
  formatDate,
  formatINR,
  note,
  paragraph,
  quotedBlock,
  type EmailTemplate,
} from "./layout";

export interface OwnerNewInquiryData {
  villaName: string;
  villaSlug?: string;
  ownerName?: string;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  totalPrice: number;
  message?: string;
}

/**
 * Optional heads-up to the property owner.
 *
 * Only sent when the villa has an owner_email on file — WhatsApp remains the
 * primary channel, and the caller skips this entirely when there's no address.
 */
export function ownerNewInquiry(data: OwnerNewInquiryData): EmailTemplate {
  const greeting = data.ownerName ? `Hi ${data.ownerName} — ` : "";

  const body = [
    paragraph(
      `${greeting}${data.guestName} has asked about staying at ${data.villaName}.`
    ),
    detailTable([
      ["Guest", data.guestName],
      ["Email", data.guestEmail],
      ["Phone", data.guestPhone],
      ["Check in", formatDate(data.checkIn)],
      ["Check out", formatDate(data.checkOut)],
      ["Guests", data.guests],
      ["Estimated total", formatINR(data.totalPrice)],
    ]),
    data.message ? quotedBlock("Message from guest", data.message) : "",
    note(
      "Reply to the guest directly — StayVilla doesn't sit between you and them, and doesn't take a cut of what you agree."
    ),
    data.villaSlug
      ? ctaButton(absoluteUrl(`/villas/${data.villaSlug}`), "View your listing")
      : "",
  ].join("");

  return {
    subject: `New inquiry for ${data.villaName}`,
    html: emailLayout({
      heading: "New inquiry",
      preheader: `${data.guestName} · ${formatDate(
        data.checkIn
      )}–${formatDate(data.checkOut)} · ${data.guests} guests`,
      body,
    }),
  };
}
