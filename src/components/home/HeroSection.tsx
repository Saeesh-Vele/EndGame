import Image from "next/image";
import SearchPanel from "./SearchPanel";
import { Destination } from "@/types";
import { ShieldCheck, Sparkles, HeartHandshake } from "lucide-react";

export default function HeroSection({
  destinations,
}: {
  destinations: Destination[];
}) {
  return (
    <section className="relative">
      <div className="relative h-[680px] sm:h-[760px] w-full overflow-hidden bg-charcoal">
        <Image
          src="https://images.unsplash.com/photo-1613490493576-7fde63acd811?q=80&w=2400&auto=format&fit=crop"
          alt="Private luxury villa with pool overlooking the coastline"
          fill
          priority
          sizes="100vw"
          quality={65}
          className="object-cover object-center"
        />
        {/* Layered luxury scrim gradient for high text contrast */}
        <div className="absolute inset-0 bg-gradient-to-t from-charcoal/95 via-charcoal/50 to-charcoal/30" />
        <div className="absolute inset-0 bg-black/20 backdrop-blur-[1px]" />

        <div className="relative h-full max-w-7xl mx-auto px-5 sm:px-8 flex flex-col justify-center pb-28 sm:pb-20">
          {/* Eyebrow Pill with Guaranteed WCAG AA Contrast */}
          <div className="inline-flex items-center gap-2 self-start rounded-full bg-charcoal/75 backdrop-blur-md px-4 py-1.5 text-xs text-white border border-white/25 mb-6 shadow-xs">
            <Sparkles size={14} className="text-sandstone" />
            <span className="tracking-wider uppercase text-xs font-semibold">
              Handpicked Luxury Villas
            </span>
          </div>

          <h1 className="font-display font-normal text-4xl sm:text-6xl md:text-7xl text-white max-w-3xl leading-[1.06] tracking-tight">
            Stay somewhere worth remembering
          </h1>
          
          <p className="mt-5 text-base sm:text-lg text-white/90 max-w-xl leading-relaxed font-normal">
            Private sanctuaries across India. Handpicked, in-person verified, 
            with direct host connection and zero service fees.
          </p>

          {/* Micro Trust Pills */}
          <div className="mt-8 flex flex-wrap items-center gap-3 sm:gap-6 text-xs text-white">
            <span className="flex items-center gap-1.5 bg-charcoal/65 backdrop-blur-xs px-3.5 py-1.5 rounded-full border border-white/20">
              <ShieldCheck size={14} className="text-sandstone shrink-0" />
              100% In-Person Verified
            </span>
            <span className="flex items-center gap-1.5 bg-charcoal/65 backdrop-blur-xs px-3.5 py-1.5 rounded-full border border-white/20">
              <HeartHandshake size={14} className="text-sandstone shrink-0" />
              Direct Host Contact
            </span>
          </div>
        </div>
      </div>

      <SearchPanel destinations={destinations} />
    </section>
  );
}

