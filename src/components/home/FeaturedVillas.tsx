import Link from "next/link";
import { Villa } from "@/types";
import VillaCard from "./VillaCard";
import { Button } from "@/components/ui/button";

export default function FeaturedVillas({ villas }: { villas: Villa[] }) {
  return (
    <section className="py-20 sm:py-28">
      <div className="max-w-7xl mx-auto px-5 sm:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
          <div>
            <span className="text-xs font-semibold uppercase tracking-widest text-slate">
              Curated Selection
            </span>
            <h2 className="font-display font-normal text-3xl sm:text-4xl text-charcoal mt-1">
              Popular this season
            </h2>
            <p className="mt-2 text-slate text-sm sm:text-base">
              Villas guests keep coming back to for exceptional stays
            </p>
          </div>
          <Button variant="outline" asChild className="shrink-0 hidden sm:inline-flex">
            <Link href="/villas">View all villas</Link>
          </Button>
        </div>

        <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
          {villas.map((villa) => (
            <VillaCard key={villa.id} villa={villa} />
          ))}
        </div>

        <Button variant="outline" asChild className="mt-10 w-full sm:hidden">
          <Link href="/villas">View all villas</Link>
        </Button>
      </div>
    </section>
  );
}

