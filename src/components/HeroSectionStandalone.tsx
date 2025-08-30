import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const HeroSectionStandalone = () => {
  const [isVisible, setIsVisible] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 300);
    return () => clearTimeout(timer);
  }, []);

  return (
    <section className="relative h-screen flex items-center justify-center overflow-hidden bg-gradient-to-b from-palo-background to-background">
      {/* Video Background Placeholder */}
      <div className="absolute inset-0 bg-gradient-to-br from-palo-accent/10 via-palo-background to-palo-secondary/20 watercolor-bg" />

      {/* Content */}
      <div className={`relative z-10 text-center px-4 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        }`}>
        <div className="mb-6 md:mb-8">
          <img
            src="/logo.png"
            alt="ANUSCHKA Logo"
            className="h-16 md:h-20 lg:h-32 mx-auto"
          />
        </div>
        <div className="h-1 w-24 md:w-32 bg-gradient-to-r from-palo-accent to-palo-secondary mx-auto mb-6 md:mb-8 rounded-full" />
        <p className="font-heading text-lg md:text-xl lg:text-2xl text-palo-primary mb-4 md:mb-6 italic">
          Anuschka Matchmaker – Art Meets You
        </p>
        <p className="font-heading text-lg md:text-xl lg:text-2xl text-palo-primary mb-4 md:mb-6 italic">
          Not just a bag. A reflection of you.
        </p>
        <div className="font-body text-base md:text-lg lg:text-xl text-muted-foreground max-w-2xl mx-auto mb-12 md:mb-16 leading-relaxed px-2 space-y-2">
          <p>
            At Anuschka, we believe that every bag is more than just an accessory.
          </p>
          <p>
            It's a piece of art, handcrafted to reflect your individuality.
          </p>
          <p>
            Our exclusive Matchmaker Quiz helps you find the perfect bag that resonates with your unique style.
          </p>
        </div>

        {/* CTAs */}
        <div className="flex flex-col lg:flex-row gap-4 lg:gap-6 justify-center items-center mb-16 md:mb-20 px-4">
          <Button
            onClick={() => navigate('/personality-quiz')}
            size="lg"
            className="w-full lg:w-auto bg-palo-primary hover:bg-palo-accent text-white px-8 md:px-12 py-3 md:py-4 text-base md:text-lg font-body rounded-full transition-all duration-300 active:scale-95 lg:hover:scale-105 lg:hover:shadow-lg"
          >
            Take a Quiz
          </Button>

          <Button
            onClick={() => navigate('/personality-quiz-result')}
            size="lg"
            variant="outline"
            className="w-full lg:w-auto border-2 border-palo-primary text-palo-primary hover:bg-palo-primary hover:text-white px-8 md:px-12 py-3 md:py-4 text-base md:text-lg font-body rounded-full transition-all duration-300 active:scale-95 lg:hover:scale-105 lg:hover:shadow-lg"
          >
            Join Circle
          </Button>
        </div>
      </div>
    </section>
  );
};

export default HeroSectionStandalone;
