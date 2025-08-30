import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import SharedHeader from "./SharedHeader";
import NominationForm from "./NominationForm";
import QuickNominationForm from "./QuickNominationForm";
import { 
  Target, 
  BookOpen, 
  Lightbulb, 
  Users, 
  Star, 
  Shield, 
  Trophy, 
  Palette, 
  ShoppingBag, 
  Heart, 
  Award, 
  User,
  Clock,
  FileText,
  CheckCircle,
  Handshake,
  Crown,
  Calendar,
  Flag
} from "lucide-react";

const IconAwards = () => {
  const [isNominationFormOpen, setIsNominationFormOpen] = useState(false);
  const [isQuickNominationFormOpen, setIsQuickNominationFormOpen] = useState(false);

  const awardCategories = [
    {
      icon: Target,
      number: 1,
      title: "Professional Achievement",
      description: "For outstanding contributions and innovation in one's professional field."
    },
    {
      icon: BookOpen,
      number: 2,
      title: "Leadership Excellence",
      description: "Honoring visionary leaders who inspire and drive change."
    },
    {
      icon: Heart,
      number: 3,
      title: "Social Responsibility & CSR",
      description: "Recognizing commitment to ethical practices and community support."
    },
    {
      icon: Users,
      number: 4,
      title: "Women's Empowerment",
      description: "Celebrating champions of gender equality and empowerment initiatives."
    },
    {
      icon: Award,
      number: 5,
      title: "Community Influencer",
      description: "For those who make a significant impact in their communities through influence and action."
    },
    {
      icon: Shield,
      number: 6,
      title: "Sustainability Champion",
      description: "Honoring advocates for environmental protection and sustainable practices."
    },
    {
      icon: Trophy,
      number: 7,
      title: "Environmental Stewardship",
      description: "For impactful contributions to environmental conservation."
    },
    {
      icon: Palette,
      number: 8,
      title: "Arts & Culture Patron",
      description: "Recognizing support and enrichment of the arts and cultural heritage."
    },
    {
      icon: ShoppingBag,
      number: 9,
      title: "Fashion & Style Icon",
      description: "For those setting trends and redefining style in the fashion industry."
    },
    {
      icon: Lightbulb,
      number: 10,
      title: "Innovation Pioneer",
      description: "Celebrating trailblazers who push the boundaries of creativity and technology."
    },
    {
      icon: Star,
      number: 11,
      title: "Digital Impact Icon",
      description: "For women using digital platforms to inspire, educate, and lead social change."
    },
    {
      icon: User,
      number: 12,
      title: "Emerging Flame Icon",
      description: "For women under 35 already making bold contributions and shaping the future."
    }
  ];

  const nominationSteps = [
    {
      icon: Clock,
      title: "Quick Apply",
      description: "Submit basic details and category choice in minutes."
    },
    {
      icon: FileText,
      title: "Detailed Submission",
      description: "Provide comprehensive project details, supporting documents, and testimonials."
    },
    {
      icon: CheckCircle,
      title: "Review & Selection",
      description: "Our jury evaluates submissions to select finalists for the awards."
    }
  ];

  const benefits = [
    {
      icon: Award,
      title: "Bespoke Anuschka Icon Trophy and Certificate of Recognition"
    },
    {
      icon: Handshake,
      title: "Feature in Global Media Outlets and Industry Publications"
    },
    {
      icon: Crown,
      title: "Exclusive Invitations to Anuschka Network Events and Gala"
    },
    {
      icon: Trophy,
      title: "Monetary Grant to Further Artistic or Philanthropic Endeavors"
    }
  ];

  const keyDates = [
    {
      icon: Calendar,
      date: "Oct 23, 2024",
      event: "Nomination Open for All Categories"
    },
    {
      icon: Clock,
      date: "Dec 15, 2024",
      event: "Quick Nomination Deadline"
    },
    {
      icon: FileText,
      date: "Jan 20, 2025",
      event: "Submission Deadline"
    },
    {
      icon: Flag,
      date: "Mar 15, 2025",
      event: "Finalists Announced & Public Voting Opens"
    },
    {
      icon: Trophy,
      date: "May 20, 2025",
      event: "Anuschka Icon Awards Gala & Winners Announced"
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      <SharedHeader />
      
      {/* Hero Section */}
      <section className="relative h-[40vh] min-h-[300px] max-h-[600px] sm:h-[45vh] md:h-[50vh] lg:h-[55vh] xl:h-[60vh] 2xl:h-[65vh] flex items-center justify-center bg-gradient-to-r from-purple-900 to-purple-700">
        {/* Background Image */}
        <div className="absolute inset-0">
          <img 
            src="/icon-awards.jpg" 
            alt="Two women in neon-lit environment representing creative excellence" 
            className="w-full h-full object-cover object-center sm:object-center md:object-center lg:object-center xl:object-center 2xl:object-center"
            onError={(e) => {
              // Fallback to background color if image fails to load
              e.currentTarget.style.display = 'none';
            }}
            loading="eager"
            decoding="async"
                            // fetchPriority removed to fix React warning
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
              Nominate Yourself or Others for the Anuschka Icon Awards
            </h1>
          </div>
        </div>
      </section>

      {/* Description and CTA Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <p className="text-xl md:text-2xl text-gray-700 mb-8 leading-relaxed">
              Celebrate brilliance and impact in art, design, and creative entrepreneurship. This is your opportunity to recognize outstanding talent.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-4 text-lg font-semibold rounded-full"
                onClick={() => setIsQuickNominationFormOpen(true)}
              >
                Start Quick Nomination
              </Button>
              <Button 
                variant="outline" 
                className="border-purple-600 text-purple-600 hover:bg-purple-50 px-8 py-4 text-lg font-semibold rounded-full"
                onClick={() => setIsNominationFormOpen(true)}
              >
                Complete Detailed Submission
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Award Categories Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Discover the Award Categories
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              The Anuschka Icon Awards recognize excellence across diverse creative domains. Explore our categories and find the perfect fit for your nomination.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 max-w-7xl mx-auto">
            {awardCategories.map((category, index) => (
              <div key={index} className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="text-center">
                  <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <category.icon className="w-8 h-8 text-purple-600" />
                  </div>
                  <div className="text-2xl font-bold text-purple-600 mb-2">{category.number}</div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{category.title}</h3>
                  <p className="text-sm text-gray-600 mb-4">{category.description}</p>
                  <Button 
                    variant="outline" 
                    className="w-full border-purple-600 text-purple-600 hover:bg-purple-50 rounded-lg"
                    onClick={() => setIsNominationFormOpen(true)}
                  >
                    Nominate
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How Nominations Work Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              How Nominations Work
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our streamlined process makes it easy to submit your nomination. Follow these simple steps.
            </p>
          </div>
          
          <div className="max-w-4xl mx-auto">
            <div className="flex flex-col md:flex-row items-center justify-between relative">
              {nominationSteps.map((step, index) => (
                <div key={index} className="text-center relative z-10 mb-8 md:mb-0">
                  <div className="w-20 h-20 bg-white border-2 border-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <step.icon className="w-10 h-10 text-purple-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{step.title}</h3>
                  <p className="text-sm text-gray-600 max-w-48">{step.description}</p>
                  
                  {/* Connecting lines */}
                  {index < nominationSteps.length - 1 && (
                    <div className="hidden md:block absolute top-10 left-full w-16 h-0.5 bg-purple-300 transform translate-x-2"></div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Who Can Nominate Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Who Can Nominate?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              The Anuschka Icon Awards are designed to be inclusive, growing broad participation in recognizing talent.
            </p>
          </div>
          
          <div className="max-w-4xl mx-auto">
            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className="w-6 h-6 bg-purple-600 rounded-full flex-shrink-0 mt-1"></div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Self-Nominations</h3>
                  <p className="text-gray-600">Artists, designers, and entrepreneurs can nominate their own work and achievements.</p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <div className="w-6 h-6 bg-purple-600 rounded-full flex-shrink-0 mt-1"></div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Third-party Nominations</h3>
                  <p className="text-gray-600">Colleagues, clients, mentors, or admirers can nominate individuals or teams they believe deserve recognition.</p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <div className="w-6 h-6 bg-purple-600 rounded-full flex-shrink-0 mt-1"></div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Organizational Nominations</h3>
                  <p className="text-gray-600">Institutions, galleries, or companies may nominate artists or projects that align with the award categories.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* What Winners Receive Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              What Winners Receive
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Beyond recognition, Anuschka Icon Award winners gain invaluable benefits that propel their careers and impact.
            </p>
          </div>
          
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {benefits.map((benefit, index) => (
                <div key={index} className="text-center">
                  <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <benefit.icon className="w-8 h-8 text-purple-600" />
                  </div>
                  <p className="text-sm text-gray-700">{benefit.title}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Eligibility & Criteria Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Eligibility & Criteria
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              To ensure fairness and maintain the high standards of the Anuschka Icon Awards, all nominations must meet the following guidelines:
            </p>
          </div>
          
          <div className="max-w-4xl mx-auto">
            <div className="space-y-4">
              {[
                "Nominees must be at least 18 years of age at the time of nomination.",
                "Submitters must include clear evidence of originality and innovation.",
                "Previous Anuschka Icon Award winners are eligible to nominate others but not themselves in the same category for three years.",
                "Work submitted must have been completed or significantly impactful within the last five years.",
                "Detailed artist statements and impact narratives are highly recommended.",
                "All materials must be submitted in English for jury review."
              ].map((criteria, index) => (
                <div key={index} className="flex items-start space-x-4">
                  <div className="w-5 h-5 bg-purple-600 rounded-full flex-shrink-0 mt-1"></div>
                  <p className="text-gray-700">{criteria}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Key Dates Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Key Dates
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Mark your calendars! Stay informed about crucial deadlines and events for the Anuschka Icon Awards.
            </p>
          </div>
          
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
              {keyDates.map((date, index) => (
                <div key={index} className="text-center">
                  <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <date.icon className="w-8 h-8 text-purple-600" />
                  </div>
                  <div className="font-semibold text-purple-600 mb-2">{date.date}</div>
                  <p className="text-sm text-gray-700">{date.event}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Ready to Recognize Excellence Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8">
              Ready to Recognize Excellence?
            </h2>
            <Button 
              className="bg-purple-600 hover:bg-purple-700 text-white px-12 py-4 text-lg font-semibold rounded-full"
              onClick={() => setIsNominationFormOpen(true)}
            >
              Start Your Nomination
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
            <div className="md:col-span-1">
              <div className="flex items-center mb-4">
                <span className="text-2xl font-bold text-purple-400">*</span>
                <span className="text-xl font-bold ml-2">logo</span>
              </div>
              <p className="text-gray-300 mb-4">
                Celebrating pioneering achievements and creative impact across the global arts and design landscape.
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
              <h4 className="font-semibold mb-4">Awards</h4>
              <ul className="space-y-2 text-gray-300">
                <li>Categories</li>
                <li>Past Winners</li>
                <li>Judges</li>
                <li>Nominate Now</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Resources</h4>
              <ul className="space-y-2 text-gray-300">
                <li>FAQs</li>
                <li>Guidelines</li>
                <li>Support</li>
                <li>Media Kit</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">About Anuschka</h4>
              <ul className="space-y-2 text-gray-300">
                <li>Our Story</li>
                <li>Mission</li>
                <li>Team</li>
                <li>Careers</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Careers</h4>
              <ul className="space-y-2 text-gray-300">
                <li>Contact Us</li>
                <li>Press</li>
                <li>Partnerships</li>
                <li>Privacy Policy</li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-700 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400">© 2024 Anuschka Icon Awards. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* Nomination Form Popup */}
      <NominationForm 
        isOpen={isNominationFormOpen}
        onClose={() => setIsNominationFormOpen(false)}
      />

      {/* Quick Nomination Form Popup */}
      <QuickNominationForm 
        isOpen={isQuickNominationFormOpen}
        onClose={() => setIsQuickNominationFormOpen(false)}
      />
    </div>
  );
};

export default IconAwards;
