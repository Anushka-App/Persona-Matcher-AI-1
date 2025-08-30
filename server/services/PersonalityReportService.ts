import { LLMService } from './LLMService';

export interface PersonalityReportInput {
  name: string;
  hobbies: string[];
  communication_style: string;
  favorite_books_movies: string[];
  strengths: string[];
  weaknesses: string[];
}

export interface PersonalityReport {
  introduction: string;
  hobbies_analysis: string;
  communication_analysis: string;
  media_preferences_analysis: string;
  strengths_weaknesses_analysis: string;
  conclusion: string;
  personalized_recommendations: string[];
}

export class PersonalityReportService {
  private llmService: LLMService;

  constructor(llmService: LLMService) {
    this.llmService = llmService;
  }

  async generatePersonalityReport(userInput: PersonalityReportInput): Promise<PersonalityReport> {
    try {
      const prompt = this.createPersonalityReportPrompt(userInput);
      
      const response = await this.llmService.process({
        type: 'personality-report',
        data: { prompt, userInput },
        options: {
          temperature: 0.8,
          maxTokens: 1500
        }
      });

      if (!response.success) {
        throw new Error(response.error || 'Failed to generate personality report');
      }

      // Try to parse as structured data first
      if (typeof response.data === 'object' && response.data !== null) {
        return this.validateAndFormatReport(response.data);
      }

      // Fallback: parse from text response
      return this.parseTextResponse(response.data as string, userInput);
      
    } catch (error) {
      console.error('Error generating personality report:', error);
      // Return a fallback report
      return this.generateFallbackReport(userInput);
    }
  }

  private createPersonalityReportPrompt(userInput: PersonalityReportInput): string {
    return `
You are an expert personality analyst and life coach. Generate a detailed, personalized personality profile based on the following user information.

USER INFORMATION:
- Name: ${userInput.name}
- Hobbies: ${userInput.hobbies.join(', ')}
- Communication Style: ${userInput.communication_style}
- Favorite Books/Movies: ${userInput.favorite_books_movies.join(', ')}
- Strengths: ${userInput.strengths.join(', ')}
- Weaknesses: ${userInput.weaknesses.join(', ')}

REQUIREMENTS:
Create a comprehensive personality profile with the following sections:

1. INTRODUCTION: Provide a brief overview of ${userInput.name}, summarizing their personality traits based on the given data.

2. HOBBIES ANALYSIS: Explain how their hobbies reflect their personality and how these activities influence their behavior and lifestyle choices.

3. COMMUNICATION ANALYSIS: Analyze how their communication style might impact their relationships, both personally and professionally. Include insights about their interpersonal dynamics.

4. MEDIA PREFERENCES ANALYSIS: Discuss how their favorite books or movies align with their values, interests, and worldview. What do these preferences reveal about their personality?

5. STRENGTHS AND WEAKNESSES ANALYSIS: Offer a balanced analysis of their strengths and weaknesses. Suggest specific ways they can enhance their strengths and address their weaknesses for personal growth.

6. CONCLUSION: Wrap up the profile with personalized recommendations and advice for growth. Be motivational and friendly, offering encouragement based on their personality traits.

7. PERSONALIZED RECOMMENDATIONS: Provide 3-5 specific, actionable recommendations for personal development, career growth, or relationship improvement.

FORMAT THE RESPONSE AS A JSON OBJECT WITH THESE EXACT KEYS:
{
  "introduction": "string",
  "hobbies_analysis": "string", 
  "communication_analysis": "string",
  "media_preferences_analysis": "string",
  "strengths_weaknesses_analysis": "string",
  "conclusion": "string",
  "personalized_recommendations": ["string", "string", "string"]
}

Make the analysis insightful, empathetic, and actionable. Focus on positive growth while being honest about areas for improvement.
`;
  }

  private validateAndFormatReport(data: Record<string, unknown>): PersonalityReport {
    const requiredFields = [
      'introduction', 'hobbies_analysis', 'communication_analysis',
      'media_preferences_analysis', 'strengths_weaknesses_analysis',
      'conclusion', 'personalized_recommendations'
    ];

    // Check if all required fields exist
    const missingFields = requiredFields.filter(field => !data[field]);
    if (missingFields.length > 0) {
      throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
    }

    // Ensure recommendations is an array
    if (!Array.isArray(data.personalized_recommendations)) {
      data.personalized_recommendations = [data.personalized_recommendations];
    }

    return {
      introduction: String(data.introduction || ''),
      hobbies_analysis: String(data.hobbies_analysis || ''),
      communication_analysis: String(data.communication_analysis || ''),
      media_preferences_analysis: String(data.media_preferences_analysis || ''),
      strengths_weaknesses_analysis: String(data.strengths_weaknesses_analysis || ''),
      conclusion: String(data.conclusion || ''),
      personalized_recommendations: Array.isArray(data.personalized_recommendations) 
        ? data.personalized_recommendations.map(String)
        : []
    };
  }

  private parseTextResponse(text: string, userInput: PersonalityReportInput): PersonalityReport {
    // Simple text parsing fallback
    const sections = text.split('\n\n');
    
    return {
      introduction: sections[0] || `Based on the information provided, ${userInput.name} appears to have a unique personality profile.`,
      hobbies_analysis: sections[1] || `Their hobbies suggest a person who enjoys ${userInput.hobbies.join(' and ')}.`,
      communication_analysis: sections[2] || `Their communication style of ${userInput.communication_style} likely influences their interactions.`,
      media_preferences_analysis: sections[3] || `Their media preferences reveal interests in ${userInput.favorite_books_movies.join(' and ')}.`,
      strengths_weaknesses_analysis: sections[4] || `They have strengths in ${userInput.strengths.join(' and ')}, and areas for growth in ${userInput.weaknesses.join(' and ')}.`,
      conclusion: sections[5] || `This analysis provides a foundation for personal growth and self-awareness.`,
      personalized_recommendations: [
        'Focus on developing your strengths further',
        'Work on addressing areas for improvement',
        'Consider how your communication style affects relationships'
      ]
    };
  }

  private generateFallbackReport(userInput: PersonalityReportInput): PersonalityReport {
    return {
      introduction: `Based on the information provided, ${userInput.name} demonstrates a personality characterized by their interests in ${userInput.hobbies.join(', ')}, their ${userInput.communication_style} communication approach, and their appreciation for ${userInput.favorite_books_movies.join(', ')}.`,
      
      hobbies_analysis: `Their hobbies of ${userInput.hobbies.join(' and ')} suggest someone who is ${this.analyzeHobbies(userInput.hobbies)}. These activities likely provide them with ${this.getHobbyBenefits(userInput.hobbies)}.`,
      
      communication_analysis: `With a ${userInput.communication_style} communication style, ${userInput.name} likely ${this.analyzeCommunicationStyle(userInput.communication_style)}. This approach can ${this.getCommunicationImpact(userInput.communication_style)}.`,
      
      media_preferences_analysis: `Their interest in ${userInput.favorite_books_movies.join(' and ')} suggests they value ${this.analyzeMediaPreferences(userInput.favorite_books_movies)}. These preferences likely reflect their ${this.getMediaInsights(userInput.favorite_books_movies)}.`,
      
      strengths_weaknesses_analysis: `Their key strengths include ${userInput.strengths.join(', ')}, which demonstrate ${this.analyzeStrengths(userInput.strengths)}. Areas for growth include ${userInput.weaknesses.join(', ')}, which can be addressed through ${this.getGrowthStrategies(userInput.weaknesses)}.`,
      
      conclusion: `This personality profile reveals a unique individual with diverse interests and clear areas for personal development. By leveraging their strengths and working on growth areas, ${userInput.name} has great potential for personal and professional success.`,
      
      personalized_recommendations: [
        `Continue developing your strengths in ${userInput.strengths[0]} and ${userInput.strengths[1] || userInput.strengths[0]}`,
        `Focus on improving your ${userInput.weaknesses[0]} through practice and feedback`,
        `Use your ${userInput.communication_style} communication style to build stronger relationships`,
        `Explore new hobbies that complement your existing interests in ${userInput.hobbies.join(' and ')}`,
        `Consider how your media preferences can guide your personal and professional choices`
      ]
    };
  }

  private analyzeHobbies(hobbies: string[]): string {
    if (hobbies.some(h => h.toLowerCase().includes('sport') || h.toLowerCase().includes('fitness'))) {
      return 'physically active and health-conscious';
    }
    if (hobbies.some(h => h.toLowerCase().includes('art') || h.toLowerCase().includes('creative'))) {
      return 'creative and expressive';
    }
    if (hobbies.some(h => h.toLowerCase().includes('read') || h.toLowerCase().includes('book'))) {
      return 'intellectual and curious';
    }
    return 'diverse and well-rounded';
  }

  private getHobbyBenefits(hobbies: string[]): string {
    if (hobbies.some(h => h.toLowerCase().includes('social'))) {
      return 'social connection and community building';
    }
    if (hobbies.some(h => h.toLowerCase().includes('outdoor'))) {
      return 'stress relief and connection with nature';
    }
    return 'personal fulfillment and skill development';
  }

  private analyzeCommunicationStyle(style: string): string {
    const styleLower = style.toLowerCase();
    if (styleLower.includes('direct')) return 'expresses thoughts clearly and honestly';
    if (styleLower.includes('empathetic')) return 'shows understanding and emotional intelligence';
    if (styleLower.includes('analytical')) return 'approaches conversations with logic and structure';
    if (styleLower.includes('collaborative')) return 'seeks input and builds consensus';
    return 'communicates in their own unique way';
  }

  private getCommunicationImpact(style: string): string {
    const styleLower = style.toLowerCase();
    if (styleLower.includes('direct')) return 'create clear expectations and avoid misunderstandings';
    if (styleLower.includes('empathetic')) return 'build strong emotional connections';
    if (styleLower.includes('analytical')) return 'solve complex problems effectively';
    if (styleLower.includes('collaborative')) return 'foster teamwork and cooperation';
    return 'create positive interactions in various contexts';
  }

  private analyzeMediaPreferences(media: string[]): string {
    if (media.some(m => m.toLowerCase().includes('fiction'))) return 'imagination and storytelling';
    if (media.some(m => m.toLowerCase().includes('non-fiction'))) return 'learning and knowledge';
    if (media.some(m => m.toLowerCase().includes('drama'))) return 'emotional depth and human experience';
    if (media.some(m => m.toLowerCase().includes('comedy'))) return 'humor and lightheartedness';
    return 'diverse perspectives and experiences';
  }

  private getMediaInsights(media: string[]): string {
    if (media.some(m => m.toLowerCase().includes('classic'))) return 'appreciation for timeless themes';
    if (media.some(m => m.toLowerCase().includes('modern'))) return 'openness to contemporary ideas';
    if (media.some(m => m.toLowerCase().includes('international'))) return 'cultural curiosity and global perspective';
    return 'broad interests and open-mindedness';
  }

  private analyzeStrengths(strengths: string[]): string {
    if (strengths.some(s => s.toLowerCase().includes('leadership'))) return 'natural leadership abilities';
    if (strengths.some(s => s.toLowerCase().includes('creativity'))) return 'innovative thinking and problem-solving';
    if (strengths.some(s => s.toLowerCase().includes('communication'))) return 'strong interpersonal skills';
    if (strengths.some(s => s.toLowerCase().includes('organization'))) return 'excellent planning and execution abilities';
    return 'valuable personal qualities';
  }

  private getGrowthStrategies(weaknesses: string[]): string {
    if (weaknesses.some(w => w.toLowerCase().includes('patience'))) return 'mindfulness and stress management techniques';
    if (weaknesses.some(w => w.toLowerCase().includes('confidence'))) return 'positive self-talk and skill development';
    if (weaknesses.some(w => w.toLowerCase().includes('organization'))) return 'time management tools and systems';
    if (weaknesses.some(w => w.toLowerCase().includes('communication'))) return 'active listening and feedback practice';
    return 'targeted skill development and self-reflection';
  }
}
