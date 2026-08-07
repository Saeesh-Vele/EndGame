import Image from "next/image";
import Link from "next/link";
import { Destination } from "@/types";

export default function Destinations({
  destinations,
}: {
  destinations: Destination[];
}) {
  return (
    <section id="destinations" className="bg-sandstone/80 py-20 sm:py-28 border-y border-pebble">
      <div className="max-w-7xl mx-auto px-5 sm:px-8">
        <div className="max-w-2xl mb-12">
          <span className="text-xs font-semibold uppercase tracking-widest text-slate">
            Getaways
          </span>
          <h2 className="font-display font-normal text-3xl sm:text-4xl text-charcoal mt-1">
            Explore by destination
          </h2>
          <p className="mt-2 text-slate text-sm sm:text-base">
            From beachside retreats in Goa to misty hilltops in Lonavala
          </p>
        </div>

        <div className="flex gap-5 overflow-x-auto pb-4 snap-x snap-mandatory sm:pb-0 sm:overflow-visible sm:grid sm:grid-cols-2 md:grid-cols-4 sm:gap-6 -mx-5 px-5 sm:mx-0 sm:px-0">
          {destinations.map((destination) => (
            <Link
              key={destination.id}
              href={`/villas?destination=${destination.slug}`}
              className="group cursor-pointer relative shrink-0 w-[75vw] max-w-[280px] sm:w-auto aspect-[3/4] rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition-all duration-300 snap-start"
            >
              <Image
                src={destination.image}
                alt={destination.name}
                fill
                sizes="(min-width: 768px) 25vw, (min-width: 640px) 50vw, 75vw"
                className="object-cover transition-transform duration-500 ease-out-smooth group-hover:scale-[1.04]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-charcoal/85 via-charcoal/20 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6 flex flex-col justify-end">
                <h3 className="text-white text-xl font-display font-normal tracking-wide">
                  {destination.name}
                </h3>
                <div className="mt-2 flex items-center gap-2">
                  <span className="inline-block rounded-full bg-white/20 backdrop-blur-xs px-2.5 py-0.5 text-xs text-white font-medium">
                    {destination.villa_count}{" "}
                    {destination.villa_count === 1 ? "villa" : "villas"}
                  </span>
                </div>
              </div>
            </Link>
          ))}
          {/* Mobile trailing spacer so last card has proper end margin */}
          <div className="w-2 shrink-0 sm:hidden" aria-hidden />
        </div>
      </div>
    </section>
  );
}


