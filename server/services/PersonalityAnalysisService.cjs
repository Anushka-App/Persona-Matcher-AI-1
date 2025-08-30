"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PersonalityAnalysisService = void 0;
const PersonalityGeminiService_1 = require("./PersonalityGeminiService.cjs");
const PersonalityDataService_1 = require("./PersonalityDataService.cjs");
class PersonalityAnalysisService {
    constructor() {
        this.userSessions = new Map();
        this.dataService = new PersonalityDataService_1.PersonalityDataService();
        this.geminiService = new PersonalityGeminiService_1.PersonalityGeminiService(this.dataService);
    }
    async initialize() {
        await this.dataService.loadAllData();
    }
    createSession() {
        const sessionId = this.generateSessionId();
        const session = {
            sessionId,
            askedQuestions: [],
            answers: [],
            productType: undefined,
            timestamp: new Date()
        };
        this.userSessions.set(sessionId, session);
        return session;
    }
    getProductTypeQuestion() {
        return this.dataService.getProductTypeQuestion();
    }
    setProductType(sessionId, productType) {
        const session = this.userSessions.get(sessionId);
        if (!session)
            throw new Error('Invalid session ID');
        session.productType = productType;
    }
    getRandomQuestion(excludeQuestions = []) {
        const questions = this.dataService.getQuestions();
        const availableQuestions = questions.filter(q => !excludeQuestions.includes(q.Question));
        if (availableQuestions.length === 0)
            return null;
        return availableQuestions[Math.floor(Math.random() * availableQuestions.length)];
    }
    getNextQuestion(sessionId, selectedPersonality) {
        const session = this.userSessions.get(sessionId);
        if (!session)
            throw new Error('Invalid session ID');
        session.answers.push(selectedPersonality);
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
        }
        else {
            const availableQuestions = questions.filter(q => !session.askedQuestions.includes(q.Question));
            if (availableQuestions.length === 0)
                return null;
            nextQuestion = availableQuestions[Math.floor(Math.random() * availableQuestions.length)];
        }
        session.askedQuestions.push(nextQuestion.Question);
        return nextQuestion;
    }
    async generateResult(sessionId) {
        const session = this.userSessions.get(sessionId);
        if (!session || session.answers.length === 0) {
            throw new Error('Invalid session or no answers');
        }
        const userAnswers = session.askedQuestions.map((question, index) => ({
            question,
            selected_personality: session.answers[index]
        }));
        const availableBags = this.dataService.getBags();
        const personalityTypes = this.dataService.getPersonalityTypes();
        const artworkData = this.dataService.getArtworkData();
        const { personality_analysis, recommendations } = await this.geminiService.analyzePersonalityAndRecommend(userAnswers, availableBags, personalityTypes, artworkData);
        let filteredRecommendations = recommendations;
        if (session.productType) {
            const productTypeBags = this.dataService.getBagsByPersonalityAndProductType(personality_analysis.predicted_personality, session.productType);
            const productTypeBagNames = new Set(productTypeBags.map(bag => bag.Bag_Name));
            filteredRecommendations = recommendations.filter(rec => productTypeBagNames.has(rec.bag_name));
            if (filteredRecommendations.length === 0) {
                filteredRecommendations = recommendations;
            }
        }
        const uniqueRecommendations = this.dataService.getUniqueBagsByArtwork(filteredRecommendations.map(rec => ({
            Bag_Name: rec.bag_name,
            Personality_Description: rec.personality_alignment,
            Product_Link: rec.product_link
        })));
        const limitedRecommendations = uniqueRecommendations.slice(0, 8);
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
        const enhancedRecommendations = filteredRecommendations.map(rec => {
            const artworkDetails = this.dataService.findProductDetails(rec.bag_name);
            return {
                ...rec,
                image_url: artworkDetails?.Image_URL || 'https://via.placeholder.com/300x300?text=Bag+Image',
                artwork_name: artworkDetails?.Artwork_Name || '',
                product_url: artworkDetails?.Product_URL || rec.product_link
            };
        });
        const artworkInsights = this.dataService.getArtworkByPersonality(personality_analysis.predicted_personality);
        const sessionDuration = Date.now() - session.timestamp.getTime();
        return {
            personality_analysis,
            recommendations: enhancedRecommendations,
            artwork_insights: artworkInsights,
            total_questions_answered: session.answers.length,
            session_duration: sessionDuration
        };
    }
    generateSessionId() {
        return `session_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
    }
    getSession(sessionId) {
        return this.userSessions.get(sessionId) || null;
    }
    cleanupOldSessions(maxAge = 24 * 60 * 60 * 1000) {
        const now = Date.now();
        for (const [sessionId, session] of this.userSessions.entries()) {
            if (now - session.timestamp.getTime() > maxAge) {
                this.userSessions.delete(sessionId);
            }
        }
    }
    getQuestions() {
        return this.dataService.getQuestions();
    }
    async processEnhancedQuiz(answers, questions) {
        try {
            const session = this.createSession();
            const result = await this.generateResult(session.sessionId);
            return {
                success: true,
                sessionId: session.sessionId,
                result
            };
        }
        catch (error) {
            console.error('Error processing enhanced quiz:', error);
            return {
                success: false,
                error: 'Failed to process quiz'
            };
        }
    }
}
exports.PersonalityAnalysisService = PersonalityAnalysisService;
