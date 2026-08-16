import type { Metadata } from "next";
import Image from "next/image";
import DestinationDialog from "@/components/admin/destinations/DestinationDialog";
import DeleteDestinationButton from "@/components/admin/destinations/DeleteDestinationButton";
import { createClient } from "@/lib/supabase/server";
import {
  getDestinations,
  getVillaCountsByDestination,
} from "@/lib/supabase/queries";

export const metadata: Metadata = {
  title: "Destinations | StayVilla Admin",
  description:
    "Manage the destinations villas are grouped under, including cover images, slugs, and the SEO copy each listing page uses.",
};

export default async function AdminDestinationsPage() {
  const supabase = await createClient();

  const [destinations, villaCounts] = await Promise.all([
    getDestinations(supabase),
    getVillaCountsByDestination(supabase),
  ]);

  return (
    <div>
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-medium text-charcoal">Destinations</h1>
          <p className="mt-1 text-sm text-slate">
            Manage the destinations villas are grouped under.
          </p>
        </div>
        <DestinationDialog />
      </div>

      {destinations.length === 0 ? (
        <p className="mt-10 text-center text-sm text-slate">
          No destinations yet. Add one to start listing villas.
        </p>
      ) : (
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {destinations.map((destination) => {
            const villaCount = villaCounts[destination.id] ?? 0;

            return (
              <div
                key={destination.id}
                className="rounded-2xl border border-pebble bg-white overflow-hidden"
              >
                <div className="relative aspect-[16/10] bg-sandstone">
                  {destination.image && (
                    <Image
                      src={destination.image}
                      alt={destination.name}
                      fill
                      sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                      className="object-cover"
                    />
                  )}
                </div>
                <div className="p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm text-charcoal truncate">
                        {destination.name}
                      </p>
                      <p className="text-xs text-slate truncate">
                        /{destination.slug}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <DestinationDialog destination={destination} />
                      <DeleteDestinationButton
                        destination={destination}
                        villaCount={villaCount}
                      />
                    </div>
                  </div>
                  <p className="mt-2 text-xs text-slate">
                    {villaCount} {villaCount === 1 ? "villa" : "villas"}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
