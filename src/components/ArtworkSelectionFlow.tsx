import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import LoadingSpinner from "./LoadingSpinner";
import { Product } from '@/types/product';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
interface ArtworkSelectionFlowProps {
  // This component is designed as a standalone page with no external props
  // All data is managed internally through state and location state
  // Using empty interface to indicate no props are expected
}

interface QuestionOption {
  id: string;
  label: string;
  value: string;
  icon: string;
  color: string;
}

// Helper functions for generating personalized content
const generatePersonalizedExplanation = (
  personality: string,
  sentiment: string,
  artworkTheme: string,
  productType: string,
  recommendationCount: number
): string => {
  const themeDescription = artworkTheme.toLowerCase();
  const productDescription = productType.toLowerCase();

  return `Based on your ${personality} personality and ${sentiment.toLowerCase()} sentiment, we've curated ${recommendationCount} stunning ${productDescription}s featuring ${themeDescription} artwork designs. Each piece has been carefully selected to reflect your unique style preferences and personality traits. These designs speak to your ${personality.toLowerCase()} nature and will complement your ${sentiment.toLowerCase()} outlook on life.`;
};

const calculateMatchConfidence = (recommendations: Array<Record<string, unknown> | Product>, personality: string): number => {
  // Calculate confidence based on number of recommendations and personality match
  const baseConfidence = Math.min(85 + (recommendations.length * 1.5), 95);
  return Math.round(baseConfidence);
};

const generateStyleInsights = (personality: string, sentiment: string): string[] => {
  const insights = [];

  if (personality === 'Unique') {
    insights.push('You gravitate toward distinctive designs that set you apart');
    insights.push('Bold patterns and unconventional elements appeal to your creative spirit');
  } else if (personality === 'Adventurous') {
    insights.push('Dynamic and energetic designs resonate with your bold personality');
    insights.push('You appreciate artwork that tells a story of exploration');
  } else if (personality === 'Elegant') {
    insights.push('Sophisticated and refined designs reflect your polished taste');
    insights.push('You value timeless beauty and understated luxury');
  }

  if (sentiment === 'Positive') {
    insights.push('Bright, uplifting colors and joyful patterns match your optimistic outlook');
  } else if (sentiment === 'Balanced') {
    insights.push('Harmonious designs with balanced proportions suit your measured approach');
  } else if (sentiment === 'Negative') {
    insights.push('Deep, introspective designs resonate with your contemplative nature');
  }

  return insights;
};

const generatePersonalizedAdvice = (personality: string, sentiment: string): string[] => {
  const advice = [];

  if (personality === 'Unique') {
    advice.push('Don\'t be afraid to mix and match different artwork themes');
    advice.push('Consider how each piece tells your unique story');
  } else if (personality === 'Adventurous') {
    advice.push('Embrace bold color combinations and dynamic patterns');
    advice.push('Let your bags reflect your fearless approach to life');
  } else if (personality === 'Elegant') {
    advice.push('Focus on quality and craftsmanship over trends');
    advice.push('Choose pieces that will become timeless classics');
  }

  return advice;
};

const ArtworkSelectionFlow: React.FC<ArtworkSelectionFlowProps> = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedDestination, setSelectedDestination] = useState<string>('');
  const [selectedBagType, setSelectedBagType] = useState<string>('');
  const [loading, setLoading] = useState(false);

  // Get personality data from location state or localStorage
  const [personalityData, setPersonalityData] = useState<{
    personality: string;
    sentiment: string;
    scores?: Record<string, number>;
    quizJourney?: Array<{ questionNumber: number; question: string; selectedOption: string }>;
    quizAnswers?: Array<{
      question: string;
      answer: string;
      weights?: Record<string, number>;
    }>;
  } | null>(null);

  useEffect(() => {
    // Try to get data from location state first
    const stateData = location.state as { personality?: string; sentiment?: string };
    if (stateData?.personality && stateData?.sentiment) {
      setPersonalityData({
        personality: stateData.personality,
        sentiment: stateData.sentiment
      });
    } else {
      // Fallback to localStorage
      const storedData = localStorage.getItem('personalityData');
      if (storedData) {
        try {
          const parsed = JSON.parse(storedData);
          setPersonalityData({
            personality: parsed.personality || 'Unique',
            sentiment: parsed.sentiment || 'Balanced',
            scores: parsed.scores,
            quizJourney: parsed.quizJourney,
            quizAnswers: parsed.quizAnswers || []
          });
        } catch (e) {
          console.error('Failed to parse stored personality data:', e);
          // Redirect back to personality quiz if no data
          navigate('/personality-quiz');
        }
      } else {
        // No data available, redirect to personality quiz
        navigate('/personality-quiz');
      }
    }
  }, [location.state, navigate]);

  // Don't render until we have personality data
  if (!personalityData) {
    return (
      <div className="min-h-screen bg-palo-background flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  const { personality, sentiment, scores, quizJourney, quizAnswers } = personalityData;

  // Question 1: Artwork theme options (static data) - UPDATED TO MATCH EXCEL CATEGORIES
  const getArtworkThemeOptions = (): QuestionOption[] => {
    const themes = [
      {
        id: 'animals',
        label: 'Animal (wildlife and majestic creatures)',
        value: 'Animal',
        icon: '🦁',
        color: 'from-orange-400 to-amber-500'
      },
      {
        id: 'flowers_plants',
        label: 'Flowers/Plants (blooms and leafy calm)',
        value: 'Flowers/Plants',
        icon: '🌸',
        color: 'from-pink-400 to-rose-500'
      },
      {
        id: 'nature_landscape',
        label: 'Nature/Landscape (vistas and natural forms)',
        value: 'Nature/Landscape',
        icon: '🏔️',
        color: 'from-green-400 to-emerald-500'
      },
      {
        id: 'pattern_abstract',
        label: 'Pattern/Abstract (abstract shapes and geometry)',
        value: 'Pattern/Abstract',
        icon: '🎨',
        color: 'from-blue-400 to-cyan-500'
      },
      {
        id: 'symbols_emblems',
        label: 'Symbols/Emblems (meaning and character)',
        value: 'Symbols/Emblems',
        icon: '⭐',
        color: 'from-purple-400 to-indigo-500'
      },
      {
        id: 'vehicles_transport',
        label: 'Vehicles/Transport (cars, planes, travel themes)',
        value: 'Vehicles/Transport',
        icon: '🚗',
        color: 'from-red-400 to-pink-500'
      },
      {
        id: 'food_drink',
        label: 'Food & Drink (culinary themes and beverages)',
        value: 'Food & Drink',
        icon: '🍽️',
        color: 'from-yellow-400 to-orange-500'
      },
      {
        id: 'other',
        label: 'Other (unique and unexpected)',
        value: 'Other (Unspecified)',
        icon: '🎭',
        color: 'from-gray-400 to-slate-500'
      }
    ];
    return themes.map(theme => ({
      id: theme.id,
      label: theme.label,
      value: theme.value,
      icon: theme.icon,
      color: theme.color
    }));
  };

  // Question 2: Product type options (mapped to match backend Excel data)
  const getProductTypeOptions = (): QuestionOption[] => {
    const productTypes = [
      {
        id: 'wallet',
        label: 'Wallets & Card Holders',
        value: 'wallet',
        icon: '💳',
        color: 'from-emerald-400 to-teal-600'
      },
      {
        id: 'crossbody',
        label: 'Crossbody Bags',
        value: 'crossbody',
        icon: '👜',
        color: 'from-purple-400 to-indigo-600'
      },
      {
        id: 'satchel',
        label: 'Satchels & Totes',
        value: 'satchel',
        icon: '👝',
        color: 'from-brown-400 to-amber-600'
      },
      {
        id: 'hobo',
        label: 'Hobo Bags',
        value: 'hobo',
        icon: '🎒',
        color: 'from-pink-400 to-rose-600'
      },
      {
        id: 'clutch',
        label: 'Clutches & Evening Bags',
        value: 'clutch',
        icon: '�',
        color: 'from-violet-400 to-purple-600'
      },
      {
        id: 'pouch',
        label: 'Pouches & Organizers',
        value: 'pouch',
        icon: '👝',
        color: 'from-cyan-400 to-blue-600'
      },
      {
        id: 'tote',
        label: 'Totes & Large Bags',
        value: 'tote',
        icon: '🛍️',
        color: 'from-orange-400 to-red-600'
      }
    ];
    return productTypes.map(type => ({
      id: type.id,
      label: type.label,
      value: type.value,
      icon: type.icon,
      color: type.color
    }));
  };

  const handleArtworkThemeSelect = (themeId: string) => {
    setSelectedDestination(themeId);
    setCurrentStep(2);
  };

  const handleProductTypeSelect = async (productTypeId: string) => {
    setSelectedBagType(productTypeId);
    setLoading(true);

    try {
      // Add minimum loading time for animation
      const startTime = Date.now();
      const minLoadingTime = 3000;

      // Get selected artwork theme and product type labels
      const selectedArtworkThemeData = getArtworkThemeOptions().find(d => d.id === selectedDestination);
      const selectedProductTypeData = getProductTypeOptions().find(b => b.id === productTypeId);

      // Send artwork selections to LLM for enhanced analysis
      const artworkAnalysisResponse = await fetch('/api/artwork-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          personality: personality,
          sentiment: sentiment,
          artworkTheme: selectedArtworkThemeData?.value || 'Other (Unspecified)',
          productType: selectedProductTypeData?.value || 'Bag',
          artworkPreferences: {
            selectedTheme: selectedArtworkThemeData?.label || 'Unspecified',
            selectedProduct: selectedProductTypeData?.label || 'Bag'
          }
        })
      });

      let enhancedBagType = selectedProductTypeData?.value || 'Bag';
      let llmInsights = '';

      if (artworkAnalysisResponse.ok) {
        const artworkAnalysis = await artworkAnalysisResponse.json();
        enhancedBagType = artworkAnalysis.suggestedBagType || enhancedBagType;
        llmInsights = artworkAnalysis.insights || '';
        console.log('🎨 LLM Artwork Analysis:', artworkAnalysis);
      }

      // Get personalized recommendations from backend API using LLM-enhanced bag type
      const response = await fetch('/recommendations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          description: `${personality} personality with ${sentiment} sentiment`,
          bagType: enhancedBagType,
          artworkTheme: selectedArtworkThemeData?.value || 'Other (Unspecified)',
          occasion: 'casual',
          llmInsights: llmInsights
        })
      });

      if (!response.ok) {
        throw new Error('Failed to get recommendations from backend');
      }

      const result = await response.json();
      const recommendations = result.recommendations || [];

      // Ensure minimum loading time
      const elapsedTime = Date.now() - startTime;
      if (elapsedTime < minLoadingTime) {
        await new Promise(resolve => setTimeout(resolve, minLoadingTime - elapsedTime));
      }

      // Generate personalized explanation with LLM insights
      const explanation = llmInsights
        ? `${generatePersonalizedExplanation(
          personality,
          sentiment,
          selectedArtworkThemeData?.value || 'Other (Unspecified)',
          selectedProductTypeData?.value || 'Bag',
          recommendations.length
        )} ${llmInsights}`
        : generatePersonalizedExplanation(
          personality,
          sentiment,
          selectedArtworkThemeData?.value || 'Other (Unspecified)',
          selectedProductTypeData?.value || 'Bag',
          recommendations.length
        );

      // Navigate to results page with personalized recommendations
      navigate('/results/text', {
        state: {
          products: recommendations,
          explanation: explanation,
          userProfile: {
            personality: personality,
            sentiment: sentiment,
            artworkTheme: selectedArtworkThemeData?.value,
            productType: selectedProductTypeData?.value,
            matchConfidence: calculateMatchConfidence(recommendations, personality),
            styleInsights: generateStyleInsights(personality, sentiment),
            personalizedAdvice: generatePersonalizedAdvice(personality, sentiment)
          }
        }
      });
    } catch (error) {
      console.error('Error getting recommendations:', error);
      setLoading(false);

      // Show error message instead of fallback recommendations
      alert('Sorry, we are unable to generate recommendations at the moment. Please try again later.');
    }
  };

  const resetFlow = () => {
    setCurrentStep(1);
    setSelectedDestination('');
    setSelectedBagType('');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-palo-background flex flex-col items-center justify-center">
        <LoadingSpinner />
        <div className="text-center mt-4">
          <p className="text-sm text-muted-foreground">Our AI is analyzing your preferences...</p>
          <p className="text-xs text-muted-foreground mt-2">Finding the perfect products for your style</p>
        </div>
      </div>
    );
  }

  // Render question options
  const renderArtworkThemeOptions = () => {
    return getArtworkThemeOptions().map((option, index) => (
      <button
        key={option.id}
        onClick={() => handleArtworkThemeSelect(option.id)}
        className="w-full p-4 md:p-6 mb-3 md:mb-4 text-left bg-card border-2 border-border rounded-xl hover:bg-accent hover:border-palo-primary transition-all duration-300 font-body transform hover:scale-105 hover:shadow-lg animate-fade-in group relative overflow-hidden"
        style={{ animationDelay: `${index * 0.1}s` }}
      >
        {/* Animated background on hover */}
        <div className="absolute inset-0 bg-gradient-to-r from-palo-accent/5 to-palo-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Floating particles */}
        <div className="absolute top-2 right-2 w-2 h-2 bg-palo-accent rounded-full opacity-0 group-hover:opacity-60 animate-ping" />
        <div className="absolute bottom-2 right-2 w-1.5 h-1.5 bg-palo-secondary rounded-full opacity-0 group-hover:opacity-60 animate-ping" style={{ animationDelay: '0.5s' }} />

        <div className="relative z-10">
          <h3 className="font-semibold text-base md:text-lg text-foreground group-hover:text-palo-primary transition-colors duration-300 leading-tight">
            {option.label}
          </h3>
          <p className="text-sm text-muted-foreground mt-2">→ {option.value}</p>
        </div>
      </button>
    ));
  };

  const renderProductTypeOptions = () => {
    return getProductTypeOptions().map((option, index) => (
      <button
        key={option.id}
        onClick={() => handleProductTypeSelect(option.id)}
        className="w-full p-4 md:p-6 mb-3 md:mb-4 text-left bg-card border-2 border-border rounded-xl hover:bg-accent hover:border-palo-primary transition-all duration-300 font-body transform hover:scale-105 hover:shadow-lg animate-fade-in group relative overflow-hidden"
        style={{ animationDelay: `${index * 0.1}s` }}
      >
        {/* Animated background on hover */}
        <div className="absolute inset-0 bg-gradient-to-r from-palo-accent/5 to-palo-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Floating particles */}
        <div className="absolute top-2 right-2 w-2 h-2 bg-palo-accent rounded-full opacity-0 group-hover:opacity-60 animate-ping" />
        <div className="absolute bottom-2 right-2 w-1.5 h-1.5 bg-palo-secondary rounded-full opacity-0 group-hover:opacity-60 animate-ping" style={{ animationDelay: '0.5s' }} />

        <div className="relative z-10">
          <h3 className="font-semibold text-base md:text-lg text-foreground group-hover:text-palo-primary transition-colors duration-300 leading-tight">
            {option.label}
          </h3>
          <p className="text-sm text-muted-foreground mt-2">→ {option.value}</p>
        </div>
      </button>
    ));
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-palo-background to-background p-4 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-10 left-5 w-48 h-48 bg-palo-accent/8 rounded-full blur-2xl animate-pulse" />
        <div className="absolute bottom-10 right-5 w-64 h-64 bg-palo-secondary/8 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/3 w-24 h-24 bg-palo-primary/6 rounded-xl animate-bounce" style={{ animationDelay: '0.5s' }} />
      </div>

      <Card className="w-full max-w-2xl mx-4 border-2 border-border shadow-xl relative z-10 animate-fade-in">
        {/* Floating decorative elements on card */}
        <div className="absolute -top-4 -left-4 w-12 h-12 bg-gradient-to-r from-palo-accent to-palo-secondary rounded-full opacity-30 animate-float" />
        <div className="absolute -bottom-4 -right-4 w-16 h-16 bg-gradient-to-r from-palo-secondary to-palo-accent rounded-full opacity-30 animate-float" style={{ animationDelay: '1s' }} />

        <CardHeader className="text-center p-6 md:p-8">
          <h3 className="font-heading text-xl md:text-2xl font-bold text-palo-primary mb-4 animate-fade-in">
            Artwork Selection
          </h3>
          <div className="mb-4">
            <div className="w-full bg-gray-200 rounded-full h-2 md:h-3 overflow-hidden">
              <div
                className="bg-gradient-to-r from-palo-accent to-palo-secondary h-2 md:h-3 rounded-full transition-all duration-700 ease-out animate-pulse"
                style={{ width: `${(currentStep / 2) * 100}%` }}
              />
            </div>
            <p className="text-xs md:text-sm text-muted-foreground mt-2 animate-fade-in">
              Step {currentStep} of 2 • {Math.round((currentStep / 2) * 100)}% Complete
            </p>
          </div>
        </CardHeader>

        <CardContent className="p-6 md:p-8">
          <h2 className="font-heading text-lg md:text-2xl font-bold text-center mb-6 md:mb-8 text-palo-primary animate-fade-in">
            {currentStep === 1 && 'Pick the artwork theme'}
            {currentStep === 2 && 'Select the product type'}
          </h2>

          <p className="font-body text-muted-foreground text-base md:text-lg text-center mb-6 animate-fade-in">
            {currentStep === 1 && `Based on your ${personality} personality, which artwork theme resonates with you?`}
            {currentStep === 2 && 'What type of product would be your perfect companion?'}
          </p>

          <div className="space-y-3 md:space-y-4">
            {currentStep === 1 && renderArtworkThemeOptions()}
            {currentStep === 2 && renderProductTypeOptions()}
          </div>
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between mt-8 w-full max-w-2xl mx-4">
        <Button
          onClick={() => {
            if (currentStep > 1) {
              setCurrentStep(currentStep - 1);
              if (currentStep === 2) setSelectedBagType('');
            }
          }}
          variant="outline"
          disabled={currentStep === 1}
          className="border-2 border-border text-foreground hover:bg-accent px-6 py-2 font-body"
        >
          ← Back
        </Button>
        <Button
          onClick={() => navigate('/personality-quiz')}
          variant="outline"
          className="border-2 border-border text-foreground hover:bg-accent px-6 py-2 font-body"
        >
          Cancel
        </Button>
      </div>
    </div>
  );
};

export default ArtworkSelectionFlow;
