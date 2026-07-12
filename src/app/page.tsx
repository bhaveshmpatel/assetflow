import { HeroSection } from "@/components/landing/HeroSection";
import { BentoGrid } from "@/components/landing/BentoGrid";
import { SocialProof } from "@/components/landing/SocialProof";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <HeroSection />
      <SocialProof />
      <BentoGrid />
    </div>
  );
}
