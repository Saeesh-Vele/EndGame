import { ShieldCheck, ReceiptText, PhoneCall } from "lucide-react";

const points = [
  {
    icon: ShieldCheck,
    title: "Personally verified",
    description:
      "Every villa is visited in person before it's listed — photos, amenities, and access are exactly as described.",
  },
  {
    icon: ReceiptText,
    title: "Transparent pricing",
    description:
      "The price you see is the price you pay. No surprise cleaning fees or service charges added at checkout.",
  },
  {
    icon: PhoneCall,
    title: "Direct owner contact",
    description:
      "Message the villa owner directly on WhatsApp for anything you need, before and during your stay.",
  },
];

export default function WhySection() {
  return (
    <section className="py-16 sm:py-24">
      <div className="max-w-7xl mx-auto px-5 sm:px-8">
        <div className="max-w-2xl">
          <h2 className="font-display font-normal text-3xl sm:text-4xl text-charcoal">
            Not another hotel booking app
          </h2>
          <p className="mt-3 text-slate leading-relaxed">
            Every villa on StayVilla is verified in person, priced honestly,
            and backed by an owner you can actually reach.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-10 sm:gap-8">
          {points.map((point) => (
            <div key={point.title}>
              <div className="flex items-center justify-center h-12 w-12 rounded-xl bg-forest/10">
                <point.icon size={22} className="text-forest" />
              </div>
              <h3 className="mt-5 text-lg text-charcoal">{point.title}</h3>
              <p className="mt-2 text-sm text-slate leading-relaxed">
                {point.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
