"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const zod_1 = require("zod");
const node_fetch_1 = __importDefault(require("node-fetch"));
const enhanced_personality_loader_1 = __importDefault(require("./enhanced-personality-loader.cjs"));
const router = express_1.default.Router();
const QuizAnswerSchema = zod_1.z.object({
    answers: zod_1.z.record(zod_1.z.string()),
    questions: zod_1.z.array(zod_1.z.object({
        id: zod_1.z.number(),
        category: zod_1.z.string()
    }))
});
let isDatasetLoaded = false;
async function ensureDatasetLoaded() {
    if (!isDatasetLoaded) {
        await enhanced_personality_loader_1.default.loadAllDatasets();
        isDatasetLoaded = true;
    }
}
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || 'hardcoded_gemini_api_key_here';
async function analyzeWithLLM(answers) {
    await ensureDatasetLoaded();
    const baseAnalysis = enhanced_personality_loader_1.default.analyzePersonality(answers);
    if (GEMINI_API_KEY && GEMINI_API_KEY !== 'hardcoded_gemini_api_key_here') {
        try {
            const answersText = Object.entries(answers)
                .map(([question, answer]) => `Question: ${question}\nAnswer: ${answer}`)
                .join('\n\n');
            const personalityData = enhanced_personality_loader_1.default.getPersonalityType(baseAnalysis.personalityType);
            const personalityDescription = personalityData?.description || baseAnalysis.description;
            const matchedBags = baseAnalysis.matchedBags.map(bag => `${bag.name}: ${bag.reason}`).join('\n');
            const matchedArtwork = baseAnalysis.matchedArtwork.map(art => `${art.name}: ${art.personalityDescription}`).join('\n');
            const llmPrompt = `Based on the following personality quiz responses and comprehensive analysis, provide an enhanced, detailed personality analysis:

QUIZ RESPONSES:
${answersText}

PERSONALITY TYPE: ${baseAnalysis.personalityType}
DESCRIPTION: ${personalityDescription}

MATCHED BAGS:
${matchedBags}

MATCHED ARTWORK PRODUCTS:
${matchedArtwork}

PERSONALITY TRAITS: ${baseAnalysis.strengths.join(', ')}

Please provide an enhanced analysis including:

1. PERSONALITY INSIGHTS: Deep insights about the person's character, motivations, and behavioral patterns based on their quiz responses
2. STYLE ANALYSIS: How their personality translates into fashion and accessory preferences, including specific style recommendations
3. LIFESTYLE RECOMMENDATIONS: Specific lifestyle and style advice based on their personality type
4. PRODUCT MATCHING: Detailed explanation of why the matched products and artwork suit their personality
5. PERSONAL GROWTH: Suggestions for embracing and enhancing their unique traits
6. ARTWORK CONNECTION: How the artwork products reflect their personality and style preferences

Format the response as a detailed, engaging analysis that feels personal and insightful. Focus on the connection between their quiz answers and their personality traits, and how this influences their style choices.

Make it conversational, warm, and encouraging. Include specific references to the matched products and artwork.`;
            const response = await (0, node_fetch_1.default)(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: llmPrompt }] }],
                    generationConfig: {
                        temperature: 0.7,
                        maxOutputTokens: 1500,
                        topP: 0.8
                    }
                })
            });
            if (response.ok) {
                const data = await response.json();
                const llmAnalysis = data.candidates?.[0]?.content?.parts?.[0]?.text;
                if (llmAnalysis) {
                    return {
                        ...baseAnalysis,
                        detailedAnalysis: llmAnalysis,
                        llmInsights: llmAnalysis,
                        insights: extractInsightsFromLLM(llmAnalysis),
                        recommendations: extractRecommendationsFromLLM(llmAnalysis),
                        styleRecommendations: extractStyleRecommendationsFromLLM(llmAnalysis),
                        lifestyleAdvice: extractLifestyleAdviceFromLLM(llmAnalysis)
                    };
                }
            }
        }
        catch (error) {
            console.error('LLM analysis error:', error);
        }
    }
    return baseAnalysis;
}
function extractInsightsFromLLM(llmResponse) {
    const insights = [];
    const lines = llmResponse.split('\n');
    let inInsightsSection = false;
    for (const line of lines) {
        if (line.toLowerCase().includes('insight') || line.toLowerCase().includes('personality')) {
            inInsightsSection = true;
            continue;
        }
        if (inInsightsSection && line.trim().startsWith('-')) {
            insights.push(line.trim().substring(1).trim());
        }
        if (inInsightsSection && line.trim() === '') {
            break;
        }
    }
    return insights.length > 0 ? insights : [
        'Your unique personality shines through in your choices',
        'You have a natural ability to express your individuality',
        'Your distinctive style reflects your inner confidence'
    ];
}
function extractRecommendationsFromLLM(llmResponse) {
    const recommendations = [];
    const lines = llmResponse.split('\n');
    let inRecommendationsSection = false;
    for (const line of lines) {
        if (line.toLowerCase().includes('recommendation') || line.toLowerCase().includes('advice')) {
            inRecommendationsSection = true;
            continue;
        }
        if (inRecommendationsSection && line.trim().startsWith('-')) {
            recommendations.push(line.trim().substring(1).trim());
        }
        if (inRecommendationsSection && line.trim() === '') {
            break;
        }
    }
    return recommendations.length > 0 ? recommendations : [
        'Choose accessories that reflect your unique personality',
        'Embrace designs that showcase your individuality',
        'Select pieces that make you feel confident and authentic'
    ];
}
function extractStyleRecommendationsFromLLM(llmResponse) {
    const styleRecommendations = [];
    const lines = llmResponse.split('\n');
    let inStyleSection = false;
    for (const line of lines) {
        if (line.toLowerCase().includes('style') || line.toLowerCase().includes('fashion')) {
            inStyleSection = true;
            continue;
        }
        if (inStyleSection && line.trim().startsWith('-')) {
            styleRecommendations.push(line.trim().substring(1).trim());
        }
        if (inStyleSection && line.trim() === '') {
            break;
        }
    }
    return styleRecommendations.length > 0 ? styleRecommendations : [
        'Choose pieces that reflect your unique style preferences',
        'Opt for versatile designs that adapt to different occasions',
        'Embrace quality materials that enhance your confidence'
    ];
}
function extractLifestyleAdviceFromLLM(llmResponse) {
    const lifestyleAdvice = [];
    const lines = llmResponse.split('\n');
    let inLifestyleSection = false;
    for (const line of lines) {
        if (line.toLowerCase().includes('lifestyle') || line.toLowerCase().includes('life')) {
            inLifestyleSection = true;
            continue;
        }
        if (inLifestyleSection && line.trim().startsWith('-')) {
            lifestyleAdvice.push(line.trim().substring(1).trim());
        }
        if (inLifestyleSection && line.trim() === '') {
            break;
        }
    }
    return lifestyleAdvice.length > 0 ? lifestyleAdvice : [
        'Embrace your unique personality in all aspects of life',
        'Surround yourself with people and things that inspire you',
        'Stay true to your authentic self while growing and evolving'
    ];
}
router.post('/api/enhanced-personality-quiz', async (req, res) => {
    try {
        const validatedData = QuizAnswerSchema.parse(req.body);
        const result = await analyzeWithLLM(validatedData.answers);
        res.json(result);
    }
    catch (error) {
        console.error('Error processing enhanced personality quiz:', error);
        res.status(400).json({
            error: 'Invalid request data',
            details: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
router.get('/api/enhanced-personality-quiz/questions', async (req, res) => {
    try {
        console.log('Loading enhanced quiz questions...');
        await ensureDatasetLoaded();
        console.log('Enhanced dataset loaded successfully');
        const questions = enhanced_personality_loader_1.default.getAllQuestions();
        console.log(`Retrieved ${questions.length} questions`);
        res.json({ questions });
    }
    catch (error) {
        console.error('Error loading enhanced quiz questions:', error);
        res.status(500).json({
            error: 'Failed to load enhanced quiz questions',
            details: error instanceof Error ? error.message : 'Unknown error',
            stack: error instanceof Error ? error.stack : undefined
        });
    }
});
router.post('/api/enhanced-personality-quiz/loading-images', async (req, res) => {
    try {
        const { answers } = req.body;
        if (!answers || Object.keys(answers).length === 0) {
            const defaultImages = [
                { url: '/api/placeholder/200/200?text=Creative+Visionary', name: 'Creative Visionary' },
                { url: '/api/placeholder/200/200?text=Analytical+Mind', name: 'Analytical Mind' },
                { url: '/api/placeholder/200/200?text=Empathetic+Soul', name: 'Empathetic Soul' },
                { url: '/api/placeholder/200/200?text=Dynamic+Leader', name: 'Dynamic Leader' },
                { url: '/api/placeholder/200/200?text=Practical+Realist', name: 'Practical Realist' },
                { url: '/api/placeholder/200/200?text=Social+Connector', name: 'Social Connector' }
            ];
            return res.json({ images: defaultImages });
        }
        await ensureDatasetLoaded();
        const analysis = enhanced_personality_loader_1.default.analyzePersonality(answers);
        const personalityType = enhanced_personality_loader_1.default.getPersonalityType(analysis.personalityType);
        if (!personalityType) {
            return res.json({ images: [] });
        }
        const relevantBags = personalityType.bags.slice(0, 3);
        const relevantArtwork = personalityType.artworkProducts.slice(0, 3);
        const images = [];
        relevantBags.forEach(bag => {
            const personalityColors = {
                'Savannah Spirit': { bg: 'orange', fg: 'white' },
                'Enchanted Rose': { bg: 'pink', fg: 'white' },
                'Retro Muse': { bg: 'purple', fg: 'white' },
                'Roaring Majesty': { bg: 'red', fg: 'white' },
                'Dreamscape Urbanite': { bg: 'blue', fg: 'white' },
                'Wolf Moon': { bg: 'gray', fg: 'white' },
                'Metamorph Muse': { bg: 'green', fg: 'white' },
                'Flutter Charm': { bg: 'yellow', fg: 'black' },
                'Caribbean Dreamer': { bg: 'teal', fg: 'white' },
                'Crimson Blossom': { bg: 'crimson', fg: 'white' }
            };
            const colors = personalityColors[analysis.personalityType] || { bg: 'purple', fg: 'white' };
            const imageUrl = `/api/placeholder/200/200?text=${encodeURIComponent(bag.name)}&bg=${colors.bg}&fg=${colors.fg}`;
            images.push({
                url: imageUrl,
                name: bag.name,
                productLink: bag.link,
                personalityType: analysis.personalityType,
                type: 'bag'
            });
        });
        relevantArtwork.forEach(art => {
            const imageUrl = art.imageUrl || `/api/placeholder/200/200?text=${encodeURIComponent(art.name)}&bg=purple&fg=white`;
            images.push({
                url: imageUrl,
                name: art.name,
                productLink: art.link,
                personalityType: analysis.personalityType,
                type: 'artwork',
                artworkName: art.artworkName,
                price: art.price
            });
        });
        if (images.length < 6) {
            const personalityImages = [
                { url: `/api/placeholder/200/200?text=${encodeURIComponent(analysis.personalityType)}`, name: analysis.personalityType },
                { url: `/api/placeholder/200/200?text=Style+Analysis`, name: 'Style Analysis' },
                { url: `/api/placeholder/200/200?text=Personal+Insights`, name: 'Personal Insights' },
                { url: `/api/placeholder/200/200?text=Perfect+Matches`, name: 'Perfect Matches' }
            ];
            images.push(...personalityImages.slice(0, 12 - images.length).map(img => ({
                ...img,
                productLink: 'https://anuschkaleather.in/collections/all',
                personalityType: analysis.personalityType,
                type: 'personality'
            })));
        }
        res.json({ images });
    }
    catch (error) {
        console.error('Error getting enhanced loading images:', error);
        res.status(500).json({
            error: 'Failed to get enhanced loading images',
            details: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
router.get('/api/enhanced-personality-quiz/personality-types', async (req, res) => {
    try {
        await ensureDatasetLoaded();
        const personalityTypes = enhanced_personality_loader_1.default.getPersonalityTypes();
        res.json({ personalityTypes });
    }
    catch (error) {
        console.error('Error loading personality types:', error);
        res.status(500).json({
            error: 'Failed to load personality types',
            details: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
router.get('/api/placeholder/:width/:height', (req, res) => {
    const { width, height, text, bg, fg } = req.query;
    const w = parseInt(width) || 200;
    const h = parseInt(height) || 200;
    const displayText = text || 'Product';
    const backgroundColor = bg || 'purple';
    const foregroundColor = fg || 'white';
    const svg = `
    <svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="${backgroundColor}"/>
      <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="${Math.min(w, h) / 8}" 
            fill="${foregroundColor}" text-anchor="middle" dy=".3em">
        ${displayText.replace(/\+/g, ' ')}
      </text>
    </svg>
  `;
    res.setHeader('Content-Type', 'image/svg+xml');
    res.setHeader('Cache-Control', 'public, max-age=3600');
    res.send(svg);
});
router.get('/api/enhanced-personality-quiz/health', (req, res) => {
    res.json({
        status: 'healthy',
        message: 'Enhanced personality quiz API is running',
        datasetLoaded: isDatasetLoaded
    });
});
exports.default = router;
