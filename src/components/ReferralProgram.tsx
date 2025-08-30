import React from "react";
import { Button } from "@/components/ui/button";
import SharedHeader from "./SharedHeader";
import { 
  Home, 
  Share2, 
  Award, 
  Star, 
  FileText, 
  ChevronDown, 
  Search, 
  User, 
  Mail 
} from "lucide-react";

const ReferralProgram = () => {
  const referralSteps = [
    {
      step: "Step 1",
      icon: Home,
      title: "Join the Circle",
      description: "Sign up as a customer or influencer.",
      details: []
    },
    {
      step: "Step 2",
      icon: Share2,
      title: "Share Your Referral Code",
      description: "Use your unique code across",
      details: [
        "Instagram Stories & Posts",
        "WhatsApp & Messaging Apps",
        "Pinterest Boards",
        "Community Events",
        "Personal Website/Blog"
      ]
    },
    {
      step: "Step 3",
      icon: Award,
      title: "Earn Rewards",
      description: "Track your referrals and unlock tier-based rewards such as exclusive gifts, styling features, paid collaborations, and VIP event access.",
      additionalRewards: [
        "Invitation to VIP Events",
        "Tier Upgrades (Silver, Gold, Platinum)"
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      <SharedHeader />
      
      {/* Hero Section */}
      <section className="relative h-[40vh] min-h-[300px] max-h-[600px] sm:h-[45vh] md:h-[50vh] lg:h-[55vh] xl:h-[60vh] 2xl:h-[65vh] flex items-center justify-center">
        {/* Background Image */}
        <div className="absolute inset-0">
          <img 
            src="/hero-woman-tablet.jpg" 
            alt="Two women sharing a moment on sofa" 
            className="w-full h-full object-cover object-center sm:object-center md:object-center lg:object-center xl:object-center 2xl:object-center"
            loading="eager"
            style={{
              objectPosition: 'center 25%'
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-purple-900/50 via-purple-800/60 to-purple-700/70"></div>
        </div>
        
        {/* Content */}
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl 2xl:text-7xl font-bold text-white mb-4 sm:mb-6 lg:mb-8 leading-tight">
              Share Stories, Earn Rewards, and Grow the Circle
            </h1>
          </div>
        </div>
      </section>

      {/* Introduction Text Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <p className="text-xl text-gray-700 leading-relaxed mb-8">
              At Anuschka, every member is more than just a customer; they are an ambassador for the brand. With the Anuschka Referral Program, you can share the beauty of Anuschka with the world while earning exciting rewards along the way.
            </p>
            <Button className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-4 text-lg font-semibold rounded-full">
              Join the Referral Program
            </Button>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
          </div>
          
          <div className="max-w-4xl mx-auto">
            <div className="space-y-12">
              {referralSteps.map((step, index) => (
                <div key={index} className="bg-white rounded-xl p-8 shadow-sm">
                  <div className="text-center mb-6">
                    <div className="text-sm text-gray-500 mb-2">{step.step}</div>
                    <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <step.icon className="w-10 h-10 text-blue-600" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-4">{step.title}</h3>
                    <p className="text-lg text-gray-700 mb-4">{step.description}</p>
                  </div>
                  
                  {step.details && step.details.length > 0 && (
                    <div className="text-center">
                      <ul className="space-y-2">
                        {step.details.map((detail, detailIndex) => (
                          <li key={detailIndex} className="text-gray-600">
                            {detail}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {step.additionalRewards && step.additionalRewards.length > 0 && (
                    <div className="text-center mt-4">
                      <ul className="space-y-2">
                        {step.additionalRewards.map((reward, rewardIndex) => (
                          <li key={rewardIndex} className="text-gray-600">
                            {reward}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Concluding Text Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <p className="text-xl text-gray-700 leading-relaxed mb-8">
              Your story matters, and sharing it can help others discover the beauty and craftsmanship behind Anuschka. As you share your love for the brand, you unlock exciting rewards and opportunities that celebrate your contributions to the Anuschka Circle.
            </p>
            <Button className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-4 text-lg font-semibold rounded-full">
              Join the Referral Program
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-4 mb-4 md:mb-0">
              <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center">
                <span className="text-sm font-bold">AC</span>
              </div>
              <p className="text-gray-400">© 2024 Anuschka Circle. All rights reserved.</p>
            </div>
            
            <div className="flex items-center space-x-8">
              <div className="flex space-x-6">
                <a href="#" className="text-gray-400 hover:text-white transition-colors">About</a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">Support</a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">Legal</a>
              </div>
              
              <div className="flex space-x-4">
                <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center">
                  <span className="text-sm">f</span>
                </div>
                <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center">
                  <span className="text-sm">in</span>
                </div>
                <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center">
                  <span className="text-sm">in</span>
                </div>
                <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center">
                  <span className="text-sm">yt</span>
                </div>
              </div>
            </div>
          </div>
          

        </div>
      </footer>
    </div>
  );
};

export default ReferralProgram;
