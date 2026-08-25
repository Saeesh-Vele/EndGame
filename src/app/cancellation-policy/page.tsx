import type { Metadata } from "next";
import LegalPage, { type LegalSection } from "@/components/legal/LegalPage";
import { SITE_CONTACT } from "@/lib/site";

export const metadata: Metadata = {
  title: "Cancellation Policy",
  description:
    "How cancellations work on StayVilla, who sets the terms, and what to do if a stay falls through.",
  robots: { index: true, follow: true },
};

const SECTIONS: LegalSection[] = [
  {
    heading: "The owner sets the terms",
    body: [
      "Because you book directly with the owner, the cancellation terms are theirs, not ours. Agree them in writing before you pay anything — what the refund window is, what deposit is held, and how a refund is returned.",
      "If an owner has not given you cancellation terms, ask. A property that will not put them in writing is worth walking away from.",
    ],
  },
  {
    heading: "Cancelling an inquiry",
    body: [
      "A booking request sent through StayVilla is not a reservation, so there is nothing to cancel and nothing to pay. If you have changed your mind, tell the owner so they can release the dates.",
    ],
  },
  {
    heading: "Typical terms you'll see",
    body: [
      "Most owners on StayVilla work to something close to the following. Treat it as a guide, not a guarantee, and confirm the actual numbers with the owner.",
    ],
    bullets: [
      "Cancel more than 30 days out: the advance is usually refunded in full, less any transfer charges.",
      "Cancel 7 to 30 days out: the advance is usually retained, and the balance is not due.",
      "Cancel within 7 days: the full amount is usually retained.",
      "No-show: the full amount is retained.",
    ],
  },
  {
    heading: "If the owner cancels",
    body: [
      "An owner who cancels a confirmed stay should refund you in full. Tell us when it happens — we follow it up, and repeated cancellations get a property removed from StayVilla.",
    ],
  },
  {
    heading: "Events outside anyone's control",
    body: [
      "Floods, storms, road closures, and similar events sometimes make a stay impossible. Most owners will reschedule rather than refund. We will help you reach a sensible outcome, but we cannot compel either side.",
    ],
  },
  {
    heading: "Getting help",
    body: [
      `If a cancellation has gone wrong, write to ${SITE_CONTACT.email} with the property name and your dates. We keep a record of every inquiry sent through the site, which usually settles who agreed what.`,
    ],
  },
];

export default function CancellationPolicyPage() {
  return (
    <LegalPage
      title="Cancellation policy"
      intro="StayVilla does not take payment for stays, so it does not issue refunds for them either. Cancellation terms come from the property owner. Here is how that works in practice and what we do when it goes wrong."
      sections={SECTIONS}
    />
  );
}
