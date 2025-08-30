import { Request, Response } from 'express';
import { PersonalityReportService, PersonalityReportInput } from '../services/PersonalityReportService';
import { LLMService } from '../services/LLMService';

// Define interfaces for quiz-related data
interface QuizAnswer {
  question?: string;
  selected_personality?: string;
}

interface UserInfo {
  name?: string;
}

interface PersonalityAnalysis {
  hobbies: string[];
  communicationStyle: string;
  mediaPreferences: string[];
  strengths: string[];
  weaknesses: string[];
}

interface PersonalityInsights {
  dominantTraits: string[];
  communicationPatterns: Array<{
    question?: string;
    style?: string;
  }>;
  lifestylePreferences: Array<{
    preference?: string;
    context?: string;
  }>;
  growthAreas: Array<{
    area?: string;
    context?: string;
  }>;
}

export class PersonalityReportController {
  private personalityReportService: PersonalityReportService;

  constructor() {
    const llmService = new LLMService(process.env.GEMINI_API_KEY || '');
    this.personalityReportService = new PersonalityReportService(llmService);
  }

  async generateReport(req: Request, res: Response): Promise<void> {
    try {
      const userInput: PersonalityReportInput = req.body;

      // Validate required fields
      if (!this.validateUserInput(userInput)) {
        res.status(400).json({
          success: false,
          error: 'Missing required fields. Please provide: name, hobbies, communication_style, favorite_books_movies, strengths, weaknesses'
        });
        return;
      }

      // Generate the personality report
      const report = await this.personalityReportService.generatePersonalityReport(userInput);

      res.status(200).json({
        success: true,
        data: report,
        message: 'Personality report generated successfully'
      });

    } catch (error) {
      console.error('Error in generateReport controller:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to generate personality report',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  async generateReportFromQuiz(req: Request, res: Response): Promise<void> {
    try {
      const { quizAnswers, userInfo } = req.body;

      if (!quizAnswers || !userInfo) {
        res.status(400).json({
          success: false,
          error: 'Missing quiz answers or user information'
        });
        return;
      }

      // Convert quiz answers to personality report input
      const userInput = this.convertQuizToPersonalityInput(quizAnswers, userInfo);

      // Generate the personality report
      const report = await this.personalityReportService.generatePersonalityReport(userInput);

      res.status(200).json({
        success: true,
        data: {
          report,
          quizSummary: {
            totalQuestions: quizAnswers.length,
            personalityInsights: this.extractPersonalityInsights(quizAnswers)
          }
        },
        message: 'Personality report generated from quiz successfully'
      });

    } catch (error) {
      console.error('Error in generateReportFromQuiz controller:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to generate personality report from quiz',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  async getReportTemplate(req: Request, res: Response): Promise<void> {
    try {
      const template = {
        name: "John Doe",
        hobbies: ["reading", "hiking", "photography"],
        communication_style: "empathetic and collaborative",
        favorite_books_movies: ["The Alchemist", "Inception", "The Great Gatsby"],
        strengths: ["creativity", "empathy", "problem-solving"],
        weaknesses: ["perfectionism", "procrastination"]
      };

      res.status(200).json({
        success: true,
        data: template,
        message: 'Report template retrieved successfully'
      });

    } catch (error) {
      console.error('Error in getReportTemplate controller:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve report template'
      });
    }
  }

  private validateUserInput(userInput: unknown): userInput is PersonalityReportInput {
    if (!userInput || typeof userInput !== 'object' || userInput === null) {
      return false;
    }
    
    const input = userInput as Record<string, unknown>;
    
    return (
      typeof input.name === 'string' &&
      Array.isArray(input.hobbies) &&
      input.hobbies.length > 0 &&
      typeof input.communication_style === 'string' &&
      Array.isArray(input.favorite_books_movies) &&
      input.favorite_books_movies.length > 0 &&
      Array.isArray(input.strengths) &&
      input.strengths.length > 0 &&
      Array.isArray(input.weaknesses) &&
      input.weaknesses.length > 0
    );
  }

  private convertQuizToPersonalityInput(quizAnswers: QuizAnswer[], userInfo: UserInfo): PersonalityReportInput {
    // Extract personality traits from quiz answers
    const personalityTraits = this.analyzeQuizAnswers(quizAnswers);
    
    // Map quiz results to personality input format
    return {
      name: userInfo.name || 'User',
      hobbies: personalityTraits.hobbies || ['personal interests'],
      communication_style: personalityTraits.communicationStyle || 'adaptive',
      favorite_books_movies: personalityTraits.mediaPreferences || ['various genres'],
      strengths: personalityTraits.strengths || ['adaptability'],
      weaknesses: personalityTraits.weaknesses || ['areas for growth']
    };
  }

  private analyzeQuizAnswers(quizAnswers: QuizAnswer[]): PersonalityAnalysis {
    const analysis: PersonalityAnalysis = {
      hobbies: [],
      communicationStyle: '',
      mediaPreferences: [],
      strengths: [],
      weaknesses: []
    };

    // Analyze each quiz answer to extract personality insights
    quizAnswers.forEach(answer => {
      if (answer.question && answer.selected_personality) {
        const question = answer.question.toLowerCase();
        const personality = answer.selected_personality.toLowerCase();

        // Extract hobbies from relevant questions
        if (question.includes('hobby') || question.includes('activity') || question.includes('free time')) {
          analysis.hobbies.push(personality);
        }

        // Extract communication style
        if (question.includes('communication') || question.includes('speak') || question.includes('express')) {
          analysis.communicationStyle = personality;
        }

        // Extract media preferences
        if (question.includes('book') || question.includes('movie') || question.includes('entertainment')) {
          analysis.mediaPreferences.push(personality);
        }

        // Extract strengths and weaknesses
        if (question.includes('strength') || question.includes('good at')) {
          analysis.strengths.push(personality);
        }
        if (question.includes('weakness') || question.includes('challenge') || question.includes('improve')) {
          analysis.weaknesses.push(personality);
        }
      }
    });

    return analysis;
  }

  private extractPersonalityInsights(quizAnswers: QuizAnswer[]): PersonalityInsights {
    const insights: PersonalityInsights = {
      dominantTraits: [],
      communicationPatterns: [],
      lifestylePreferences: [],
      growthAreas: []
    };

    // Count personality trait frequencies
    const traitCounts: { [key: string]: number } = {};
    
    quizAnswers.forEach(answer => {
      if (answer.selected_personality) {
        const trait = answer.selected_personality;
        traitCounts[trait] = (traitCounts[trait] || 0) + 1;
      }
    });

    // Get dominant traits (appearing more than once)
    insights.dominantTraits = Object.entries(traitCounts)
      .filter(([_, count]) => count > 1)
      .sort(([_, a], [__, b]) => b - a)
      .map(([trait, _]) => trait);

    // Analyze communication patterns
    const communicationAnswers = quizAnswers.filter(answer => 
      answer.question?.toLowerCase().includes('communication') ||
      answer.question?.toLowerCase().includes('speak') ||
      answer.question?.toLowerCase().includes('express')
    );

    insights.communicationPatterns = communicationAnswers.map(answer => ({
      question: answer.question,
      style: answer.selected_personality
    }));

    // Analyze lifestyle preferences
    const lifestyleAnswers = quizAnswers.filter(answer =>
      answer.question?.toLowerCase().includes('hobby') ||
      answer.question?.toLowerCase().includes('activity') ||
      answer.question?.toLowerCase().includes('lifestyle')
    );

    insights.lifestylePreferences = lifestyleAnswers.map(answer => ({
      preference: answer.selected_personality,
      context: answer.question
    }));

    // Identify growth areas
    const growthAnswers = quizAnswers.filter(answer =>
      answer.question?.toLowerCase().includes('improve') ||
      answer.question?.toLowerCase().includes('challenge') ||
      answer.question?.toLowerCase().includes('weakness')
    );

    insights.growthAreas = growthAnswers.map(answer => ({
      area: answer.selected_personality,
      context: answer.question
    }));

    return insights;
  }
}
