import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const HeroSection = () => {
  const [isVisible, setIsVisible] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 300);
    return () => clearTimeout(timer);
  }, []);

  const scrollToCollection = () => {
    const element = document.getElementById('collection');
    element?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <>
      <section className="relative overflow-hidden bg-gradient-to-b from-palo-background to-background">
        {/* Adaptive Hero Banner with Image - Using viewport units for better scaling */}
        <div className="relative w-full h-[40vh] min-h-[300px] max-h-[600px] sm:h-[45vh] md:h-[50vh] lg:h-[55vh] xl:h-[60vh] 2xl:h-[65vh] overflow-hidden">
          <img
            src="/WhatsApp Image 2025-08-20 at 17.11.00 (1) copy.jpeg"
            alt="Hero banner image featuring six women"
            className="w-full h-full object-cover object-center sm:object-center md:object-center lg:object-center xl:object-center 2xl:object-center"
            loading="eager"
            style={{
              objectPosition: 'center 20%'
            }}
          />
          {/* Subtle gradient overlay for better text readability */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/5 via-transparent to-black/15"></div>
        </div>

        {/* Content with dynamic spacing and sizing */}
        <div className={`text-center px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 py-6 sm:py-8 md:py-10 lg:py-12 xl:py-16 2xl:py-20 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}>
          <div className="mb-4 sm:mb-6 md:mb-8 lg:mb-10 xl:mb-12">
            <img
              src="/logo.png"
              alt="ANUSCHKA Logo"
              className="h-10 sm:h-14 md:h-18 lg:h-20 xl:h-24 2xl:h-28 mx-auto"
            />
          </div>
          
          {/* Dynamic divider */}
          <div className="h-0.5 sm:h-1 w-16 sm:w-20 md:w-24 lg:w-28 xl:w-32 2xl:w-36 bg-gradient-to-r from-palo-accent to-palo-secondary mx-auto mb-4 sm:mb-6 md:mb-8 lg:mb-10 xl:mb-12 rounded-full" />
          
          {/* Dynamic typography scaling */}
          <p className="font-heading text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl 2xl:text-3xl text-palo-primary mb-2 sm:mb-3 md:mb-4 lg:mb-5 xl:mb-6 italic leading-tight">
            Anuschka Matchmaker – Art Meets You
          </p>
          <p className="font-heading text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl 2xl:text-3xl text-palo-primary mb-3 sm:mb-4 md:mb-5 lg:mb-6 xl:mb-8 italic leading-tight">
            Not just a bag. A reflection of you.
          </p>
          
          {/* Dynamic description with better line height */}
          <div className="font-body text-xs sm:text-sm md:text-base lg:text-lg xl:text-xl 2xl:text-2xl text-muted-foreground max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl 2xl:max-w-2xl mx-auto mb-6 sm:mb-8 md:mb-10 lg:mb-12 xl:mb-16 leading-relaxed px-2 space-y-2">
            <p>
            At Anuschka, we believe every bag is more than a mere accessory it's a handcrafted
            piece of art designed to reflect your individuality. Our exclusive Matchmaker Quiz helps
            you find the perfect bag that resonates with your unique style.
            </p>
          </div>

          {/* Dynamic CTA buttons with better responsive behavior */}
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 md:gap-4 lg:gap-6 justify-center items-center mb-8 sm:mb-10 md:mb-12 lg:mb-16 xl:mb-20 px-2 sm:px-4">
            <Button
              onClick={() => navigate('/personality-quiz')}
              size="lg"
              className="w-full sm:w-auto bg-palo-primary hover:bg-palo-accent text-white px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12 py-2 sm:py-2.5 md:py-3 lg:py-4 text-xs sm:text-sm md:text-base lg:text-lg xl:text-xl font-body rounded-full transition-all duration-300 active:scale-95 hover:scale-105 hover:shadow-lg"
            >
              Shop by Personality
            </Button>

            <Button
              onClick={() => navigate('/upload')}
              size="lg"
              variant="outline"
              className="w-full sm:w-auto border-2 border-palo-primary text-palo-primary hover:bg-palo-primary hover:text-white px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12 py-2 sm:py-2.5 md:py-3 lg:py-4 text-xs sm:text-sm md:text-base lg:text-lg xl:text-xl font-body rounded-full transition-all duration-300 active:scale-95 hover:scale-105 hover:shadow-lg"
            >
              Shop by Outfit
            </Button>
          </div>
        </div>
      </section>
    </>
  );
};

export default HeroSection;