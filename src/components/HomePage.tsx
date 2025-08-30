import HeroSection from "./HeroSection";
import SharedHeader from './SharedHeader';

const HomePage = () => {
  return (
    <div className="min-h-screen bg-background">
      <SharedHeader />
      <HeroSection />
    </div>
  );
};

export default HomePage;