import HeroSection1 from "./HeroSection1";
import PersonalityQuizHook from "./PersonalityQuizHook";
import { Button } from "@/components/ui/button";
import { useNavigate } from 'react-router-dom';

const HomePage1 = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-background">
      <HeroSection1 />
      <PersonalityQuizHook />
    </div>
  );
};

export default HomePage1;
