import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import EcoMapVisualization from "@/components/EcoMapVisualization";
import HowItWorks from "@/components/HowItWorks";
import ImpactDashboard from "@/components/ImpactDashboard";
import CommunityFeed from "@/components/CommunityFeed";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        <HeroSection />
        <EcoMapVisualization />
        <HowItWorks />
        <ImpactDashboard />
        <CommunityFeed />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
