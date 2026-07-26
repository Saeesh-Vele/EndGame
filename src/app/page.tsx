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
