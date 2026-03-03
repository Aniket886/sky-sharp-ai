import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import HowItWorks from "@/components/HowItWorks";
import BeforeAfterSlider from "@/components/BeforeAfterSlider";
import BentoGrid from "@/components/BentoGrid";
import Footer from "@/components/Footer";

const Index = () => (
  <div className="min-h-screen bg-background">
    <Navbar />
    <HeroSection />
    <HowItWorks />
    <BeforeAfterSlider />
    <BentoGrid />
    <Footer />
  </div>
);

export default Index;
