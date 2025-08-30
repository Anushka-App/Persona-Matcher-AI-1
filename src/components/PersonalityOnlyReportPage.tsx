import React, { useMemo, useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import SharedHeader from './SharedHeader';
import { CheckCircle2, Star, User, FileText, Scale, AlertCircle, RefreshCw } from 'lucide-react';
import httpClient from '@/lib/http';

type JourneyItem = { questionNumber: number; question: string; selectedOption: string };

interface LocationState {
  personalityType: string;
  dominantTraits: string[];
  scores: Record<string, number>;
  quizJourney: JourneyItem[];
  markdownReport?: string;
}

const PersonalityOnlyReportPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const state = (location.state || {}) as Partial<LocationState>;

  const personalityType = state.personalityType || 'Your Match';
  const dominantTraits = state.dominantTraits || [];
  const markdownReport = state.markdownReport || '';
  const sentiment = (state as { sentiment?: string }).sentiment;

  // State for API handling and fallback content
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [generatedContent, setGeneratedContent] = useState<string>('');
  const [isUsingFallback, setIsUsingFallback] = useState(false);

  const deriveSentiment = (): string => {
    if (sentiment) return sentiment;
    if (dominantTraits && dominantTraits.length > 0) return dominantTraits[0];
    return 'Balanced';
  };

  // Generate fallback content when API is not available
  const generateFallbackContent = (): string => {
    // Get traits directly from dominant traits or generate smart fallbacks
    let traits: string[] = [];
    
    if (dominantTraits && dominantTraits.length > 0) {
      traits = [...dominantTraits];
      // Ensure we have at least 4 traits
      while (traits.length < 4) {
        traits.push('Uniqueness');
      }
    } else {
      // Smart fallback based on personality type
      const personalityTypeLower = (personalityType || '').toLowerCase();
      if (personalityTypeLower.includes('creative') || personalityTypeLower.includes('artistic')) {
        traits = ['Creativity', 'Artistic Flair', 'Innovation', 'Expression'];
      } else if (personalityTypeLower.includes('leader') || personalityTypeLower.includes('executive')) {
        traits = ['Leadership', 'Vision', 'Strategic Thinking', 'Inspiration'];
      } else if (personalityTypeLower.includes('analytical') || personalityTypeLower.includes('logical')) {
        traits = ['Analytical', 'Precision', 'Problem Solving', 'Logic'];
      } else if (personalityTypeLower.includes('social') || personalityTypeLower.includes('people')) {
        traits = ['Empathy', 'Communication', 'Collaboration', 'Relationship Building'];
      } else if (personalityTypeLower.includes('refined') || personalityTypeLower.includes('connoisseur')) {
        traits = ['Elegance', 'Sophistication', 'Minimalism', 'Discernment'];
      } else {
        traits = ['Elegance', 'Versatility', 'Sincerity', 'Competence'];
      }
    }
    
    const personalityTypeLower = (personalityType || '').toLowerCase();
    const displayType = personalityType || 'A Unique Individual';
    
    // Generate context-aware content based on personality type
    let overview = '';
    let strengths = '';
    let growthAreas = '';
    
    if (personalityTypeLower.includes('creative') || personalityTypeLower.includes('artistic')) {
      overview = `You present as ${displayType}, embodying the spirit of artistic innovation and creative expression. Your personality combines ${traits.slice(0, 3).join(', ')} in a way that makes you a natural creator and visionary who brings fresh perspectives to every situation.`;
      strengths = `Your artistic flair and creative thinking give you a unique perspective that others find inspiring and refreshing. You excel at turning abstract ideas into tangible expressions and helping others see beauty in unexpected places. Your innovative approach allows you to solve problems with creative solutions that others might overlook.`;
      growthAreas = `Consider developing your practical implementation skills to complement your creative vision, making your artistic ideas more accessible to broader audiences. Focus on building structured approaches that can help translate your creative insights into actionable plans.`;
    } else if (personalityTypeLower.includes('leader') || personalityTypeLower.includes('executive')) {
      overview = `You present as ${displayType}, demonstrating natural leadership qualities and strategic vision. Your personality combines ${traits.slice(0, 3).join(', ')} in a way that makes you an effective guide and decision-maker who inspires confidence in others.`;
      strengths = `Your leadership abilities and strategic thinking give you the power to inspire teams and drive meaningful change. You excel at seeing the big picture and motivating others toward shared goals. Your natural ability to guide and influence makes you someone others look to for direction and support.`;
      growthAreas = `Consider developing your emotional intelligence and active listening skills to create even deeper connections with your team members. Focus on building more collaborative leadership approaches that empower others to contribute their unique strengths.`;
    } else if (personalityTypeLower.includes('analytical') || personalityTypeLower.includes('logical')) {
      overview = `You present as ${displayType}, showcasing exceptional analytical thinking and logical reasoning. Your personality combines ${traits.slice(0, 3).join(', ')} in a way that makes you a reliable problem-solver and strategic planner who brings clarity to complex situations.`;
      strengths = `Your analytical mind and attention to detail give you the ability to break down complex problems into manageable solutions. You excel at creating systems and processes that others can follow. Your logical approach helps teams make better decisions based on solid evidence and clear reasoning.`;
      growthAreas = `Consider developing your creative thinking and intuition to complement your logical approach, bringing more innovation to your problem-solving process. Focus on building skills that help you communicate complex ideas in more accessible and engaging ways.`;
    } else if (personalityTypeLower.includes('social') || personalityTypeLower.includes('people')) {
      overview = `You present as ${displayType}, radiating warmth and social intelligence. Your personality combines ${traits.slice(0, 3).join(', ')} in a way that makes you a natural connector and relationship builder who creates positive environments wherever you go.`;
      strengths = `Your empathy and communication skills give you the ability to understand and support others effectively. You excel at creating inclusive environments where people feel valued and heard. Your natural warmth and genuine interest in others helps build trust and cooperation in any group setting.`;
      growthAreas = `Consider developing your boundary-setting skills to maintain your energy while continuing to support others. Focus on building sustainable approaches to helping others that don't deplete your own resources and well-being.`;
    } else if (personalityTypeLower.includes('refined') || personalityTypeLower.includes('connoisseur')) {
      overview = `You present as ${displayType}, embodying refined taste and sophisticated discernment. Your personality combines ${traits.slice(0, 3).join(', ')} in a way that makes you a natural curator of quality and excellence who appreciates the finer things in life.`;
      strengths = `Your refined sensibility and attention to detail give you the ability to recognize and appreciate the finest things in life. You excel at creating environments of elegance and helping others develop their own sense of sophistication. Your discerning eye and appreciation for quality makes you someone others trust for recommendations and guidance.`;
      growthAreas = `Consider developing your ability to share your refined perspective with others, helping them appreciate the beauty and quality that surrounds them. Focus on finding ways to make your sophisticated insights more accessible and relevant to people from different backgrounds.`;
    } else {
      overview = `You present as ${displayType}, with distinctive traits that make you unique and valuable. Your personality combines ${traits.slice(0, 3).join(', ')} in a way that creates a truly individual approach to life and work that sets you apart.`;
      strengths = `Your combination of ${traits.slice(0, 2).join(' and ')} gives you a unique advantage in creative and collaborative environments. You excel at finding innovative solutions while maintaining authentic connections with others. Your distinctive approach brings fresh perspectives that help teams and organizations think differently.`;
      growthAreas = `Consider developing your ${traits[traits.length - 1]} further to create even more balance in your personality profile. This will enhance your overall effectiveness and personal satisfaction while building on your natural strengths.`;
    }
    
    // Generate specific, meaningful descriptions for each trait
    const traitDescriptions = traits.map((trait, index) => {
      // Create unique, specific descriptions for each trait
      const traitSpecificDescriptions = {
        'Sincerity': 'You value authenticity and genuine connections, always approaching situations with honesty and transparency. Your sincerity creates trust and meaningful relationships.',
        'Competence': 'You excel at what you do, demonstrating reliability and expertise in your chosen areas. Your competence makes you someone others can depend on.',
        'Sophistication': 'You appreciate refined aesthetics and cultural depth, showing discerning taste and worldly knowledge in your choices.',
        'Boldness': 'You embrace challenges with confidence and aren\'t afraid to take calculated risks. Your boldness helps you seize opportunities others might miss.',
        'Elegance': 'You carry yourself with grace and refinement, appreciating beauty and harmony in both your personal style and interactions.',
        'Whimsy': 'You bring creativity and playfulness to everything you do, finding joy in unexpected places and inspiring others with your imagination.',
        'Excitement': 'You approach life with energy and enthusiasm, bringing vibrancy and dynamism to every situation you encounter.',
        'Ruggedness': 'You embody strength and resilience, showing natural authenticity and the ability to handle challenges with determination.',
        'ArtisticFlair': 'You have a natural creative vision and aesthetic sensitivity, expressing yourself through artistic and innovative approaches.',
        'NatureAffinity': 'You feel connected to natural elements and appreciate organic beauty, finding peace and inspiration in the natural world.',
        'LuxuryLeaning': 'You appreciate premium quality and refined taste, valuing craftsmanship and exclusivity in your choices.',
        'Versatility': 'You adapt easily to different situations and roles, showing flexibility and a multi-faceted approach to challenges.',
        'ColorPlayfulness': 'You embrace vibrant expression and dynamic aesthetics, bringing energy and joy through your colorful choices.',
        'Minimalism': 'You value simplicity and clarity, focusing on what\'s essential and finding beauty in clean, uncluttered approaches.',
        'Uniqueness': 'You embrace your individuality and aren\'t afraid to stand out from the crowd. Your unique perspective brings fresh insights to every situation.'
      };
      
      // Get the specific description for this trait, or create a custom one if not found
      const description = traitSpecificDescriptions[trait as keyof typeof traitSpecificDescriptions] || 
        `You naturally embody ${trait.toLowerCase()}, bringing this quality to your interactions, decisions, and personal style. This trait is a fundamental part of what makes you uniquely you.`;
      
      return `**${trait}** - ${description}`;
    });
    
    return `# Personality Overview

${overview}

# Your Unique Traits

${traitDescriptions.map((desc, i) => `${i + 1}. ${desc}`).join('\n')}

# Key Strengths

${strengths}

# Growth Areas

${growthAreas}`;
  };

  // Try to fetch content from API, fallback to local generation
  useEffect(() => {
    const fetchContent = async () => {
      if (markdownReport) {
        setGeneratedContent(markdownReport);
        return;
      }

      if (!personalityType || !dominantTraits || dominantTraits.length === 0) {
        // Generate fallback content if no personality data
        const fallbackContent = generateFallbackContent();
        setGeneratedContent(fallbackContent);
        setIsUsingFallback(true);
        return;
      }

      // Only try API once, then use fallback permanently
      if (isUsingFallback) {
        return;
      }

      setIsLoading(true);
      setApiError(null);

      try {
        // Call the unified backend endpoint for personality report generation
        const payload = {
          type: 'personality-only',
          data: {
            personalityType,
            dominantTraits,
            quizJourney: state.quizJourney || [],
            sentiment: deriveSentiment()
          }
        };

        const response = await httpClient.post<{ 
          success: boolean;
          reportTitle?: string;
          personaName?: string;
          overview?: string;
          traits?: Array<{
            key: string;
            title: string;
            summary: string;
            bullets: string[];
          }>;
          artworks?: Array<{
            artworkName: string;
            description: string;
            imageUrl: string;
            productUrl: string;
          }>;
          markdown_report?: string;
          llm_used?: boolean;
          error?: string;
        }>('/api/personality/generate-report', payload);
        
        if (response.error) {
          throw new Error(response.error);
        }

        if (response.data && response.data.success) {
          
          // Handle structured JSON response
          if (response.data.reportTitle && response.data.traits) {
            // Convert structured response to markdown format for display
            const structuredToMarkdown = (data: Record<string, unknown>) => {
              let markdown = `## ${data.reportTitle || 'Your Personality Report'}\n\n`;
              
              if (data.overview) {
                markdown += `## Personality Overview\n${data.overview}\n\n`;
              }
              
              if (data.traits && Array.isArray(data.traits) && data.traits.length > 0) {
                markdown += `## Your Unique Traits\n`;
                (data.traits as Array<Record<string, unknown>>).forEach((trait: Record<string, unknown>) => {
                  markdown += `### ${trait.title as string}\n`;
                  markdown += `${trait.summary as string}\n\n`;
                  if (trait.bullets && Array.isArray(trait.bullets) && trait.bullets.length > 0) {
                    markdown += `**Key Manifestations:**\n`;
                    (trait.bullets as string[]).forEach((bullet: string) => {
                      markdown += `• ${bullet}\n`;
                    });
                    markdown += '\n';
                  }
                });
              }
              
              if (data.artworks && Array.isArray(data.artworks) && data.artworks.length > 0) {
                markdown += `## Recommended Artworks\n`;
                (data.artworks as Array<Record<string, unknown>>).forEach((artwork: Record<string, unknown>) => {
                  markdown += `### ${artwork.artworkName as string}\n`;
                  markdown += `${artwork.description as string}\n\n`;
                });
              }
              
              return markdown;
            };
            
            setGeneratedContent(structuredToMarkdown(response.data));
            setApiError(null);
          } else if (response.data.markdown_report) {
            // Handle legacy markdown response
            setGeneratedContent(response.data.markdown_report);
            setApiError(null);
          } else {
            throw new Error('No valid report content received from API');
          }
        } else {
          throw new Error(response.data?.error || 'No report data received from API');
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'API request failed';
        
        // Only log non-rate-limit errors to reduce console noise
        if (!errorMessage.includes('rate limit') && !errorMessage.includes('429')) {
          console.warn('API request failed, using fallback content:', error);
        } else {
          console.log('⚠️ LLM rate limit reached, using fallback content');
        }
        
        setApiError(errorMessage);
        const fallbackContent = generateFallbackContent();
        setGeneratedContent(fallbackContent);
        setIsUsingFallback(true);
      } finally {
        setIsLoading(false);
      }
    };

    fetchContent();
  }, [personalityType, dominantTraits, markdownReport, isUsingFallback]);

  // Parse markdown report into sections
  const reportSections = useMemo(() => {
    const sections: Record<string, string> = {};
    const contentToParse = generatedContent || markdownReport;
    
    if (!contentToParse) return sections;
    
    // Split by double newlines to handle different markdown formats
    const blocks = contentToParse.split(/\n\s*\n/);
    
    for (const block of blocks) {
      const trimmedBlock = block.trim();
      if (!trimmedBlock) continue;
      
      // Check if this block starts with a header
      const headerMatch = trimmedBlock.match(/^(#{1,3})\s+(.+)$/m);
      
      if (headerMatch) {
        const headerLevel = headerMatch[1].length;
        const headerText = headerMatch[2].trim();
        const content = trimmedBlock.replace(/^#{1,3}\s+.+$/m, '').trim();
        
        if (content) {
          sections[headerText] = content;
        }
      } else {
        // If no header, try to extract key information
        const lowerBlock = trimmedBlock.toLowerCase();
        if (lowerBlock.includes('personality') || lowerBlock.includes('overview') || lowerBlock.includes('summary')) {
          if (!sections['Personality Overview']) {
            sections['Personality Overview'] = trimmedBlock;
          }
        } else if (lowerBlock.includes('trait') || lowerBlock.includes('characteristic')) {
          if (!sections['Your Unique Traits']) {
            sections['Your Unique Traits'] = trimmedBlock;
          }
        } else if (lowerBlock.includes('strength') || lowerBlock.includes('quality')) {
          if (!sections['Key Strengths']) {
            sections['Key Strengths'] = sections['Key Strengths'] || '';
            sections['Key Strengths'] += (sections['Key Strengths'] ? '\n\n' : '') + trimmedBlock;
          }
        }
      }
    }
    
    return sections;
  }, [generatedContent, markdownReport]);

  // Get available sections for dynamic display
  const availableSections = Object.keys(reportSections);
  const hasDynamicContent = availableSections.length > 0;

  // Get personality overview content dynamically
  const getPersonalityOverview = () => {
    // Try multiple section names that LLMs might use
    const possibleOverviewSections = [
      'Personality Overview',
      'Personality Overview & Summary',
      'Summary',
      'Overview',
      'Introduction',
      'Personality Summary',
      'Key Insights'
    ];
    
    for (const sectionName of possibleOverviewSections) {
      if (hasDynamicContent && reportSections[sectionName]) {
        const content = reportSections[sectionName];
        if (typeof content === 'string' && content.trim().length > 50) {
          return content.trim();
        }
      }
    }
    
    // Try to find any content that looks like an overview
    for (const [sectionName, content] of Object.entries(reportSections)) {
      if (typeof content === 'string' && content.trim().length > 100) {
        const lowerContent = content.toLowerCase();
        if (lowerContent.includes('personality') || 
            lowerContent.includes('overview') || 
            lowerContent.includes('summary') ||
            lowerContent.includes('introduction')) {
          return content.trim();
        }
      }
    }
    
    // Fallback: use the longest content block as overview
    let longestContent = '';
    for (const content of Object.values(reportSections)) {
      if (typeof content === 'string' && content.trim().length > longestContent.length) {
        longestContent = content.trim();
      }
    }
    
    if (longestContent.length > 50) {
      return longestContent;
    }
    
    // Final fallback content
    return `You present as ${personalityType}, with cues like ${dominantTraits.slice(0, 3).join(', ')}. Your unique combination of traits creates a distinctive approach to life that sets you apart.`;
  };

  // Get unique traits content dynamically
  const getUniqueTraits = () => {
    // First priority: use dominant traits if available
    if (dominantTraits && dominantTraits.length > 0) {
      return dominantTraits.slice(0, 4);
    }
    
    // Try multiple section names that LLMs might use
    const possibleTraitSections = [
      'Your Unique Traits',
      'Key Traits',
      'Characteristic Traits',
      'Personality Traits',
      'Key Characteristics',
      'Distinctive Qualities'
    ];
    
    for (const sectionName of possibleTraitSections) {
      if (hasDynamicContent && reportSections[sectionName]) {
        const content = reportSections[sectionName];
        if (typeof content === 'string') {
          // Try to extract traits using multiple patterns
          let traits = [];
          
          // Pattern 1: Look for numbered or bulleted lists
          const listMatches = content.match(/(?:^\d+\.\s*|\*\s*|-\s*)([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/gm);
          if (listMatches && listMatches.length >= 3) {
            traits = listMatches.map(match => match.replace(/^(?:\d+\.\s*|\*\s*|-\s*)/, ''));
          }
          
          // Pattern 2: Look for capitalized trait words
          if (traits.length === 0) {
            const traitMatches = content.match(/\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\b/g);
            if (traitMatches && traitMatches.length >= 3) {
              traits = traitMatches;
            }
          }
          
          // Pattern 3: Look for trait-like phrases
          if (traits.length === 0) {
            const phraseMatches = content.match(/(?:is|are|shows|demonstrates|exhibits)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/gi);
            if (phraseMatches && phraseMatches.length >= 3) {
              traits = phraseMatches.map(match => match.replace(/^(?:is|are|shows|demonstrates|exhibits)\s+/i, ''));
            }
          }
          
          if (traits.length >= 3) {
            return traits.slice(0, 4);
          }
        }
      }
    }
    
    // Fallback: try to extract from any content that might contain traits
    for (const [sectionName, content] of Object.entries(reportSections)) {
      if (typeof content === 'string' && content.toLowerCase().includes('trait')) {
        const traitMatches = content.match(/\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\b/g);
        if (traitMatches && traitMatches.length >= 3) {
          return traitMatches.slice(0, 4);
        }
      }
    }
    
    // Smart fallback based on personality type
    const personalityTypeLower = personalityType.toLowerCase();
    if (personalityTypeLower.includes('creative') || personalityTypeLower.includes('artistic')) {
      return ['Creativity', 'Artistic Flair', 'Innovation', 'Expression'];
    } else if (personalityTypeLower.includes('leader') || personalityTypeLower.includes('executive')) {
      return ['Leadership', 'Vision', 'Strategic Thinking', 'Inspiration'];
    } else if (personalityTypeLower.includes('analytical') || personalityTypeLower.includes('logical')) {
      return ['Analytical', 'Precision', 'Problem Solving', 'Logic'];
    } else if (personalityTypeLower.includes('social') || personalityTypeLower.includes('people')) {
      return ['Empathy', 'Communication', 'Collaboration', 'Relationship Building'];
    } else if (personalityTypeLower.includes('refined') || personalityTypeLower.includes('connoisseur')) {
      return ['Sincerity', 'Elegance', 'Sophistication', 'Discernment'];
    } else {
      return ['Elegance', 'Versatility', 'Sincerity', 'Competence'];
    }
  };

  // Icon mapping for traits
  const getTraitIcon = (trait: string, index: number) => {
    const icons = [Scale, Star, User, FileText];
    return icons[index % icons.length];
  };

  // Enhanced trait descriptions mapping
  const getTraitDescription = (trait: string) => {
    const descriptions: Record<string, string> = {
      'Elegance': 'Choosing solutions that work—and look good doing it. Calm composure, sharp eye for detail, turning clutter into clarity without fuss.',
      'Versatility': 'Switching gears with ease, reading the room and the moment, adapting fast, finding creative angles, turning shifting demands into momentum.',
      'Sincerity': 'Saying what you mean and listening fully, grounded honesty, building real trust, creating space where collaboration is open and respectful.',
      'Competence': 'Delivering thoroughly, consistently, and without fanfare. Clear plans, clean execution, strong finishes, results that speak for themselves.',
      'Creativity': 'Thinking outside the box, finding innovative solutions, and approaching challenges with fresh perspectives and artistic flair.',
      'Leadership': 'Taking charge when needed, inspiring others, and guiding teams toward shared goals with confidence and vision.',
      'Empathy': 'Understanding others\' feelings and perspectives, building meaningful connections, and creating supportive environments.',
      'Resilience': 'Bouncing back from setbacks, maintaining composure under pressure, and finding strength in challenging situations.',
      'Analytical': 'Breaking down complex problems, gathering relevant information, and making decisions based on careful analysis.',
      'Adaptable': 'Adjusting to new situations quickly, embracing change, and finding opportunities in unexpected circumstances.',
      'Passionate': 'Approaching work and life with enthusiasm, dedication, and a genuine love for what you do.',
      'Strategic': 'Thinking long-term, planning ahead, and making decisions that align with broader goals and vision.'
    };
    
    // Try to find a description in the LLM content first
    for (const [sectionName, content] of Object.entries(reportSections)) {
      if (typeof content === 'string' && content.toLowerCase().includes(trait.toLowerCase())) {
        // Extract a sentence or phrase that describes this trait
        const sentences = content.split(/[.!?]+/);
        for (const sentence of sentences) {
          if (sentence.toLowerCase().includes(trait.toLowerCase()) && sentence.trim().length > 20) {
            return sentence.trim();
          }
        }
      }
    }
    
    return descriptions[trait] || 'This trait shows up in daily choices—shaping how you think, decide, collaborate, and create.';
  };

  // Show loading state while initializing
  if (isLoading && !generatedContent && !markdownReport) {
    return (
      <div className="min-h-screen bg-white">
        <SharedHeader />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <RefreshCw className="w-16 h-16 text-purple-600 mx-auto mb-4 animate-spin" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Generating Your Report</h2>
            <p className="text-gray-600">Please wait while we create your personalized personality report...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <SharedHeader />

      {/* Hero Banner at the top */}
      <div className="w-full relative bg-gradient-to-r from-purple-900 via-purple-700 to-purple-500 overflow-hidden h-[40vh] min-h-[300px] max-h-[600px] sm:h-[45vh] md:h-[50vh] lg:h-[55vh] xl:h-[60vh] 2xl:h-[65vh] flex items-center justify-center">
        {/* Background image with overlay */}
        <div className="absolute inset-0">
          <img 
            src="/Untitled (Graph) (1) copy.png"
            alt="Young woman working on laptop at wooden desk"
            className="w-full h-full object-cover object-center sm:object-center md:object-center lg:object-center xl:object-center 2xl:object-center"
            loading="eager"
            decoding="async"
            // fetchPriority removed to fix React warning
            style={{
              objectPosition: 'center 25%'
            }}
          />
          {/* Enhanced gradient overlay for better text readability */}
          <div className="absolute inset-0 bg-gradient-to-r from-purple-900/50 via-purple-800/60 to-purple-700/70"></div>
        </div>
        
        {/* Text overlay in bottom left corner */}
        <div className="absolute bottom-6 left-6 md:bottom-8 md:left-8 z-20">
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl px-4 sm:px-6 py-3 sm:py-4 border border-white/20">
            <div className="text-white text-left">
              <div className="text-base sm:text-lg md:text-2xl font-serif font-medium leading-tight">
                Your Personality in just
              </div>
              <div className="text-xl sm:text-2xl md:text-4xl font-serif font-bold leading-tight text-purple-200">
                90 sec
              </div>
            </div>
          </div>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute top-20 left-10 w-32 h-32 border-2 border-white/20 rounded-full transform rotate-45"></div>
        <div className="absolute bottom-20 left-20 w-24 h-24 border-2 border-white/20 rounded-full"></div>
        <div className="absolute top-40 right-20 w-20 h-20 border-2 border-white/20 rounded-full transform -rotate-12"></div>
      </div>



             {/* Content */}
       <div className="container mx-auto px-4 py-10">
         <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-sm border border-[#EFE7F4] p-6 md:p-10">
           <div className="text-center mb-8">
             <h1 className="text-3xl md:text-4xl font-heading font-bold text-[#4B0D6A]">Your Personality Report</h1>
             <p className="mt-2 text-[#4B0D6A]">{personalityType}</p>
             
             {/* Loading State */}
             {isLoading && (
               <div className="mt-4 flex items-center justify-center text-blue-600">
                 <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                 <span>Generating your personalized report...</span>
               </div>
             )}
           </div>

          {/* Personality Overview */}
          <div className="mb-8">
            <h2 className="text-xl font-heading font-semibold text-[#2B1B44] mb-4">Personality Overview</h2>
            <div className="text-[#4A4A4A] leading-relaxed space-y-4">
              {getPersonalityOverview().split('\n\n').map((paragraph, idx) => (
                <p key={idx} className="text-[#4A4A4A] leading-relaxed">
                  {paragraph.trim()}
                </p>
              ))}
            </div>
          </div>

          {/* Your Unique Traits */}
          <div className="mb-8">
            <h3 className="text-lg font-heading font-semibold text-[#2B1B44] mb-6">Your Unique Traits</h3>
            <div className="grid gap-6 md:grid-cols-2">
              {getUniqueTraits().map((trait, idx) => {
                const IconComponent = getTraitIcon(trait, idx);
                return (
                  <div key={idx} className="rounded-xl border border-[#E6E0EA] bg-[#FBFAFC] p-6 flex gap-4">
                    <div className="flex-shrink-0">
                      <IconComponent className="text-[#6A1B9A] w-6 h-6" />
                    </div>
                    <div>
                      <div className="font-semibold text-[#2B1B44] text-lg mb-2">{trait}</div>
                      <p className="text-sm text-[#4A4A4A] leading-relaxed">
                        {getTraitDescription(trait)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>




        </div>
      </div>

      {/* Anuschka MatchMaker Section */}
      <div className="w-full bg-gradient-to-r from-purple-50 to-purple-100 py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto text-center">
            {/* Title */}
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-[#4B0D6A] mb-8">
              Anuschka MatchMaker
            </h2>
            
            {/* Product Images and Call to Action - Centered Block */}
            <div className="flex justify-center">
              <div className="flex flex-col lg:flex-row items-center gap-12 max-w-4xl">
                {/* Left Side - Two Images Side by Side */}
                <div className="flex gap-4 order-1">
                  {/* First Product Image */}
                  <img
                    src="/product-image1.png"
                    alt="Handbag with vibrant floral and butterfly pattern"
                    className="w-32 h-32 object-cover rounded-lg shadow-md border-2 border-white"
                  />
                  
                  {/* Second Product Image */}
                  <img
                    src="/product-image2.png"
                    alt="Handbag with red and green floral pattern"
                    className="w-32 h-32 object-cover rounded-lg shadow-md border-2 border-white"
                  />
                </div>
                
                {/* Right Side - Text and Button */}
                <div className="text-center lg:text-left order-2">
                  <p className="text-xl md:text-2xl text-[#4B0D6A] font-medium mb-6 leading-relaxed">
                    Find the bag that matches your personality!
                  </p>
                  <Button
                    onClick={() =>
                      navigate('/artwork-selection', {
                        state: {
                          personality: personalityType,
                          sentiment: deriveSentiment()
                        }
                      })
                    }
                    className="bg-[#6A1B9A] hover:bg-[#5b1584] text-white px-10 py-4 text-lg font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 border-2 border-[#6A1B9A] hover:border-[#5b1584]"
                  >
                    Find Match
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};

export default PersonalityOnlyReportPage;


