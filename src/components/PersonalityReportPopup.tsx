import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { X, Star, Heart, Sparkles, Palette, TrendingUp, Users, Award } from 'lucide-react';
import { Product } from "@/types/product";


interface PersonalityReportPopupProps {
  personality: string;
  sentiment: string;
  explanation: string;
  recommendations?: Product[];
  onClose: () => void;
  isVisible: boolean;
  customNavigate?: () => void; // Add custom navigation function
  // New props for advanced analysis
  confidenceScore?: number;
  stylePreferences?: string[];
  lifestyleInsights?: string;
  totalQuestionsAnswered?: number;
  sessionDuration?: number;
  artworkInsights?: Record<string, unknown>;
  // Optional LLM markdown report and bag personality label
  markdownReport?: string;
  bagPersonality?: string;
  // Dynamic analysis data
  personalityScores?: Array<{
    trait: string;
    score: number;
    description: string;
    level: 'Low' | 'Moderate' | 'High';
  }>;
  insights?: string[];
  personalityRecommendations?: string[];
}

const PersonalityReportPopup: React.FC<PersonalityReportPopupProps> = ({
  personality,
  sentiment,
  explanation,
  recommendations,
  onClose,
  isVisible,
  confidenceScore = 85,
  stylePreferences = ['Classic', 'Versatile', 'Practical'],
  lifestyleInsights = 'You prefer functional yet stylish accessories.',
  totalQuestionsAnswered = 7,
  sessionDuration = 60000,
  artworkInsights,
  markdownReport,
  bagPersonality,
  customNavigate,
  personalityScores,
  insights,
  personalityRecommendations
}) => {
  const navigate = useNavigate();

  const [isSavingToCSV, setIsSavingToCSV] = useState(false);
  
  // Save personality report to CSV when component mounts
  useEffect(() => {
    if (isVisible && !isSavingToCSV) {
      savePersonalityReportToCSV();
    }
  }, [isVisible]);

  const savePersonalityReportToCSV = async () => {
    if (isSavingToCSV) return;
    
    setIsSavingToCSV(true);
    try {
      const reportData = {
        personality,
        sentiment,
        explanation,
        confidenceScore,
        stylePreferences,
        lifestyleInsights,
        totalQuestionsAnswered,
        sessionDuration,
        artworkInsights,
        markdownReport,
        bagPersonality,
        recommendations,
        userInfo: {
          email: localStorage.getItem('userEmail') || '',
          name: localStorage.getItem('userName') || '',
          phone: localStorage.getItem('userPhone') || '',
          session_id: localStorage.getItem('sessionId') || `session_${Date.now()}`,
          circle_member: localStorage.getItem('isCircleMember') === 'true' || false
        }
      };

      const response = await fetch('/api/personality/save-report', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(reportData),
      });

      if (response.ok) {
        const result = await response.json();
        console.log('✅ Personality report saved to CSV:', result);
        
        // Store the user cookie ID for future tracking
        if (result.userCookieId) {
          localStorage.setItem('userCookieId', result.userCookieId);
        }
      } else {
        console.error('❌ Failed to save personality report to CSV');
      }
    } catch (error) {
      console.error('❌ Error saving personality report to CSV:', error);
    } finally {
      setIsSavingToCSV(false);
    }
  };
  
  if (!isVisible) {
    return null;
  }

  // Helper function to extract personality name from markdown report
  const extractPersonalityName = (markdown: string): string | null => {
    const lines = markdown.split('\n');
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].includes('## Your Personality:')) {
        // Extract the personality name from the line
        const match = lines[i].match(/## Your Personality:\s*(.+)/);
        if (match && match[1]) {
          return match[1].trim();
        }
      }
    }
    return null;
  };

  // Helper function to extract style statement from markdown report
  const extractStyleStatement = (markdown: string): string | null => {
    const lines = markdown.split('\n');
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].includes('## Style Statement')) {
        // Find the content after the Style Statement header
        let content = '';
        for (let j = i + 1; j < lines.length; j++) {
          if (lines[j].startsWith('## ')) break; // Stop at next section
          if (lines[j].trim()) {
            content += lines[j].trim() + ' ';
          }
        }
        return content.trim() || null;
      }
    }
    return null;
  };

  // Helper function to extract style profile from markdown report
  const extractStyleProfile = (markdown: string): string | null => {
    const lines = markdown.split('\n');
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].includes('## Your Style Profile')) {
        // Find the content after the Style Profile header
        let content = '';
        for (let j = i + 1; j < lines.length; j++) {
          if (lines[j].startsWith('## ')) break; // Stop at next section
          if (lines[j].trim()) {
            content += lines[j].trim() + ' ';
          }
        }
        return content.trim() || null;
      }
    }
    return null;
  };

  // Helper function to navigate to results page
  const navigateToResults = () => {
    navigate('/personality-quiz-result', {
      state: {
        recommendations,
        personalityData: {
          personality,
          sentiment,
          explanation,
          confidenceScore,
          stylePreferences,
          lifestyleInsights,
          totalQuestionsAnswered,
          sessionDuration,
          artworkInsights
        }
      }
    });
  };

  // Helper function to create styled section cards
  const createSectionCard = (
    title: string,
    icon: React.ReactNode,
    gradient: string,
    children: React.ReactNode
  ) => (
    <Card className={`border-2 ${gradient}`}>
      <CardHeader className="p-4 md:p-6">
        <CardTitle className="flex items-center space-x-2 text-lg md:text-xl">
          {icon}
          <span>{title}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 md:p-6">
        {children}
      </CardContent>
    </Card>
  );

  const sanitizeHtml = (html: string) => {
    // Very basic sanitizer: strip script tags and on* attributes
    return html
      .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, '')
      .replace(/ on[a-z]+="[^"]*"/gi, '')
      .replace(/ on[a-z]+='[^']*'/gi, '');
  };

  const renderMarkdownToHtml = (md: string) => {
    const escapeHtml = (s: string) => s
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

    const boldified = md.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    const lines = boldified.split(/\r?\n/);
    const htmlParts: string[] = [];
    let listOpen = false;
    let inTraitBreakdown = false;
    let currentTrait = '';
    
    for (const raw of lines) {
      const line = raw.trim();
      
      if (line.startsWith('## ')) {
        if (listOpen) { htmlParts.push('</ul>'); listOpen = false; }
        const content = escapeHtml(line.slice(3));
        
        // Special styling for different sections using brand colors
        if (content.toLowerCase().includes('your personality:')) {
          htmlParts.push(`<h2 class="text-3xl font-bold text-[#2B1B44] mt-8 mb-6 bg-gradient-to-r from-[#F1E4F3] to-[#E4B7F6] p-4 rounded-xl text-center border-2 border-[#FFBF3F] shadow-lg">${content}</h2>`);
        } else if (content.toLowerCase().includes('personality overview')) {
          htmlParts.push(`<h2 class="text-2xl font-bold text-[#2B1B44] mt-8 mb-6 bg-gradient-to-r from-[#F5F4F6] to-[#F1E4F3] p-4 rounded-xl border-l-4 border-[#E4B7F6] shadow-md">${content}</h2>`);
          inTraitBreakdown = false;
        } else if (content.toLowerCase().includes('your unique traits')) {
          htmlParts.push(`<h2 class="text-2xl font-bold text-[#2B1B44] mt-8 mb-6 bg-gradient-to-r from-[#FFBF3F] to-[#F1E4F3] p-4 rounded-xl border-l-4 border-[#FFBF3F] shadow-md">${content}</h2>`);
          inTraitBreakdown = true;
        } else if (content.toLowerCase().includes('trait breakdown')) {
          htmlParts.push(`<h2 class="text-2xl font-bold text-[#2B1B44] mt-8 mb-6 bg-gradient-to-r from-[#FFBF3F] to-[#F1E4F3] p-4 rounded-xl border-l-4 border-[#FFBF3F] shadow-md">${content}</h2>`);
          inTraitBreakdown = true;
        } else if (content.toLowerCase().includes('style statement')) {
          htmlParts.push(`<h2 class="text-2xl font-bold text-[#2B1B44] mt-8 mb-6 bg-gradient-to-r from-[#E4B7F6] to-[#F1E4F3] p-4 rounded-xl border-l-4 border-[#E4B7F6] shadow-md">${content}</h2>`);
          inTraitBreakdown = false;
        } else if (content.toLowerCase().includes('style profile')) {
          htmlParts.push(`<h2 class="text-2xl font-bold text-[#2B1B44] mt-8 mb-6 bg-gradient-to-r from-[#F5F4F6] to-[#F1E4F3] p-4 rounded-xl border-l-4 border-[#E4B7F6] shadow-md">${content}</h2>`);
          inTraitBreakdown = false;
        } else if (content.toLowerCase().includes('strengths')) {
          htmlParts.push(`<h2 class="text-2xl font-bold text-[#2B1B44] mt-8 mb-6 bg-gradient-to-r from-[#FFBF3F] to-[#F1E4F3] p-4 rounded-xl border-l-4 border-[#FFBF3F] shadow-md">${content}</h2>`);
          inTraitBreakdown = false;
        } else if (content.toLowerCase().includes('challenges') || content.toLowerCase().includes('growth')) {
          htmlParts.push(`<h2 class="text-2xl font-bold text-[#2B1B44] mt-8 mb-6 bg-gradient-to-r from-[#FFBF3F] to-[#F1E4F3] p-4 rounded-xl border-l-4 border-[#FFBF3F] shadow-md">${content}</h2>`);
          inTraitBreakdown = false;
        } else if (content.toLowerCase().includes('development tips')) {
          htmlParts.push(`<h2 class="text-2xl font-bold text-[#2B1B44] mt-8 mb-6 bg-gradient-to-r from-[#F5F4F6] to-[#E4B7F6] p-4 rounded-xl border-l-4 border-[#E4B7F6] shadow-md">${content}</h2>`);
          inTraitBreakdown = false;
        } else {
          htmlParts.push(`<h2 class="text-2xl font-bold text-[#2B1B44] mt-8 mb-6 bg-gradient-to-r from-[#F1E4F3] to-[#E4B7F6] p-4 rounded-xl border-l-4 border-[#E4B7F6] shadow-md">${content}</h2>`);
        }
      } else if (line.startsWith('### ')) {
        if (listOpen) { htmlParts.push('</ul>'); listOpen = false; }
        const content = escapeHtml(line.slice(4));
        htmlParts.push(`<h3 class="text-xl font-semibold text-[#2B1B44] mt-6 mb-4 flex items-center bg-white p-3 rounded-lg shadow-sm">
          <div class="w-2 h-6 bg-gradient-to-b from-[#FFBF3F] to-[#E4B7F6] rounded-full mr-3"></div>
          ${content}
        </h3>`);
      } else if (line.startsWith('**') && line.endsWith('**') && inTraitBreakdown) {
        // Handle trait names in bold (e.g., **Elegance**)
        if (listOpen) { htmlParts.push('</ul>'); listOpen = false; }
        if (currentTrait) {
          htmlParts.push(`</div>`); // Close previous trait div
        }
        const traitName = line.slice(2, -2); // Remove ** from start and end
        currentTrait = traitName;
        htmlParts.push(`<div class="bg-gradient-to-r from-white to-[#F5F4F6] rounded-xl p-4 mb-4 shadow-md border-l-4 border-[#FFBF3F]">`);
        htmlParts.push(`<h4 class="text-lg font-semibold text-[#2B1B44] mb-2 flex items-center">`);
        htmlParts.push(`<Star className="h-5 w-5 text-[#FFBF3F] mr-2" />`);
        htmlParts.push(`${traitName}</h4>`);
      } else if (line.startsWith('- **') && inTraitBreakdown) {
        // Special handling for trait breakdown items (legacy format)
        if (listOpen) { htmlParts.push('</ul>'); listOpen = false; }
        const traitMatch = line.match(/- \*\*(.+?)\*\*: (.+)/);
        if (traitMatch) {
          const traitName = traitMatch[1];
          const traitContent = traitMatch[2];
          currentTrait = traitName;
          htmlParts.push(`<div class="bg-gradient-to-r from-white to-[#F5F4F6] rounded-xl p-4 mb-4 shadow-md border-l-4 border-[#FFBF3F]">`);
          htmlParts.push(`<h4 class="text-lg font-semibold text-[#2B1B44] mb-2 flex items-center">`);
          htmlParts.push(`<Star className="h-5 w-5 text-[#FFBF3F] mr-2" />`);
          htmlParts.push(`${traitName}</h4>`);
          htmlParts.push(`<p class="text-[#2B1B44] mb-3 leading-relaxed">${escapeHtml(traitContent)}</p>`);
        }
      } else if (line.startsWith('  - **') && inTraitBreakdown) {
        // Handle trait sub-items (Observed Signals, In Daily Life, etc.)
        const subItemMatch = line.match(/ {2}- \*\*(.+?)\*\*: (.+)/);
        if (subItemMatch) {
          const subItemName = subItemMatch[1];
          const subItemContent = subItemMatch[2];
          htmlParts.push(`<div class="ml-4 mb-2 bg-white/50 p-2 rounded-lg">`);
          htmlParts.push(`<h5 class="text-sm font-semibold text-[#FFBF3F] mb-1">${subItemName}:</h5>`);
          htmlParts.push(`<p class="text-[#2B1B44] text-sm leading-relaxed">${escapeHtml(subItemContent)}</p>`);
          htmlParts.push(`</div>`);
        }
      } else if (line.startsWith('- ') && !inTraitBreakdown) {
        if (!listOpen) { htmlParts.push('<ul class="list-disc ml-6 space-y-2">'); listOpen = true; }
        const content = line.slice(2).replace(/&/g, '&amp;');
        htmlParts.push(`<li class="text-[#2B1B44] bg-white p-2 rounded-lg shadow-sm">${content}</li>`);
      } else if (line.length === 0) {
        if (listOpen) { htmlParts.push('</ul>'); listOpen = false; }
        if (inTraitBreakdown && currentTrait) {
          htmlParts.push(`</div>`); // Close trait div
          currentTrait = '';
        }
        htmlParts.push('');
      } else if (line.startsWith('  ') && inTraitBreakdown) {
        // Handle indented content within trait breakdown
        const content = escapeHtml(line.trim());
      } else if (line.length > 0 && !line.startsWith('#') && !line.startsWith('-') && !line.startsWith('**') && inTraitBreakdown && currentTrait) {
        // Handle regular text content within trait descriptions
        htmlParts.push(`<p class="text-[#2B1B44] mb-3 leading-relaxed">${escapeHtml(line)}</p>`);
      } else {
        if (listOpen) { htmlParts.push('</ul>'); listOpen = false; }
        const content = escapeHtml(line)
          .replace(/&lt;strong&gt;([\s\S]+?)&lt;\/strong&gt;/g, '<strong>$1</strong>');
        htmlParts.push(`<p class="text-[#2B1B44] leading-7 bg-white p-3 rounded-lg shadow-sm">${content}</p>`);
      }
    }
    
    if (listOpen) htmlParts.push('</ul>');
    if (inTraitBreakdown && currentTrait) {
      htmlParts.push(`</div>`); // Close any open trait div
    }
    
    return sanitizeHtml(htmlParts.filter(Boolean).join('\n'));
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      // Show a simple alert for now (you can replace with a proper toast)
      alert('Results copied to clipboard! 📋');
    } catch (err) {
      console.error('Failed to copy: ', err);
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      alert('Results copied to clipboard! 📋');
    }
  };

  const formatDuration = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    return `${minutes}m ${seconds % 60}s`;
  };

  const getConfidenceColor = (score: number) => {
    if (score >= 80) return 'text-[#E4B7F6]';
    if (score >= 60) return 'text-[#FFBF3F]';
    return 'text-[#F1E4F3]';
  };

  const getConfidenceLevel = (score: number) => {
    if (score >= 80) return 'Very High';
    if (score >= 60) return 'High';
    if (score >= 40) return 'Medium';
    return 'Low';
  };

  // Extract personality name, style statement, and style profile for display
  const personalityName = markdownReport ? extractPersonalityName(markdownReport) : null;
  const styleStatement = markdownReport ? extractStyleStatement(markdownReport) : null;
  const styleProfile = markdownReport ? extractStyleProfile(markdownReport) : null;

  // Debug logging
  console.log('🔍 Debug - Personality Report Data:', {
    hasMarkdownReport: !!markdownReport,
    markdownReportLength: markdownReport?.length || 0,
    extractedPersonalityName: personalityName,
    extractedStyleStatement: styleStatement,
    extractedStyleProfile: styleProfile,
    fallbackPersonality: personality,
    receivedProps: { personality, sentiment, explanation, markdownReport }
  });

  // Log the first 500 characters of markdown report to see what's being generated
  if (markdownReport) {
    console.log('📄 Markdown Report Preview:', markdownReport.substring(0, 500));
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-lg z-50 flex items-center justify-center p-2 md:p-4">
      <div className="bg-gradient-to-br from-[#F5F4F6] to-[#F1E4F3] rounded-2xl shadow-2xl max-w-5xl w-full max-h-[95vh] md:max-h-[90vh] overflow-y-auto border-2 border-[#E4B7F6]">
        {/* Enhanced Header */}
        <div className="sticky top-0 bg-gradient-to-r from-[#2B1B44] via-[#E4B7F6] to-[#FFBF3F] p-6 md:p-8 rounded-t-2xl border-b-2 border-[#FFBF3F] shadow-lg">
          <div className="absolute inset-0 bg-gradient-to-br from-[#2B1B44]/20 via-[#E4B7F6]/30 to-[#FFBF3F]/20" />
          <div className="relative flex justify-between items-start">
            <div className="flex-1">
              {/* Main Personality Title */}
              <div className="flex items-center space-x-3 mb-4">
                <div className="bg-white/20 p-3 rounded-full backdrop-blur-sm shadow-md">
                  <Sparkles className="h-6 w-6 md:h-8 md:w-8 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl md:text-4xl font-bold text-white drop-shadow-lg leading-tight">
                    {personalityName || personality}
                  </h1>
                  <p className="text-white/95 mt-1 text-sm md:text-base font-medium drop-shadow-md">
                    Your Unique Personality Type
                  </p>
                </div>
              </div>
              
              {/* Additional Personality Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div className="bg-white/90 rounded-lg p-4 border border-[#FFBF3F] shadow-sm backdrop-blur-sm">
                  <div className="flex items-center space-x-2 mb-2">
                    <Palette className="h-4 w-4 text-[#2B1B44]" />
                    <span className="text-sm font-semibold text-[#2B1B44]">Style Sentiment</span>
                  </div>
                  <p className="text-[#2B1B44] font-medium text-sm md:text-base">{sentiment}</p>
                </div>
                
                {bagPersonality && (
                  <div className="bg-white/90 rounded-lg p-4 border border-[#E4B7F6] shadow-sm backdrop-blur-sm">
                    <div className="flex items-center space-x-2 mb-2">
                      <TrendingUp className="h-4 w-4 text-[#FFBF3F]" />
                      <span className="text-sm font-semibold text-[#2B1B44]">Bag Preference</span>
                    </div>
                    <p className="text-[#2B1B44] font-medium text-sm md:text-base">{bagPersonality}</p>
                  </div>
                )}
              </div>
              
              {/* Confidence Score (if available) */}
              {confidenceScore && confidenceScore > 0 && (
                <div className="mt-4 bg-white/90 rounded-lg p-4 border border-[#FFBF3F] max-w-xs shadow-sm backdrop-blur-sm">
                  <div className="flex items-center space-x-2 mb-2">
                    <Award className="h-4 w-4 text-[#FFBF3F]" />
                    <span className="text-sm font-semibold text-[#2B1B44]">Analysis Confidence</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="flex-1 bg-[#F5F4F6] rounded-full h-2.5">
                      <div 
                        className={`h-2.5 rounded-full transition-all duration-300 ${
                          confidenceScore >= 80 ? 'bg-[#E4B7F6]' : 
                          confidenceScore >= 60 ? 'bg-[#FFBF3F]' : 'bg-[#F1E4F3]'
                        }`}
                        style={{ width: `${confidenceScore}%` }}
                      />
                    </div>
                    <span className={`text-sm font-semibold ${getConfidenceColor(confidenceScore)}`}>
                      {confidenceScore}%
                    </span>
                  </div>
                </div>
              )}

              {/* CSV Save Status */}
              <div className="mt-4 bg-white/90 rounded-lg p-4 border border-[#FFBF3F] max-w-xs shadow-sm backdrop-blur-sm">
                <div className="flex items-center space-x-2">
                  <div className={`w-3 h-3 rounded-full ${isSavingToCSV ? 'bg-[#FFBF3F] animate-pulse' : 'bg-[#E4B7F6]'}`} />
                  <span className="text-sm font-semibold text-[#2B1B44]">
                    {isSavingToCSV ? 'Saving to Database...' : 'Saved to Database ✓'}
                  </span>
                </div>
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex flex-col gap-3 ml-6">
              <Button
                onClick={onClose}
                variant="ghost"
                size="sm"
                className="text-white hover:text-white/80 hover:bg-white/20 rounded-lg transition-all duration-200"
              >
                <X className="h-5 w-5 md:h-6 md:w-6" />
              </Button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 md:p-8 space-y-6 md:space-y-8">
          {/* Perfect Bag Matches Introduction */}
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-[#2B1B44] mb-4">
              Your Perfect Bag Matches:
            </h2>
            <p className="text-[#2B1B44] leading-relaxed text-base md:text-lg max-w-4xl mx-auto">
              From your Personality Style Quiz Results, the Anuschka Matchmaker reveals a curated 
              collection of handcrafted art — each piece destined to reflect your inner spirit and 
              matched to your unique style.
            </p>
          </div>

          {/* Prominent Style Statement Display */}
          {styleStatement && (
            createSectionCard(
              "Your Style Statement",
              <Sparkles className="h-5 w-5 md:h-6 md:w-6 text-[#FFBF3F]" />,
              "border-[#FFBF3F] bg-gradient-to-r from-[#F1E4F3] to-[#E4B7F6]",
              <div className="text-center">
                <p className="text-lg md:text-xl font-medium text-[#2B1B44] leading-relaxed italic">
                  "{styleStatement}"
                </p>
              </div>
            )
          )}

          {/* Style Profile Display */}
          {styleProfile && (
            createSectionCard(
              "Your Style Profile",
              <Palette className="h-5 w-5 md:h-6 md:w-6 text-[#E4B7F6]" />,
              "border-[#E4B7F6] bg-gradient-to-r from-[#F5F4F6] to-[#F1E4F3]",
              <div className="space-y-4">
                <p className="text-[#2B1B44] leading-relaxed text-sm md:text-base">
                  {styleProfile}
                </p>
              </div>
            )
          )}

          {/* Analysis Summary or Full Markdown Report */}
          {markdownReport ? (
            createSectionCard(
              "Your Personality Report",
              <Sparkles className="h-5 w-5 md:h-6 md:w-6 text-[#2B1B44]" />,
              "border-[#2B1B44] bg-gradient-to-r from-[#F1E4F3] to-[#E4B7F6]",
              <div
                className="text-sm md:text-base text-[#2B1B44] space-y-2"
                dangerouslySetInnerHTML={{ __html: renderMarkdownToHtml(markdownReport) }}
              />
            )
          ) : (
            createSectionCard(
              "Personality Style Summary",
              <Sparkles className="h-5 w-5 md:h-6 md:w-6 text-[#2B1B44]" />,
              "border-[#2B1B44] bg-gradient-to-r from-[#F1E4F3] to-[#E4B7F6]",
              <p className="text-[#2B1B44] leading-relaxed text-sm md:text-base">{explanation}</p>
            )
          )}



          {/* Style Preferences (hidden when full markdown is present) */}
          {!markdownReport && (
            createSectionCard(
              "Style Preferences",
              <Palette className="h-5 w-5 md:h-6 md:w-6 text-[#FFBF3F]" />,
              "border-[#FFBF3F] bg-gradient-to-r from-[#F5F4F6] to-[#F1E4F3]",
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold text-[#2B1B44] mb-2 text-sm md:text-base">Your Style Traits:</h4>
                  <div className="space-y-2">
                    {stylePreferences.map((preference, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <Star className="h-4 w-4 text-[#FFBF3F]" />
                        <span className="text-[#2B1B44] text-sm md:text-base">{preference}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold text-[#2B1B44] mb-2 text-sm md:text-base">Lifestyle Insights:</h4>
                  <p className="text-[#2B1B44] leading-relaxed text-sm md:text-base">{lifestyleInsights}</p>
                </div>
              </div>
            )
          )}

          {/* Anushcka MatchMaker Section */}
          {createSectionCard(
            "Anushcka MatchMaker",
            <TrendingUp className="h-5 w-5 md:h-6 md:w-6 text-[#FFBF3F]" />,
            "border-[#FFBF3F] bg-gradient-to-r from-[#F5F4F6] to-[#F1E4F3]",
            <div className="text-center">
              <h3 className="text-lg md:text-xl font-bold text-[#2B1B44] mb-3 md:mb-4">
                Find the bag that matches your personality!
              </h3>
              <p className="text-[#2B1B44] mb-4 md:mb-6 text-sm md:text-base">
                Our AI-powered matchmaker analyzes your unique style preferences to curate the perfect bag collection just for you.
              </p>
              <Button
                onClick={customNavigate || navigateToResults}
                className="bg-gradient-to-r from-[#FFBF3F] to-[#8CD9B5] hover:from-[#8CD9B5] hover:to-[#FFBF3F] text-white px-6 md:px-8 py-3 text-base md:text-lg font-semibold w-full md:w-auto"
              >
                <Sparkles className="h-4 w-4 md:h-5 md:w-5 mr-2" />
                Find Match
              </Button>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 md:gap-6 pt-6">
            <Button
              onClick={() => {
                const shareText = `🎭 I just discovered my personality type: ${personality}! ${sentiment} uiz yourself and find your perfect handbag match!`;
                const shareUrl = window.location.origin + '/personality-quiz';

                if (navigator.share) {
                  // Use native sharing on mobile devices
                  navigator.share({
                    title: 'My Personality Quiz Results',
                    text: shareText,
                    url: shareUrl
                  }).catch((error) => {
                    console.error('Error sharing:', error);
                    // Fallback to clipboard
                    copyToClipboard(shareText + '\n\n' + shareUrl);
                  });
                } else {
                  // Fallback to clipboard for desktop
                  copyToClipboard(shareText + '\n\n' + shareUrl);
                }
              }}
              variant="outline"
              className="flex-1 border-2 border-[#FFBF3F] text-[#FFBF3F] hover:bg-[#FFBF3F]/10 text-base md:text-lg font-semibold py-3 rounded-xl transition-all duration-300"
            >
              <Users className="h-5 w-5 mr-2" />
              Share Results
            </Button>
          </div>
        </div>
      </div>
      

    </div>
  );
};

export default PersonalityReportPopup; 