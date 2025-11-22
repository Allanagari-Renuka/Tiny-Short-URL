import { Navbar } from "@/components/Navbar";
import UrlShortener from "@/components/UrlShortener";
import { HowItWorks } from "@/components/HowItWorks";
import { RecentUrls } from "@/components/RecentUrls";
import Analytics  from "@/components/Analytics";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        <UrlShortener />
        <HowItWorks />
        <RecentUrls />
        <Analytics />
      </main>
    </div>
  );
};

export default Index;
