import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const PersonalityQuizHook = () => {
  const navigate = useNavigate();

  const navigateToQuiz = () => {
    navigate('/personality-quiz');
  };

  return (
    <section id="collection" className="py-24 bg-palo-background relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-20 left-10 w-64 h-64 bg-palo-secondary rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-palo-accent rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left: Text Content */}
          <div className="space-y-8">
            <div>
              <h2 className="font-heading text-4xl md:text-5xl font-bold text-palo-primary mb-6 leading-tight">
                Anuschka Matchmaker
                <br />
                <span className="bg-gradient-to-r from-palo-accent to-palo-secondary bg-clip-text text-transparent">
                  Art Meets You
                </span>
              </h2>
              <div className="h-1 w-24 bg-gradient-to-r from-palo-accent to-palo-secondary rounded-full mb-6" />
            </div>

            <p className="font-body text-lg text-muted-foreground leading-relaxed">
              Every Anuschka bag carries art with soul. That's why the Matchmaker also considers your personality, helping you find a bag whose design resonates with who you are—because style should be as personal as it is beautiful.
            </p>

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-palo-secondary rounded-full" />
                <span className="font-body text-palo-primary">Discover your artistic identity</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-palo-accent rounded-full" />
                <span className="font-body text-palo-primary">Get personalized bag recommendations</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-palo-primary rounded-full" />
                <span className="font-body text-palo-primary">Join our exclusive Circle community</span>
              </div>
            </div>

            <Button
              onClick={navigateToQuiz}
              size="lg"
              className="bg-palo-primary hover:bg-palo-accent text-white px-12 py-4 text-lg font-body rounded-full transition-all duration-300 hover:scale-105 hover:shadow-xl"
            >
              Take the Quiz
              <span className="ml-2">✨</span>
            </Button>
          </div>

          {/* Right: Hero Image */}
          <div className="relative">
            <div className="aspect-square bg-gradient-to-br from-purple-50 via-white to-pink-50 rounded-full p-8 shadow-2xl">
              <div className="w-full h-full bg-gradient-to-br from-purple-100/30 to-pink-100/30 rounded-full flex items-center justify-center relative overflow-hidden">
                {/* Hero Girl Image */}
                <div className="relative w-full h-full flex items-center justify-center">
                  <img
                    src="/girl.png"
                    alt="Anuschka Style Icon"
                    className="w-200 h-200 object-contain rounded-full shadow-lg transition-transform duration-500 hover:scale-105"
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

export default PersonalityQuizHook;