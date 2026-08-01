import { absoluteUrl } from "@/lib/site";
import {
  ctaButton,
  detailTable,
  emailLayout,
  formatINR,
  paragraph,
  type EmailTemplate,
} from "./layout";

export interface AdminNewSubmissionData {
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

/** Sent to the admin inbox when an owner submits the "List your villa" form. */
export function adminNewSubmission(
  data: AdminNewSubmissionData
): EmailTemplate {
  const body = [
    paragraph(
      `${data.ownerName} has submitted ${data.villaName} for listing on StayVilla.`
    ),
    detailTable([
      ["Owner", data.ownerName],
      ["Email", data.ownerEmail],
      ["Phone", data.ownerPhone],
      ["Villa", data.villaName],
      ["Location", data.location],
      ["Bedrooms", data.bedrooms],
      ["Max guests", data.maxGuests],
      [
        "Asking / night",
        data.pricePerNight != null ? formatINR(data.pricePerNight) : undefined,
      ],
    ]),
    ctaButton(
      absoluteUrl(`/admin/submissions/${data.submissionId}`),
      "Review submission"
    ),
  ].join("");

  return {
    subject: `New villa listing submission — ${data.villaName}`,
    html: emailLayout({
      heading: "New villa listing submission",
      preheader: `${data.villaName} · ${data.location} · from ${data.ownerName}`,
      body,
    }),
  };
}
