import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { AlertCircle } from "lucide-react";
import SharedHeader from './SharedHeader';

const CirclePage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isVisible, setIsVisible] = useState(false);
  const [selectedTier, setSelectedTier] = useState<string>("");
  const [userExists, setUserExists] = useState<boolean | null>(null);
  const [isCheckingUser, setIsCheckingUser] = useState(true);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    setIsVisible(true);
    checkUserStatus();
    checkForSuccessMessage();
  }, []);

  const checkUserStatus = async () => {
    try {
      // Get or create user cookie
      let userCookieId = getCookie('user_cookie_id');
      if (!userCookieId) {
        userCookieId = generateUserCookieId();
        setCookie('user_cookie_id', userCookieId, 365);
      }

      // Check if user already has an account
      const response = await fetch(`/api/user/check-exists/${userCookieId}`);
      if (response.ok) {
        const data = await response.json();
        setUserExists(data.exists);
      }
    } catch (error) {
      console.error('Error checking user status:', error);
    } finally {
      setIsCheckingUser(false);
    }
  };

  const checkForSuccessMessage = () => {
    if (location.state?.showSuccess && location.state?.message) {
      setSuccessMessage(location.state.message);
      setShowSuccessMessage(true);
      // Clear the state after showing message
      navigate(location.pathname, { replace: true });
    }
  };

  const generateUserCookieId = (): string => {
    return 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  };

  const setCookie = (name: string, value: string, days: number) => {
    const expires = new Date();
    expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000));
    document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/`;
  };

  const getCookie = (name: string): string | null => {
    const nameEQ = name + "=";
    const ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) === ' ') c = c.substring(1, c.length);
      if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
  };

  const handleJoinCircle = () => {
    if (userExists) {
      // User already has account, show message and redirect to sign in
      alert('You already have an account. Please click on Sign In to access your membership benefits.');
      navigate('/login');
    } else if (selectedTier) {
      // User doesn't have account and has selected a tier, navigate to create account
      navigate('/create-account', { state: { selectedTier } });
    }
  };

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const membershipTiers = [
    {
      title: "Silver Benefits",
      subtitle: "",
      features: [
        "Free invitation to Anuschka Circle events",
        "Free styling consultation",
        "Join the Anuschka Referral Programme",
        "Join the Anuschka Influencer Programme",
        "Participate in the Anuschka Woman of the Year Awards",
        "Enjoy a free Anuschka Gift Voucher worth Rs.1000/- (redeem online)"
      ]
    },
    {
      title: "Gold Benefits",
      subtitle: "",
      features: [
        "Free invitation to Anuschka Circle events",
        "Free styling consultation",
        "Participate in the Anuschka Woman of the Year Awards",
        "Participate in the 'Be an Inspiration' initiative",
        "Priority access to New Collections",
        "Exclusive In-store benefits",
        "Free Anuschka gift voucher worth INR 2000/-"
      ]
    },
    {
      title: "Platinum Benefits",
      subtitle: "",
      features: [
        "Free invitation to Anuschka Circle events",
        "Free styling consultation",
        "Participate in the annual Anuschka art and sustainability festival",
        "Monograms for keychain and bags for platinum members",
        "Participate in community programme",
        "Get invited to 'A Day with the Artisans' Programme"
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white">
      <SharedHeader />

      {/* Success Message */}
      {showSuccessMessage && (
        <div className="bg-green-50 border-b border-green-200 py-4">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-center space-x-2 text-green-800">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="font-medium">{successMessage}</span>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12 lg:py-16">
                 {/* Hero Section - Welcome to Anuschka Circle */}
         <div className={`opacity-0 transform translate-y-4 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : ''}`}>
           <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center">
             {/* Left Side - Title */}
             <div className="lg:pr-8 text-center lg:text-left">
               <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                 Welcome to<br />
                 Anuschka<br />
                 Circle – A Space<br />
                 for Women Who<br />
                 Lead with<br />
                 Purpose
               </h1>
             </div>
                           {/* Right Side - Image */}
              <div className="flex justify-center lg:justify-end order-first lg:order-last">
                <div className="w-full max-w-sm sm:max-w-md lg:max-w-lg h-[300px] sm:h-[400px] lg:h-[500px] flex items-center justify-center">
                  <img 
                    src="/anuschka-circle-logo.png" 
                    alt="Anuschka Circle Design" 
                    className="w-full h-full object-contain"
                  />
                </div>
              </div>
           </div>
         </div>

                 {/* Mid-Upper Section - Anuschka Circle is more than a community */}
         <div id="about" className={`mt-16 sm:mt-24 lg:mt-32 text-center opacity-0 transform translate-y-4 transition-all duration-1000 delay-300 ${isVisible ? 'opacity-100 translate-y-0' : ''}`}>
           <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-serif font-bold text-gray-900 mb-6 sm:mb-8 px-4">
             Anuschka Circle is more than a community
           </h2>
           <p className="text-base sm:text-lg text-gray-600 max-w-4xl mx-auto mb-8 sm:mb-10 leading-relaxed px-4">
             More than a brand, The Anuschka Circle is a movement — a collective of over 50,000 women united by shared values: preserving art, empowering women, and celebrating conscious living. Like every Anuschka bag, every member of this Circle is one-of-a-kind. This is your space to connect, create, and inspire — alongside changemakers, entrepreneurs, artists, and leaders who live with authenticity and purpose.
           </p>
           <Button 
             variant="outline"
             className="border-purple-300 text-purple-700 hover:bg-purple-50 px-6 sm:px-8 py-3 rounded-full text-base sm:text-lg w-full sm:w-auto"
             onClick={() => scrollToSection('community')}
           >
             Explore the Circle
           </Button>
         </div>

         {/* Mid-Lower Section - What is Anuschka Circle? */}
         <div id="community" className={`mt-12 sm:mt-16 md:mt-20 lg:mt-32 opacity-0 transform translate-y-4 transition-all duration-1000 delay-500 ${isVisible ? 'opacity-100 translate-y-0' : ''}`}>
           <div className="flex flex-col lg:flex-row items-center lg:items-start gap-6 sm:gap-8 lg:gap-16">
             {/* Left Side - Text Content */}
             <div className="flex-1 lg:pr-8 text-center lg:text-left">
               <h2 className="text-3xl sm:text-3xl font-bold text-gray-900 mb-4 sm:mb-6">What is Anuschka Circle?</h2>
               <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-4 sm:mb-6 px-4 lg:px-0">
                 The Anuschka Circle: Empowering Women Through<br />
                 Craft, Creativity, and Community
               </h3>
               <div className="text-gray-700 leading-relaxed space-y-4 sm:space-y-6 px-4 lg:px-0">
                 <p className="text-base sm:text-lg">
                 Anuschka is not just about wearing luxury; it’s about embracing a lifestyle that celebrates artistry, authenticity, and empowerment. The Anuschka Circle is a vibrant, purpose-driven community designed for women who lead with purpose, creativity, and authenticity. It’s a platform where changemakers, creators, and leaders unite to inspire and empower each other.
                 </p>
                 <p className="text-base sm:text-lg">
                 As a member of Anuschka Circle, you will connect with a community of over 50,000 women who share your passion for supporting art, preserving culture, and living a conscious, responsible life. The Anuschka Circle represents the values of craftsmanship, heritage, and slow fashion – values that are reflected in every Anuschka bag.
                 </p>
                 <p className="text-base sm:text-lg">
                 Here, you will find a safe space for your story to be heard, your ideas to flourish, and your creativity to shine. Like the unique, handcrafted bags Anuschka creates, every woman in the Circle is one of a kind – and we believe that each one of you has a story that deserves to be celebrated.
                 </p>
               </div>
             </div>
                                         {/* Right Side - Image and Button */}
              <div className="flex-1 flex flex-col items-center justify-center space-y-6 order-first lg:order-last lg:mt-16">
                <div className="w-80 h-80 sm:w-96 sm:h-96 lg:w-[400px] lg:h-[400px] flex items-center justify-center">
                  <img 
                    src="/Untitled_design-removebg-preview.png" 
                    alt="Anuschka Circle Logo" 
                    className="w-full h-full object-contain"
                  />
                </div>
                <Button 
                  variant="outline"
                  className="border-purple-300 text-purple-700 hover:bg-purple-50 px-8 py-3 rounded-full text-lg w-auto"
                  onClick={() => scrollToSection('membership')}
                >
                  Explore the Circle
                </Button>
              </div>
           </div>
         </div>

         {/* Bottom Section - Why Join the Circle? */}
         <div id="membership" className={`mt-16 sm:mt-24 lg:mt-32 opacity-0 transform translate-y-4 transition-all duration-1000 delay-700 ${isVisible ? 'opacity-100 translate-y-0' : ''}`}>
           <div className="text-center mb-12 sm:mb-16 px-4">
             <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-serif font-bold text-gray-900 mb-6 sm:mb-8">
               Why Join the Circle?
             </h2>
             <p className="text-base sm:text-lg text-gray-600 max-w-4xl mx-auto">
               Because here, you're not just a customer — you're an ambassador for craftsmanship, 
               sustainability, and women's empowerment.
             </p>
           </div>
           
           {/* Membership Tiers */}
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 lg:gap-10 mb-12 sm:mb-16 px-4">
             {membershipTiers.map((tier, index) => (
               <div 
                 key={tier.title}
                 className={`bg-white rounded-xl p-6 sm:p-8 shadow-lg border-2 cursor-pointer transition-all duration-300 ${
                   selectedTier === tier.title 
                     ? 'border-purple-500 shadow-xl scale-105' 
                     : 'border-gray-200 hover:shadow-xl hover:border-purple-300'
                 }`}
                 onClick={() => setSelectedTier(tier.title)}
               >
                 {/* Radio Button */}
                 <div className="flex items-center justify-between mb-4 sm:mb-6">
                   <h3 className="text-lg sm:text-xl font-bold text-gray-900">{tier.title}</h3>
                   <div className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full border-2 flex items-center justify-center ${
                     selectedTier === tier.title 
                       ? 'border-purple-500 bg-purple-500' 
                       : 'border-gray-300'
                   }`}>
                     {selectedTier === tier.title && (
                       <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-white rounded-full"></div>
                     )}
                   </div>
                 </div>
                 
                 <ul className="space-y-3 sm:space-y-4">
                   {tier.features.map((feature, featureIndex) => (
                     <li key={featureIndex} className="flex items-start">
                       <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-blue-500 rounded-full mr-3 sm:mr-4 mt-2 flex-shrink-0"></span>
                       <span className="text-sm sm:text-base text-gray-700">{feature}</span>
                     </li>
                   ))}
                 </ul>
               </div>
             ))}
           </div>

                     {/* Selection Summary */}
           {selectedTier && (
             <div className="text-center mb-6 sm:mb-8 p-4 sm:p-6 bg-purple-50 rounded-xl border border-purple-200 mx-4">
               <p className="text-base sm:text-lg text-purple-800 font-medium mb-2">
                 Selected: <span className="font-bold">{selectedTier}</span>
               </p>
               <p className="text-sm sm:text-base text-purple-600">
                 You've chosen the perfect membership tier for your journey with Anuschka Circle.
               </p>
             </div>
           )}

           {/* Concluding Text */}
           <div className="text-center mb-8 sm:mb-12 px-4">
             <p className="text-base sm:text-lg text-gray-600">
               Every tier reflects the value you bring to the Circle — and the impact you create by sharing our story.
             </p>
           </div>

           {/* Final Call to Action */}
           <div className="text-center px-4">
             {userExists ? (
               <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-4">
                 <div className="flex items-center justify-center space-x-2 text-yellow-800">
                   <AlertCircle className="w-5 h-5" />
                   <span className="font-medium">You already have an account!</span>
                 </div>
                 <p className="text-sm text-yellow-700 text-center mt-2">
                   Please click on Sign In to access your membership benefits.
                 </p>
                 <div className="mt-4 flex justify-center">
                   <Button
                     onClick={() => navigate('/login')}
                     className="bg-yellow-600 hover:bg-yellow-700 text-white px-6 py-2 rounded-full"
                   >
                     Sign In
                   </Button>
                 </div>
               </div>
             ) : (
               <Button 
                 className={`w-full sm:w-auto px-8 sm:px-16 py-3 sm:py-4 rounded-full text-base sm:text-lg font-medium transition-all duration-300 ${
                   selectedTier 
                     ? 'bg-purple-700 hover:bg-purple-600 text-white shadow-lg hover:shadow-xl' 
                     : 'bg-gray-400 text-gray-600 cursor-not-allowed'
                 }`}
                 onClick={handleJoinCircle}
                 disabled={!selectedTier || isCheckingUser}
               >
                 {isCheckingUser ? 'Checking...' : 
                   selectedTier ? `Join Anuschka Circle - ${selectedTier}` : 'Select a Membership Tier'
                 }
               </Button>
             )}
           </div>
        </div>

        
      </div>
    </div>
  );
};

export default CirclePage;