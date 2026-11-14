import { AvailableToolsSection } from "@/components/landing/available-tools-section";
import { HeroSection } from "@/components/landing/hero-section";
import { HomeSections } from "@/components/landing/home-sections";

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <HomeSections />
      <AvailableToolsSection />
    </>
  );
}
