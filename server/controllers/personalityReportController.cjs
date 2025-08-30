"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PersonalityReportController = void 0;
const PersonalityReportService_1 = require("../services/PersonalityReportService");
const LLMService_1 = require("../services/LLMService");
class PersonalityReportController {
    constructor() {
        const llmService = new LLMService_1.LLMService(process.env.GEMINI_API_KEY || '');
        this.personalityReportService = new PersonalityReportService_1.PersonalityReportService(llmService);
    }
    async generateReport(req, res) {
        try {
            const userInput = req.body;
            if (!this.validateUserInput(userInput)) {
                res.status(400).json({
                    success: false,
                    error: 'Missing required fields. Please provide: name, hobbies, communication_style, favorite_books_movies, strengths, weaknesses'
                });
                return;
            }
            const report = await this.personalityReportService.generatePersonalityReport(userInput);
            res.status(200).json({
                success: true,
                data: report,
                message: 'Personality report generated successfully'
            });
        }
        catch (error) {
            console.error('Error in generateReport controller:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to generate personality report',
                details: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }
    async generateReportFromQuiz(req, res) {
        try {
            const { quizAnswers, userInfo } = req.body;
            if (!quizAnswers || !userInfo) {
                res.status(400).json({
                    success: false,
                    error: 'Missing quiz answers or user information'
                });
                return;
            }
            const userInput = this.convertQuizToPersonalityInput(quizAnswers, userInfo);
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
        }
        catch (error) {
            console.error('Error in generateReportFromQuiz controller:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to generate personality report from quiz',
                details: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }
    async getReportTemplate(req, res) {
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
        }
        catch (error) {
            console.error('Error in getReportTemplate controller:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to retrieve report template'
            });
        }
    }
    validateUserInput(userInput) {
        if (!userInput || typeof userInput !== 'object' || userInput === null) {
            return false;
        }
        const input = userInput;
        return (typeof input.name === 'string' &&
            Array.isArray(input.hobbies) &&
            input.hobbies.length > 0 &&
            typeof input.communication_style === 'string' &&
            Array.isArray(input.favorite_books_movies) &&
            input.favorite_books_movies.length > 0 &&
            Array.isArray(input.strengths) &&
            input.strengths.length > 0 &&
            Array.isArray(input.weaknesses) &&
            input.weaknesses.length > 0);
    }
    convertQuizToPersonalityInput(quizAnswers, userInfo) {
        const personalityTraits = this.analyzeQuizAnswers(quizAnswers);
        return {
            name: userInfo.name || 'User',
            hobbies: personalityTraits.hobbies || ['personal interests'],
            communication_style: personalityTraits.communicationStyle || 'adaptive',
            favorite_books_movies: personalityTraits.mediaPreferences || ['various genres'],
            strengths: personalityTraits.strengths || ['adaptability'],
            weaknesses: personalityTraits.weaknesses || ['areas for growth']
        };
    }
    analyzeQuizAnswers(quizAnswers) {
        const analysis = {
            hobbies: [],
            communicationStyle: '',
            mediaPreferences: [],
            strengths: [],
            weaknesses: []
        };
        quizAnswers.forEach(answer => {
            if (answer.question && answer.selected_personality) {
                const question = answer.question.toLowerCase();
                const personality = answer.selected_personality.toLowerCase();
                if (question.includes('hobby') || question.includes('activity') || question.includes('free time')) {
                    analysis.hobbies.push(personality);
                }
                if (question.includes('communication') || question.includes('speak') || question.includes('express')) {
                    analysis.communicationStyle = personality;
                }
                if (question.includes('book') || question.includes('movie') || question.includes('entertainment')) {
                    analysis.mediaPreferences.push(personality);
                }
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
    extractPersonalityInsights(quizAnswers) {
        const insights = {
            dominantTraits: [],
            communicationPatterns: [],
            lifestylePreferences: [],
            growthAreas: []
        };
        const traitCounts = {};
        quizAnswers.forEach(answer => {
            if (answer.selected_personality) {
                const trait = answer.selected_personality;
                traitCounts[trait] = (traitCounts[trait] || 0) + 1;
            }
        });
        insights.dominantTraits = Object.entries(traitCounts)
            .filter(([_, count]) => count > 1)
            .sort(([_, a], [__, b]) => b - a)
            .map(([trait, _]) => trait);
        const communicationAnswers = quizAnswers.filter(answer => answer.question?.toLowerCase().includes('communication') ||
            answer.question?.toLowerCase().includes('speak') ||
            answer.question?.toLowerCase().includes('express'));
        insights.communicationPatterns = communicationAnswers.map(answer => ({
            question: answer.question,
            style: answer.selected_personality
        }));
        const lifestyleAnswers = quizAnswers.filter(answer => answer.question?.toLowerCase().includes('hobby') ||
            answer.question?.toLowerCase().includes('activity') ||
            answer.question?.toLowerCase().includes('lifestyle'));
        insights.lifestylePreferences = lifestyleAnswers.map(answer => ({
            preference: answer.selected_personality,
            context: answer.question
        }));
        const growthAnswers = quizAnswers.filter(answer => answer.question?.toLowerCase().includes('improve') ||
            answer.question?.toLowerCase().includes('challenge') ||
            answer.question?.toLowerCase().includes('weakness'));
        insights.growthAreas = growthAnswers.map(answer => ({
            area: answer.selected_personality,
            context: answer.question
        }));
        return insights;
    }
}
exports.PersonalityReportController = PersonalityReportController;
