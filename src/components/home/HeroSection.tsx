import Image from "next/image";
import SearchPanel from "./SearchPanel";
import { Destination } from "@/types";

export default function HeroSection({
  destinations,
}: {
  destinations: Destination[];
}) {
  return (
    <section className="relative">
      <div className="relative h-[640px] sm:h-[720px] w-full overflow-hidden">
        <Image
          src="https://images.unsplash.com/photo-1613490493576-7fde63acd811?q=80&w=2400&auto=format&fit=crop"
          alt="Private villa with pool overlooking the coastline"
          fill
          priority
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-charcoal/70 via-charcoal/20 to-transparent" />

        <div className="relative h-full max-w-7xl mx-auto px-5 sm:px-8 flex flex-col justify-center pb-24 sm:pb-16">
          <h1 className="font-display font-normal text-5xl sm:text-7xl text-white max-w-3xl leading-[1.05]">
            Stay somewhere worth remembering
          </h1>
          <p className="mt-5 text-base sm:text-lg text-white/85 max-w-xl leading-relaxed">
            Handpicked private villas across India. Full privacy, no shared
            walls, just you and the view.
          </p>
        </div>
      </div>

      <SearchPanel destinations={destinations} />
    </section>
  );
}
