import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Heart, Star, Palette, Compass, Sparkles, Crown } from "lucide-react";

const ChatPage = () => {
  const navigate = useNavigate();

  const characters = [
    {
      icon: <Heart className="w-8 h-8 text-pink-500" />,
      name: "The Creative Soul",
      description: "Artistic, imaginative, and drawn to unique, expressive designs. You find beauty in the unconventional and love pieces that tell a story.",
      traits: ["Artistic", "Imaginative", "Expressive", "Unique"],
      color: "bg-pink-50 border-pink-200",
      percentage: 35
    },
    {
      icon: <Crown className="w-8 h-8 text-purple-500" />,
      name: "The Trailblazing Spirit",
      description: "Bold, adventurous, and unafraid to stand out with fierce confidence. You choose pieces that make a statement and reflect your inner strength.",
      traits: ["Bold", "Adventurous", "Confident", "Fierce"],
      color: "bg-purple-50 border-purple-200",
      percentage: 28
    },
    {
      icon: <Palette className="w-8 h-8 text-blue-500" />,
      name: "The Poetic Soul",
      description: "Romantic, introspective, and finds meaning in life's delicate moments. You appreciate subtle elegance and pieces that speak to your heart.",
      traits: ["Romantic", "Introspective", "Elegant", "Delicate"],
      color: "bg-blue-50 border-blue-200",
      percentage: 22
    },
    {
      icon: <Compass className="w-8 h-8 text-green-500" />,
      name: "The Radiant Observer",
      description: "Attentive to beauty, detail-oriented, and values sophisticated aesthetics. You choose pieces that reflect your refined taste and attention to detail.",
      traits: ["Attentive", "Detail-oriented", "Sophisticated", "Refined"],
      color: "bg-green-50 border-green-200",
      percentage: 15
    }
  ];

  const featuredArtworks = [
    {
      name: "Butterfly Heaven",
      character: "The Creative Soul",
      image: "/logo.png",
      description: "A whimsical design that captures the essence of artistic expression and creative freedom."
    },
    {
      name: "Abstract Leopard",
      character: "The Trailblazing Spirit",
      image: "/logo.png",
      description: "Bold and fierce, this design embodies strength and confidence with its striking patterns."
    },
    {
      name: "Enchanted Garden",
      character: "The Poetic Soul",
      image: "/logo.png",
      description: "Romantic and dreamy, this piece speaks to the heart with its delicate floral motifs."
    },
    {
      name: "City Lights",
      character: "The Radiant Observer",
      image: "/logo.png",
      description: "Sophisticated and refined, this design reflects urban elegance and attention to detail."
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-purple-50 pt-20">
      {/* Hero Section */}
      <section className="py-16 text-center">
        <div className="container mx-auto px-4">
          <h1 className="font-heading text-4xl md:text-6xl font-bold text-gray-800 mb-6">
            Discover Your
            <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent"> Character</span>
          </h1>
          <p className="font-body text-xl text-gray-600 max-w-3xl mx-auto mb-8 leading-relaxed">
            Every Anuschka bag is designed with a specific personality in mind. Discover which character resonates with your unique style and find your perfect artistic match.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button
              onClick={() => navigate('/quiz')}
              size="lg"
              className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 text-lg font-medium rounded-full transition-all duration-300 hover:scale-105"
            >
              Take Character Quiz
            </Button>
            <Button
              onClick={() => navigate('/circle')}
              variant="outline"
              size="lg"
              className="border-2 border-purple-600 text-purple-600 hover:bg-purple-600 hover:text-white px-8 py-3 text-lg font-medium rounded-full transition-all duration-300"
            >
              Join Circle
            </Button>
          </div>
        </div>
      </section>

      {/* Character Types */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="font-heading text-3xl md:text-4xl font-bold text-center text-gray-800 mb-12">
            Meet Our Characters
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            {characters.map((character, index) => (
              <Card key={index} className={`border-2 ${character.color} hover:shadow-xl transition-all duration-300 hover:-translate-y-2`}>
                <CardHeader>
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-white rounded-full shadow-md">
                      {character.icon}
                    </div>
                    <div>
                      <CardTitle className="font-heading text-2xl text-gray-800">
                        {character.name}
                      </CardTitle>
                      <CardDescription className="font-body text-gray-600">
                        {character.percentage}% of our community
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="font-body text-gray-700 leading-relaxed mb-4">
                    {character.description}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {character.traits.map((trait, traitIndex) => (
                      <span
                        key={traitIndex}
                        className="px-3 py-1 bg-white text-sm font-medium rounded-full border border-gray-200"
                      >
                        {trait}
                      </span>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Artworks */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="font-heading text-3xl md:text-4xl font-bold text-center text-gray-800 mb-12">
            Character-Inspired Artworks
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {featuredArtworks.map((artwork, index) => (
              <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2 bg-white">
                <CardHeader className="text-center pb-4">
                  <div className="w-32 h-32 mx-auto mb-4 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center">
                    <img
                      src={artwork.image}
                      alt={artwork.name}
                      className="w-20 h-20 object-contain"
                    />
                  </div>
                  <CardTitle className="font-heading text-lg text-gray-800">
                    {artwork.name}
                  </CardTitle>
                  <CardDescription className="font-body text-purple-600 font-medium">
                    {artwork.character}
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="font-body text-gray-600 text-sm leading-relaxed">
                    {artwork.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Character Quiz CTA */}
      <section className="py-16 bg-gradient-to-r from-purple-600 to-pink-600">
        <div className="container mx-auto px-4 text-center">
          <h2 className="font-heading text-3xl md:text-4xl font-bold text-white mb-6">
            Find Your Perfect Character Match
          </h2>
          <p className="font-body text-xl text-purple-100 max-w-2xl mx-auto mb-8">
            Take our personality quiz to discover which Anuschka character resonates with your unique style and personality.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button
              onClick={() => navigate('/quiz')}
              size="lg"
              className="bg-white text-purple-600 hover:bg-gray-100 px-8 py-3 text-lg font-medium rounded-full transition-all duration-300 hover:scale-105"
            >
              Start Character Quiz
            </Button>
            <Button
              onClick={() => navigate('/upload')}
              variant="outline"
              size="lg"
              className="border-2 border-white text-white hover:bg-white hover:text-purple-600 px-8 py-3 text-lg font-medium rounded-full transition-all duration-300"
            >
              Upload Your Style
            </Button>
          </div>
        </div>
      </section>

      {/* Character Statistics */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="font-heading text-3xl md:text-4xl font-bold text-center text-gray-800 mb-12">
            Community Character Distribution
          </h2>
          <div className="max-w-4xl mx-auto">
            <Card className="border-0 shadow-lg bg-white">
              <CardHeader>
                <CardTitle className="font-heading text-2xl text-gray-800">
                  Which Character Are You?
                </CardTitle>
                <CardDescription>
                  Based on our community's personality quiz results
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {characters.map((character, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-white rounded-full shadow-sm">
                            {character.icon}
                          </div>
                          <span className="font-body text-sm font-medium text-gray-800">
                            {character.name}
                          </span>
                        </div>
                        <span className="font-body text-sm font-medium text-gray-600">
                          {character.percentage}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div 
                          className={`h-3 rounded-full transition-all duration-1000 ease-out ${
                            index === 0 ? 'bg-pink-500' :
                            index === 1 ? 'bg-purple-500' :
                            index === 2 ? 'bg-blue-500' : 'bg-green-500'
                          }`}
                          style={{ width: `${character.percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ChatPage; 