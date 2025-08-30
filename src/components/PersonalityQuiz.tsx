import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import LoadingSpinner from "./LoadingSpinner";
import ProductCarousel from "./ProductCarousel";
import PersonalityReportPopup from "./PersonalityReportPopup";
import AnuschkaCirclePopup from "./AnuschkaCirclePopup";
import { Product } from "@/types/product";
import personalityQuiz, { additionalQuestions } from "@/data/personalityQuizTree";
import { createPersonalityAnalyzer, QuizAnswer } from "@/lib/personalityAnalysis";

interface QuizNode {
  question: string;
  options: {
    answer: string;
    next_question?: QuizNode;
    result?: string;
    weights?: Record<string, number>;
  }[];
}

interface UserSession {
  sessionId: string;
  askedQuestions: string[];
  answers: string[];
}

interface QuizState {
  sessionId: string | null;
  currentQuestion: QuizNode | null;
  answers: QuizAnswer[];
  loading: boolean;
  error: string | null;
  recommendations: Product[];
  personalityData: {
    personality: string;
    sentiment: string;
    explanation: string;
    // Advanced data for comprehensive report
    markdownReport?: string;
    confidenceScore?: number;
    stylePreferences?: string[];
    lifestyleInsights?: string;
    totalQuestionsAnswered?: number;
    sessionDuration?: number;
    artworkInsights?: Record<string, unknown>;
    bagPersonality?: string;
    // Dynamic analysis data
    scores?: {
      raw: Record<string, number>;
      normalized: Record<string, number>;
      levels: Record<string, 'Low' | 'Moderate' | 'High'>;
    };
    dominantTraits?: string[];
    insights?: string[];
    recommendations?: string[];
  } | null;
  showPersonalityReport: boolean;
  showAnuschkaPopup: boolean;
  questionPath: QuizNode[]; // Track the path through the tree
  personalityAnalyzer: ReturnType<typeof createPersonalityAnalyzer>;
}

interface PersonalityQuizProps {
  onBack?: () => void;
  onRecommendations?: (products: Product[], personalityData?: Record<string, unknown>) => void;
  setLoading?: (loading: boolean) => void;
  isLoading?: boolean;
}

const PersonalityQuiz: React.FC<PersonalityQuizProps> = () => {
  const [state, setState] = useState<QuizState>({
    sessionId: null,
    currentQuestion: null,
    answers: [],
    loading: false,
    error: null,
    recommendations: [],
    personalityData: null,
    showPersonalityReport: false,
    showAnuschkaPopup: false,
    questionPath: [],
    personalityAnalyzer: createPersonalityAnalyzer()
  });

  const navigate = useNavigate();

  // Generate a unique session ID
  const generateSessionId = () => {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  };

  // Start quiz with the first question from the tree
  const startQuiz = () => {
    const sessionId = generateSessionId();
    setState(prev => ({
      ...prev,
      sessionId,
      currentQuestion: personalityQuiz,
      questionPath: [personalityQuiz],
      loading: false
    }));
  };

  // Handle answer selection and navigate through the tree
  const handleAnswer = async (selectedAnswer: string) => {
    if (!state.currentQuestion) return;

    // Find the selected option
    const selectedOption = state.currentQuestion.options.find(option => option.answer === selectedAnswer);

    if (!selectedOption) {
      throw new Error('Invalid answer selected');
    }

    // Add answer to personality analyzer
    const answerData: QuizAnswer = {
      question: state.currentQuestion.question,
      answer: selectedAnswer,
      weights: selectedOption.weights
    };

    state.personalityAnalyzer.addAnswer(answerData.question, answerData.answer, answerData.weights);

    setState(prev => ({
      ...prev,
      loading: true,
      error: null,
      answers: [...prev.answers, answerData]
    }));

    try {
      // Check if this leads to a result (end of tree)
      if (selectedOption.result) {
        // Quiz completed - generate results
        await generateResults(selectedOption.result, [...state.answers, answerData]);
      } else if (selectedOption.next_question) {
        // Continue to next question
        setState(prev => ({
          ...prev,
          currentQuestion: selectedOption.next_question,
          questionPath: [...prev.questionPath, selectedOption.next_question],
          loading: false
        }));
      } else {
        throw new Error('Invalid quiz structure');
      }
    } catch (error) {
      console.error('Error handling answer:', error);
      setState(prev => ({
        ...prev,
        error: 'Failed to process answer',
        loading: false
      }));
    }
  };

  // Generate results based on the final personality result
  const generateResults = async (personalityResult: string, allAnswers: QuizAnswer[]) => {
    try {
      // Get dynamic personality analysis
      const analysis = state.personalityAnalyzer.getFullAnalysis();

      // Extract personality traits from the result string
      const personalityMatch = personalityResult.match(/\((.*?)\)/);
      const personalityTraits = personalityMatch ? personalityMatch[1] : personalityResult;

      // Store personality data and navigate to artwork selection flow
      const personalityData = {
        personality: analysis.personalityType || personalityResult.split(' (')[0] || 'Unique',
        sentiment: personalityTraits || 'Balanced',
        scores: analysis.scores,
        dominantTraits: analysis.dominantTraits,
        insights: analysis.insights,
        quizAnswers: allAnswers
      };

      // Store in localStorage for the artwork selection flow
      localStorage.setItem('personalityData', JSON.stringify(personalityData));

      // Navigate to artwork selection flow instead of calling recommendations directly
      navigate('/artwork-selection', {
        state: {
          personality: personalityData.personality,
          sentiment: personalityData.sentiment,
          scores: personalityData.scores,
          dominantTraits: personalityData.dominantTraits,
          insights: personalityData.insights,
          quizAnswers: personalityData.quizAnswers
        }
      });

    } catch (error) {
      console.error('Error generating results:', error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: 'Sorry, we are unable to generate your personality analysis at the moment. Please try again later.'
      }));
    }
  };

  // Render question options
  const renderOptions = () => {
    if (!state.currentQuestion) return null;

    return state.currentQuestion.options.map((option, index) => (
      <button
        key={index}
        onClick={() => handleAnswer(option.answer)}
        disabled={state.loading}
        className="w-full p-4 md:p-6 mb-3 md:mb-4 text-left bg-card border-2 border-border rounded-xl hover:bg-accent hover:border-palo-primary transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed font-body transform hover:scale-105 hover:shadow-lg animate-fade-in group relative overflow-hidden"
        style={{ animationDelay: `${index * 0.1}s` }}
      >
        {/* Animated background on hover */}
        <div className="absolute inset-0 bg-gradient-to-r from-palo-accent/5 to-palo-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Floating particles */}
        <div className="absolute top-2 right-2 w-2 h-2 bg-palo-accent rounded-full opacity-0 group-hover:opacity-60 animate-ping" />
        <div className="absolute bottom-2 right-2 w-1.5 h-1.5 bg-palo-secondary rounded-full opacity-0 group-hover:opacity-60 animate-ping" style={{ animationDelay: '0.5s' }} />

        <span className="text-base md:text-lg font-medium text-foreground relative z-10 group-hover:text-palo-primary transition-colors duration-300">
          {option.answer}
        </span>
      </button>
    ));
  };

  // Calculate progress based on tree depth
  const calculateProgress = () => {
    if (!state.questionPath.length) return 0;
    // Each level in the tree represents progress
    const maxDepth = 3; // Root + 2 levels of questions
    return Math.min((state.questionPath.length / maxDepth) * 100, 100);
  };

  // Get current question number
  const getCurrentQuestionNumber = () => {
    return state.questionPath.length;
  };

  // Get total questions (approximate based on tree structure)
  const getTotalQuestions = () => {
    return 3; // Root + 2 levels of questions
  };

  // Render different states
  if (state.loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <LoadingSpinner />
        <div className="text-center mt-4">
          <p className="text-sm text-muted-foreground">Debug: Loading state is active</p>
          <p className="text-xs text-muted-foreground mt-2">Our stylist is analyzing your style...</p>
        </div>
      </div>
    );
  }

  if (state.error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-palo-background to-background p-4">
        <Card className="w-full max-w-md mx-4 border-2 border-border shadow-xl">
          <CardContent className="p-6 md:p-8 text-center">
            <div className="text-red-600 mb-4 text-4xl md:text-6xl">⚠️</div>
            <h2 className="font-heading text-lg md:text-xl font-bold mb-3 md:mb-4 text-foreground">Oops! Something went wrong</h2>
            <p className="font-body text-muted-foreground mb-4 md:mb-6 text-sm md:text-base">{state.error}</p>
            <Button
              onClick={startQuiz}
              className="bg-palo-primary hover:bg-palo-accent text-white px-6 py-3 rounded-lg w-full md:w-auto font-body"
            >
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show personality report popup first, then recommendations
  if (state.recommendations.length > 0) {
    console.log("🎯 PersonalityQuiz - We have recommendations!", {
      recommendationsCount: state.recommendations.length,
      showPersonalityReport: state.showPersonalityReport,
      personalityData: state.personalityData
    });

    return (
      <>
        {/* Personality Report Popup - Show this first */}
        {state.showPersonalityReport && state.personalityData && (
          <>
            {console.log("🎨 PersonalityQuiz - About to render PersonalityReportPopup!")}
            <PersonalityReportPopup
              personality={state.personalityData.personality}
              sentiment={state.personalityData.sentiment}
              explanation={state.personalityData.explanation}
              recommendations={state.recommendations}
              onClose={() => setState(prev => ({ ...prev, showPersonalityReport: false }))}
              isVisible={state.showPersonalityReport}
              confidenceScore={state.personalityData.confidenceScore}
              stylePreferences={state.personalityData.stylePreferences}
              lifestyleInsights={state.personalityData.lifestyleInsights}
              totalQuestionsAnswered={state.personalityData.totalQuestionsAnswered}
              sessionDuration={state.personalityData.sessionDuration}
              artworkInsights={state.personalityData.artworkInsights}
              markdownReport={state.personalityData.markdownReport}
              bagPersonality={state.personalityData.bagPersonality}
              // Dynamic analysis data
              personalityScores={state.personalityData.scores ? Object.entries(state.personalityData.scores.normalized || {}).map(([trait, score]) => ({
                trait,
                score: typeof score === 'number' ? score : 0,
                description: `Your ${trait.toLowerCase()} score indicates ${state.personalityData.scores?.levels?.[trait] || 'moderate'} levels in this trait.`,
                level: (state.personalityData.scores?.levels?.[trait] as 'Low' | 'Moderate' | 'High') || 'Moderate'
              })) : undefined}
              insights={state.personalityData.insights}
              personalityRecommendations={state.personalityData.recommendations}
            />
          </>
        )}



        {/* Recommendations Page - Show after popup is closed */}
        {!state.showPersonalityReport && (
          <div className="min-h-screen bg-palo-background pt-16 md:pt-20">
            <div className="container mx-auto px-4 md:px-6 py-8 md:py-12">
              <div className="max-w-4xl mx-auto">
                <div className="text-center mb-6 md:mb-8">
                  <h2 className="font-heading text-2xl md:text-3xl font-bold text-palo-primary mb-2">
                    Recommended bags based on personality.
                  </h2>
                  <p className="font-body text-muted-foreground text-sm md:text-base">
                    Curated just for you by our AI stylist
                  </p>
                </div>
                <div className="mb-6 md:mb-8">
                  <ProductCarousel products={state.recommendations} />
                </div>
                <div className="text-center mt-6 md:mt-8">
                  <button
                    onClick={() => {
                      setState({
                        sessionId: null,
                        currentQuestion: null,
                        answers: [],
                        loading: false,
                        error: null,
                        recommendations: [],
                        personalityData: null,
                        showPersonalityReport: false,
                        showAnuschkaPopup: false,
                        questionPath: [],
                        personalityAnalyzer: createPersonalityAnalyzer()
                      });
                    }}
                    className="font-body px-6 py-3 bg-palo-secondary text-palo-secondary-foreground rounded-lg hover:bg-palo-secondary/80 transition-colors w-full md:w-auto"
                  >
                    Start New Quiz
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </>
    );
  }



  if (!state.currentQuestion) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-palo-background to-background p-4 relative overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-10 w-64 h-64 bg-palo-accent/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-palo-secondary/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
          <div className="absolute top-1/2 left-1/4 w-32 h-32 bg-palo-primary/5 rounded-full blur-2xl animate-bounce" style={{ animationDelay: '0.5s' }} />
          <div className="absolute top-1/3 right-1/4 w-48 h-48 bg-palo-accent/8 rounded-full blur-2xl animate-bounce" style={{ animationDelay: '1.5s' }} />
        </div>

        <div className="w-full max-w-2xl mx-4 text-center relative z-10">
          {/* Floating decorative elements */}
          <div className="absolute -top-8 -left-8 w-16 h-16 bg-gradient-to-r from-palo-accent to-palo-secondary rounded-full opacity-20 animate-float" />
          <div className="absolute -bottom-8 -right-8 w-20 h-20 bg-gradient-to-r from-palo-secondary to-palo-accent rounded-full opacity-20 animate-float" style={{ animationDelay: '1s' }} />

          <h1 className="font-heading text-4xl md:text-5xl font-bold text-palo-primary mb-6 leading-tight animate-fade-in">
            Your Personality. Your Perfect Match.
          </h1>
          <h5 className="font-heading text-xl md:text-2xl font-medium text-palo-primary mb-6 leading-relaxed animate-fade-in">
            In just 90 seconds, uncover your personality style and unlock the
            Anuschka collection destined for you.
          </h5>

          <p className="font-body text-lg md:text-xl text-muted-foreground mb-8 leading-relaxed text-left max-w-2xl mx-auto animate-fade-in" style={{ animationDelay: '0.3s' }}>
            From your unique character to your signature style, our Matchmaker
            reveals who you are — and the handcrafted Anuschka pieces that reflect
            your inner spirit. This is more than fashion. It’s art, matched to you.
          </p>

          <Button
            onClick={startQuiz}
            className="bg-palo-primary hover:bg-palo-accent text-white px-8 md:px-12 py-4 md:py-5 rounded-full text-lg md:text-xl font-body font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 animate-fade-in hover:animate-pulse"
            style={{ animationDelay: '0.6s' }}
          >
            Reveal My Match ✨
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-palo-background to-background p-4 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-10 left-5 w-48 h-48 bg-palo-accent/8 rounded-full blur-2xl animate-pulse" />
        <div className="absolute bottom-10 right-5 w-64 h-64 bg-palo-secondary/8 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/3 w-24 h-24 bg-palo-primary/6 rounded-full blur-xl animate-bounce" style={{ animationDelay: '0.5s' }} />
      </div>

      <Card className="w-full max-w-2xl mx-4 border-2 border-border shadow-xl relative z-10 animate-fade-in">
        {/* Floating decorative elements on card */}
        <div className="absolute -top-4 -left-4 w-12 h-12 bg-gradient-to-r from-palo-accent to-palo-secondary rounded-full opacity-30 animate-float" />
        <div className="absolute -bottom-4 -right-4 w-16 h-16 bg-gradient-to-r from-palo-secondary to-palo-accent rounded-full opacity-30 animate-float" style={{ animationDelay: '1s' }} />

        <CardHeader className="text-center p-6 md:p-8">
          <h3 className="font-heading text-xl md:text-2xl font-bold text-palo-primary mb-4 animate-fade-in">
            Personality Style Quiz
          </h3>
          <div className="mb-4">
            <div className="w-full bg-gray-200 rounded-full h-2 md:h-3 overflow-hidden">
              <div
                className="bg-gradient-to-r from-palo-accent to-palo-secondary h-2 md:h-3 rounded-full transition-all duration-700 ease-out animate-pulse"
                style={{ width: `${calculateProgress()}%` }}
              />
            </div>
            <p className="text-xs md:text-sm text-muted-foreground mt-2 animate-fade-in">
              Question {getCurrentQuestionNumber()} of {getTotalQuestions()} • {calculateProgress()}% Complete
            </p>
          </div>
        </CardHeader>

        <CardContent className="p-6 md:p-8">
          <h2 className="font-heading text-lg md:text-2xl font-bold text-center mb-6 md:mb-8 text-palo-primary animate-fade-in">
            {state.currentQuestion.question}
          </h2>

          <div className="space-y-3 md:space-y-4">
            {renderOptions()}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PersonalityQuiz;