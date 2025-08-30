import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const HeroSection1 = () => {
  const [isVisible, setIsVisible] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 300);
    return () => clearTimeout(timer);
  }, []);

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-palo-background to-background">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-64 h-64 bg-palo-accent/8 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-palo-secondary/8 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/4 w-32 h-32 bg-palo-primary/5 rounded-full blur-2xl animate-bounce" style={{ animationDelay: '0.5s' }} />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left: Text Content */}
          <div className={`space-y-8 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            {/* ANUSCHKA Logo */}
            <div className="mb-6">
              <img
                src="/logo.png"
                alt="ANUSCHKA Logo"
                className="h-16 md:h-20 lg:h-24 mx-auto lg:mx-0"
              />
            </div>

            <div>
              <h1 className="font-heading text-4xl md:text-5xl font-bold text-palo-primary mb-6 leading-tight">
                Anuschka Matchmaker – Art Meets You
              </h1>
              <p className="font-heading text-lg md:text-xl lg:text-2xl text-palo-primary mb-4 md:mb-6 italic">
                Not just a bag. A reflection of you.
              </p>
            </div>

            <div className="space-y-4">
              <p className="font-body text-lg text-muted-foreground leading-relaxed">
                At Anuschka, we believe that every bag is more than just an accessory.
              </p>
              <p className="font-body text-lg text-muted-foreground leading-relaxed">
                It's a piece of art, handcrafted to reflect your individuality.
              </p>
              <p className="font-body text-lg text-muted-foreground leading-relaxed">
                Our exclusive Matchmaker Quiz helps you find the perfect bag that resonates with your unique style.
              </p>
            </div>

            <div className="flex flex-col lg:flex-row gap-4 lg:gap-6">
              <Button
                onClick={() => navigate('/personality-quiz')}
                size="lg"
                className="bg-palo-primary hover:bg-palo-accent text-white px-8 md:px-12 py-3 md:py-4 text-base md:text-lg font-body rounded-full transition-all duration-300 hover:scale-105 hover:shadow-xl animate-fade-in"
              >
                Take a Quiz
              </Button>

              <Button
                onClick={() => navigate('/personality-quiz-result')}
                size="lg"
                variant="outline"
                className="border-2 border-palo-primary text-palo-primary hover:bg-palo-primary hover:text-white px-8 md:px-12 py-3 md:py-4 text-base md:text-lg font-body rounded-full transition-all duration-300 hover:scale-105 hover:shadow-xl"
              >
                Join Circle
              </Button>
            </div>
          </div>

          {/* Right: Hero Image */}
          <div className={`relative transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`} style={{ animationDelay: '0.3s' }}>
            <div className="aspect-square bg-gradient-to-br from-purple-50 via-white to-pink-50 rounded-full p-8 shadow-2xl relative">
              <div className="w-full h-full bg-gradient-to-br from-purple-100/30 to-pink-100/30 rounded-full flex items-center justify-center relative overflow-hidden">
                {/* Hero Girl Image */}
                <div className="relative w-full h-full flex items-center justify-center">
                  <img
                    src="/girl.png"
                    alt="Anuschka Style Icon"
                    className="w-200 h-200 object-contain rounded-full shadow-lg transition-transform duration-500 hover:scale-105 animate-fade-in"
                    style={{ 
                      boxShadow: '0 0 40px 0 rgba(147, 51, 234, 0.15), 0 8px 32px 0 rgba(236, 72, 153, 0.12)',
                      filter: 'drop-shadow(0 4px 8px rgba(0, 0, 0, 0.1))'
                    }}
                  />
                  
                  {/* Decorative Elements */}
                  <div className="absolute top-8 left-8 w-12 h-12 bg-purple-200 rounded-full opacity-60 animate-pulse" />
                  <div className="absolute bottom-8 right-8 w-16 h-16 bg-pink-200 rounded-full opacity-60 animate-pulse" style={{ animationDelay: '1s' }} />
                  <div className="absolute top-1/2 left-4 w-8 h-8 bg-purple-300 rounded-full opacity-40 animate-bounce" style={{ animationDelay: '0.5s' }} />
                  <div className="absolute top-1/2 right-4 w-10 h-10 bg-pink-300 rounded-full opacity-40 animate-bounce" style={{ animationDelay: '1.5s' }} />
                </div>
              </div>
            </div>

            {/* Floating Elements */}
            <div className="absolute -top-4 -left-4 w-16 h-16 bg-purple-200/40 rounded-full animate-float" />
            <div className="absolute -bottom-4 -right-4 w-20 h-20 bg-pink-200/40 rounded-full animate-float" style={{ animationDelay: '1s' }} />
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection1;
