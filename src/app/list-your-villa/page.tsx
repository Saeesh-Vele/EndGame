import type { Metadata } from "next";
import { Camera, HandCoins, MessageCircle, Route } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import VillaSubmissionForm from "@/components/submissions/VillaSubmissionForm";
import { createClient } from "@/lib/supabase/server";
import { getDestinations } from "@/lib/supabase/queries";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "List Your Villa",
  description:
    "Reach guests who want a whole private property, not a hotel room. Zero commission on inquiries, and we visit every villa in person before it goes live.",
  openGraph: {
    title: "List Your Villa on StayVilla",
    description:
      "No commission on inquiries. We visit every property before it goes live.",
    type: "website",
  },
};

const PROMISES = [
  {
    icon: HandCoins,
    title: "No commission on inquiries",
    body: "Guests contact you directly. We don't sit in the middle of the booking or take a cut of it.",
  },
  {
    icon: Route,
    title: "We visit before you go live",
    body: "Someone from the team comes to the property, walks through it, and checks it matches the listing.",
  },
  {
    icon: Camera,
    title: "We shoot the photos",
    body: "Professional photography on the visit, at no cost to you. No stock images anywhere on StayVilla.",
  },
  {
    icon: MessageCircle,
    title: "You keep control",
    body: "Your calendar, your pricing, your rules. Pull the listing whenever you like.",
  },
];

const STEPS = [
  {
    step: "01",
    title: "Send us the details",
    body: "The form below takes about five minutes. Rough numbers are fine.",
  },
  {
    step: "02",
    title: "We get in touch",
    body: "Expect a call or WhatsApp within 48 hours to talk through the property.",
  },
  {
    step: "03",
    title: "We visit and shoot",
    body: "A team member visits, verifies the property, and photographs it.",
  },
  {
    step: "04",
    title: "You go live",
    body: "We build the listing, you approve it, and guests start reaching out.",
  },
];

export default async function ListYourVillaPage() {
  const supabase = await createClient();
  const destinations = await getDestinations(supabase);

  return (
    <>
      <Navbar transparent={false} />

      <main className="pt-18">
        <section className="bg-sandstone">
          <div className="max-w-3xl mx-auto px-5 sm:px-8 py-14 sm:py-20 text-center">
            <p className="text-xs uppercase tracking-[0.18em] text-slate">
              For property owners
            </p>
            <h1 className="mt-3 font-display font-normal text-4xl sm:text-5xl text-charcoal leading-[1.1]">
              List your villa on StayVilla
            </h1>
            <p className="mt-5 text-base sm:text-lg text-slate leading-relaxed">
              StayVilla is a small, handpicked collection of private villas
              across India. Every property on it has been visited by someone on
              our team. If yours is a good fit, tell us about it below — it
              takes about five minutes, and we&apos;ll come back to you within
              48 hours.
            </p>
          </div>
        </section>

        <section className="max-w-7xl mx-auto px-5 sm:px-8 py-14 sm:py-20">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {PROMISES.map((promise) => (
              <div key={promise.title}>
                <promise.icon size={22} className="text-forest" />
                <h2 className="mt-4 text-base text-charcoal">
                  {promise.title}
                </h2>
                <p className="mt-2 text-sm text-slate leading-relaxed">
                  {promise.body}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-white border-y border-pebble">
          <div className="max-w-7xl mx-auto px-5 sm:px-8 py-14 sm:py-20">
            <h2 className="font-display font-normal text-3xl sm:text-4xl text-charcoal">
              How it works
            </h2>
            <ol className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {STEPS.map((step) => (
                <li key={step.step}>
                  <span className="font-display text-3xl text-forest">
                    {step.step}
                  </span>
                  <h3 className="mt-3 text-base text-charcoal">{step.title}</h3>
                  <p className="mt-2 text-sm text-slate leading-relaxed">
                    {step.body}
                  </p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="max-w-3xl mx-auto px-5 sm:px-8 py-14 sm:py-20">
          <h2 className="font-display font-normal text-3xl sm:text-4xl text-charcoal">
            Tell us about your property
          </h2>
          <p className="mt-3 text-slate leading-relaxed">
            Only the first few fields are required. Everything else helps us
            come to the call prepared.
          </p>

          <div className="mt-8">
            <VillaSubmissionForm destinations={destinations} />
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
