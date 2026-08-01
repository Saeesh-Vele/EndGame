import { absoluteUrl } from "@/lib/site";
import {
  ctaButton,
  detailTable,
  emailLayout,
  formatDate,
  formatINR,
  note,
  paragraph,
  secondaryLink,
  type EmailTemplate,
} from "./layout";

export interface GuestBookingConfirmationData {
  villaName: string;
  villaSlug?: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  totalPrice: number;
  ownerName?: string;
  /** wa.me link to the owner, if the villa has a number on file. */
  ownerWhatsappUrl?: string;
}

/** Receipt sent to the guest as soon as their request is recorded. */
export function guestBookingConfirmation(
  data: GuestBookingConfirmationData
): EmailTemplate {
  const host = data.ownerName ?? "the host";

  const body = [
    paragraph(
      `Thanks — we've passed your request for ${data.villaName} to the host. You should hear back within 24 hours.`
    ),
    detailTable([
      ["Villa", data.villaName],
      ["Check in", formatDate(data.checkIn)],
      ["Check out", formatDate(data.checkOut)],
      ["Guests", data.guests],
      ["Estimated total", formatINR(data.totalPrice)],
    ]),
    note(
      `This is a request, not a confirmed booking. ${host} will review it and respond — nothing is reserved and no payment is due until you've agreed terms directly.`
    ),
    data.ownerWhatsappUrl
      ? ctaButton(data.ownerWhatsappUrl, `Message ${host} on WhatsApp`)
      : "",
    data.villaSlug
      ? secondaryLink(
          absoluteUrl(`/villas/${data.villaSlug}`),
          "View the villa again"
        )
      : "",
  ].join("");

  return {
    subject: `Your booking request for ${data.villaName}`,
    html: emailLayout({
      heading: "We've sent your request",
      preheader: `${formatDate(data.checkIn)}–${formatDate(
        data.checkOut
      )} · ${data.guests} guests · ${formatINR(data.totalPrice)}`,
      body,
    }),
  };
}
