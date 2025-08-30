import { useState } from "react";
import { Button } from "@/components/ui/button";
import LoadingSpinner from "./LoadingSpinner";
import { Product } from "@/types/product";

interface OccasionQuizProps {
  onBack: () => void;
  onRecommendations: (products: Product[], personalityData?: Record<string, unknown>) => void;
  setLoading: (loading: boolean) => void;
  isLoading: boolean;
}

const OccasionQuiz = ({ onBack, onRecommendations, setLoading, isLoading }: OccasionQuizProps) => {
  const [step, setStep] = useState(1);
  const [answers, setAnswers] = useState({
    occasion: "",
    recipient: "",
    colors: [] as string[],
    bagTypes: [] as string[]
  });

  const occasions = [
    "Gift for Someone",
    "Everyday Use",
    "Office/Work",
    "Party/Event",
    "Travel/Holiday",
    "Graduation or Special Moment",
    "Romantic Date",
    "Other"
  ];

  const recipients = [
    "Myself", "Mother", "Wife", "Friend", "Unsure"
  ];

  const colorPalettes = [
    "Red", "Black", "Floral", "Pastel", "Earthy",
    "Neutral", "Vibrant", "Gold", "Abstract", "Metallic"
  ];

  const bagTypes = [
    "Crossbody", "Tote", "Clutch", "Backpack", "Hobo", "No Preference"
  ];

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const inputText = `Recommend a handbag for ${answers.occasion} for ${answers.recipient} who likes ${answers.colors.join(", ")} and prefers ${answers.bagTypes.join(", ")}.`;

      // Add a minimum loading time to ensure the animation is visible
      const startTime = Date.now();
      const minLoadingTime = 2000; // 2 seconds minimum

      const response = await fetch("/recommendations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description: inputText }),
      });

      if (!response.ok) {
        throw new Error("Failed to get recommendations");
      }

      const data = await response.json();
      
      // Ensure minimum loading time has passed
      const elapsedTime = Date.now() - startTime;
      if (elapsedTime < minLoadingTime) {
        await new Promise(resolve => setTimeout(resolve, minLoadingTime - elapsedTime));
      }
      
      onRecommendations(data.recommendations || [], {
        personality: data.userProfile?.personality || 'Classic and elegant',
        sentiment: data.userProfile?.sentiment || 'Confident and stylish',
        explanation: data.explanation || 'These handbag selections are carefully chosen to complement your occasion and style preferences.',
        markdownReport: data.markdownReport || null
      });
    } catch (error) {
      console.error("Error getting recommendations:", error);
      // Mock data for demo
      onRecommendations([
        {
          id: "1",
          name: "Professional Tote Bag",
          price: "$249",
          image: "/api/placeholder/300/300",
          link: "https://anuschkaleather.com"
        }
      ], {
        personality: 'Classic and elegant',
        sentiment: 'Confident and stylish',
        explanation: 'These handbag selections are carefully chosen to complement your occasion and style preferences.'
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleColor = (color: string) => {
    setAnswers(prev => ({
      ...prev,
      colors: prev.colors.includes(color)
        ? prev.colors.filter(c => c !== color)
        : [...prev.colors, color]
    }));
  };

  const toggleBagType = (bagType: string) => {
    setAnswers(prev => ({
      ...prev,
      bagTypes: prev.bagTypes.includes(bagType)
        ? prev.bagTypes.filter(b => b !== bagType)
        : [...prev.bagTypes, bagType]
    }));
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div className="flex items-center gap-4 mb-8">
        <Button variant="ghost" onClick={onBack}>← Back</Button>
        <div className="flex-1">
          <div className="w-full bg-muted rounded-full h-2">
            <div
              className="bg-primary h-2 rounded-full transition-all duration-300"
              style={{ width: `${(step / 4) * 100}%` }}
            />
          </div>
          <p className="text-sm text-muted-foreground mt-2">Step {step} of 4</p>
        </div>
      </div>

      {step === 1 && (
        <div className="space-y-6">
          <div className="text-center">
            <h3 className="font-heading text-2xl font-bold text-foreground mb-2">
              What's the occasion?
            </h3>
            <p className="font-body text-muted-foreground">Tell us about the purpose or event</p>
          </div>
          <div className="grid gap-3">
            {occasions.map((occasion) => (
              <button
                key={occasion}
                onClick={() => setAnswers(prev => ({ ...prev, occasion }))}
                className={`p-4 rounded-lg border-2 transition-all ${answers.occasion === occasion
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border hover:border-primary/50"
                  }`}
              >
                {occasion}
              </button>
            ))}
          </div>
          <Button
            onClick={() => setStep(2)}
            disabled={!answers.occasion}
            className="w-full"
          >
            Next →
          </Button>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-6">
          <div className="text-center">
            <h3 className="font-heading text-2xl font-bold text-foreground mb-2">
              Who is it for?
            </h3>
            <p className="font-body text-muted-foreground">Select the recipient</p>
          </div>
          <div className="grid gap-3">
            {recipients.map((recipient) => (
              <button
                key={recipient}
                onClick={() => setAnswers(prev => ({ ...prev, recipient }))}
                className={`p-4 rounded-lg border-2 transition-all ${answers.recipient === recipient
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border hover:border-primary/50"
                  }`}
              >
                {recipient}
              </button>
            ))}
          </div>
          <div className="flex gap-4">
            <Button variant="outline" onClick={() => setStep(1)} className="flex-1">
              ← Previous
            </Button>
            <Button
              onClick={() => setStep(3)}
              disabled={!answers.recipient}
              className="flex-1"
            >
              Next →
            </Button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-6">
          <div className="text-center">
            <h3 className="font-heading text-2xl font-bold text-foreground mb-2">
              Preferred Color Palettes
            </h3>
            <p className="font-body text-muted-foreground">Select all that appeal to you</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {colorPalettes.map((color) => (
              <button
                key={color}
                onClick={() => toggleColor(color)}
                className={`p-3 rounded-lg border-2 transition-all ${answers.colors.includes(color)
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border hover:border-primary/50"
                  }`}
              >
                {color}
              </button>
            ))}
          </div>
          <div className="flex gap-4">
            <Button variant="outline" onClick={() => setStep(2)} className="flex-1">
              ← Previous
            </Button>
            <Button onClick={() => setStep(4)} className="flex-1">
              Next →
            </Button>
          </div>
        </div>
      )}

      {step === 4 && (
        <div className="space-y-6">
          <div className="text-center">
            <h3 className="font-heading text-2xl font-bold text-foreground mb-2">
              Bag Type Preference
            </h3>
            <p className="font-body text-muted-foreground">Optional - select preferred styles</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {bagTypes.map((type) => (
              <button
                key={type}
                onClick={() => toggleBagType(type)}
                className={`p-3 rounded-lg border-2 transition-all ${answers.bagTypes.includes(type)
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border hover:border-primary/50"
                  }`}
              >
                {type}
              </button>
            ))}
          </div>
          <div className="flex gap-4">
            <Button variant="outline" onClick={() => setStep(3)} className="flex-1">
              ← Previous
            </Button>
            <Button onClick={handleSubmit} className="flex-1">
              Get My Recommendations ✨
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default OccasionQuiz;