import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import HeroSection from "@/components/home/HeroSection";
import FeaturedVillas from "@/components/home/FeaturedVillas";
import Destinations from "@/components/home/Destinations";
import WhySection from "@/components/home/WhySection";
import CTASection from "@/components/home/CTASection";
import { featuredVillas, sampleDestinations } from "@/lib/data/sample";

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <HeroSection />
        <FeaturedVillas villas={featuredVillas} />
        <Destinations destinations={sampleDestinations} />
        <WhySection />
        <CTASection />
      </main>
      <Footer />
    </>
  );
}
