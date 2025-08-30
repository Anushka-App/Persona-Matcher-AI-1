import { useState } from "react";
import QuizSelector from "./QuizSelector";
import PersonalityQuiz from "./PersonalityQuiz";
import OccasionQuiz from "./OccasionQuiz";
import ProductCarousel from "./ProductCarousel";
import PersonalityReportPopup from "./PersonalityReportPopup";
import { Product } from "@/types/product";

export type QuizPath = "personality" | "occasion" | null;

const StyleAdvisor = () => {
  const [selectedPath, setSelectedPath] = useState<QuizPath>(null);
  const [recommendations, setRecommendations] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showPersonalityReport, setShowPersonalityReport] = useState(false);
  const [personalityData, setPersonalityData] = useState<{
    personality: string;
    sentiment: string;
    explanation: string;
    markdownReport?: string;
  } | null>(null);

  const handlePathSelect = (path: QuizPath) => {
    setSelectedPath(path);
    setRecommendations([]);
  };

  const handleRecommendations = (products: Product[], personalityData?: {
    personality: string;
    sentiment: string;
    explanation: string;
    markdownReport?: string;
  }) => {
    setRecommendations(products);
    if (personalityData) {
      setPersonalityData(personalityData);
      setShowPersonalityReport(true);
    }
  };

  const handleBack = () => {
    setSelectedPath(null);
    setRecommendations([]);
    setShowPersonalityReport(false);
    setPersonalityData(null);
  };

  const setLoadingState = (loading: boolean) => {
    setIsLoading(loading);
  };

  if (recommendations.length > 0) {
    return (
      <>
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="font-heading text-3xl font-bold text-foreground mb-2">
              Recommended bags based on personality.
            </h2>
            <p className="font-body text-muted-foreground">
              Curated just for you by our AI stylist
            </p>
          </div>
          <ProductCarousel products={recommendations} />
          <div className="text-center">
            <button
              onClick={handleBack}
              className="font-body px-6 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80 transition-colors"
            >
              Start New Search
            </button>
          </div>
        </div>

        {/* Personality Report Popup */}
        {showPersonalityReport && personalityData && (
          <PersonalityReportPopup
            personality={personalityData.personality}
            sentiment={personalityData.sentiment}
            explanation={personalityData.explanation}
            markdownReport={personalityData.markdownReport}
            recommendations={recommendations}
            onClose={() => setShowPersonalityReport(false)}
            isVisible={showPersonalityReport}
          />
        )}
      </>
    );
  }

  if (selectedPath === "personality") {
    return (
      <PersonalityQuiz
        onBack={handleBack}
        onRecommendations={handleRecommendations}
        setLoading={setLoadingState}
        isLoading={isLoading}
      />
    );
  }

  if (selectedPath === "occasion") {
    return (
      <OccasionQuiz
        onBack={handleBack}
        onRecommendations={handleRecommendations}
        setLoading={setLoadingState}
        isLoading={isLoading}
      />
    );
  }

  return <QuizSelector onSelectPath={handlePathSelect} />;
};

export default StyleAdvisor;