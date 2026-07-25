import type { Metadata } from "next";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import VillasPageClient from "@/components/villas/VillasPageClient";
import { createClient } from "@/lib/supabase/server";
import { getVillas, getDestinations } from "@/lib/supabase/queries";
import { Destination } from "@/types";

export const dynamic = "force-dynamic";

type VillasSearchParams = Promise<{ destination?: string }>;

function findDestination(destinations: Destination[], destination?: string) {
  if (!destination) return undefined;
  return destinations.find((d) => d.slug === destination.toLowerCase());
}

export async function generateMetadata({
  searchParams,
}: {
  searchParams: VillasSearchParams;
}): Promise<Metadata> {
  const { destination } = await searchParams;
  const supabase = await createClient();
  const destinations = await getDestinations(supabase);
  const destMeta = findDestination(destinations, destination);

  if (destMeta) {
    return {
      title: `Private Villas in ${destMeta.name} | StayVilla`,
      description:
        destMeta.meta_description ??
        `Browse handpicked private villas in ${destMeta.name}. Verified owners, transparent pricing, full privacy.`,
    };
  }

  return {
    title: "Browse Private Villas Across India | StayVilla",
    description:
      "Browse handpicked private villas across India. Filter by destination, price, bedrooms, and amenities.",
  };
}

export default async function VillasPage({
  searchParams,
}: {
  searchParams: VillasSearchParams;
}) {
  const { destination } = await searchParams;
  const supabase = await createClient();
  const [villas, destinations] = await Promise.all([
    getVillas(supabase),
    getDestinations(supabase),
  ]);
  const destMeta = findDestination(destinations, destination);

  return (
    <>
      <Navbar transparent={false} />
      <VillasPageClient
        villas={villas}
        destinations={destinations}
        initialDestination={destMeta?.name}
      />
      <Footer />
    </>
  );
}
