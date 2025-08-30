import React from 'react';
import { Button } from "@/components/ui/button";
import { X, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface JourneyItem {
  questionNumber: number;
  question: string;
  selectedOption: string;
}

interface Props {
  isVisible: boolean;
  onClose: () => void;
  personalityType: string;
  dominantTraits: string[];
  scores: Record<string, number>;
  quizJourney: JourneyItem[];
  markdownReport?: string;
  // Dynamic analysis data
  personalityScores?: Array<{
    trait: string;
    score: number;
    description: string;
    level: 'Low' | 'Moderate' | 'High';
  }>;
  insights?: string[];
  recommendations?: string[];
}

const PersonalityOnlyReportPopup: React.FC<Props> = ({
  isVisible,
  onClose,
  personalityType,
  dominantTraits,
  scores,
  quizJourney,
  markdownReport,
  personalityScores,
  insights,
  recommendations
}) => {
  const navigate = useNavigate();

  if (!isVisible) return null;

  const handleViewMatches = () => {
    navigate('/artwork-selection');
    onClose();
  };

  const handleClose = () => {
    onClose();
  };

  // Parse the markdown report to extract sections
  const parseMarkdownReport = (markdown: string) => {
    const sections: { [key: string]: string } = {};
    
    if (!markdown) return sections;

    const lines = markdown.split('\n');
    let currentSection = '';
    let currentContent = '';

    for (const line of lines) {
      if (line.startsWith('## ')) {
        if (currentSection && currentContent) {
          sections[currentSection] = currentContent.trim();
        }
        currentSection = line.replace('## ', '').trim();
        currentContent = '';
      } else if (line.startsWith('### ')) {
        if (currentSection && currentContent) {
          sections[currentSection] = currentContent.trim();
        }
        currentSection = line.replace('### ', '').trim();
        currentContent = '';
      } else if (line.trim() && currentSection) {
        currentContent += line + '\n';
      }
    }

    if (currentSection && currentContent) {
      sections[currentSection] = currentContent.trim();
    }

    return sections;
  };

  const reportSections = parseMarkdownReport(markdownReport || '');

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Dim background */}
      <div className="absolute inset-0 bg-black/50" onClick={handleClose} />

      {/* Centered container mimicking full page within popup */}
      <div className="relative z-10 min-h-screen">
        {/* Hero band */}
        <div className="w-full bg-muted/40">
          <div className="container mx-auto px-4">
            <div className="h-56 md:h-64 w-full flex items-center justify-center">
              <div className="w-10/12 md:w-8/12 h-40 md:h-48 bg-muted rounded-md flex items-center justify-center">
                <div className="w-24 h-24 bg-muted-foreground/20 rounded-full mb-4" />
              </div>
            </div>
          </div>
        </div>

        {/* Content card */}
        <div className="container mx-auto px-4 py-8">
          <div className="relative max-w-5xl mx-auto bg-white rounded-2xl shadow-md border border-[#EFE7F4] p-6 md:p-10">
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 text-[#2B1B44] hover:text-[#1A0F2E]"
              aria-label="Close"
            >
              <X className="h-6 w-6" />
            </button>

            {/* Title */}
            <div className="text-center mb-6">
              <h1 className="text-3xl md:text-4xl font-heading font-bold text-[#4B0D6A]">
                Your Personality Report
              </h1>
              <p className="mt-2 text-[#4B0D6A]">{personalityType}</p>
            </div>

            {/* Overview */}
            <div className="mb-8">
              <h2 className="text-xl font-heading font-semibold text-[#2B1B44] mb-2">Personality Overview</h2>
              <p className="text-[#4A4A4A] leading-relaxed">
                {reportSections['Personality Overview & Summary'] || 
                  `You present as ${personalityType}, with cues like ${dominantTraits.slice(0, 3).join(', ')}.`}
              </p>
            </div>

            {/* Dynamic Personality Scores */}
            {personalityScores && personalityScores.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-heading font-semibold text-[#2B1B44] mb-3">Your Personality Profile</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  {personalityScores.slice(0, 6).map((score, idx) => (
                    <div key={idx} className="rounded-xl border border-[#E6E0EA] bg-[#FBFAFC] p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div className="font-semibold text-[#2B1B44]">{score.trait}</div>
                        <div className={`text-xs px-2 py-1 rounded-full ${
                          score.level === 'High' ? 'bg-green-100 text-green-700' :
                          score.level === 'Moderate' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-blue-100 text-blue-700'
                        }`}>
                          {score.level}
                        </div>
                      </div>
                      <p className="text-xs text-[#4A4A4A]">
                        {score.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Insights */}
            {insights && insights.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-heading font-semibold text-[#2B1B44] mb-3">Key Insights</h3>
                <div className="space-y-3">
                  {insights.slice(0, 3).map((insight, idx) => (
                    <div key={idx} className="flex gap-3 items-start">
                      <div className="w-2 h-2 bg-[#6A1B9A] rounded-full mt-2 flex-shrink-0" />
                      <p className="text-sm text-[#4A4A4A]">{insight}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Fallback Traits grid */}
            {(!personalityScores || personalityScores.length === 0) && (
              <div className="mb-6">
                <h3 className="text-lg font-heading font-semibold text-[#2B1B44] mb-3">Your Unique Traits</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  {dominantTraits.slice(0, 4).map((trait, idx) => (
                    <div key={idx} className="rounded-xl border border-[#E6E0EA] bg-[#FBFAFC] p-4 flex gap-3">
                      <CheckCircle2 className="text-[#6A1B9A] mt-1" />
                      <div>
                        <div className="font-semibold text-[#2B1B44]">{trait}</div>
                        <p className="text-xs text-[#4A4A4A] mt-1">
                          Shows up in daily choices—shaping how you think, decide, collaborate, and create.
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* MatchMaker CTA */}
            <div className="mt-8 text-center py-6 bg-gradient-to-r from-[#F5F4F6] to-[#F1E4F3] rounded-xl border border-[#E4B7F6]">
              <h3 className="text-xl font-bold text-[#2B1B44] mb-2">Anuschka MatchMaker</h3>
              <p className="text-[#4A4A4A] mb-4">Find the bag that matches your personality!</p>
              <Button onClick={handleViewMatches} className="bg-[#6A1B9A] hover:bg-[#5b1584] text-white px-8">
                Find Match
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PersonalityOnlyReportPopup;


