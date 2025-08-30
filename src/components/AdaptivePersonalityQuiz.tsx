import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import PersonalityOnlyReportPopup from "./PersonalityOnlyReportPopup";
import { useNavigate } from 'react-router-dom';
import SharedHeader from './SharedHeader';

// Extend Window interface for quiz engine
declare global {
  interface Window {
    AdaptiveQuizEngine?: new (data: unknown) => AdaptiveQuizEngine;
    __loadingQuizEngine?: boolean;
  }
}

type GraphOption = { text: string; next: string };
type GraphNode = {
  question: string;
  options: GraphOption[];
};

type QuizGraphData = {
  graph: {
    root: string;
    nodes: Record<string, GraphNode>;
  };
};

type EngineReport = {
  personalityType: string;
  dominantTraits: string[];
  allScores: Record<string, number>;
  quizJourney: Array<{ questionNumber: number; question: string; selectedOption: string }>;
};

interface AdaptiveQuizEngine {
  getNextQuestion(currentNodeId: string, optionIndex: number): string | null;
  getPersonalityReport(): EngineReport;
}

interface QuizReportState {
  personalityType: string;
  dominantTraits: string[];
  allScores: Record<string, number>;
  quizJourney: Array<{ questionNumber: number; question: string; selectedOption: string }>;
  markdownReport?: string;
}

const SimpleLogoLoader: React.FC<{ message?: string }> = ({ message }) => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <img src="/logo.png" alt="Logo" className="w-24 h-24 animate-pulse" />
      <p className="mt-4 text-muted-foreground text-sm md:text-base">
        {message || 'Finding your personality...'}
      </p>
      <div className="mt-3 flex space-x-1">
        <span className="w-2 h-2 bg-primary rounded-full animate-bounce" />
        <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
        <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
      </div>
    </div>
  );
};

const AdaptivePersonalityQuiz: React.FC = () => {
  const navigate = useNavigate();
  const engineRef = useRef<AdaptiveQuizEngine | null>(null);
  const [quizGraph, setQuizGraph] = useState<QuizGraphData | null>(null);
  const [currentNodeId, setCurrentNodeId] = useState<string>('root');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [report, setReport] = useState<QuizReportState | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [showPopup, setShowPopup] = useState(false);

  const nodes: Record<string, GraphNode> = useMemo(() => {
    return quizGraph?.graph?.nodes || {};
  }, [quizGraph]);

  useEffect(() => {
    const loadQuizData = async () => {
      try {
        // Check if script is already loaded or loading
        if (window.AdaptiveQuizEngine) {
          await loadQuizGraphData();
          return;
        }

        // Check if script is currently being loaded
        if (window.__loadingQuizEngine) {
          // Wait for the script to finish loading
          const checkInterval = setInterval(() => {
            if (window.AdaptiveQuizEngine) {
              clearInterval(checkInterval);
              loadQuizGraphData();
            }
          }, 100);
          return;
        }

        // Mark that we're loading the script
        window.__loadingQuizEngine = true;

        // Load the quiz engine script only if not already loaded
        const script = document.createElement('script');
        script.src = '/adaptive-quiz-engine.js';
        script.onload = async () => {
          window.__loadingQuizEngine = false;
          await loadQuizGraphData();
        };
        script.onerror = () => {
          window.__loadingQuizEngine = false;
          console.error('Failed to load quiz engine');
          setIsInitializing(false);
        };
        document.head.appendChild(script);
      } catch (error) {
        window.__loadingQuizEngine = false;
        console.error('Failed to load quiz data:', error);
        setIsInitializing(false);
      }
    };

    const loadQuizGraphData = async () => {
      try {
        // Load the quiz graph data
        const response = await fetch('/adaptive_personality_only_GRAPH.json');
        const data = (await response.json()) as QuizGraphData;
        setQuizGraph(data);
        
        // Initialize the engine
        if (window.AdaptiveQuizEngine) {
          engineRef.current = new window.AdaptiveQuizEngine(data);
          setCurrentNodeId(data.graph.root);
        }
        setIsInitializing(false);
      } catch (error) {
        console.error('Failed to load quiz graph data:', error);
        setIsInitializing(false);
      }
    };

    loadQuizData();
  }, []);

  const handleSelect = async (optionIndex: number) => {
    if (!engineRef.current) return;
    const next = engineRef.current.getNextQuestion(currentNodeId, optionIndex);
    const nextId: string = next || 'END';
    if (nextId === 'END') {
      setIsSubmitting(true);
      // Minimal logo-only loading
      setIsLoading(true);
      // Build base report from engine
      const base = engineRef.current.getPersonalityReport();
      try {
        // Since the backend doesn't have this endpoint, we'll use fallback content
        const markdownReport = '';
        const growthTipsMarkdown: string | undefined = undefined;
        const visualSummary: Array<{ trait: string; intensity: number }> | undefined = undefined;
        // Small delay so animation is visible
        await new Promise(r => setTimeout(r, 1500));
        setReport({
          personalityType: base.personalityType,
          dominantTraits: base.dominantTraits,
          allScores: base.allScores,
          quizJourney: base.quizJourney,
          markdownReport
        });
        // Navigate to report page with the collected data
        navigate('/personality-report', {
          state: {
            personalityType: base.personalityType,
            dominantTraits: base.dominantTraits,
            scores: base.allScores,
            quizJourney: base.quizJourney,
            markdownReport
          }
        });
      } catch (e) {
        // Even if backend fails, show base report
        await new Promise(r => setTimeout(r, 800));
        setReport({
          personalityType: base.personalityType,
          dominantTraits: base.dominantTraits,
          allScores: base.allScores,
          quizJourney: base.quizJourney
        });
        navigate('/personality-report', {
          state: {
            personalityType: base.personalityType,
            dominantTraits: base.dominantTraits,
            scores: base.allScores,
            quizJourney: base.quizJourney
          }
        });
      } finally {
        setIsLoading(false);
        setIsSubmitting(false);
      }
    } else {
      setCurrentNodeId(nextId);
    }
  };

  if (isLoading) {
    return <SimpleLogoLoader message="Finding your best-fit personality..." />;
  }

  if (isInitializing) {
    return <SimpleLogoLoader message="Loading quiz..." />;
  }

  const node = nodes[currentNodeId];
  if (!node) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Quiz not available</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Please refresh to restart.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Derive step info for display like the prototype (Question X of Y)
  const getCurrentStepNumber = (): number => {
    if (!currentNodeId) return 1;
    if (currentNodeId === 'Q1') return 1;
    if (currentNodeId.startsWith('Q2')) return 2;
    if (currentNodeId.startsWith('Q3')) return 3;
    if (currentNodeId === 'Q4') return 4;
    if (currentNodeId === 'Q5') return 5;
    if (currentNodeId === 'Q6') return 6;
    return 1;
  };

  const totalSteps = 6; // Based on the adaptive graph (Q1..Q6)

  return (
    <div className="min-h-screen bg-palo-background">
      <SharedHeader />

      {/* Hero banner with woman and tablet */}
      <div className="w-full relative overflow-hidden bg-gradient-to-r from-purple-800 via-purple-600 to-purple-400">
        {/* Adaptive Hero Image - Using viewport units for better scaling */}
        <div className="relative w-full h-[40vh] min-h-[300px] max-h-[600px] sm:h-[45vh] md:h-[50vh] lg:h-[55vh] xl:h-[60vh] 2xl:h-[65vh] overflow-hidden">
          <img 
            src="/hero-woman-tablet copy.jpg"
            alt="Young woman using tablet and stylus"
            className="w-full h-full object-cover object-center sm:object-center md:object-center lg:object-center xl:object-center 2xl:object-center"
            style={{ 
              objectPosition: 'left 30%',
              clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 100%)'
            }}
            loading="eager"
          />
          {/* Adaptive gradient overlay to enhance purple tones */}
          <div className="absolute inset-0 bg-gradient-to-r from-purple-900/40 via-purple-700/30 to-purple-500/20 sm:from-purple-900/45 sm:via-purple-700/35 sm:to-purple-500/25 md:from-purple-900/50 md:via-purple-700/40 md:to-purple-500/30 lg:from-purple-900/55 lg:via-purple-700/45 lg:to-purple-500/35 xl:from-purple-900/60 xl:via-purple-700/50 xl:to-purple-500/40 2xl:from-purple-900/65 2xl:via-purple-700/55 2xl:to-purple-500/45"></div>
        </div>
        

        
        {/* Responsive text overlay in bottom right corner */}
        <div className="absolute bottom-4 right-4 sm:bottom-6 sm:right-6 md:bottom-8 md:right-8 lg:bottom-10 lg:right-10 xl:bottom-12 xl:right-12 z-20">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl sm:rounded-2xl px-4 py-3 sm:px-6 sm:py-4 md:px-8 md:py-5 lg:px-10 lg:py-6 border border-white/20">
            <div className="text-white text-left">
              <div className="text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl font-serif font-medium leading-tight">
                Your Personality in just
              </div>
              <div className="text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl 2xl:text-5xl font-serif font-bold leading-tight text-purple-200">
                90 sec
              </div>
            </div>
          </div>
        </div>
        
        {/* Responsive decorative purple elements */}
        <div className="absolute top-16 left-8 sm:top-20 sm:left-10 md:top-24 md:left-12 lg:top-28 lg:left-16 xl:top-32 xl:left-20 w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 lg:w-36 lg:h-36 xl:w-40 xl:h-40 border-2 border-purple-300/30 rounded-full transform rotate-45"></div>
        <div className="absolute bottom-16 left-16 sm:bottom-20 sm:left-20 md:bottom-24 md:left-24 lg:bottom-28 lg:left-28 xl:bottom-32 xl:left-32 w-20 h-20 sm:w-22 sm:h-22 md:w-24 md:h-24 lg:w-28 lg:h-28 xl:w-32 xl:h-32 border-2 border-purple-300/30 rounded-full"></div>
        <div className="absolute top-32 right-16 sm:top-40 sm:right-20 md:top-48 md:right-24 lg:top-56 lg:right-28 xl:top-64 xl:right-32 w-16 h-16 sm:w-18 sm:h-18 md:w-20 md:h-20 lg:w-24 lg:h-24 xl:w-28 xl:h-28 border-2 border-purple-300/30 rounded-full transform -rotate-12"></div>
      </div>

      <div className="container mx-auto px-4 py-10">
        {/* Page Title */}
        <h1 className="text-center text-3xl md:text-4xl font-heading font-bold text-[#4B0D6A] mb-6">
          Personality Quiz
        </h1>

        <div className="max-w-3xl mx-auto">
          <div className="rounded-2xl border border-border bg-card shadow-sm">
            <div className="px-6 md:px-8 pt-6 md:pt-8 text-center">
              <p className="text-xs md:text-sm text-muted-foreground">Question {getCurrentStepNumber()} of {totalSteps}</p>
            </div>
            <div className="px-6 md:px-8 pb-2 text-center">
              <h2 className="font-heading text-xl md:text-2xl text-foreground font-semibold">
                {node.question}
              </h2>
            </div>

            <div className="px-6 md:px-8 pb-6 md:pb-8 space-y-3 md:space-y-4">
              {node.options.map((opt, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSelect(idx)}
                  disabled={isSubmitting}
                  className="w-full text-left px-4 md:px-5 py-3 md:py-4 rounded-lg border-2 border-[#E6E0EA] bg-white hover:border-[#C9B7D1] focus:outline-none focus:ring-2 focus:ring-[#D6C4E0] transition disabled:opacity-50"
                >
                  <span className="text-sm md:text-base text-foreground">{opt.text}</span>
                </button>
              ))}
            </div>

            {/* Bottom actions to visually match prototype (disabled to keep behavior unchanged) */}
            <div className="px-6 md:px-8 pb-6 md:pb-8 flex items-center justify-between">
              <button
                type="button"
                className="px-5 py-2 rounded-full border border-[#E6E0EA] text-[#4B0D6A] bg-white disabled:opacity-60"
                disabled
              >
                Previous
              </button>
              <button
                type="button"
                className="px-6 py-2 rounded-full bg-[#E9DFF1] text-[#A28AB5] cursor-not-allowed"
                disabled
              >
                Next
              </button>
            </div>
          </div>

          {/* Optional restart aligned with existing behavior */}
          <div className="text-center mt-6">
            <Button variant="outline" onClick={() => window.location.reload()} disabled={isSubmitting}>
              Restart
            </Button>
          </div>
        </div>
      </div>

      {/* Report now shown as a dedicated page via navigation */}
    </div>
  );
};

export default AdaptivePersonalityQuiz;


