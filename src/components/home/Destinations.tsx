import Image from "next/image";
import Link from "next/link";
import { Destination } from "@/types";

export default function Destinations({
  destinations,
}: {
  destinations: Destination[];
}) {
  return (
    <section id="destinations" className="bg-sandstone py-16 sm:py-24">
      <div className="max-w-7xl mx-auto px-5 sm:px-8">
        <h2 className="font-display font-normal text-3xl sm:text-4xl text-charcoal">
          Pick a destination
        </h2>

        <div className="mt-10 flex gap-5 overflow-x-auto pb-2 sm:pb-0 sm:overflow-visible sm:grid sm:grid-cols-4 sm:gap-6 -mx-5 px-5 sm:mx-0 sm:px-0">
          {destinations.map((destination) => (
            <Link
              key={destination.id}
              href={`/villas?destination=${destination.slug}`}
              className="group cursor-pointer relative shrink-0 w-[220px] sm:w-auto aspect-[3/4] rounded-2xl overflow-hidden"
            >
              <Image
                src={destination.image}
                alt={destination.name}
                fill
                sizes="(min-width: 640px) 25vw, 220px"
                className="object-cover transition-transform duration-[600ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.03]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-charcoal/80 via-charcoal/10 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-5">
                <h3 className="text-white text-xl font-display font-normal">
                  {destination.name}
                </h3>
                <p className="mt-1 text-white/80 text-sm">
                  {destination.villa_count}{" "}
                  {destination.villa_count === 1 ? "villa" : "villas"}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
