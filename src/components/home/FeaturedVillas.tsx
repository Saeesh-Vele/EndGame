import { Villa } from "@/types";
import VillaCard from "./VillaCard";

export default function FeaturedVillas({ villas }: { villas: Villa[] }) {
  return (
    <section className="py-16 sm:py-24">
      <div className="max-w-7xl mx-auto px-5 sm:px-8">
        <div className="flex items-end justify-between gap-6">
          <div>
            <h2 className="font-display font-normal text-3xl sm:text-4xl text-charcoal">
              Popular this season
            </h2>
            <p className="mt-2 text-slate">
              Villas guests keep coming back to
            </p>
          </div>
          <a
            href="#"
            className="cursor-pointer shrink-0 text-sm font-medium text-forest hover:text-forest-light transition-colors duration-200"
          >
            View all
          </a>
        </div>

        <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-10">
          {villas.map((villa) => (
            <VillaCard key={villa.id} villa={villa} />
          ))}
        </div>
      </div>
    </section>
  );
}
