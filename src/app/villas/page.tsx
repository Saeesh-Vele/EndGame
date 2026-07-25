import type { Metadata } from "next";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import VillasPageClient from "@/components/villas/VillasPageClient";
import { allVillas, sampleDestinations } from "@/lib/data/sample";

type VillasSearchParams = Promise<{ destination?: string }>;

function findDestination(destination?: string) {
  if (!destination) return undefined;
  return sampleDestinations.find(
    (d) => d.slug === destination.toLowerCase()
  );
}

export async function generateMetadata({
  searchParams,
}: {
  searchParams: VillasSearchParams;
}): Promise<Metadata> {
  const { destination } = await searchParams;
  const destMeta = findDestination(destination);

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
  const destMeta = findDestination(destination);

  return (
    <>
      <Navbar transparent={false} />
      <VillasPageClient
        villas={allVillas}
        destinations={sampleDestinations}
        initialDestination={destMeta?.name}
      />
      <Footer />
    </>
  );
}
