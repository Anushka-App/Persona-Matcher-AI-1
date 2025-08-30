import fs from 'fs';
import path from 'path';

export interface Question {
  Question: string;
  Option_1: string;
  Option_1_Personality: string;
  Option_2: string;
  Option_2_Personality: string;
  Option_3: string;
  Option_3_Personality: string;
  Option_4: string;
  Option_4_Personality: string;
}

export interface UserSession {
  sessionId: string;
  askedQuestions: string[];
  answers: string[];
}

export class PersonalityQuizService {
  private questions: Question[] = [];
  private userSessions: Map<string, UserSession> = new Map();

  constructor() {
    this.loadQuestions();
  }

  private loadQuestions(): void {
    try {
      const csvPath = path.join(process.cwd(), 'public', 'updated_ml_bags_personality_dataset_cleaned.csv');
      const csvContent = fs.readFileSync(csvPath, 'utf-8');
      this.questions = this.parseCSV(csvContent);
      console.log(`Loaded ${this.questions.length} questions from CSV`);
    } catch (error) {
      console.error('Failed to load questions from CSV:', error);
      // Fallback to sample questions
      this.questions = this.getSampleQuestions();
    }
  }

  private parseCSV(csvText: string): Question[] {
    const lines = csvText.split('\n');
    const questions: Question[] = [];

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      if (!line.trim()) continue;

      // Better CSV parsing that handles quoted fields
      const values = this.parseCSVLine(line);
      
      if (values.length >= 13) {
        const question: Question = {
          Question: values[4] || '',
          Option_1: values[5] || '',
          Option_1_Personality: values[6] || '',
          Option_2: values[7] || '',
          Option_2_Personality: values[8] || '',
          Option_3: values[9] || '',
          Option_3_Personality: values[10] || '',
          Option_4: values[11] || '',
          Option_4_Personality: values[12] || ''
        };

        // Only add questions that have valid data and are not URLs
        if (question.Question && 
            question.Option_1 && 
            question.Option_1_Personality &&
            !question.Question.startsWith('http') &&
            question.Question.length > 10) {
          questions.push(question);
        }
      }
    }

    return questions;
  }

  private parseCSVLine(line: string): string[] {
    const result = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    
    // Add the last field
    result.push(current.trim());
    
    return result;
  }

  private getSampleQuestions(): Question[] {
    return [
      {
        Question: "What's your ideal weekend activity?",
        Option_1: "Shopping at luxury boutiques",
        Option_1_Personality: "Luxury_Seeker",
        Option_2: "Outdoor adventure sports",
        Option_2_Personality: "Adventure_Seeker",
        Option_3: "Quiet coffee shop reading",
        Option_3_Personality: "Intellectual",
        Option_4: "Social gatherings with friends",
        Option_4_Personality: "Social_Butterfly"
      },
      {
        Question: "Which scenery feels most calming to you?",
        Option_1: "A blooming spring garden 🌷",
        Option_1_Personality: "Gentle Guardian",
        Option_2: "A field of wild roses under sunset 🌹",
        Option_2_Personality: "Crimson Blossom",
        Option_3: "A misty meadow with dew",
        Option_3_Personality: "Metamorph Muse",
        Option_4: "A vintage botanical greenhouse 🌼",
        Option_4_Personality: "Ocean Mist"
      },
      {
        Question: "Your favorite type of floral pattern on accessories?",
        Option_1: "Minimalistic pastel petals",
        Option_1_Personality: "Wolf Moon",
        Option_2: "Bold and fiery rose prints",
        Option_2_Personality: "Winged Serenity",
        Option_3: "Soft watercolor blossoms",
        Option_3_Personality: "Playful Paws",
        Option_4: "Dark romantic florals",
        Option_4_Personality: "Petal Muse"
      }
    ];
  }

  // Get first question (random selection)
  getFirstQuestion(): { sessionId: string; question: Question } {
    const sessionId = this.generateSessionId();
    const question = this.getRandomQuestion();
    
    this.userSessions.set(sessionId, {
      sessionId,
      askedQuestions: [question.Question],
      answers: []
    });

    return { sessionId, question };
  }

  // Get next question based on previous answer
  getNextQuestion(sessionId: string, selectedPersonality: string): Question | null {
    const session = this.userSessions.get(sessionId);
    if (!session) throw new Error("Invalid session ID");

    // Add answer to session
    session.answers.push(selectedPersonality);

    // Filter questions based on personality
    const filteredQuestions = this.filterQuestionsByPersonality(
      selectedPersonality, 
      session.askedQuestions
    );

    if (filteredQuestions.length === 0) {
      // Fallback to random question if no personality match
      const randomQuestion = this.getRandomQuestion(session.askedQuestions);
      if (randomQuestion) {
        session.askedQuestions.push(randomQuestion.Question);
        return randomQuestion;
      }
      return null; // No more questions
    }

    // Select random question from filtered options
    const selectedQuestion = filteredQuestions[
      Math.floor(Math.random() * filteredQuestions.length)
    ];
    session.askedQuestions.push(selectedQuestion.Question);
    
    return selectedQuestion;
  }

  // Filter questions by personality type
  private filterQuestionsByPersonality(
    personality: string, 
    excludeQuestions: string[]
  ): Question[] {
    return this.questions.filter(question => {
      // Check if question has the personality type in any option
      const hasPersonality = [
        question.Option_1_Personality,
        question.Option_2_Personality,
        question.Option_3_Personality,
        question.Option_4_Personality
      ].includes(personality);

      // Exclude already asked questions
      const notAsked = !excludeQuestions.includes(question.Question);

      return hasPersonality && notAsked;
    });
  }

  // Get random question (fallback method)
  private getRandomQuestion(excludeQuestions: string[] = []): Question | null {
    const availableQuestions = this.questions.filter(
      question => !excludeQuestions.includes(question.Question)
    );

    if (availableQuestions.length === 0) return null;

    return availableQuestions[
      Math.floor(Math.random() * availableQuestions.length)
    ];
  }

  private generateSessionId(): string {
    return Math.random().toString(36).substring(2, 15);
  }

  // Get user session for final prediction
  getUserSession(sessionId: string): UserSession | null {
    return this.userSessions.get(sessionId) || null;
  }

  // Get personality prediction based on answers
  getPersonalityPrediction(answers: string[]): string {
    const personalityCounts: { [key: string]: number } = {};
    
    answers.forEach(answer => {
      personalityCounts[answer] = (personalityCounts[answer] || 0) + 1;
    });

    let maxCount = 0;
    let predictedPersonality = 'Classic Dreamer';

    Object.entries(personalityCounts).forEach(([personality, count]) => {
      if (count > maxCount) {
        maxCount = count;
        predictedPersonality = personality;
      }
    });

    return predictedPersonality;
  }

  // Get all questions (for debugging)
  getAllQuestions(): Question[] {
    return this.questions;
  }
} 