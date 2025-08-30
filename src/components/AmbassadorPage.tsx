import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import SharedHeader from "./SharedHeader";
import AmbassadorForm from "./AmbassadorForm";
import { CheckCircle, Mail, Tag, Share2, Star, Award, Users, TrendingUp, Gift, Crown, FileText, Code } from "lucide-react";

const AmbassadorPage = () => {
  const [isAmbassadorFormOpen, setIsAmbassadorFormOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white">
      <SharedHeader />
      
      {/* Hero Section */}
      <section className="relative h-[40vh] min-h-[300px] max-h-[600px] sm:h-[45vh] md:h-[50vh] lg:h-[55vh] xl:h-[60vh] 2xl:h-[65vh] flex items-center justify-center">
        {/* Background Image */}
        <div className="absolute inset-0">
          <img 
            src="/ambasaador.jpg" 
            alt="Group of diverse women ambassadors" 
            className="w-full h-full object-cover object-center sm:object-center md:object-center lg:object-center xl:object-center 2xl:object-center"
            loading="eager"
            style={{
              objectPosition: 'center 20%'
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-purple-900/40 via-purple-800/50 to-purple-700/60 sm:from-purple-900/45 sm:via-purple-800/55 sm:to-purple-700/65 md:from-purple-900/50 md:via-purple-800/60 md:to-purple-700/70 lg:from-purple-900/55 lg:via-purple-800/65 lg:to-purple-700/75 xl:from-purple-900/60 xl:via-purple-800/70 xl:to-purple-700/80 2xl:from-purple-900/65 2xl:via-purple-800/75 2xl:to-purple-700/85"></div>
        </div>
        
        {/* Content */}
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl 2xl:text-7xl font-bold text-white mb-4 sm:mb-6 leading-tight">
              Become an Anuschka Ambassador
            </h1>
          </div>
        </div>
      </section>

      {/* Description and CTA Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <p className="text-xl md:text-2xl text-gray-700 mb-8 leading-relaxed">
              Join the Anuschka Circle Ambassador Program and help spread the joy of handcrafted artistry while earning exclusive rewards and connecting with a passionate community.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-4 text-lg font-semibold rounded-full"
                onClick={() => setIsAmbassadorFormOpen(true)}
              >
                Join the Program
              </Button>
              <Button variant="outline" className="border-purple-600 text-purple-600 hover:bg-purple-50 px-8 py-4 text-lg font-semibold rounded-full">
                Explore Tracks
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Ambassador Tracks */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Explore Our Ambassador Tracks
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {/* Community Referral */}
            <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-purple-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Community Referral</h3>
              </div>
              <ul className="space-y-3 mb-6">
                <li className="flex items-center text-gray-700">
                  <CheckCircle className="w-5 h-5 text-purple-600 mr-3 flex-shrink-0" />
                  Earn commission on referrals
                </li>
                <li className="flex items-center text-gray-700">
                  <CheckCircle className="w-5 h-5 text-purple-600 mr-3 flex-shrink-0" />
                  Exclusive discounts
                </li>
                <li className="flex items-center text-gray-700">
                  <CheckCircle className="w-5 h-5 text-purple-600 mr-3 flex-shrink-0" />
                  Monthly challenges
                </li>
                <li className="flex items-center text-gray-700">
                  <CheckCircle className="w-5 h-5 text-purple-600 mr-3 flex-shrink-0" />
                  Connect with enthusiasts
                </li>
              </ul>
              <Button 
                className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-lg"
                onClick={() => setIsAmbassadorFormOpen(true)}
              >
                Join this track
              </Button>
            </div>

            {/* Influencer Referral */}
            <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="w-8 h-8 text-purple-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Influencer Referral</h3>
              </div>
              <ul className="space-y-3 mb-6">
                <li className="flex items-center text-gray-700">
                  <CheckCircle className="w-5 h-5 text-purple-600 mr-3 flex-shrink-0" />
                  Higher commission rates
                </li>
                <li className="flex items-center text-gray-700">
                  <CheckCircle className="w-5 h-5 text-purple-600 mr-3 flex-shrink-0" />
                  Early access to products
                </li>
                <li className="flex items-center text-gray-700">
                  <CheckCircle className="w-5 h-5 text-purple-600 mr-3 flex-shrink-0" />
                  Social media features
                </li>
                <li className="flex items-center text-gray-700">
                  <CheckCircle className="w-5 h-5 text-purple-600 mr-3 flex-shrink-0" />
                  Sponsored content opportunities
                </li>
              </ul>
              <Button 
                className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-lg"
                onClick={() => setIsAmbassadorFormOpen(true)}
              >
                Join this track
              </Button>
            </div>

            {/* UGC Program */}
            <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Star className="w-8 h-8 text-purple-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">UGC Program</h3>
              </div>
              <ul className="space-y-3 mb-6">
                <li className="flex items-center text-gray-700">
                  <CheckCircle className="w-5 h-5 text-purple-600 mr-3 flex-shrink-0" />
                  Content creation bonuses
                </li>
                <li className="flex items-center text-gray-700">
                  <CheckCircle className="w-5 h-5 text-purple-600 mr-3 flex-shrink-0" />
                  Website showcases
                </li>
                <li className="flex items-center text-gray-700">
                  <CheckCircle className="w-5 h-5 text-purple-600 mr-3 flex-shrink-0" />
                  Product seeding
                </li>
                <li className="flex items-center text-gray-700">
                  <CheckCircle className="w-5 h-5 text-purple-600 mr-3 flex-shrink-0" />
                  Creative freedom
                </li>
              </ul>
              <Button 
                className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-lg"
                onClick={() => setIsAmbassadorFormOpen(true)}
              >
                Join this track
              </Button>
            </div>

            {/* Micro-Creator */}
            <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Gift className="w-8 h-8 text-purple-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Micro-Creator</h3>
              </div>
              <ul className="space-y-3 mb-6">
                <li className="flex items-center text-gray-700">
                  <CheckCircle className="w-5 h-5 text-purple-600 mr-3 flex-shrink-0" />
                  Flexible earning
                </li>
                <li className="flex items-center text-gray-700">
                  <CheckCircle className="w-5 h-5 text-purple-600 mr-3 flex-shrink-0" />
                  Product samples
                </li>
                <li className="flex items-center text-gray-700">
                  <CheckCircle className="w-5 h-5 text-purple-600 mr-3 flex-shrink-0" />
                  Community support
                </li>
                <li className="flex items-center text-gray-700">
                  <CheckCircle className="w-5 h-5 text-purple-600 mr-3 flex-shrink-0" />
                  Growth opportunities
                </li>
              </ul>
              <Button 
                className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-lg"
                onClick={() => setIsAmbassadorFormOpen(true)}
              >
                Join this track
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-gray-100">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
                How It Works
              </h2>
            </div>
            
            <div className="flex flex-col md:flex-row items-center justify-between relative">
              {/* Step 1: Opt In */}
              <div className="text-center relative z-10">
                <div className="w-16 h-16 bg-white border-2 border-black rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-black" />
                </div>
                <h3 className="text-lg font-bold text-gray-800 mb-2">Opt In</h3>
                <p className="text-sm text-gray-600 max-w-32">Sign up and create your account easily.</p>
                
                {/* Connecting line to next step */}
                <div className="hidden md:block absolute top-8 left-full w-16 h-0.5 bg-gray-400 transform translate-x-2"></div>
              </div>
              
              {/* Step 2: Apply */}
              <div className="text-center relative z-10 mt-8 md:mt-0">
                <div className="w-16 h-16 bg-white border-2 border-black rounded-full flex items-center justify-center mx-auto mb-4">
                  <FileText className="w-8 h-8 text-black" />
                </div>
                <h3 className="text-lg font-bold text-gray-800 mb-2">Apply</h3>
                <p className="text-sm text-gray-600 max-w-32">Submit your application with required details.</p>
                
                {/* Connecting lines */}
                <div className="hidden md:block absolute top-8 -left-8 w-16 h-0.5 bg-gray-400"></div>
                <div className="hidden md:block absolute top-8 left-full w-16 h-0.5 bg-gray-400 transform translate-x-2"></div>
              </div>
              
              {/* Step 3: Get Your Code */}
              <div className="text-center relative z-10 mt-8 md:mt-0">
                <div className="w-16 h-16 bg-white border-2 border-black rounded-full flex items-center justify-center mx-auto mb-4">
                  <Code className="w-8 h-8 text-black" />
                </div>
                <h3 className="text-lg font-bold text-gray-800 mb-2">Get Your Code</h3>
                <p className="text-sm text-gray-600 max-w-32">Receive your unique referral code instantly.</p>
                
                {/* Connecting lines */}
                <div className="hidden md:block absolute top-8 -left-8 w-16 h-0.5 bg-gray-400"></div>
                <div className="hidden md:block absolute top-8 left-full w-16 h-0.5 bg-gray-400 transform translate-x-2"></div>
              </div>
              
              {/* Step 4: Share & Earn */}
              <div className="text-center relative z-10 mt-8 md:mt-0">
                <div className="w-16 h-16 bg-white border-2 border-black rounded-full flex items-center justify-center mx-auto mb-4">
                  <Share2 className="w-8 h-8 text-black" />
                </div>
                <h3 className="text-lg font-bold text-gray-800 mb-2">Share & Earn</h3>
                <p className="text-sm text-gray-600 max-w-32">Share your code and start earning rewards.</p>
                
                {/* Connecting line to previous step */}
                <div className="hidden md:block absolute top-8 -left-8 w-16 h-0.5 bg-gray-400"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tiers & Rewards */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Tiers & Rewards
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Progress through tiers to unlock greater rewards and exclusive benefits
            </p>
          </div>
          
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Silver Tier */}
              <div className="bg-gradient-to-b from-gray-50 to-white border border-gray-200 rounded-2xl p-8 text-center">
                <div className="w-20 h-20 bg-gray-400 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Award className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Silver</h3>
                <div className="text-left space-y-4 mb-6">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Requirements:</h4>
                    <p className="text-gray-600">Active participation, 10+ referrals</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Perks:</h4>
                    <ul className="text-gray-600 space-y-1">
                      <li>• 5% commission</li>
                      <li>• Exclusive discounts</li>
                      <li>• Facebook group access</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Recognition:</h4>
                    <ul className="text-gray-600 space-y-1">
                      <li>• Welcome kit</li>
                      <li>• Digital badge</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Gold Tier */}
              <div className="bg-gradient-to-b from-yellow-50 to-white border border-yellow-200 rounded-2xl p-8 text-center transform scale-105">
                <div className="w-20 h-20 bg-yellow-500 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Award className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Gold</h3>
                <div className="text-left space-y-4 mb-6">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Requirements:</h4>
                    <p className="text-gray-600">$1,000+ in referral sales, engaging content</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Perks:</h4>
                    <ul className="text-gray-600 space-y-1">
                      <li>• 10% commission</li>
                      <li>• Early access</li>
                      <li>• Priority support</li>
                      <li>• Personalized manager</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Recognition:</h4>
                    <ul className="text-gray-600 space-y-1">
                      <li>• Physical gold pin</li>
                      <li>• Social media feature</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Platinum Tier */}
              <div className="bg-gradient-to-b from-purple-50 to-white border border-purple-200 rounded-2xl p-8 text-center">
                <div className="w-20 h-20 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Crown className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Platinum</h3>
                <div className="text-left space-y-4 mb-6">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Requirements:</h4>
                    <p className="text-gray-600">$5,000+ in referral sales, mentoring new ambassadors</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Perks:</h4>
                    <ul className="text-gray-600 space-y-1">
                      <li>• 15% commission</li>
                      <li>• VIP invitations</li>
                      <li>• Luxury gift box</li>
                      <li>• Co-design opportunities</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Recognition:</h4>
                    <ul className="text-gray-600 space-y-1">
                      <li>• Engraved trophy</li>
                      <li>• Website section</li>
                      <li>• Public recognition</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="text-center mt-12">
              <p className="text-lg text-gray-600">
                All programs use customized referral codes, ensuring seamless tracking and rewards.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Frequently Asked Questions
            </h2>
          </div>
          
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                What is the Anuschka Circle Ambassador Program?
              </h3>
            </div>
            
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                How do I qualify to become an ambassador?
              </h3>
            </div>
            
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                How are commissions calculated and paid?
              </h3>
            </div>
            
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Can I be part of more than one track?
              </h3>
            </div>
            
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                What kind of support do ambassadors receive?
              </h3>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center mb-4">
                <Star className="w-8 h-8 text-purple-400 mr-2" />
                <span className="text-xl font-bold">Anuschka</span>
              </div>
              <p className="text-gray-300 mb-4">
                Hand-painted leather bags and accessories, celebrating art and individuality.
              </p>
              <div className="flex space-x-4">
                <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center">
                  <span className="text-sm">f</span>
                </div>
                <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center">
                  <span className="text-sm">in</span>
                </div>
                <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center">
                  <span className="text-sm">p</span>
                </div>
                <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center">
                  <span className="text-sm">in</span>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-300">
                <li>Contact Us</li>
                <li>Help Center</li>
                <li>Shipping & Returns</li>
                <li>Privacy Policy</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">About Anuschka</h4>
              <ul className="space-y-2 text-gray-300">
                <li>Our Story</li>
                <li>Craftsmanship</li>
                <li>Blog</li>
                <li>Careers</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-gray-300">
                <li>Terms of Service</li>
                <li>Program Guidelines</li>
                <li>Cookie Policy</li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-700 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400">© 2026 Anuschka. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* Ambassador Form Popup */}
      <AmbassadorForm 
        isOpen={isAmbassadorFormOpen}
        onClose={() => setIsAmbassadorFormOpen(false)}
      />
    </div>
  );
};

export default AmbassadorPage;
