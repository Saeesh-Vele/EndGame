import type { Metadata } from "next";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import HeroSection from "@/components/home/HeroSection";
import FeaturedVillas from "@/components/home/FeaturedVillas";
import Destinations from "@/components/home/Destinations";
import WhySection from "@/components/home/WhySection";
import CTASection from "@/components/home/CTASection";
import { createClient } from "@/lib/supabase/server";
import {
  getFeaturedVillas,
  getDestinationsWithCounts,
} from "@/lib/supabase/queries";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "StayVilla — Handpicked Private Villas Across India",
  description:
    "Book private villas in Goa, Lonavala, Udaipur and Alibaug. Every stay visited and verified in person, with direct host contact and zero service fees.",
};

export default async function Home() {
  const supabase = await createClient();
  const [featuredVillas, destinations] = await Promise.all([
    getFeaturedVillas(supabase),
    getDestinationsWithCounts(supabase),
  ]);

  return (
    <>
      <Navbar />
      <main>
        <HeroSection destinations={destinations} />
        <FeaturedVillas villas={featuredVillas} />
        <Destinations destinations={destinations} />
        <WhySection />
        <CTASection />
      </main>
      <Footer />
    </>
  );
}
