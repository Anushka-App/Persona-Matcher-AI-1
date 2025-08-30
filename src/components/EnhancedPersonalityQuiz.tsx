import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import LoadingSpinner from "./LoadingSpinner";
import { 
  FaQuestionCircle, 
  FaHeart, 
  FaStar, 
  FaLightbulb, 
  FaGift, 
  FaShoppingBag, 
  FaUser, 
  FaChartBar, 
  FaMagic, 
  FaRocket, 
  FaCheck, 
  FaSpinner,
  FaArrowRight,
  FaArrowLeft,
  FaPalette,
  FaGem,
  FaCrown,
  FaLeaf,
  FaSun,
  FaMoon,
  FaFire,
  FaWater,
  FaWind,
  FaMountain
} from 'react-icons/fa';

interface Question {
  id: number;
  question: string;
  options: {
    text: string;
    value: string;
    icon?: string;
  }[];
  category: string;
}

interface EnhancedQuizResult {
  personalityType: string;
  description: string;
  strengths: string[];
  recommendations: string[];
  products: string[];
  insights: string[];
  matchedBags: Array<{
    name: string;
    link: string;
    reason: string;
    imageUrl?: string;
    price?: string;
  }>;
  matchedArtwork: Array<{
    name: string;
    link: string;
    imageUrl: string;
    price: string;
    artworkName: string;
    personalityDescription: string;
  }>;
  sentiment: string;
  detailedAnalysis: string;
  llmInsights?: string;
  styleRecommendations?: string[];
  lifestyleAdvice?: string[];
}

const EnhancedPersonalityQuiz: React.FC = () => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [results, setResults] = useState<EnhancedQuizResult | null>(null);
  const [progress, setProgress] = useState(0);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(true);

  // Load questions from the enhanced dataset
  useEffect(() => {
    const loadQuestions = async () => {
      setIsLoadingQuestions(true);
      try {
        const response = await fetch('/api/enhanced-personality-quiz/questions');
        const data = await response.json();
        
        // Transform dataset questions to our format
        const transformedQuestions: Question[] = data.questions.slice(0, 10).map((q: Record<string, unknown>, index: number) => ({
          id: index + 1,
          question: q.question as string,
          options: (q.options as Array<Record<string, unknown>>).map((opt: Record<string, unknown>, optIndex: number) => ({
            text: opt.text,
            value: opt.text, // Use the text as value for matching
            icon: getIconForOption(optIndex)
          })),
          category: 'personality'
        }));
        
        setQuestions(transformedQuestions);
      } catch (error) {
        console.error('Error loading enhanced questions:', error);
        // Fallback to default questions
        setQuestions(getDefaultQuestions());
      } finally {
        setIsLoadingQuestions(false);
      }
    };

    loadQuestions();
  }, []);

  const getIconForOption = (index: number): string => {
    const icons = [
      'FaHeart', 'FaStar', 'FaMagic', 'FaRocket', 'FaPalette', 
      'FaGem', 'FaCrown', 'FaLeaf', 'FaSun', 'FaMoon', 
      'FaFire', 'FaWater', 'FaWind', 'FaMountain'
    ];
    return icons[index % icons.length];
  };

  const getDefaultQuestions = (): Question[] => [
    {
      id: 1,
      question: "How do you typically spend your weekends?",
      options: [
        { text: "Exploring new places and adventures", value: "adventurous", icon: "FaRocket" },
        { text: "Relaxing at home with a good book", value: "introspective", icon: "FaHeart" },
        { text: "Meeting friends and socializing", value: "social", icon: "FaUser" },
        { text: "Working on personal projects", value: "productive", icon: "FaMagic" }
      ],
      category: "lifestyle"
    },
    {
      id: 2,
      question: "When making decisions, you usually:",
      options: [
        { text: "Follow your intuition and feelings", value: "intuitive", icon: "FaLightbulb" },
        { text: "Analyze facts and data carefully", value: "analytical", icon: "FaChartBar" },
        { text: "Consider how it affects others", value: "empathetic", icon: "FaHeart" },
        { text: "Look for practical solutions", value: "practical", icon: "FaCheck" }
      ],
      category: "decision-making"
    },
    {
      id: 3,
      question: "Your ideal work environment is:",
      options: [
        { text: "Creative and flexible", value: "creative", icon: "FaMagic" },
        { text: "Structured and organized", value: "organized", icon: "FaCheck" },
        { text: "Collaborative and team-oriented", value: "collaborative", icon: "FaUser" },
        { text: "Independent and quiet", value: "independent", icon: "FaHeart" }
      ],
      category: "work-style"
    },
    {
      id: 4,
      question: "When shopping for clothes, you prioritize:",
      options: [
        { text: "Comfort and practicality", value: "comfort", icon: "FaHeart" },
        { text: "Style and fashion trends", value: "fashion", icon: "FaStar" },
        { text: "Quality and durability", value: "quality", icon: "FaCheck" },
        { text: "Unique and artistic pieces", value: "artistic", icon: "FaMagic" }
      ],
      category: "fashion-preference"
    },
    {
      id: 5,
      question: "In social situations, you tend to:",
      options: [
        { text: "Take the lead and organize activities", value: "leader", icon: "FaRocket" },
        { text: "Listen and support others", value: "supporter", icon: "FaHeart" },
        { text: "Observe and analyze the situation", value: "observer", icon: "FaChartBar" },
        { text: "Bring creativity and fun", value: "entertainer", icon: "FaMagic" }
      ],
      category: "social-behavior"
    },
    {
      id: 6,
      question: "Your biggest strength is:",
      options: [
        { text: "Creativity and imagination", value: "creative", icon: "FaMagic" },
        { text: "Logical thinking and problem-solving", value: "logical", icon: "FaChartBar" },
        { text: "Empathy and understanding others", value: "empathetic", icon: "FaHeart" },
        { text: "Reliability and consistency", value: "reliable", icon: "FaCheck" }
      ],
      category: "strengths"
    },
    {
      id: 7,
      question: "When faced with challenges, you:",
      options: [
        { text: "See them as opportunities to grow", value: "optimistic", icon: "FaRocket" },
        { text: "Carefully plan your approach", value: "strategic", icon: "FaChartBar" },
        { text: "Seek support from others", value: "collaborative", icon: "FaUser" },
        { text: "Trust your instincts", value: "intuitive", icon: "FaLightbulb" }
      ],
      category: "challenge-response"
    },
    {
      id: 8,
      question: "Your ideal vacation would be:",
      options: [
        { text: "An adventurous expedition", value: "adventure", icon: "FaRocket" },
        { text: "A peaceful retreat in nature", value: "peaceful", icon: "FaHeart" },
        { text: "A cultural city exploration", value: "cultural", icon: "FaStar" },
        { text: "A creative workshop or course", value: "learning", icon: "FaMagic" }
      ],
      category: "vacation-preference"
    },
    {
      id: 9,
      question: "Your preferred color palette is:",
      options: [
        { text: "Bold and vibrant colors", value: "bold", icon: "FaFire" },
        { text: "Soft and pastel tones", value: "soft", icon: "FaLeaf" },
        { text: "Neutral and classic shades", value: "neutral", icon: "FaGem" },
        { text: "Earthy and natural tones", value: "earthy", icon: "FaMountain" }
      ],
      category: "color-preference"
    },
    {
      id: 10,
      question: "Your energy level is typically:",
      options: [
        { text: "High energy and dynamic", value: "high", icon: "FaSun" },
        { text: "Calm and steady", value: "calm", icon: "FaMoon" },
        { text: "Adaptable and flowing", value: "flowing", icon: "FaWater" },
        { text: "Focused and intense", value: "focused", icon: "FaCrown" }
      ],
      category: "energy-level"
    }
  ];

  const getIconComponent = (iconName: string) => {
    const iconMap: Record<string, React.ComponentType> = {
      FaQuestionCircle,
      FaHeart,
      FaStar,
      FaLightbulb,
      FaGift,
      FaShoppingBag,
      FaUser,
      FaChartBar,
      FaMagic,
      FaRocket,
      FaCheck,
      FaSpinner,
      FaPalette,
      FaGem,
      FaCrown,
      FaLeaf,
      FaSun,
      FaMoon,
      FaFire,
      FaWater,
      FaWind,
      FaMountain
    };
    return iconMap[iconName] || FaQuestionCircle;
  };

  const handleAnswer = (value: string) => {
    setAnswers(prev => ({ ...prev, [currentQuestion]: value }));
  };

  const nextQuestion = () => {
    if (questions.length > 0 && currentQuestion < questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
      setProgress(((currentQuestion + 2) / questions.length) * 100);
    }
  };

  const previousQuestion = () => {
    if (questions.length > 0 && currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
      setProgress((currentQuestion / questions.length) * 100);
    }
  };

  const submitQuiz = async () => {
    if (questions.length === 0) {
      console.error('No questions available to submit');
      return;
    }
    
    setIsLoading(true);

    // Add a minimum loading time to ensure the animation is visible
    const startTime = Date.now();
    const minLoadingTime = 3000; // 3 seconds minimum for enhanced analysis

    try {
      // Transform answers to match the dataset format
      const transformedAnswers: Record<string, string> = {};
      Object.entries(answers).forEach(([questionId, answer]) => {
        const question = questions.find(q => q.id === parseInt(questionId));
        if (question) {
          transformedAnswers[question.question] = answer;
        }
      });

      const response = await fetch('/api/enhanced-personality-quiz', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          answers: transformedAnswers,
          questions: questions.map(q => ({ id: q.id, category: q.category }))
        }),
      });

      if (response.ok) {
        const result = await response.json();
        setResults(result);
        
        // Ensure minimum loading time has passed
        const elapsedTime = Date.now() - startTime;
        if (elapsedTime < minLoadingTime) {
          await new Promise(resolve => setTimeout(resolve, minLoadingTime - elapsedTime));
        }
        
        setShowResults(true);
      } else {
        // Fallback to mock results if API fails
        const mockResult = generateMockResults();
        setResults(mockResult);
        
        // Ensure minimum loading time has passed
        const elapsedTime = Date.now() - startTime;
        if (elapsedTime < minLoadingTime) {
          await new Promise(resolve => setTimeout(resolve, minLoadingTime - elapsedTime));
        }
        
        setShowResults(true);
      }
    } catch (error) {
      console.error('Error submitting enhanced quiz:', error);
      // Fallback to mock results
      const mockResult = generateMockResults();
      setResults(mockResult);
      
      // Ensure minimum loading time has passed
      const elapsedTime = Date.now() - startTime;
      if (elapsedTime < minLoadingTime) {
        await new Promise(resolve => setTimeout(resolve, minLoadingTime - elapsedTime));
      }
      
      setShowResults(true);
    } finally {
      setIsLoading(false);
    }
  };

  const generateMockResults = (): EnhancedQuizResult => {
    const personalityTypes = [
      {
        personalityType: "Savannah Spirit",
        description: "You're a bold and adventurous soul with a wild, untamed spirit. Your natural leadership and fearless approach to life make you stand out in any crowd.",
        strengths: ["Natural leadership", "Fearless approach to challenges", "Strong sense of adventure"],
        recommendations: ["Choose bold, statement pieces", "Opt for durable, travel-friendly accessories", "Embrace earthy tones and natural materials"],
        products: ["Leather crossbody bags with bold animal prints", "Adventure-ready backpacks", "Statement wallets with natural textures"],
        insights: ["Your bold nature makes you a natural leader", "You thrive in environments that allow for freedom", "Your adventurous spirit attracts others"],
        matchedBags: [
          { name: "Adventure Crossbody Bag", link: "https://anuschkaleather.in/collections/all", reason: "Perfect for your adventurous spirit" },
          { name: "Wilderness Satchel", link: "https://anuschkaleather.in/collections/all", reason: "Reflects your bold personality" }
        ],
        matchedArtwork: [
          {
            name: "Leopard Print Organizer",
            link: "https://anuschkaleather.in/collections/all",
            imageUrl: "/api/placeholder/200/200?text=Leopard+Print&bg=orange&fg=white",
            price: "₹2,999",
            artworkName: "Wild Spirit",
            personalityDescription: "Bold and adventurous like the lioness, this piece reflects your strength and independence."
          }
        ],
        sentiment: "Bold and adventurous with a wild, untamed spirit",
        detailedAnalysis: "Your Savannah Spirit personality shines through in your choices, reflecting your authentic nature and individual style preferences.",
        styleRecommendations: ["Embrace bold animal prints and natural textures", "Choose structured bags with multiple compartments", "Opt for warm earth tones"],
        lifestyleAdvice: ["Plan regular outdoor adventures", "Surround yourself with natural elements", "Embrace spontaneity and new experiences"]
      },
      {
        personalityType: "Enchanted Rose",
        description: "You're a romantic and magical soul with a touch of vintage elegance. Your deep emotional intelligence and creative imagination make you truly special.",
        strengths: ["Deep emotional intelligence", "Creative imagination", "Ability to find beauty in everyday moments"],
        recommendations: ["Select romantic, vintage-inspired pieces", "Choose soft, feminine details", "Opt for accessories that add magic"],
        products: ["Vintage-inspired clutches", "Delicate coin purses with floral patterns", "Elegant wristlets with soft designs"],
        insights: ["Your romantic nature helps you create meaningful connections", "You have a unique ability to see magic in ordinary moments", "Your vintage charm adds timeless elegance"],
        matchedBags: [
          { name: "Vintage Rose Clutch", link: "https://anuschkaleather.in/collections/all", reason: "Perfect for your romantic nature" },
          { name: "Enchanted Wallet", link: "https://anuschkaleather.in/collections/all", reason: "Reflects your magical personality" }
        ],
        matchedArtwork: [
          {
            name: "Floral Pattern Organizer",
            link: "https://anuschkaleather.in/collections/all",
            imageUrl: "/api/placeholder/200/200?text=Floral+Pattern&bg=pink&fg=white",
            price: "₹1,999",
            artworkName: "Enchanted Garden",
            personalityDescription: "Romantic and magical like a blooming rose, this piece embodies your grace and elegance."
          }
        ],
        sentiment: "Romantic and magical with a touch of vintage elegance",
        detailedAnalysis: "Your Enchanted Rose personality makes you naturally drawn to accessories that reflect your unique character and lifestyle preferences.",
        styleRecommendations: ["Select soft, romantic colors and floral patterns", "Choose delicate details like embroidery", "Opt for feminine silhouettes with graceful curves"],
        lifestyleAdvice: ["Create magical moments in your daily routine", "Surround yourself with beauty and romantic touches", "Practice mindfulness to appreciate life's wonders"]
      }
    ];

    const selectedType = personalityTypes[Math.floor(Math.random() * personalityTypes.length)];
    return selectedType;
  };

  const resetQuiz = () => {
    setCurrentQuestion(0);
    setAnswers({});
    setShowResults(false);
    setResults(null);
    setProgress(0);
  };

  useEffect(() => {
    setProgress(((currentQuestion + 1) / questions.length) * 100);
  }, [currentQuestion, questions.length]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <LoadingSpinner />
        <div className="text-center mt-4">
          <p className="text-sm text-muted-foreground">AI is analyzing your personality with enhanced insights...</p>
        </div>
      </div>
    );
  }

  if (showResults && results) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <Card className="mb-8">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <FaCrown className="text-6xl text-purple-600" />
              </div>
              <CardTitle className="text-4xl font-bold text-gray-800 mb-2">
                {results.personalityType}
              </CardTitle>
              <CardDescription className="text-xl text-gray-600">
                {results.description}
              </CardDescription>
            </CardHeader>
          </Card>

          {/* Enhanced Analysis Section */}
          {results.llmInsights && (
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FaMagic className="text-purple-500" />
                  AI-Enhanced Analysis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose max-w-none">
                  <p className="text-gray-700 leading-relaxed">{results.llmInsights}</p>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FaChartBar className="text-blue-500" />
                  Your Strengths
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {results.strengths.map((strength, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <FaCheck className="text-green-500 text-sm" />
                      <span className="text-gray-700">{strength}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FaLightbulb className="text-yellow-500" />
                  Personal Insights
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {results.insights.map((insight, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <FaStar className="text-yellow-500 text-sm" />
                      <span className="text-gray-700">{insight}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Matched Products Section */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FaGift className="text-purple-500" />
                Your Perfect Matches
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                {/* Matched Bags */}
                <div>
                  <h4 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <FaShoppingBag className="text-blue-500" />
                    Recommended Bags
                  </h4>
                  <div className="space-y-3">
                    {results.matchedBags.map((bag, index) => (
                      <div key={index} className="p-3 border rounded-lg bg-gray-50">
                        <h5 className="font-medium text-gray-800">{bag.name}</h5>
                        <p className="text-sm text-gray-600 mt-1">{bag.reason}</p>
                        <a 
                          href={bag.link} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-purple-600 text-sm hover:underline mt-2 inline-block"
                        >
                          View Product →
                        </a>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Matched Artwork */}
                <div>
                  <h4 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <FaPalette className="text-green-500" />
                    Artwork Collections
                  </h4>
                  <div className="space-y-3">
                    {results.matchedArtwork.map((art, index) => (
                      <div key={index} className="p-3 border rounded-lg bg-gray-50">
                        <div className="flex items-center gap-3">
                          <img 
                            src={art.imageUrl} 
                            alt={art.name}
                            className="w-12 h-12 rounded object-cover"
                          />
                          <div>
                            <h5 className="font-medium text-gray-800">{art.name}</h5>
                            <p className="text-sm text-gray-600">{art.price}</p>
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 mt-2">{art.personalityDescription}</p>
                        <a 
                          href={art.link} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-purple-600 text-sm hover:underline mt-2 inline-block"
                        >
                          View Collection →
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Style and Lifestyle Recommendations */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FaStar className="text-purple-500" />
                  Style Recommendations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {(results.styleRecommendations || results.recommendations).map((rec, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <FaCheck className="text-green-500 text-sm" />
                      <span className="text-gray-700">{rec}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FaHeart className="text-red-500" />
                  Lifestyle Advice
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {(results.lifestyleAdvice || results.recommendations).map((advice, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <FaStar className="text-yellow-500 text-sm" />
                      <span className="text-gray-700">{advice}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>

          <div className="flex justify-center gap-4">
            <Button
              onClick={resetQuiz}
              variant="outline"
              size="lg"
              className="px-8"
            >
              <FaArrowLeft className="mr-2" />
              Take Quiz Again
            </Button>
            <Button
              onClick={() => window.location.href = '/quiz'}
              size="lg"
              className="px-8 bg-purple-600 hover:bg-purple-700"
            >
              <FaRocket className="mr-2" />
              Explore More
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Show loading state while questions are being loaded
  if (isLoadingQuestions || questions.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 py-20 px-4">
        <div className="max-w-2xl mx-auto">
          <Card className="mb-8">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <FaMagic className="text-6xl text-purple-600" />
              </div>
              <CardTitle className="text-3xl font-bold text-gray-800 mb-2">
                Loading Enhanced Personality Quiz
              </CardTitle>
              <CardDescription className="text-lg text-gray-600">
                Preparing your personalized questions with AI-enhanced analysis...
              </CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardContent className="text-center py-12">
              <div className="flex items-center justify-center gap-3">
                <FaSpinner className="text-2xl text-purple-600 animate-spin" />
                <span className="text-lg text-gray-600">Loading enhanced questions...</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const currentQ = questions[currentQuestion];
  const hasAnswered = answers[currentQuestion];

  // Safety check - if currentQ is undefined, show error
  if (!currentQ) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 py-20 px-4">
        <div className="max-w-2xl mx-auto">
          <Card className="mb-8">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <FaMagic className="text-6xl text-purple-600" />
              </div>
              <CardTitle className="text-3xl font-bold text-gray-800 mb-2">
                Quiz Error
              </CardTitle>
              <CardDescription className="text-lg text-gray-600">
                Unable to load enhanced quiz questions. Please try refreshing the page.
              </CardDescription>
            </CardHeader>
          </Card>
          <div className="text-center">
            <Button
              onClick={() => window.location.reload()}
              size="lg"
              className="px-8 bg-purple-600 hover:bg-purple-700"
            >
              <FaSpinner className="mr-2" />
              Refresh Page
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 py-20 px-4">
      <div className="max-w-2xl mx-auto">
        <Card className="mb-8">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <FaCrown className="text-6xl text-purple-600" />
            </div>
            <CardTitle className="text-3xl font-bold text-gray-800 mb-2">
              Enhanced Personality Quiz
            </CardTitle>
            <CardDescription className="text-lg text-gray-600">
              Discover your unique personality with AI-enhanced analysis and personalized recommendations
            </CardDescription>
          </CardHeader>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <FaQuestionCircle className="text-purple-600" />
                <span className="text-sm font-medium text-gray-600">
                  Question {currentQuestion + 1} of {questions.length}
                </span>
              </div>
              <span className="text-sm font-medium text-gray-600">
                {Math.round(progress)}%
              </span>
            </div>
            <Progress value={progress} className="w-full" />
          </CardHeader>
          <CardContent>
            <h3 className="text-xl font-semibold text-gray-800 mb-6">
              {currentQ.question}
            </h3>
            
            <div className="space-y-3">
              {currentQ.options.map((option, index) => {
                const IconComponent = option.icon ? getIconComponent(option.icon) : FaHeart;
                const isSelected = answers[currentQuestion] === option.value;
                
                return (
                  <button
                    key={index}
                    onClick={() => handleAnswer(option.value)}
                    className={`w-full p-4 rounded-lg border-2 transition-all duration-200 text-left flex items-center gap-3 ${
                      isSelected
                        ? 'border-purple-500 bg-purple-50 text-purple-700'
                        : 'border-gray-200 hover:border-purple-300 hover:bg-purple-25'
                    }`}
                  >
                    <IconComponent className={`text-xl ${isSelected ? 'text-purple-600' : 'text-gray-400'}`} />
                    <span className="font-medium">{option.text}</span>
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-between">
          <Button
            onClick={previousQuestion}
            variant="outline"
            disabled={currentQuestion === 0}
            className="flex items-center gap-2"
          >
            <FaArrowLeft />
            Previous
          </Button>

          {currentQuestion === questions.length - 1 ? (
            <Button
              onClick={submitQuiz}
              disabled={!hasAnswered || isLoading}
              className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700"
            >
              {isLoading ? (
                <>
                  <FaSpinner className="animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <FaCheck />
                  Get Enhanced Results
                </>
              )}
            </Button>
          ) : (
            <Button
              onClick={nextQuestion}
              disabled={!hasAnswered}
              className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700"
            >
              Next
              <FaArrowRight />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default EnhancedPersonalityQuiz; 