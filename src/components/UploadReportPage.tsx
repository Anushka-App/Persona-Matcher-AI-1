import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import SharedHeader from './SharedHeader';
import { Share2 } from 'lucide-react';

interface LocationState {
  products: Array<Record<string, unknown>>;
  explanation: string;
  userProfile: {
    personality: string;
    sentiment: string;
  };
  fromUpload: boolean;
  markdownReport?: string;
}

const UploadReportPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const state = (location.state || {}) as Partial<LocationState>;

  const products = state.products || [];
  const explanation = state.explanation || '';
  const personality = state.userProfile?.personality || 'Your Match';
  const sentiment = state.userProfile?.sentiment || 'Balanced';
  const markdownReport = state.markdownReport || '';

  const handleFindMatch = () => {
    navigate('/results/text', {
      state: {
        products: products,
        explanation: explanation,
        userProfile: {
          personality: personality,
          sentiment: sentiment
        },
        fromUpload: true
      }
    });
  };

  const handleShareResults = () => {
    const shareText = `🎭 I just discovered my personality type: ${personality}! ${sentiment} style. Take the upload quiz and find your perfect handbag match!`;
    const shareUrl = window.location.origin + '/upload';

    if (navigator.share) {
      navigator.share({
        title: 'My Upload Quiz Results',
        text: shareText,
        url: shareUrl
      }).catch((error) => {
        console.error('Error sharing:', error);
        // Fallback to clipboard
        navigator.clipboard.writeText(shareText + '\n\n' + shareUrl);
        alert('Results copied to clipboard!');
      });
    } else {
      // Fallback to clipboard for desktop
      navigator.clipboard.writeText(shareText + '\n\n' + shareUrl);
      alert('Results copied to clipboard!');
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <SharedHeader />
      
      {/* Hero Section */}
      <div className="w-full bg-muted/40">
        <div className="container mx-auto px-4">
          <div className="h-56 md:h-64 w-full flex flex-col items-center justify-center">
            <div className="w-10/12 md:w-8/12 h-40 md:h-48 bg-muted rounded-md flex items-center justify-center mb-4">
              <div className="w-24 h-24 bg-muted-foreground/20 rounded-full" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-black mb-2">
              {personality}
            </h1>
            <p className="text-gray-600">Shop By Personality | Theme</p>
          </div>
        </div>
      </div>

      {/* Your Unique Personality Type Section */}
      <div className="container mx-auto px-4 py-10">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-700 mb-6">Your Unique Personality Type</h2>
            <div className="space-y-3 mb-6">
              <div className="flex justify-center items-center space-x-4">
                <span className="text-gray-600">Style Sentiment:</span>
                <span className="font-semibold">{sentiment}</span>
              </div>
              <div className="flex justify-center items-center space-x-4">
                <span className="text-gray-600">Analysis Confidence:</span>
                <span className="font-semibold">85%</span>
              </div>
              <div className="flex justify-center items-center space-x-4">
                <span className="text-gray-600">Status:</span>
                <span className="font-semibold text-green-600">Saved to Database</span>
              </div>
            </div>
            <Button
              onClick={handleFindMatch}
              className="bg-[#6A1B9A] hover:bg-[#5b1584] text-white px-8 py-3 text-lg"
            >
              Find Match
            </Button>
          </div>

          {/* Your Style Insights Section */}
          <div className="mb-8">
            <h3 className="text-2xl font-bold text-gray-700 text-center mb-6">Your Style Insights</h3>
            <div className="grid md:grid-cols-2 gap-8">
              {/* Left Column - Personality Style Summary */}
              <div className="bg-white rounded-xl border border-[#E6E0EA] p-6">
                <h4 className="text-lg font-semibold text-[#2B1B44] mb-4">Personality Style Summary</h4>
                <p className="text-[#4A4A4A] leading-relaxed">
                  {explanation || 'These handbag selections are carefully chosen to complement your style preferences.'}
                </p>
              </div>

              {/* Right Column - Style Preferences */}
              <div className="bg-white rounded-xl border border-[#E6E0EA] p-6">
                <h4 className="text-lg font-semibold text-[#2B1B44] mb-4">Style Preferences</h4>
                <div className="space-y-3">
                  <div>
                    <span className="font-semibold text-[#2B1B44]">Classic: </span>
                    <span className="text-[#4A4A4A]">Timeless designs with enduring appeal.</span>
                  </div>
                  <div>
                    <span className="font-semibold text-[#2B1B44]">Versatile: </span>
                    <span className="text-[#4A4A4A]">Adaptable for various occasions, seamlessly fitting into your dynamic life.</span>
                  </div>
                  <div>
                    <span className="font-semibold text-[#2B1B44]">Practical: </span>
                    <span className="text-[#4A4A4A]">Prioritizing functionality and comfort without compromising on elegance.</span>
                  </div>
                  <div>
                    <span className="font-semibold text-[#2B1B44]">Lifestyle Insights: </span>
                    <span className="text-[#4A4A4A]">You seek accessories that enhance your daily flow and reflect a confident, grounded presence.</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Anuschka MatchMaker Section */}
          <div className="bg-gradient-to-r from-[#F5F4F6] to-[#F1E4F3] rounded-xl border border-[#E4B7F6] p-8 text-center">
            <h3 className="text-2xl font-bold text-[#2B1B44] mb-4">Anuschka MatchMaker</h3>
            <p className="text-[#4A4A4A] mb-6 max-w-2xl mx-auto leading-relaxed">
              Our AI-powered matchmaker is designed to connect you with handcrafted art that truly resonates with your unique spirit. Explore collections that tell your story and elevate your everyday.
            </p>
            
            {/* Product Images */}
            <div className="flex justify-center gap-8 mb-6">
              <img 
                src="/red-floral-handbag.jpg" 
                alt="Red leather handbag with vibrant floral and insect motifs" 
                className="w-32 h-32 object-cover rounded-lg border-2 border-[#E6E0EA] shadow-lg"
              />
              <img 
                src="/black-leopard-handbag.jpg" 
                alt="Black hobo bag with leopard, cactus, and butterfly design" 
                className="w-32 h-32 object-cover rounded-lg border-2 border-[#E6E0EA] shadow-lg"
              />
            </div>
            
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Button
                onClick={handleFindMatch}
                className="bg-[#6A1B9A] hover:bg-[#5b1584] text-white px-8 py-3"
              >
                Find Match
              </Button>
              <Button
                onClick={handleShareResults}
                variant="outline"
                className="border-gray-300 text-gray-700 hover:bg-gray-50 px-8 py-3"
              >
                <Share2 className="w-4 h-4 mr-2" />
                Share Results
              </Button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mt-10">
            <Button
              onClick={() => navigate('/upload')}
              size="lg"
              variant="outline"
              className="border-purple-300 text-purple-700 hover:bg-purple-50"
            >
              Upload New Image
            </Button>
            <Button
              onClick={() => navigate('/')}
              size="lg"
              variant="outline"
              className="border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              Back to Home
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UploadReportPage;
