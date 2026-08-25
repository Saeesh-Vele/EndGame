import type { Metadata } from "next";
import Link from "next/link";
import { Mail, MessageCircle } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ContactForm from "@/components/about/ContactForm";
import { SITE_CONTACT, whatsappHref } from "@/lib/site";

export const metadata: Metadata = {
  title: "About",
  description:
    "A handpicked collection of private villas across India. Every property is visited and verified in person — no stock photos, no booking fees, no middleman.",
  openGraph: {
    title: "About StayVilla",
    description:
      "Every villa visited and verified. No stock photos. Transparent pricing. Direct owner contact.",
    type: "website",
  },
};

const PRINCIPLES = [
  {
    title: "Every villa is visited",
    body: "Someone from the team has stood in every property on this site. If we haven't been, it isn't listed. That's the whole filter.",
  },
  {
    title: "No stock photos",
    body: "The pictures are ours, shot on the visit. What you see is the actual room, at the actual time of day, with the actual view.",
  },
  {
    title: "Transparent pricing",
    body: "The nightly rate is the nightly rate. Weekend and seasonal rates are shown up front, and there is no service fee bolted on at the end.",
  },
  {
    title: "You talk to the owner",
    body: "We pass you straight to whoever runs the property. We don't sit between you and them, and we don't take a cut of what you agree.",
  },
];

const GUEST_STEPS = [
  {
    step: "01",
    title: "Browse",
    body: "Filter by destination, dates, price, and how many of you there are.",
  },
  {
    step: "02",
    title: "Inquire",
    body: "Send a request or message the owner on WhatsApp. Usually answered the same day.",
  },
  {
    step: "03",
    title: "Book",
    body: "Agree the dates and payment directly with the owner. We're around if anything goes sideways.",
  },
];

const OWNER_STEPS = [
  {
    step: "01",
    title: "Submit",
    body: "Send us the property details through the listing form. Takes about five minutes.",
  },
  {
    step: "02",
    title: "We visit",
    body: "We come out, walk the property, verify it matches, and photograph it.",
  },
  {
    step: "03",
    title: "Go live",
    body: "We build the listing, you approve it, and guests start reaching out.",
  },
];

function Steps({
  heading,
  steps,
}: {
  heading: string;
  steps: { step: string; title: string; body: string }[];
}) {
  return (
    <div>
      <h3 className="text-base font-medium text-charcoal">{heading}</h3>
      <ol className="mt-6 flex flex-col gap-6">
        {steps.map((item) => (
          <li key={item.step} className="flex gap-4">
            <span className="font-display text-2xl text-forest shrink-0 leading-none pt-0.5">
              {item.step}
            </span>
            <div>
              <p className="text-sm text-charcoal">{item.title}</p>
              <p className="mt-1 text-sm text-slate leading-relaxed">
                {item.body}
              </p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}

export default function AboutPage() {
  return (
    <>
      <Navbar transparent={false} />

      <main className="pt-18">
        <section className="bg-sandstone">
          <div className="max-w-3xl mx-auto px-5 sm:px-8 py-14 sm:py-20">
            <p className="text-xs uppercase tracking-[0.18em] text-slate">
              About
            </p>
            <h1 className="mt-3 font-display font-normal text-4xl sm:text-5xl text-charcoal leading-[1.1]">
              A short list of villas we&apos;d actually stay in
            </h1>
            <p className="mt-5 text-base sm:text-lg text-slate leading-relaxed">
              StayVilla is a small collection of private villas across India.
              Not a marketplace, not an aggregator — a list that grows slowly
              because someone has to physically go and look at each place
              before it goes on.
            </p>
          </div>
        </section>

        <section className="max-w-7xl mx-auto px-5 sm:px-8 py-14 sm:py-20">
          <h2 className="font-display font-normal text-3xl sm:text-4xl text-charcoal">
            How we work
          </h2>
          <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 gap-x-10 gap-y-8">
            {PRINCIPLES.map((principle) => (
              <div key={principle.title}>
                <h3 className="text-base text-charcoal">{principle.title}</h3>
                <p className="mt-2 text-sm text-slate leading-relaxed">
                  {principle.body}
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
            <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16">
              <Steps heading="If you're staying" steps={GUEST_STEPS} />
              <Steps heading="If you own a villa" steps={OWNER_STEPS} />
            </div>

            <div className="mt-12 flex flex-col sm:flex-row gap-3">
              <Link
                href="/villas"
                className="cursor-pointer inline-flex items-center justify-center rounded-xl bg-forest px-7 py-3.5 text-sm font-medium text-white transition-colors duration-200 hover:bg-forest-light active:bg-forest-dark"
              >
                Browse villas
              </Link>
              <Link
                href="/list-your-villa"
                className="cursor-pointer inline-flex items-center justify-center rounded-xl border border-pebble px-7 py-3.5 text-sm text-charcoal transition-colors duration-200 hover:border-forest"
              >
                List your villa
              </Link>
            </div>
          </div>
        </section>

        {/* Linked from the footer as /about#contact — the id has to stay. */}
        <section
          id="contact"
          className="scroll-mt-24 max-w-3xl mx-auto px-5 sm:px-8 py-14 sm:py-20"
        >
          <h2 className="font-display font-normal text-3xl sm:text-4xl text-charcoal">
            Get in touch
          </h2>
          <p className="mt-3 text-slate leading-relaxed">
            Questions about a property, a booking that&apos;s gone quiet, or a
            villa you think should be on here — any of it, either way below.
            We&apos;re a small team, so you&apos;ll get a person.
          </p>

          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <a
              href={`mailto:${SITE_CONTACT.email}`}
              className="cursor-pointer rounded-2xl bg-white p-6 shadow-sm transition-colors duration-200 hover:bg-white/70"
            >
              <Mail size={20} className="text-forest" />
              <p className="mt-4 text-sm text-charcoal">Email</p>
              <p className="mt-1 text-sm text-slate break-all">
                {SITE_CONTACT.email}
              </p>
            </a>

            <a
              href={whatsappHref("Hi StayVilla, I have a question.")}
              target="_blank"
              rel="noopener noreferrer"
              className="cursor-pointer rounded-2xl bg-white p-6 shadow-sm transition-colors duration-200 hover:bg-white/70"
            >
              <MessageCircle size={20} className="text-forest" />
              <p className="mt-4 text-sm text-charcoal">WhatsApp</p>
              <p className="mt-1 text-sm text-slate">{SITE_CONTACT.whatsapp}</p>
            </a>
          </div>

          <div className="mt-10">
            <h3 className="text-base font-medium text-charcoal">
              Or send us a message
            </h3>
            <p className="mt-1 text-sm text-slate">
              We read everything that comes through here.
            </p>
            <div className="mt-6">
              <ContactForm />
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
