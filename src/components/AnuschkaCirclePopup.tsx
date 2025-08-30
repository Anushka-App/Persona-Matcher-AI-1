import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { X, Star, Heart, Sparkles, Palette, TrendingUp, Users, Award, Crown, Gem, Zap } from 'lucide-react';

interface AnuschkaCirclePopupProps {
  isVisible: boolean;
  onClose: () => void;
  personalityType?: string;
  userEmail?: string;
  userName?: string;
}

const AnuschkaCirclePopup: React.FC<AnuschkaCirclePopupProps> = ({
  isVisible,
  onClose,
  personalityType,
  userEmail,
  userName
}) => {
  const navigate = useNavigate();
  const [isAnimating, setIsAnimating] = useState(false);
  const [currentSection, setCurrentSection] = useState(0);

  useEffect(() => {
    if (isVisible) {
      setIsAnimating(true);
      const timer = setTimeout(() => setIsAnimating(false), 1000);
      return () => clearTimeout(timer);
    }
  }, [isVisible]);

  useEffect(() => {
    if (isVisible) {
      const interval = setInterval(() => {
        setCurrentSection((prev) => (prev + 1) % 4);
      }, 4000);
      return () => clearInterval(interval);
    }
  }, [isVisible]);

  if (!isVisible) return null;

  const membershipTiers = [
    {
      name: "Silver Membership",
      icon: <Star className="h-6 w-6 text-slate-400" />,
      referrals: "0 Referrals",
      benefits: [
        "Early access to collections",
        "Social media features & reposts",
        "Share your style story with our global community"
      ],
      color: "from-slate-100 to-slate-200",
      borderColor: "border-slate-300"
    },
    {
      name: "Gold Membership",
      icon: <Crown className="h-6 w-6 text-amber-500" />,
      referrals: "2-5 Referrals",
      benefits: [
        "Bonus gifting & styling features",
        "Invitations to campaigns & VIP events",
        "Collaborate on co-authored projects"
      ],
      color: "from-amber-50 to-yellow-100",
      borderColor: "border-amber-300"
    },
    {
      name: "Platinum Membership",
      icon: <Gem className="h-6 w-6 text-purple-600" />,
      referrals: "10+ Referrals",
      benefits: [
        "Paid collaborations & exclusive styling",
        "Top-tier visibility as a key brand ambassador",
        "Opportunities to shape groundbreaking events"
      ],
      color: "from-purple-50 to-indigo-100",
      borderColor: "border-purple-300"
    }
  ];

  const sections = [
    {
      title: "Welcome to Anuschka Circle",
      subtitle: "A Space for Women Who Lead with Purpose",
      description: "Join over 50,000 women who share your values of empowerment, conscious living, and authentic expression.",
      icon: <Sparkles className="h-8 w-8 text-purple-600" />
    },
    {
      title: "More Than a Community",
      subtitle: "A Movement of Empowerment",
      description: "Connect with changemakers, creators, and leaders who inspire you to live your most authentic life.",
      icon: <Heart className="h-8 w-8 text-pink-600" />
    },
    {
      title: "Craft, Creativity & Connection",
      subtitle: "Where Art Meets Purpose",
      description: "Embrace artistry, authenticity, and empowerment in a space designed for women who lead with purpose.",
      icon: <Palette className="h-8 w-8 text-indigo-600" />
    },
    {
      title: "Your Journey Starts Here",
      subtitle: "Begin Your Transformation",
      description: "Every tier reflects the value you bring to the Circle – and the impact you create by sharing our story.",
      icon: <Zap className="h-8 w-8 text-yellow-600" />
    }
  ];

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-lg z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-6xl w-full max-h-[95vh] overflow-hidden border border-purple-200/20">
        {/* Enhanced Header with Animated Background */}
        <div className="relative bg-gradient-to-br from-purple-600 via-pink-600 to-indigo-700 p-8 rounded-t-3xl overflow-hidden">
          {/* Animated Background Elements */}
          <div className="absolute inset-0 bg-gradient-to-br from-purple-600/20 via-pink-600/20 to-indigo-700/20 animate-pulse" />
          <div 
            className="absolute top-0 left-0 w-full h-full opacity-30"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
            }}
          />
          
          <div className="relative flex items-center justify-between">
            <div className="flex-1">
              {/* Animated Logo */}
              <div className="flex items-center space-x-4 mb-6">
                <div className="relative">
                  <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-2xl flex items-center justify-center shadow-lg transform rotate-12 hover:rotate-0 transition-transform duration-500">
                    <span className="text-purple-900 font-bold text-sm text-center leading-tight">
                      ANUSCHKA<br/>CIRCLE
                    </span>
                  </div>
                  <div className="absolute -inset-2 bg-gradient-to-r from-purple-400 to-pink-400 rounded-2xl blur opacity-75 animate-pulse" />
                </div>
                <div>
                  <h1 className="text-4xl md:text-5xl font-bold text-white mb-2 drop-shadow-lg">
                    Anuschka Circle
                  </h1>
                  <p className="text-white/90 text-lg md:text-xl font-medium">
                    Empowering Women Through Craft, Creativity, and Community
                  </p>
                </div>
              </div>
              
              {/* Animated Section Display */}
              <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 border border-white/30">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="text-white">
                    {sections[currentSection].icon}
                  </div>
                  <div>
                    <h2 className="text-2xl md:text-3xl font-bold text-white">
                      {sections[currentSection].title}
                    </h2>
                    <p className="text-white/80 text-lg">
                      {sections[currentSection].subtitle}
                    </p>
                  </div>
                </div>
                <p className="text-white/90 text-base leading-relaxed">
                  {sections[currentSection].description}
                </p>
              </div>
            </div>
            
            {/* Close Button */}
            <Button 
              onClick={onClose} 
              variant="ghost" 
              size="sm"
              className="text-white hover:text-white/80 hover:bg-white/20 rounded-full p-3 transition-all duration-200"
            >
              <X className="h-6 w-6" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="p-8 space-y-8 overflow-y-auto max-h-[calc(95vh-300px)]">
          {/* What is Anuschka Circle Section */}
          <div className="text-center space-y-6">
            <div className="space-y-4">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-800">
                What is Anuschka Circle?
              </h2>
              <p className="text-gray-600 text-lg max-w-4xl mx-auto leading-relaxed">
                The Anuschka Circle is more than a community—it's a purpose-driven movement for women who lead with purpose, creativity, and authenticity. 
                Connect with over 50,000 women who share your passions for art, culture, and responsible living.
              </p>
            </div>
            
            {/* Animated Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-200 transform hover:scale-105 transition-all duration-300">
                <div className="text-4xl font-bold text-purple-600 mb-2">50K+</div>
                <div className="text-gray-700 font-medium">Women Connected</div>
              </div>
              <div className="bg-gradient-to-br from-pink-50 to-rose-50 rounded-2xl p-6 border border-pink-200 transform hover:scale-105 transition-all duration-300">
                <div className="text-4xl font-bold text-pink-600 mb-2">100+</div>
                <div className="text-gray-700 font-medium">Events Hosted</div>
              </div>
              <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-2xl p-6 border border-indigo-200 transform hover:scale-105 transition-all duration-300">
                <div className="text-4xl font-bold text-indigo-600 mb-2">24/7</div>
                <div className="text-gray-700 font-medium">Support Available</div>
              </div>
            </div>
          </div>

          {/* Why Join Section */}
          <div className="text-center space-y-6">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800">
              Why Join the Circle?
            </h2>
            <p className="text-gray-600 text-lg max-w-3xl mx-auto">
              Because here, you're not just a customer – you're an ambassador for craftsmanship, sustainability, and women's empowerment.
            </p>
          </div>

          {/* Membership Tiers */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {membershipTiers.map((tier, index) => (
              <Card 
                key={tier.name}
                className={`border-2 ${tier.borderColor} bg-gradient-to-br ${tier.color} transform hover:scale-105 transition-all duration-300 hover:shadow-xl`}
              >
                <CardHeader className="text-center pb-4">
                  <div className="flex justify-center mb-3">
                    <div className="p-3 bg-white rounded-full shadow-md">
                      {tier.icon}
                    </div>
                  </div>
                  <CardTitle className="text-xl font-bold text-gray-800">
                    {tier.name}
                  </CardTitle>
                  <p className="text-sm text-gray-600 font-medium">
                    {tier.referrals}
                  </p>
                </CardHeader>
                <CardContent className="space-y-3">
                  {tier.benefits.map((benefit, benefitIndex) => (
                    <div key={benefitIndex} className="flex items-start space-x-3">
                      <div className="flex-shrink-0 w-5 h-5 bg-green-100 rounded-full flex items-center justify-center mt-0.5">
                        <div className="w-2 h-2 bg-green-500 rounded-full" />
                      </div>
                      <p className="text-sm text-gray-700 leading-relaxed">
                        {benefit}
                      </p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Concluding Message */}
          <div className="text-center space-y-6">
            <p className="text-gray-600 text-lg max-w-3xl mx-auto">
              Every tier reflects the value you bring to the Circle – and the impact you create by sharing our story.
            </p>
            
            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button
                onClick={() => {
                  // Handle join circle action
                  console.log('Join Anuschka Circle clicked');
                }}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-4 text-lg font-semibold rounded-2xl shadow-lg transform hover:scale-105 transition-all duration-200"
              >
                <Crown className="h-5 w-5 mr-2" />
                Join Anuschka Circle
              </Button>
              
              <Button
                onClick={() => {
                  // Handle explore action
                  console.log('Explore the Circle clicked');
                }}
                variant="outline"
                className="border-2 border-purple-300 text-purple-600 hover:bg-purple-50 px-8 py-4 text-lg font-semibold rounded-2xl transition-all duration-200"
              >
                <Sparkles className="h-5 w-5 mr-2" />
                Explore the Circle
              </Button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 border-t border-purple-200/30">
          <div className="text-center text-gray-600">
            <p className="font-medium">
              Ready to transform your life and connect with amazing women?
            </p>
            <p className="text-sm mt-1">
              Join thousands of women who have already found their tribe in the Anuschka Circle.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnuschkaCirclePopup; 