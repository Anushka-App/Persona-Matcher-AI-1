"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PersonalityQuizService = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
class PersonalityQuizService {
    constructor() {
        this.questions = [];
        this.userSessions = new Map();
        this.loadQuestions();
    }
    loadQuestions() {
        try {
            const csvPath = path_1.default.join(process.cwd(), 'public', 'updated_ml_bags_personality_dataset_cleaned.csv');
            const csvContent = fs_1.default.readFileSync(csvPath, 'utf-8');
            this.questions = this.parseCSV(csvContent);
            console.log(`Loaded ${this.questions.length} questions from CSV`);
        }
        catch (error) {
            console.error('Failed to load questions from CSV:', error);
            this.questions = this.getSampleQuestions();
        }
    }
    parseCSV(csvText) {
        const lines = csvText.split('\n');
        const questions = [];
        for (let i = 1; i < lines.length; i++) {
            const line = lines[i];
            if (!line.trim())
                continue;
            const values = this.parseCSVLine(line);
            if (values.length >= 13) {
                const question = {
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
    parseCSVLine(line) {
        const result = [];
        let current = '';
        let inQuotes = false;
        for (let i = 0; i < line.length; i++) {
            const char = line[i];
            if (char === '"') {
                inQuotes = !inQuotes;
            }
            else if (char === ',' && !inQuotes) {
                result.push(current.trim());
                current = '';
            }
            else {
                current += char;
            }
        }
        result.push(current.trim());
        return result;
    }
    getSampleQuestions() {
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
    getFirstQuestion() {
        const sessionId = this.generateSessionId();
        const question = this.getRandomQuestion();
        this.userSessions.set(sessionId, {
            sessionId,
            askedQuestions: [question.Question],
            answers: []
        });
        return { sessionId, question };
    }
    getNextQuestion(sessionId, selectedPersonality) {
        const session = this.userSessions.get(sessionId);
        if (!session)
            throw new Error("Invalid session ID");
        session.answers.push(selectedPersonality);
        const filteredQuestions = this.filterQuestionsByPersonality(selectedPersonality, session.askedQuestions);
        if (filteredQuestions.length === 0) {
            const randomQuestion = this.getRandomQuestion(session.askedQuestions);
            if (randomQuestion) {
                session.askedQuestions.push(randomQuestion.Question);
                return randomQuestion;
            }
            return null;
        }
        const selectedQuestion = filteredQuestions[Math.floor(Math.random() * filteredQuestions.length)];
        session.askedQuestions.push(selectedQuestion.Question);
        return selectedQuestion;
    }
    filterQuestionsByPersonality(personality, excludeQuestions) {
        return this.questions.filter(question => {
            const hasPersonality = [
                question.Option_1_Personality,
                question.Option_2_Personality,
                question.Option_3_Personality,
                question.Option_4_Personality
            ].includes(personality);
            const notAsked = !excludeQuestions.includes(question.Question);
            return hasPersonality && notAsked;
        });
    }
    getRandomQuestion(excludeQuestions = []) {
        const availableQuestions = this.questions.filter(question => !excludeQuestions.includes(question.Question));
        if (availableQuestions.length === 0)
            return null;
        return availableQuestions[Math.floor(Math.random() * availableQuestions.length)];
    }
    generateSessionId() {
        return Math.random().toString(36).substring(2, 15);
    }
    getUserSession(sessionId) {
        return this.userSessions.get(sessionId) || null;
    }
    getPersonalityPrediction(answers) {
        const personalityCounts = {};
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
    getAllQuestions() {
        return this.questions;
    }
}
exports.PersonalityQuizService = PersonalityQuizService;
