import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function CTASection() {
  return (
    <section className="bg-forest relative overflow-hidden py-20 sm:py-28 text-white">
      <div className="absolute inset-0 bg-gradient-to-b from-white/10 via-transparent to-transparent pointer-events-none" />
      <div className="relative max-w-7xl mx-auto px-5 sm:px-8 text-center">
        <span className="text-xs font-semibold uppercase tracking-widest text-sandstone">
          Host Your Sanctuary
        </span>
        <h2 className="font-display font-normal text-3xl sm:text-5xl text-white mt-2 max-w-2xl mx-auto leading-tight">
          Have a villa worth sharing?
        </h2>
        <p className="mt-4 text-white/90 text-base sm:text-lg max-w-xl mx-auto leading-relaxed">
          List your private villa on StayVilla and connect with guests looking for a 
          private stay, not a hotel room. Zero commission on inquiries.
        </p>
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button size="lg" asChild className="bg-white text-forest hover:bg-sandstone border-none font-medium">
            <Link href="/list-your-villa">List your villa</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}


