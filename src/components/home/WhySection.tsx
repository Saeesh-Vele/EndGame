import { ShieldCheck, ReceiptText, PhoneCall } from "lucide-react";
import { Card } from "@/components/ui/card";

const points = [
  {
    icon: ShieldCheck,
    title: "100% In-Person Verified",
    description:
      "Every villa is inspected by our team. Photos, floor plans, and amenities are verified on site before listing.",
  },
  {
    icon: ReceiptText,
    title: "Transparent Pricing",
    description:
      "Honest nightly rates upfront. Zero surprise service fees or hidden cleaning charges added at checkout.",
  },
  {
    icon: PhoneCall,
    title: "Direct Host Contact",
    description:
      "Connect directly with villa hosts via WhatsApp. Get instant answers, tailored requests, and local recommendations.",
  },
];

export default function WhySection() {
  return (
    <section className="py-20 sm:py-28">
      <div className="max-w-7xl mx-auto px-5 sm:px-8">
        <div className="max-w-2xl">
          <span className="text-xs font-semibold uppercase tracking-widest text-slate">
            The StayVilla Difference
          </span>
          <h2 className="font-display font-normal text-3xl sm:text-4xl text-charcoal mt-1">
            Built for peace of mind
          </h2>
          <p className="mt-3 text-slate text-sm sm:text-base leading-relaxed">
            Not an anonymous booking engine. A curated collection of private sanctuaries, 
            backed by real host connections and honest standards.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8">
          {points.map((point) => (
            <Card key={point.title} className="p-8 sm:p-10 hover:shadow-md transition-shadow duration-300">
              <div className="flex items-center justify-center h-12 w-12 rounded-xl bg-forest/10 text-forest">
                <point.icon size={22} />
              </div>
              <h3 className="mt-6 text-lg font-semibold text-charcoal">{point.title}</h3>
              <p className="mt-2 text-sm text-slate leading-relaxed">
                {point.description}
              </p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}


