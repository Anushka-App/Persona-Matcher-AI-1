import { PersonalityGeminiService } from './PersonalityGeminiService';
import { PersonalityDataService } from './PersonalityDataService';
import { UserSession, QuizResult, PersonalityAnalysis, EnhancedRecommendation, Question, ProductTypeQuestion } from '../types/personalityTypes';

export class PersonalityAnalysisService {
  private geminiService: PersonalityGeminiService;
  private dataService: PersonalityDataService;
  private userSessions: Map<string, UserSession> = new Map();

  constructor() {
    this.dataService = new PersonalityDataService();
    this.geminiService = new PersonalityGeminiService(this.dataService);
  }

  async initialize(): Promise<void> {
    await this.dataService.loadAllData();
  }

  createSession(): UserSession {
    const sessionId = this.generateSessionId();
    const session: UserSession = {
      sessionId,
      askedQuestions: [],
      answers: [],
      productType: undefined,
      timestamp: new Date()
    };
    
    this.userSessions.set(sessionId, session);
    return session;
  }

  getProductTypeQuestion(): ProductTypeQuestion {
    return this.dataService.getProductTypeQuestion();
  }

  setProductType(sessionId: string, productType: string): void {
    const session = this.userSessions.get(sessionId);
    if (!session) throw new Error('Invalid session ID');
    session.productType = productType;
  }

  getRandomQuestion(excludeQuestions: string[] = []): Question | null {
    const questions = this.dataService.getQuestions();
    const availableQuestions = questions.filter(q => !excludeQuestions.includes(q.Question));
    
    if (availableQuestions.length === 0) return null;
    
    return availableQuestions[Math.floor(Math.random() * availableQuestions.length)];
  }

  getNextQuestion(sessionId: string, selectedPersonality: string): Question | null {
    const session = this.userSessions.get(sessionId);
    if (!session) throw new Error('Invalid session ID');

    session.answers.push(selectedPersonality);
    
    // Filter questions based on personality
    const questions = this.dataService.getQuestions();
    const filteredQuestions = questions.filter(question => {
      const hasPersonality = [
        question.Option_1_Personality,
        question.Option_2_Personality,
        question.Option_3_Personality,
        question.Option_4_Personality
      ].includes(selectedPersonality);
      
      const notAsked = !session.askedQuestions.includes(question.Question);
      
      return hasPersonality && notAsked;
    });

    let nextQuestion;
    if (filteredQuestions.length > 0) {
      nextQuestion = filteredQuestions[Math.floor(Math.random() * filteredQuestions.length)];
    } else {
      // Fallback to random question
      const availableQuestions = questions.filter(q => !session.askedQuestions.includes(q.Question));
      if (availableQuestions.length === 0) return null;
      nextQuestion = availableQuestions[Math.floor(Math.random() * availableQuestions.length)];
    }

    session.askedQuestions.push(nextQuestion.Question);
    return nextQuestion;
  }

  async generateResult(sessionId: string): Promise<QuizResult> {
    const session = this.userSessions.get(sessionId);
    if (!session || session.answers.length === 0) {
      throw new Error('Invalid session or no answers');
    }

    // Prepare user answers
    const userAnswers = session.askedQuestions.map((question, index) => ({
      question,
      selected_personality: session.answers[index]
    }));

    // Get data for analysis
    const availableBags = this.dataService.getBags();
    const personalityTypes = this.dataService.getPersonalityTypes();
    const artworkData = this.dataService.getArtworkData();

    // Get LLM analysis
    const { personality_analysis, recommendations } = await this.geminiService.analyzePersonalityAndRecommend(
      userAnswers,
      availableBags,
      personalityTypes,
      artworkData
    );

    // Filter recommendations by product type if specified
    let filteredRecommendations = recommendations;
    if (session.productType) {
      const productTypeBags = this.dataService.getBagsByPersonalityAndProductType(
        personality_analysis.predicted_personality,
        session.productType
      );
      
      // Filter recommendations to only include bags from the selected product type
      const productTypeBagNames = new Set(productTypeBags.map(bag => bag.Bag_Name));
      filteredRecommendations = recommendations.filter(rec => 
        productTypeBagNames.has(rec.bag_name)
      );
      
      // If no filtered recommendations, fall back to all recommendations
      if (filteredRecommendations.length === 0) {
        filteredRecommendations = recommendations;
      }
    }

    // Use the data service method for better deduplication
    const uniqueRecommendations = this.dataService.getUniqueBagsByArtwork(
      filteredRecommendations.map(rec => ({
        Bag_Name: rec.bag_name,
        Personality_Description: rec.personality_alignment,
        Product_Link: rec.product_link
      }))
    );

    // Limit to 5-10 unique products for better variety
    const limitedRecommendations = uniqueRecommendations.slice(0, 8);

    // Convert back to recommendation format
    filteredRecommendations = limitedRecommendations.map(bag => {
      const originalRec = filteredRecommendations.find(rec => rec.bag_name === bag.Bag_Name);
      return originalRec || {
        bag_name: bag.Bag_Name,
        reasoning: 'Recommended based on your personality and product type',
        style_match: 'Perfect match for your style',
        personality_alignment: bag.Personality_Description,
        product_link: bag.Product_Link,
        price_range: '$50-$200',
        brand_info: 'Premium leather goods',
        material_details: 'Genuine leather',
        color_options: 'Multiple colors available',
        occasion_suitability: 'Versatile for any occasion'
      };
    });

    console.log(`🎯 Final filtered recommendations: ${filteredRecommendations.length}`);

    // Enhance recommendations with artwork data
    const enhancedRecommendations = filteredRecommendations.map(rec => {
      const artworkDetails = this.dataService.findProductDetails(rec.bag_name);
      return {
        ...rec,
        image_url: artworkDetails?.Image_URL || 'https://via.placeholder.com/300x300?text=Bag+Image',
        artwork_name: artworkDetails?.Artwork_Name || '',
        product_url: artworkDetails?.Product_URL || rec.product_link
      };
    });

    // Get artwork insights
    const artworkInsights = this.dataService.getArtworkByPersonality(personality_analysis.predicted_personality);

    // Calculate session duration
    const sessionDuration = Date.now() - session.timestamp.getTime();

    return {
      personality_analysis,
      recommendations: enhancedRecommendations,
      artwork_insights: artworkInsights,
      total_questions_answered: session.answers.length,
      session_duration: sessionDuration
    };
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
  }

  getSession(sessionId: string): UserSession | null {
    return this.userSessions.get(sessionId) || null;
  }

  cleanupOldSessions(maxAge: number = 24 * 60 * 60 * 1000): void {
    const now = Date.now();
    for (const [sessionId, session] of this.userSessions.entries()) {
      if (now - session.timestamp.getTime() > maxAge) {
        this.userSessions.delete(sessionId);
      }
    }
  }

  getQuestions(): Question[] {
    return this.dataService.getQuestions();
  }

  async processEnhancedQuiz(answers: Array<{ question: string; selected_personality: string }>, questions: Question[]): Promise<{ success: boolean; sessionId?: string; result?: QuizResult; error?: string }> {
    try {
      // Create a new session for this quiz
      const session = this.createSession();
      
      // Process answers and generate results
      const result = await this.generateResult(session.sessionId);
      
      return {
        success: true,
        sessionId: session.sessionId,
        result
      };
    } catch (error) {
      console.error('Error processing enhanced quiz:', error);
      return {
        success: false,
        error: 'Failed to process quiz'
      };
    }
  }
} 