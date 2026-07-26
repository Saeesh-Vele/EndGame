import type { Metadata } from "next";
import LegalPage, { type LegalSection } from "@/components/legal/LegalPage";
import { SITE_CONTACT } from "@/lib/site";

export const metadata: Metadata = {
  title: "Terms of Service | StayVilla",
  description:
    "The terms that apply when you browse StayVilla, send a booking request, or list a property.",
  robots: { index: true, follow: true },
};

const SECTIONS: LegalSection[] = [
  {
    heading: "What StayVilla is",
    body: [
      "StayVilla is a directory of private villas. We verify the properties we list, photograph them, and put you in touch with whoever runs them.",
      "We are not the owner, the operator, or the agent of any property on this site, and we are not a party to the agreement you reach with an owner.",
    ],
  },
  {
    heading: "Booking requests",
    body: [
      "Sending a request through StayVilla is an inquiry, not a reservation. Nothing is confirmed until the owner accepts and you have agreed terms with them directly.",
      "Prices shown are the rates the owner has given us. They can change, and the owner may quote differently for particular dates, longer stays, or larger groups.",
    ],
  },
  {
    heading: "Your account",
    body: [
      "You are responsible for keeping your password to yourself and for anything done through your account. Tell us promptly if you think someone else has access.",
      "You must be old enough to enter a contract in your jurisdiction to create an account or send a booking request.",
    ],
  },
  {
    heading: "Acceptable use",
    body: ["When using StayVilla, you agree not to:"],
    bullets: [
      "Send booking requests you have no intention of honouring.",
      "Scrape, republish, or resell listings, photography, or owner contact details.",
      "Attempt to access accounts, data, or administrative areas that are not yours.",
      "Submit a property you do not own or are not authorised to list.",
    ],
  },
  {
    heading: "Listing a property",
    body: [
      "If you submit a property, you confirm you are entitled to let it and that the details you give us are accurate. We visit before listing, and we may decline any property for any reason.",
      "We may remove a listing without notice if it turns out to be misrepresented, unsafe, or unavailable in practice.",
    ],
  },
  {
    heading: "Our liability",
    body: [
      "We take care over what we list, but the stay itself is between you and the owner. We are not liable for the condition of a property, a cancellation by an owner, or any loss arising from your stay.",
      "Nothing here limits liability that cannot lawfully be limited — including for death or personal injury caused by negligence, or for fraud.",
    ],
  },
  {
    heading: "Changes and termination",
    body: [
      "We may change these terms. Continued use after a change means you accept the updated version. We may suspend or close an account that breaches these terms.",
    ],
  },
  {
    heading: "Governing law",
    body: [
      `These terms are governed by the laws of ${SITE_CONTACT.jurisdiction}, and its courts have exclusive jurisdiction over any dispute. Confirm this clause with your legal advisor — the correct jurisdiction depends on where the business is actually registered.`,
    ],
  },
];

export default function TermsPage() {
  return (
    <LegalPage
      title="Terms of service"
      intro="These terms apply whenever you browse StayVilla, send a booking request, or submit a property for listing. They are written to be readable rather than exhaustive."
      sections={SECTIONS}
    />
  );
}
