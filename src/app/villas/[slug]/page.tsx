import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ImageGallery from "@/components/villa/ImageGallery";
import VillaInfoHeader from "@/components/villa/VillaInfoHeader";
import QuickStats from "@/components/villa/QuickStats";
import HostSection from "@/components/villa/HostSection";
import Description from "@/components/villa/Description";
import AmenitiesGrid from "@/components/villa/AmenitiesGrid";
import LocationSection from "@/components/villa/LocationSection";
import BookingCard from "@/components/villa/BookingCard";
import ReviewsSection from "@/components/villa/ReviewsSection";
import SimilarVillas from "@/components/villa/SimilarVillas";
import { allVillas, sampleDestinations } from "@/lib/data/sample";

type VillaParams = Promise<{ slug: string }>;

function findVilla(slug: string) {
  return allVillas.find((v) => v.slug === slug);
}

export async function generateStaticParams() {
  return allVillas.map((villa) => ({ slug: villa.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: VillaParams;
}): Promise<Metadata> {
  const { slug } = await params;
  const villa = findVilla(slug);

  if (!villa) {
    return { title: "Villa not found | StayVilla" };
  }

  return {
    title: `${villa.name} — ${villa.location} | StayVilla`,
    description: villa.description.slice(0, 160),
  };
}

export default async function VillaDetailPage({
  params,
}: {
  params: VillaParams;
}) {
  const { slug } = await params;
  const villa = findVilla(slug);

  if (!villa) notFound();

  const destinationMeta = sampleDestinations.find(
    (d) => d.name === villa.destination
  );

  const similarVillas = allVillas
    .filter((v) => v.destination === villa.destination && v.id !== villa.id)
    .slice(0, 6);

  return (
    <>
      <Navbar transparent={false} />
      <main className="pt-18">
        <ImageGallery images={villa.images} villaName={villa.name} />

        <div className="max-w-7xl mx-auto px-5 sm:px-8 py-6">
          <VillaInfoHeader
            name={villa.name}
            location={villa.location}
            rating={villa.rating}
            reviewCount={villa.review_count}
          />
        </div>

        <div className="max-w-7xl mx-auto px-5 sm:px-8 pb-16 sm:pb-24">
          <div className="flex flex-col lg:flex-row gap-10">
            <div className="lg:w-[60%] min-w-0">
              <QuickStats
                guests={villa.max_guests}
                bedrooms={villa.bedrooms}
                bathrooms={villa.bathrooms}
                beds={villa.beds ?? villa.bedrooms}
              />
              <HostSection
                ownerName={villa.owner_name ?? "the host"}
                hostSince={villa.host_since}
                isSuperhost={villa.is_superhost}
              />
              <Description text={villa.description} />
              <AmenitiesGrid
                amenities={villa.full_amenities ?? villa.amenities}
              />
              <LocationSection
                location={villa.location}
                description={destinationMeta?.meta_description}
              />
            </div>

            <div className="lg:w-[40%]">
              <BookingCard
                villaName={villa.name}
                pricePerNight={villa.price_per_night}
                weekendPrice={villa.weekend_price}
                maxGuests={villa.max_guests}
                ownerName={villa.owner_name}
                ownerWhatsapp={villa.owner_whatsapp}
              />
            </div>
          </div>

          <ReviewsSection
            rating={villa.rating}
            reviewCount={villa.review_count}
            reviews={villa.reviews ?? []}
          />

          <SimilarVillas
            villas={similarVillas}
            destination={villa.destination}
          />
        </div>
      </main>
      <Footer />
    </>
  );
}
