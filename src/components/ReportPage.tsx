import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const ReportPage = () => {
  const navigate = useNavigate();

  const scoreData = [
    {
      title: "Practicality Score",
      score: 85,
      description: "Your score reflects a high preference for functional and convenient bags. You prioritize ease of use and smart organization, ensuring your bag supports your daily activities seamlessly."
    },
    {
      title: "Elegance Score", 
      score: 72,
      description: "You appreciate refined aesthetics and classic designs. Your choices lean towards timeless pieces that exude sophistication and grace."
    },
    {
      title: "Trendiness Score",
      score: 60,
      description: "While you're aware of current trends, you maintain a balanced approach, integrating fashionable elements without being overly influenced by fleeting fads."
    },
    {
      title: "Versatility Score",
      score: 90,
      description: "Your top priority is a bag that adapts to various occasions and outfits. You seek styles that can transition seamlessly from day to night, or casual to formal."
    },
    {
      title: "Comfort Score",
      score: 78,
      description: "Comfort is a significant factor in your bag choices. You prefer lightweight designs and ergonomic straps that ensure ease of carrying throughout the day."
    },
    {
      title: "Uniqueness Score",
      score: 65,
      description: "You enjoy bags that stand out from the crowd, reflecting your individual personality without being overly avant-garde. You seek distinctive details or artistic craftsmanship."
    }
  ];

  const handleExploreCollection = () => {
    navigate('/upload');
  };

  const handleShareReport = () => {
    if (navigator.share) {
      navigator.share({
        title: 'My Anuschka Score Report',
        text: 'Check out my personalized Anuschka bag score report!',
        url: window.location.href
      });
    } else {
      // Fallback for browsers that don't support Web Share API
      navigator.clipboard.writeText(window.location.href);
      alert('Report link copied to clipboard!');
    }
  };

  const handleDownloadReport = () => {
    // Create a simple PDF-like report
    const reportContent = `
      Anuschka Personalized Score Report
      
      Butterfly Blooms Bronze
      
      Your Scores:
      ${scoreData.map(item => `${item.title}: ${item.score}`).join('\n')}
      
      Generated on: ${new Date().toLocaleDateString()}
    `;
    
    const blob = new Blob([reportContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'anuschka-score-report.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-white pt-20">
      <div className="container mx-auto px-6 py-8">
        {/* Page Title */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-purple-600 mb-4">
            Your Personalized Score Report
          </h1>
          <div className="flex justify-center space-x-4 mt-6">
            <Button 
              onClick={handleShareReport}
              variant="outline" 
              className="border-purple-600 text-purple-600 hover:bg-purple-50"
            >
              Share Report
            </Button>
            <Button 
              onClick={handleDownloadReport}
              variant="outline" 
              className="border-purple-600 text-purple-600 hover:bg-purple-50"
            >
              Download PDF
            </Button>
          </div>
        </div>

        {/* Main Content Box */}
        <div className="bg-gray-100 rounded-lg p-8 mb-12">
          <div className="grid lg:grid-cols-2 gap-8 items-center">
            {/* Left Panel - Text Description */}
            <div className="space-y-6">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-800">
                Butterfly Blooms Bronze
              </h2>
              <p className="text-lg text-gray-700 leading-relaxed">
                Your spirit mirrors the butterfly, representing transformation and lightness. 
                You are drawn to roses, symbolizing elegance and love, and daisies, 
                representing innocence and purity.
              </p>
              <div className="text-center lg:text-left space-y-4">
                <Button 
                  onClick={handleExploreCollection}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 text-lg font-medium rounded-full"
                >
                  Explore Collection
                </Button>
                <div className="text-sm text-gray-600">
                  Based on your quiz results • Generated on {new Date().toLocaleDateString()}
                </div>
              </div>
            </div>

            {/* Right Panel - Image */}
            <div className="flex justify-center lg:justify-end">
              <div className="relative group cursor-pointer" onClick={handleExploreCollection}>
                <img
                  src="/logo.png"
                  alt="Butterfly Blooms Bronze Bag"
                  className="w-full max-w-md h-auto rounded-lg shadow-lg transition-transform group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent rounded-lg"></div>
                <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg px-3 py-2">
                  <p className="text-sm font-medium text-gray-800">Click to explore</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Score Breakdown Section */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-gray-800 text-center mb-8">
            Your Score's Breakdown
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {scoreData.map((item, index) => (
              <Card key={index} className="bg-gray-100 border-0 shadow-sm hover:shadow-md transition-shadow cursor-pointer group">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    {/* Score Title and Number */}
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-gray-800 group-hover:text-purple-600 transition-colors">
                        {item.title}
                      </h3>
                      <span className="text-2xl font-bold text-purple-600">
                        {item.score}
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="relative">
                      <div className="w-full bg-gray-300 rounded-full h-3">
                        <div 
                          className="bg-purple-400 h-3 rounded-full transition-all duration-1000 ease-out relative"
                          style={{ width: `${item.score}%` }}
                        >
                          {/* Score indicator dot */}
                          <div className="absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-1/2 w-4 h-4 bg-white rounded-full border-2 border-purple-400 shadow-sm"></div>
                        </div>
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-gray-700 text-sm leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="text-center mb-12">
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              onClick={() => navigate('/quiz')}
              variant="outline"
              className="border-purple-600 text-purple-600 hover:bg-purple-50 px-8 py-3"
            >
              Retake Quiz
            </Button>
            <Button 
              onClick={() => navigate('/circle')}
              className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3"
            >
              Join Circle for More Insights
            </Button>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center py-8 border-t border-gray-200">
          <p className="text-gray-500 text-sm">
            © 2023 Anuschka Inc. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ReportPage; 