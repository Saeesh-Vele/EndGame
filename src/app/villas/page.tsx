import type { Metadata } from "next";
import { truncateForMeta } from "@/lib/meta-description";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import VillasPageClient from "@/components/villas/VillasPageClient";
import { createClient } from "@/lib/supabase/server";
import { getVillas, getDestinations } from "@/lib/supabase/queries";
import { Destination } from "@/types";

export const dynamic = "force-dynamic";

type VillasSearchParams = Promise<{
  destination?: string;
  checkIn?: string;
  checkOut?: string;
  guests?: string;
}>;

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

/** `?destination=goa,alibaug` → the matching destination names. */
function resolveDestinationNames(
  destinations: Destination[],
  param?: string
): string[] {
  if (!param) return [];

  const slugs = new Set(
    param
      .split(",")
      .map((slug) => slug.trim().toLowerCase())
      .filter(Boolean)
  );

  return destinations.filter((d) => slugs.has(d.slug)).map((d) => d.name);
}

function parseDate(value?: string) {
  return value && ISO_DATE.test(value) ? value : "";
}

function parseGuests(value?: string) {
  const parsed = Number.parseInt(value ?? "", 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
}

export async function generateMetadata({
  searchParams,
}: {
  searchParams: VillasSearchParams;
}): Promise<Metadata> {
  const { destination } = await searchParams;
  const supabase = await createClient();
  const destinations = await getDestinations(supabase);
  const names = resolveDestinationNames(destinations, destination);
  const destMeta =
    names.length === 1
      ? destinations.find((d) => d.name === names[0])
      : undefined;

  if (destMeta) {
    return {
      title: `Private Villas in ${destMeta.name} | StayVilla`,
      description: truncateForMeta(
        destMeta.meta_description,
        `Browse handpicked private villas in ${destMeta.name}. Verified owners, transparent pricing, full privacy.`,
      ),
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
  const params = await searchParams;
  const supabase = await createClient();
  const [villas, destinations] = await Promise.all([
    getVillas(supabase),
    getDestinations(supabase),
  ]);

  const initialDestinations = resolveDestinationNames(
    destinations,
    params.destination
  );

  // VillasPageClient owns the filter state and writes it back to the URL with
  // history.replaceState, which does not re-render this component. So a real
  // navigation to /villas with different params (footer link, homepage
  // search) has to remount it — otherwise its useState would keep the old
  // values. Keying on the incoming params does exactly that.
  const stateKey = [
    params.destination ?? "",
    params.checkIn ?? "",
    params.checkOut ?? "",
    params.guests ?? "",
  ].join("|");

  return (
    <>
      <Navbar transparent={false} />
      <VillasPageClient
        key={stateKey}
        villas={villas}
        destinations={destinations}
        initialDestinations={initialDestinations}
        initialCheckIn={parseDate(params.checkIn)}
        initialCheckOut={parseDate(params.checkOut)}
        initialGuests={parseGuests(params.guests)}
      />
      <Footer />
    </>
  );
}
