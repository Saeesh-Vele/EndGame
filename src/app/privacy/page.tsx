import type { Metadata } from "next";
import LegalPage, { type LegalSection } from "@/components/legal/LegalPage";
import { SITE_CONTACT } from "@/lib/site";

export const metadata: Metadata = {
  title: "Privacy Policy | StayVilla",
  description:
    "What StayVilla collects, why, who it is shared with, and how to get it removed.",
  robots: { index: true, follow: true },
};

const SECTIONS: LegalSection[] = [
  {
    heading: "What we collect",
    body: [
      "We collect only what we need to pass an inquiry to a property owner and to keep your account working.",
    ],
    bullets: [
      "Contact details you type into a booking request or the listing form: name, email address, and phone number.",
      "Account details if you create one: name, email address, and an encrypted password we never see in plain text.",
      "The villas you save, so they are still there next time you sign in.",
      "Standard server logs — IP address, browser, and the pages requested — kept for security and troubleshooting.",
    ],
  },
  {
    heading: "Why we collect it",
    body: [
      "Booking and inquiry details are passed to the owner of the property you are asking about, because that is the entire point of sending them. Account details identify you when you sign back in. Logs help us spot abuse and fix breakage.",
      "We do not use any of it to build advertising profiles, and we do not sell it.",
    ],
  },
  {
    heading: "Who we share it with",
    body: [
      "Three groups, and no others:",
    ],
    bullets: [
      "The owner of the property you inquire about — name, email, phone, dates, and party size.",
      "Our hosting and database providers, who process data on our instructions in order to run the site.",
      "Authorities, where a valid legal order compels us. We will tell you unless we are legally barred from doing so.",
    ],
  },
  {
    heading: "How long we keep it",
    body: [
      "Booking requests are retained while they are live and for a period afterwards for dispute resolution and accounting. Account data is kept until you delete the account. Server logs are rotated on a short cycle.",
      "Set the exact retention periods with your legal advisor and state them here — regulators expect specific numbers, not 'a period'.",
    ],
  },
  {
    heading: "Your rights",
    body: [
      "You can ask us for a copy of what we hold about you, ask us to correct it, or ask us to delete it. Deleting your account removes your profile and saved villas. Booking requests already sent to an owner cannot be recalled from that owner.",
      `Write to ${SITE_CONTACT.email} and we will respond within a reasonable period.`,
    ],
  },
  {
    heading: "Cookies",
    body: [
      "We set a session cookie so that signing in works and so that a booking request can be submitted without an account. We do not run third-party advertising or analytics cookies.",
    ],
  },
  {
    heading: "Changes to this policy",
    body: [
      "If this policy changes materially we will update the date at the top and, where the change affects you directly, tell you by email.",
    ],
  },
];

export default function PrivacyPage() {
  return (
    <LegalPage
      title="Privacy policy"
      intro="StayVilla connects guests with the owners of private villas. That means handling a small amount of personal information and passing some of it on. This page sets out exactly what, why, and to whom."
      sections={SECTIONS}
    />
  );
}
