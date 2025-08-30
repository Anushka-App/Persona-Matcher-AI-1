import dotenv from 'dotenv';
dotenv.config();

import express, { Request, Response } from 'express';
import fetch from 'node-fetch';
import multer from 'multer';
import cors from 'cors';
import path from 'path';
import { existsSync, readdirSync, statSync } from 'fs';
import cookieParser from 'cookie-parser';
import { loadProducts } from './data-loader';
import { getStyleKeywords, findMatchingProducts } from './recommender';
import { Product } from './types';
import { findPersonaForArtwork, artworkPersonaMappings } from './artwork-persona-mapping';
import { loadArtworkPersonalityDescriptions, getArtworkPersonality } from './artwork-personality-descriptions';
import { PersonalityQuizService } from './personality-quiz-service';
import { PersonalityAnalysisService } from './services/PersonalityAnalysisService';

import { DatabaseService } from './services/DatabaseService';
import { ArtworkPersonalityService } from './services/ArtworkPersonalityService';
import { PersonalityReportCSVService } from './services/PersonalityReportCSVService';
import UserService from './services/UserService';
import { LLMService } from './services/LLMService';
import { FashionRecommendationService } from './services/FashionRecommendationService';
// Removed strictFilter import as it's not needed

const app = express();
// For Render deployment, use their PORT, otherwise default to 8000
// Render automatically sets PORT environment variable
const PORT = parseInt(process.env.PORT || '8000', 10);
const isProduction = process.env.NODE_ENV === 'production';

// Log the actual port being used
console.log(`🔧 Server configured to use port: ${PORT}`);
console.log(`🔧 Environment: ${isProduction ? 'Production' : 'Development'}`);
console.log(`🔧 Process.env.PORT: ${process.env.PORT || 'Not set (using default 8000)'}`);

// Read Gemini API key, fall back to hard-coded value
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || 'hardcoded_gemini_api_key_here';

// Debug logging for API key
console.log(`🔑 Gemini API Key Status: ${GEMINI_API_KEY ? 'Present' : 'Missing'}`);
console.log(`🔑 Gemini API Key Value: ${GEMINI_API_KEY ? GEMINI_API_KEY.substring(0, 10) + '...' : 'Not set'}`);
console.log(`🔑 Will use LLM: ${GEMINI_API_KEY && GEMINI_API_KEY !== 'hardcoded_gemini_api_key_here' ? 'YES' : 'NO'}`);
console.log(`🔑 Environment variables:`, {
    NODE_ENV: process.env.NODE_ENV,
    GEMINI_API_KEY: process.env.GEMINI_API_KEY ? 'Set' : 'Not set'
});

// Configure CORS for frontend-backend communication
app.use(cors({
    origin: process.env.NODE_ENV === 'production'
        ? ['https://persona-matcher-ai-1.onrender.com', 'https://persona-matcher-ai-1.vercel.app']
        : ['http://localhost:3001', 'http://localhost:3000', 'http://127.0.0.1:3001'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));
app.use(express.json());
app.use(cookieParser());
// Configure multer for multipart form-data (image uploads)
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB limit
        files: 1 // Only allow 1 file
    },
    fileFilter: (req, file, cb) => {
        // Accept only image files
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed'));
        }
    }
});

// Serve static files from the built React app
const distPath = path.join(process.cwd(), 'dist');
const publicPath = path.join(process.cwd(), 'public');
console.log(`📁 Serving static files from: ${distPath}`);
console.log(`📁 Dist folder exists: ${existsSync(distPath)}`);
console.log(`📁 Public folder exists: ${existsSync(publicPath)}`);

if (existsSync(distPath)) {
    app.use(express.static(distPath));
    console.log('✅ Dist static files middleware configured');
} else {
    console.log('❌ Dist folder not found - static files not served');
}

// Serve static files from public directory for development
if (existsSync(publicPath)) {
    app.use(express.static(publicPath));
    console.log('✅ Public static files middleware configured');
} else {
    console.log('❌ Public folder not found - public files not served');
}

// API status endpoint
app.get('/api/status', (_req, res) => {
    res.json({
        status: 'Recommender API running',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development',
        port: PORT,
        distPath: distPath,
        distExists: existsSync(distPath)
    });
});

// Health endpoint for frontend connection status
app.get('/api/health', (_req, res) => {
    const memUsage = process.memoryUsage();
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        memory: {
            heapUsed: memUsage.heapUsed,
            heapTotal: memUsage.heapTotal,
            external: memUsage.external,
            rss: memUsage.rss
        },
        environment: process.env.NODE_ENV || 'development',
        version: '2.0'
    });
});

// Lightweight health check for development
app.get('/healthz', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});









async function startServer() {
    try {
        // Initialize services first
        const personalityQuizService = new PersonalityQuizService();
        const personalityAnalysisService = new PersonalityAnalysisService();
        const databaseService = new DatabaseService();
        const artworkPersonalityService = new ArtworkPersonalityService();
        const personalityReportCSVService = new PersonalityReportCSVService();
        const userService = new UserService();
        const llmService = new LLMService(GEMINI_API_KEY);

        // Initialize services
        try {
            console.log('🧠 Initializing personality analysis service...');
            await personalityAnalysisService.initialize();
            console.log('✅ Personality analysis service initialized');

            console.log('🗄️ Initializing database tables...');
            await databaseService.initializeTables();
            console.log('✅ Database tables initialized');

            console.log('🎨 Loading artwork personality data...');
            await artworkPersonalityService.loadArtworkPersonalityData();
            console.log('✅ Artwork personality data loaded');
        } catch (error) {
            console.error('❌ Error initializing services:', error);
            // Continue with server startup even if some services fail
        }

        const productDatabase: Product[] = await loadProducts();
        console.log(`Loaded ${productDatabase.length} products into memory.`);

        // Initialize Fashion Recommendation Service
        const fashionRecommendationService = new FashionRecommendationService(llmService, productDatabase);
        console.log('✅ Fashion Recommendation Service initialized');

        // Load artwork personality descriptions
        const artworkDescriptions = await loadArtworkPersonalityDescriptions();
        console.log(`Loaded ${artworkDescriptions.size} artwork personality descriptions.`);

        // Helper function for fallback alternatives
        const getFallbackAlternatives = (artworkTheme: string): string[] => {
            const themeMap: Record<string, string[]> = {
                'animal': ['crossbody', 'satchel', 'hobo'],
                'flowers/plants': ['clutch', 'pouch', 'satchel'],
                'nature/landscape': ['crossbody', 'satchel', 'hobo'],
                'symbols/emblems': ['clutch', 'accessory', 'pouch'],
                'pattern/abstract': ['clutch', 'pouch', 'accessory'],
                'vehicles/transport': ['crossbody', 'satchel', 'hobo'],
                'food & drink': ['pouch', 'accessory', 'clutch'],
                'other (unspecified)': ['satchel', 'crossbody', 'pouch']
            };
            return themeMap[artworkTheme.toLowerCase()] || ['satchel', 'crossbody', 'pouch'];
        };

        // Helper function to clean personality traits
        const cleanPersonalityTraits = (traits: string): string => {
            if (!traits) return '';
            const lines = traits.split('\n').filter(line =>
                !line.includes('₹') &&
                !line.includes('Rs.') &&
                !line.includes('INR') &&
                !line.includes('Product Descriptions:') &&
                !line.match(/^\d+\./) &&
                line.trim().length > 0
            );
            const meaningfulContent = lines.join(' ').match(/"([^"]+)"/g);
            if (meaningfulContent && meaningfulContent.length > 0) {
                return meaningfulContent[0].replace(/"/g, '').substring(0, 200) + '...';
            }
            return lines.join(' ').substring(0, 150) + '...';
        };

        // Helper function to transform backend Product format to frontend Product format for compatibility
        const transformToFrontendFormat = async (product: {
            artworkName?: string;
            productName?: string;
            personalityTraits?: string;
            price?: string;
            imageUrl?: string;
            productUrl?: string;
            productType?: string;
        }) => {
            // Helper function to ensure absolute URLs
            const ensureAbsoluteUrl = (url: string, baseUrl: string = 'https://anuschka.com') => {
                if (!url) return `${baseUrl}/product-image1.png`;
                if (url.startsWith('http')) return url;
                if (url.startsWith('/')) return `${baseUrl}${url}`;
                return `${baseUrl}/${url}`;
            };

            // Get dynamic description using the service
            let description = '';
            try {
                // Priority 1: psychologicalAppeal from artwork personality service
                const artworkPersonality = product.artworkName ? artworkPersonalityService.getArtworkPersonality(product.artworkName) : null;
                if (artworkPersonality && typeof artworkPersonality === 'object' && artworkPersonality.psychologicalAppeal) {
                    const psychologicalAppeal = artworkPersonality.psychologicalAppeal;
                    if (psychologicalAppeal && typeof psychologicalAppeal === 'string' && psychologicalAppeal.trim()) {
                        description = psychologicalAppeal;
                    }
                }

                // Priority 2: LLM-generated personality-based description (if Gemini available)
                if (!description && GEMINI_API_KEY && GEMINI_API_KEY !== 'hardcoded_gemini_api_key_here') {
                    try {
                        console.log(`🤖 Generating LLM description for: ${product.artworkName} (${product.personalityTraits})`);
                        const personalityPrompt = `You are a fashion psychologist writing a personality-based description for a handbag.

Product details:
- Artwork Name: ${product.artworkName}
- Theme: ${product.personalityTraits}
- Product Type: ${product.productType}

Write exactly 3-4 sentences (3-5 lines) describing how this bag suits someone's personality and style. Focus on:
1. What type of person would be drawn to this artwork/theme
2. How it reflects their inner personality and lifestyle
3. Why it makes them feel confident and authentic

Requirements:
- Keep it to exactly 3-4 sentences
- Write in second person ("your", "you")
- Be personal and emotionally resonant
- Focus on personality traits, not product features
- Each sentence should be meaningful and distinct

Do not mention:
- Specific product names, prices, or materials
- Brand names or purchasing information
- Technical features or dimensions

Example style: "This design speaks to your adventurous spirit and love for nature's untamed beauty. Your appreciation for wildlife artistry reveals a bold, confident personality that values authenticity over conformity. Perfect for someone who embraces life's wild moments with grace and isn't afraid to stand out from the crowd."

Write in a warm, personal tone as if speaking directly to the person.`;

                        const descRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                contents: [{ parts: [{ text: personalityPrompt }] }],
                                generationConfig: {
                                    temperature: 0.8,
                                    maxOutputTokens: 200,
                                    candidateCount: 1,
                                    stopSequences: ["END"]
                                }
                            })
                        });

                        if (descRes.ok) {
                            const descData: any = await descRes.json();
                            const candidates = descData.candidates || [];
                            const llmDescription = candidates?.[0]?.content?.parts?.[0]?.text || '';
                            if (llmDescription && llmDescription.trim()) {
                                // Clean up the description
                                let cleanDesc = llmDescription.trim();
                                // Remove any quotes if they wrap the entire text
                                if (cleanDesc.startsWith('"') && cleanDesc.endsWith('"')) {
                                    cleanDesc = cleanDesc.slice(1, -1);
                                }
                                // Ensure it doesn't exceed reasonable length
                                if (cleanDesc.length > 500) {
                                    cleanDesc = cleanDesc.substring(0, 500) + '...';
                                }
                                description = cleanDesc;
                                console.log(`✅ LLM description generated: ${description.substring(0, 100)}...`);
                            } else {
                                console.log(`❌ LLM returned empty description for ${product.artworkName}`);
                            }
                        } else if (descRes.status === 429) {
                            console.log(`⚠️ LLM rate limit hit for ${product.artworkName}, using fallback`);
                        } else {
                            console.log(`❌ LLM request failed with status: ${descRes.status}`);
                        }
                    } catch (err) {
                        console.error('LLM description generation error:', err);
                    }
                }

                // Priority 3: Enhanced fallback descriptions with 3-4 lines
                if (!description) {
                    // Create a detailed 3-4 line personality description based on theme
                    const theme = product.personalityTraits?.toLowerCase() || '';
                    const artworkName = product.artworkName || 'this design';

                    if (theme.includes('animal')) {
                        description = `This ${artworkName} design speaks to your adventurous spirit and deep connection to nature's untamed beauty. Your appreciation for wildlife artistry reveals a bold, confident personality that values authenticity over conformity. Perfect for someone who embraces life's wild moments with grace and isn't afraid to stand out from the crowd. You see strength and freedom in nature's creatures and carry that energy with you.`;
                    } else if (theme.includes('flowers') || theme.includes('plants')) {
                        description = `This ${artworkName} collection resonates with your nurturing, creative soul and appreciation for life's delicate beauty. Your love for botanical elegance reflects a thoughtful spirit that finds joy in nature's quiet moments and gentle transformations. Ideal for someone who brings harmony and grace to every situation while maintaining an inner strength like blooming flowers. You understand that true beauty comes from growth and natural authenticity.`;
                    } else if (theme.includes('nature') || theme.includes('landscape')) {
                        description = `This ${artworkName} artwork speaks to your free-spirited, grounded nature and desire for balance in life's journey. Your connection to natural landscapes reveals a peaceful soul who values tranquility while embracing adventure and exploration. Perfect for someone who finds beauty in the world around them and seeks harmony between inner peace and outer discovery. You carry the calm confidence of someone who knows their place in the larger tapestry of life.`;
                    } else if (theme.includes('symbol') || theme.includes('emblem')) {
                        description = `This ${artworkName} design reflects your meaningful, intentional approach to life and appreciation for deeper significance. Your attraction to symbolic art reveals a thoughtful personality with inner wisdom and a desire for purpose in every choice. Ideal for someone who values tradition, meaning, and the stories that symbols tell across cultures and time. You understand that the most beautiful things often carry the deepest meanings.`;
                    } else if (theme.includes('abstract') || theme.includes('pattern')) {
                        description = `This ${artworkName} collection speaks to your creative, innovative spirit and appreciation for artistic expression beyond the ordinary. Your love for abstract beauty reveals a visionary personality who sees possibilities where others see patterns. Perfect for someone who thinks outside conventional boundaries and isn't afraid to express their unique perspective. You understand that art, like life, is about finding your own interpretation and meaning.`;
                    } else {
                        description = `This ${artworkName} collection speaks to your unique artistic sensibility and sophisticated appreciation for distinctive design. Your attraction to this style reveals a confident individual who values quality, creativity, and self-expression in every choice. Perfect for someone who understands that true style comes from within and isn't afraid to let their personality shine through their accessories. You carry yourself with the quiet confidence of someone who knows their own worth.`;
                    }
                }

                // Final fallback (should rarely be needed now)
                if (!description) {
                    description = `This beautiful ${product.artworkName} design reflects your unique personality and sophisticated taste. Perfect for someone who appreciates artistry and quality in their accessories. A timeless piece that speaks to your individual style.`;
                }
            } catch (error) {
                console.error('Error in getDynamicDescription:', error);
                description = `${product.artworkName} - Beautiful handcrafted bag with unique artwork that reflects your personality`;
            }

            return {
                id: `${product.artworkName || 'artwork'}-${product.productName || 'product'}-${Math.random().toString(36).substr(2, 6)}`,
                name: product.productName || product.artworkName || 'Anuschka Bag',
                artworkName: product.artworkName || product.productName || 'Anuschka Artwork',
                productName: product.productName || 'Anuschka Bag',
                personaName: product.artworkName || 'Anuschka Persona',
                personaDescription: product.personalityTraits || 'Beautiful handcrafted bag with unique artwork',
                price: product.price || '$150',
                image: ensureAbsoluteUrl(product.imageUrl || ''),
                link: ensureAbsoluteUrl(product.productUrl || '', 'https://anuschka.com/products'),
                productType: product.productType || 'Handbag',
                description: description,
                psychologicalAppeal: product.personalityTraits || 'This bag appeals to those who appreciate unique, artistic designs',
                artworkPersonality: product.artworkName || 'Anuschka Artwork'
            };
        };

        // Support GET /recommendations?description=... for quick testing
        app.get('/recommendations', async (req: Request, res: Response) => {
            const description = req.query.description;
            if (!description || typeof description !== 'string') {
                return res.status(400).json({ error: 'Missing or invalid "description" query parameter.' });
            }
            console.log(`🔍 GET /recommendations called with description: ${description}`);

            // Use simple keyword-based filtering for GET requests
            let matches: Product[] = [];
            const descriptionLower = description.toLowerCase();
            matches = productDatabase.filter(p => {
                const traitsLower = p.personalityTraits?.toLowerCase() || '';
                const artworkLower = p.artworkName?.toLowerCase() || '';
                const productLower = p.productName?.toLowerCase() || '';

                return traitsLower.includes(descriptionLower) ||
                    artworkLower.includes(descriptionLower) ||
                    productLower.includes(descriptionLower);
            });

            // If no matches, return some sample products
            if (matches.length === 0) {
                console.log('🔍 No keyword matches found, returning sample products');
                matches = productDatabase.slice(0, 12);
            }

            // Transform backend Product format to frontend Product format for compatibility
            console.log(`🔄 Transforming ${matches.length} products to frontend format...`);
            console.log(`🎨 Artwork personality service loaded: ${artworkPersonalityService ? 'YES' : 'NO'}`);
            console.log(`🎨 Artwork personality data count: ${artworkPersonalityService?.getAllArtworkData()?.length || 0}`);

            const frontendCompatibleRecommendations = await Promise.all(matches.map(async (product, index) => {
                try {
                    const transformed = await transformToFrontendFormat(product);
                    return transformed;
                } catch (error) {
                    console.error(`❌ Failed to transform product ${index}:`, product.artworkName, error);
                    // Return a fallback product if transformation fails
                    return {
                        id: product.artworkName || product.productName || Math.random().toString(36).substr(2, 9),
                        name: product.productName || product.artworkName || 'Anuschka Bag',
                        artworkName: product.artworkName || product.productName || 'Anuschka Artwork',
                        productName: product.productName || 'Anuschka Bag',
                        personaName: product.artworkName || 'Anuschka Persona',
                        personaDescription: product.personalityTraits || 'Beautiful handcrafted bag with unique artwork',
                        price: product.price || '$150',
                        image: 'https://anuschka.com/product-image1.png',
                        link: 'https://anuschka.com/products',
                        productType: product.productType || 'Handbag',
                        description: `${product.artworkName} - Beautiful handcrafted bag with unique artwork that reflects your personality`,
                        psychologicalAppeal: product.personalityTraits || 'This bag appeals to those who appreciate unique, artistic designs',
                        artworkPersonality: product.artworkName || 'Anuschka Artwork'
                    };
                }
            }));

            console.log(`✅ Successfully transformed ${frontendCompatibleRecommendations.length} products`);

            return res.json({ recommendations: frontendCompatibleRecommendations });
        });

        // POST /recommendations endpoint for frontend components
        app.post('/recommendations', async (req: Request, res: Response) => {
            try {
                console.log('🎯 POST /recommendations called');
                console.log('📝 Request body:', req.body);

                const { description, bagType, occasion, artworkTheme } = req.body;
                const file = (req as { file?: Express.Multer.File }).file;

                // Validate input
                if (!description && !file) {
                    console.log('❌ Missing both description and file');
                    return res.status(400).json({ error: 'Missing description or file' });
                }

                console.log(`✅ Valid request - Description: ${description}, BagType: ${bagType}, ArtworkTheme: ${artworkTheme}, Occasion: ${occasion}, File: ${file ? 'Present' : 'None'}`);

                // Map bag type to product type format used in Excel
                let bagPref = bagType || 'Bag';
                if (bagType === 'everyday') bagPref = 'Bag';
                if (bagType === 'tote') bagPref = 'Tote';
                if (bagType === 'crossbody') bagPref = 'Crossbody';
                if (bagType === 'pouch') bagPref = 'Pouch';
                if (bagType === 'techcase') bagPref = 'Case';
                if (bagType === 'hobo') bagPref = 'Hobo';

                console.log(`👜 Bag preference mapped: ${bagType} → ${bagPref}`);

                // Use the mapped persona artwork data for recommendations
                let matches: Product[] = [];

                // First, try to filter by both artwork theme and bag type if provided
                if (artworkTheme && bagPref) {
                    console.log(`🎨 Filtering by artwork theme: ${artworkTheme} and bag type: ${bagPref}`);
                    matches = productDatabase.filter(p => {
                        // Check artwork theme in the Themes field from Excel (exact matching)
                        let themeMatch = false;
                        const excelThemes = p.personalityTraits?.toLowerCase() || ''; // This is actually the Themes field from Excel
                        const artworkLower = p.artworkName?.toLowerCase() || '';

                        // Map frontend theme names to Excel theme values with strict matching
                        if (artworkTheme.toLowerCase() === 'animal') {
                            // First check Excel themes field
                            themeMatch = excelThemes.includes('animal');

                            // If no match in themes, check artwork name for animal keywords
                            if (!themeMatch) {
                                const animalKeywords = [
                                    // Strong animal indicators only
                                    'leopard', 'tiger', 'lion', 'elephant', 'zebra', 'giraffe', 'cheetah', 'safari', 'wildlife', 'jungle',
                                    'bird', 'eagle', 'owl', 'peacock', 'flamingo', 'parrot', 'cardinal', 'robin', 'swan',
                                    'cat', 'dog', 'horse', 'bear', 'wolf', 'fox', 'deer', 'rabbit', 'butterfly', 'fish', 'turtle',
                                    'abstract leopard', 'wild', 'creature', 'beast', 'fauna', 'dragon', 'phoenix'
                                ];
                                themeMatch = animalKeywords.some(keyword => artworkLower.includes(keyword));

                                // EXCLUDE items that sound like flowers/plants even if they have animal keywords
                                const flowerExclusions = ['garden', 'rose', 'floral', 'bloom', 'petal', 'flower', 'botanical'];
                                const hasFlowerTerms = flowerExclusions.some(term => artworkLower.includes(term));
                                if (hasFlowerTerms && !artworkLower.includes('safari') && !artworkLower.includes('wild')) {
                                    themeMatch = false; // Exclude garden/floral items unless they're clearly animal-themed
                                }
                            }
                        } else if (artworkTheme.toLowerCase() === 'flowers/plants') {
                            themeMatch = excelThemes.includes('flowers/plants');
                        } else if (artworkTheme.toLowerCase() === 'nature/landscape') {
                            themeMatch = excelThemes.includes('nature/landscape');
                        } else if (artworkTheme.toLowerCase() === 'pattern/abstract') {
                            themeMatch = excelThemes.includes('pattern/abstract');
                        } else if (artworkTheme.toLowerCase() === 'symbols/emblems') {
                            themeMatch = excelThemes.includes('symbols/emblems');
                        } else if (artworkTheme.toLowerCase() === 'vehicles/transport') {
                            themeMatch = excelThemes.includes('vehicles/transport');
                        } else if (artworkTheme.toLowerCase() === 'food & drink') {
                            themeMatch = excelThemes.includes('food & drink');
                        } else {
                            // For exact theme matching, check if the theme appears in the Excel themes
                            themeMatch = excelThemes.includes(artworkTheme.toLowerCase());
                        }

                        // Also check artwork name for theme keywords as fallback
                        if (!themeMatch) {
                            const themeKeywords = {
                                'animal': [
                                    // Wildlife and Safari animals
                                    'animal', 'wild', 'safari', 'jungle', 'lion', 'tiger', 'leopard', 'elephant', 'zebra', 'giraffe', 'cheetah', 'rhino', 'hippo',
                                    // Birds
                                    'bird', 'eagle', 'owl', 'peacock', 'flamingo', 'parrot', 'swan', 'crane', 'robin', 'cardinal', 'hummingbird',
                                    // Domestic and farm animals  
                                    'cat', 'dog', 'horse', 'cow', 'sheep', 'goat', 'pig', 'chicken', 'duck', 'rabbit', 'hamster',
                                    // Ocean and aquatic animals
                                    'fish', 'dolphin', 'whale', 'shark', 'octopus', 'turtle', 'seal', 'starfish', 'jellyfish',
                                    // Forest animals
                                    'bear', 'wolf', 'fox', 'deer', 'moose', 'squirrel', 'raccoon', 'beaver', 'chipmunk',
                                    // Insects and small creatures
                                    'butterfly', 'bee', 'dragonfly', 'ladybug', 'spider', 'ant', 'cricket',
                                    // Mythical/artistic animals
                                    'dragon', 'phoenix', 'unicorn',
                                    // Animal-related terms
                                    'creature', 'beast', 'fauna', 'wildlife', 'zoological', 'paw', 'feather', 'fur', 'scale', 'claw', 'wing'
                                ],
                                'flowers/plants': ['flower', 'floral', 'bloom', 'rose', 'lily', 'orchid', 'sunflower', 'tulip', 'plant', 'leaf', 'garden', 'botanical', 'petal', 'stem', 'bud', 'vine', 'fern', 'moss', 'herb'],
                                'nature/landscape': ['nature', 'landscape', 'mountain', 'forest', 'tree', 'ocean', 'beach', 'sunset', 'sky', 'river', 'lake', 'valley', 'meadow', 'canyon', 'cliff', 'hill', 'stream'],
                                'symbols/emblems': ['symbol', 'emblem', 'icon', 'cross', 'star', 'heart', 'moon', 'sun', 'mandala', 'tribal', 'celtic', 'rune', 'sacred', 'spiritual', 'mystic'],
                                'pattern/abstract': ['pattern', 'abstract', 'geometric', 'design', 'stripe', 'dot', 'circle', 'square', 'triangle', 'modern', 'contemporary', 'artistic', 'creative'],
                                'vehicles/transport': ['vehicle', 'car', 'train', 'plane', 'boat', 'bike', 'motorcycle', 'travel', 'transport', 'ship', 'aircraft', 'automobile'],
                                'food & drink': ['food', 'drink', 'coffee', 'tea', 'wine', 'fruit', 'cake', 'culinary', 'kitchen', 'dining', 'beverage', 'recipe']
                            };

                            const keywords = themeKeywords[artworkTheme.toLowerCase()] || [];
                            themeMatch = keywords.some(keyword => artworkLower.includes(keyword));
                        }

                        // Check bag type in product type and product name
                        const bagMatch = p.productType?.toLowerCase().includes(bagPref.toLowerCase()) ||
                            p.productName?.toLowerCase().includes(bagPref.toLowerCase());

                        return themeMatch && bagMatch;
                    });
                    console.log(`✅ Found ${matches.length} products matching both theme and bag type`);
                }

                // If no matches, try filtering by artwork theme only
                if (matches.length === 0 && artworkTheme) {
                    console.log(`🎨 Filtering by artwork theme only: ${artworkTheme}`);
                    matches = productDatabase.filter(p => {
                        const themeLower = artworkTheme.toLowerCase();
                        const traitsLower = p.personalityTraits?.toLowerCase() || '';
                        const artworkLower = p.artworkName?.toLowerCase() || '';

                        // Use the same comprehensive theme matching logic as above
                        if (themeLower === 'animal') {
                            const animalKeywords = [
                                'animal', 'wild', 'safari', 'jungle', 'lion', 'tiger', 'leopard', 'elephant', 'zebra', 'giraffe', 'cheetah',
                                'bird', 'eagle', 'owl', 'peacock', 'flamingo', 'parrot', 'swan', 'crane', 'cardinal',
                                'cat', 'dog', 'horse', 'bear', 'wolf', 'fox', 'deer', 'rabbit', 'butterfly', 'fish', 'turtle',
                                'creature', 'beast', 'fauna', 'wildlife', 'dragon', 'paw', 'feather', 'fur', 'wing'
                            ];
                            return animalKeywords.some(keyword =>
                                traitsLower.includes(keyword) || artworkLower.includes(keyword)
                            );
                        } else if (themeLower === 'flowers/plants') {
                            return traitsLower.includes('flower') || traitsLower.includes('plant') ||
                                traitsLower.includes('bloom') || traitsLower.includes('floral') ||
                                artworkLower.includes('flower') || artworkLower.includes('plant') ||
                                artworkLower.includes('bloom') || artworkLower.includes('floral');
                        } else if (themeLower === 'nature/landscape') {
                            return traitsLower.includes('nature') || traitsLower.includes('landscape') ||
                                traitsLower.includes('vista') || traitsLower.includes('natural') ||
                                artworkLower.includes('nature') || artworkLower.includes('landscape') ||
                                artworkLower.includes('vista') || artworkLower.includes('natural');
                        } else if (themeLower === 'pattern/abstract') {
                            return traitsLower.includes('pattern') || traitsLower.includes('abstract') ||
                                traitsLower.includes('geometric') || traitsLower.includes('design') ||
                                artworkLower.includes('pattern') || artworkLower.includes('abstract') ||
                                artworkLower.includes('geometric') || artworkLower.includes('design');
                        } else if (themeLower === 'symbols/emblems') {
                            return traitsLower.includes('symbol') || traitsLower.includes('emblem') ||
                                traitsLower.includes('icon') || traitsLower.includes('meaningful') ||
                                artworkLower.includes('symbol') || artworkLower.includes('emblem') ||
                                artworkLower.includes('icon') || artworkLower.includes('meaningful');
                        } else if (themeLower === 'vehicles/transport') {
                            return traitsLower.includes('vehicle') || traitsLower.includes('transport') ||
                                traitsLower.includes('car') || traitsLower.includes('travel') ||
                                artworkLower.includes('vehicle') || artworkLower.includes('transport') ||
                                artworkLower.includes('car') || artworkLower.includes('travel');
                        } else if (themeLower === 'food & drink') {
                            return traitsLower.includes('food') || traitsLower.includes('drink') ||
                                traitsLower.includes('culinary') || traitsLower.includes('gastronomy') ||
                                artworkLower.includes('food') || artworkLower.includes('drink') ||
                                artworkLower.includes('culinary') || artworkLower.includes('gastronomy');
                        } else {
                            return traitsLower.includes(themeLower) || artworkLower.includes(themeLower);
                        }
                    });
                    console.log(`✅ Found ${matches.length} products matching artwork theme`);
                }

                // If still no matches, try filtering by bag type only
                if (matches.length === 0 && bagPref) {
                    console.log(`👜 Filtering by bag type only: ${bagPref}`);
                    matches = productDatabase.filter(p => {
                        return p.productType?.toLowerCase().includes(bagPref.toLowerCase()) ||
                            p.productName?.toLowerCase().includes(bagPref.toLowerCase());
                    });
                    console.log(`✅ Found ${matches.length} products matching bag type`);
                }

                // If still no matches, use keyword-based matching as fallback
                if (matches.length === 0) {
                    console.log(`🔍 Using keyword-based matching as fallback`);
                    const keywords = getStyleKeywords(description || '');
                    matches = findMatchingProducts(keywords, productDatabase);
                    console.log(`✅ Found ${matches.length} products using keyword matching`);
                }

                // Ensure we have exactly 12 unique recommendations
                if (matches.length > 12) {
                    // Remove duplicates based on unique artwork+product combination
                    const uniqueMatches = matches.filter((product, index, self) =>
                        index === self.findIndex(p =>
                            p.artworkName === product.artworkName &&
                            p.productName === product.productName
                        )
                    );

                    // Shuffle the unique matches to get different recommendations each time
                    const shuffled = uniqueMatches.sort(() => Math.random() - 0.5);
                    matches = shuffled.slice(0, 12);
                    console.log(`✅ Filtered to ${uniqueMatches.length} unique products, shuffled and limited to 12 recommendations`);
                } else if (matches.length < 12) {
                    // Remove duplicates first
                    const uniqueMatches = matches.filter((product, index, self) =>
                        index === self.findIndex(p =>
                            p.artworkName === product.artworkName &&
                            p.productName === product.productName
                        )
                    );

                    // If we don't have enough unique products, add more from the database
                    const remainingProducts = productDatabase
                        .filter(p => !uniqueMatches.some(m =>
                            m.artworkName === p.artworkName && m.productName === p.productName
                        ))
                        .sort(() => Math.random() - 0.5); // Shuffle remaining products
                    const additionalProducts = remainingProducts.slice(0, 12 - uniqueMatches.length);
                    matches = [...uniqueMatches, ...additionalProducts];
                    console.log(`✅ Using ${uniqueMatches.length} unique matches, added ${additionalProducts.length} additional shuffled products to reach 12`);
                }

                // Final fallback: if we still don't have 12, take random 12 from the database
                if (matches.length < 12) {
                    console.log(`⚠️ Still only ${matches.length} products, taking random 12 from database`);
                    console.log(`📊 Total products in database: ${productDatabase.length}`);
                    const shuffledDatabase = productDatabase.sort(() => Math.random() - 0.5);
                    matches = shuffledDatabase.slice(0, 12);
                    console.log(`✅ After fallback: ${matches.length} products`);
                }

                console.log(`🎯 Final recommendations count: ${matches.length}`);
                console.log(`📊 Product database size: ${productDatabase.length}`);

                // Generate explanation based on the filtering criteria used
                let explanation = '';
                if (artworkTheme && bagPref) {
                    explanation = `These ${bagPref} selections are carefully chosen to match your preferred ${artworkTheme} artwork theme and complement your ${description || 'unique'} personality.`;
                } else if (artworkTheme) {
                    explanation = `These products are selected based on your ${artworkTheme} artwork theme preference and ${description || 'unique'} personality.`;
                } else if (bagPref) {
                    explanation = `These ${bagPref} selections are carefully chosen to complement your ${description || 'unique'} personality and style preferences.`;
                } else {
                    explanation = `These selections are carefully chosen to complement your ${description || 'unique'} personality and style preferences.`;
                }

                // Create user profile data
                const userProfileData = {
                    personality: description || 'Style-conscious individual',
                    sentiment: 'Confident and stylish',
                    artworkTheme: artworkTheme || 'Pattern/Abstract',
                    bagType: bagPref
                };

                // Transform backend Product format to frontend Product format for compatibility
                const frontendCompatibleRecommendations = await Promise.all(matches.map(transformToFrontendFormat));

                const responseData = {
                    success: true,
                    recommendations: frontendCompatibleRecommendations,
                    explanation: explanation,
                    userProfile: userProfileData,
                    markdownReport: null,
                    confidenceScore: 85,
                    stylePreferences: ['Classic', 'Versatile', 'Practical'],
                    lifestyleInsights: 'You prefer functional yet stylish accessories.',
                    artworkInsights: artworkTheme ? `Based on your ${artworkTheme} artwork preference` : null
                };

                console.log(`📤 Sending response with ${responseData.recommendations.length} recommendations`);
                console.log('📦 Sample recommendation:', responseData.recommendations[0]);

                res.json(responseData);

            } catch (error) {
                console.error('❌ Error in POST /recommendations:', error);

                // Return a more detailed error response for debugging
                const errorMessage = error instanceof Error ? error.message : 'Unknown error';
                res.status(500).json({
                    error: 'Failed to get recommendations',
                    details: errorMessage,
                    timestamp: new Date().toISOString()
                });
            }
        });

        // Test endpoint to verify server is running updated code
        app.get('/test-updated', (req: Request, res: Response) => {
            res.json({
                message: 'Server is running updated code',
                timestamp: new Date().toISOString(),
                version: '2.0'
            });
        });

        // Get sample bag images for loading animation
        app.get('/loading-images', (req: Request, res: Response) => {
            try {
                // Get 12 random products with images
                const productsWithImages = productDatabase
                    .filter(p => p.imageUrl && p.imageUrl.trim() !== '')
                    .sort(() => Math.random() - 0.5)
                    .slice(0, 12);

                const images = productsWithImages.map(p => ({
                    url: p.imageUrl,
                    name: p.productName
                }));

                res.json({ images });
            } catch (error) {
                console.error('Error getting loading images:', error);
                res.status(500).json({ error: 'Failed to get loading images' });
            }
        });

        // GET recommendations endpoint
        app.get('/recommendations', async (req: Request, res: Response) => {
            try {
                const description = req.query.description;
                if (!description || typeof description !== 'string') {
                    return res.status(400).json({ error: 'Missing or invalid "description" query parameter.' });
                }

                console.log(`🔍 GET /recommendations called with description: ${description}`);

                // Simple keyword-based filtering for GET requests
                let matches: Product[] = [];
                const descriptionLower = description.toLowerCase();
                matches = productDatabase.filter(p => {
                    const traitsLower = p.personalityTraits?.toLowerCase() || '';
                    const artworkLower = p.artworkName?.toLowerCase() || '';
                    const productLower = p.productName?.toLowerCase() || '';

                    return traitsLower.includes(descriptionLower) ||
                        artworkLower.includes(descriptionLower) ||
                        productLower.includes(descriptionLower);
                });

                // If no matches, return some sample products
                if (matches.length === 0) {
                    console.log('🔍 No keyword matches found, returning sample products');
                    matches = productDatabase.slice(0, 12);
                }

                console.log(`🔄 Transforming ${matches.length} products to frontend format...`);

                const frontendCompatibleRecommendations = await Promise.all(matches.map(async (product, index) => {
                    try {
                        const transformed = await transformToFrontendFormat(product);
                        return transformed;
                    } catch (error) {
                        console.error(`❌ Failed to transform product ${index}:`, product.artworkName, error);
                        // Return a fallback product if transformation fails
                        return {
                            id: product.artworkName || product.productName || Math.random().toString(36).substr(2, 9),
                            name: product.productName || product.artworkName || 'Anuschka Bag',
                            artworkName: product.artworkName || product.productName || 'Anuschka Artwork',
                            productName: product.productName || product.artworkName || 'Anuschka Bag',
                            personaName: product.artworkName || product.artworkName || 'Anuschka Persona',
                            personaDescription: product.personalityTraits || 'Beautiful handcrafted bag with unique artwork',
                            price: product.price || '$150',
                            image: 'https://anuschka.com/product-image1.png',
                            link: 'https://anuschka.com/products',
                            productType: product.productType || 'Handbag',
                            description: `${product.artworkName} - Beautiful handcrafted bag with unique artwork that reflects your personality`,
                            psychologicalAppeal: product.personalityTraits || 'This bag appeals to those who appreciate unique, artistic designs',
                            artworkPersonality: product.artworkName || 'Anuschka Artwork'
                        };
                    }
                }));

                console.log(`✅ Successfully transformed ${frontendCompatibleRecommendations.length} products`);

                return res.json({ recommendations: frontendCompatibleRecommendations });
            } catch (error) {
                console.error('❌ Error in GET /recommendations:', error);
                res.status(500).json({ error: 'Internal server error' });
            }
        });

        // Loading images endpoint
        app.get('/loading-images', async (req: Request, res: Response) => {
            try {
                console.log('🖼️ Loading images endpoint called');

                // Return sample images for now
                const images = [
                    'https://anuschka.com/product-image1.png',
                    'https://anuschka.com/product-image2.png',
                    'https://anuschka.com/product-image3.png',
                    'https://anuschka.com/product-image4.png',
                    'https://anuschka.com/product-image5.png',
                    'https://anuschka.com/product-image6.png',
                    'https://anuschka.com/product-image7.png',
                    'https://anuschka.com/product-image8.png',
                    'https://anuschka.com/product-image9.png',
                    'https://anuschka.com/product-image10.png',
                    'https://anuschka.com/product-image11.png',
                    'https://anuschka.com/product-image12.png'
                ];

                res.json({ images });
            } catch (error) {
                console.error('Error getting loading images:', error);
                res.status(500).json({ error: 'Failed to get loading images' });
            }
        });

        // Test updated endpoint
        app.get('/test-updated', (req: Request, res: Response) => {
            res.json({ message: 'Server is running updated code' });
        });

        // Artwork data endpoint
        app.get('/api/artwork-data', async (req: Request, res: Response) => {
            try {
                console.log('📊 Artwork data endpoint called');

                // Return a simple response for now to test the endpoint
                res.json({
                    success: true,
                    count: 755,
                    data: [
                        {
                            artworkName: 'Abstract Leopard',
                            productName: 'Sample Product',
                            imageUrl: 'https://example.com/image.jpg'
                        }
                    ],
                    message: 'Artwork data endpoint working'
                });

            } catch (error) {
                console.error('❌ Error in artwork data endpoint:', error);
                res.status(500).json({
                    error: 'Failed to load artwork data',
                    message: error instanceof Error ? error.message : 'Unknown error'
                });
            }
        });

        // Services are already initialized above

        // Legacy Personality Quiz API endpoints (keeping for backward compatibility)
        app.get('/api/personality-quiz/first-question', (req: Request, res: Response) => {
            try {
                const { sessionId, question } = personalityQuizService.getFirstQuestion();
                res.json({ sessionId, question });
            } catch (error) {
                console.error('Failed to get first question:', error);
                res.status(500).json({ error: 'Failed to get first question' });
            }
        });

        app.post('/api/personality-quiz/next-question', (req: Request, res: Response) => {
            try {
                const { sessionId, selectedPersonality } = req.body;

                if (!sessionId || !selectedPersonality) {
                    return res.status(400).json({ error: 'Missing sessionId or selectedPersonality' });
                }

                const question = personalityQuizService.getNextQuestion(sessionId, selectedPersonality);

                if (!question) {
                    // Quiz completed, get final result
                    const session = personalityQuizService.getUserSession(sessionId);
                    if (session) {
                        const predictedPersonality = personalityQuizService.getPersonalityPrediction(session.answers);
                        res.json({
                            message: 'Quiz completed',
                            session,
                            predictedPersonality
                        });
                    } else {
                        res.status(400).json({ error: 'Invalid session ID' });
                    }
                } else {
                    res.json({ question });
                }
            } catch (error) {
                console.error('Failed to get next question:', error);
                res.status(500).json({ error: 'Failed to get next question' });
            }
        });

        app.post('/api/personality-quiz/result', (req: Request, res: Response) => {
            try {
                const { sessionId } = req.body;

                if (!sessionId) {
                    return res.status(400).json({ error: 'Missing sessionId' });
                }

                const session = personalityQuizService.getUserSession(sessionId);

                if (!session) {
                    return res.status(400).json({ error: 'Invalid session ID' });
                }

                const predictedPersonality = personalityQuizService.getPersonalityPrediction(session.answers);

                res.json({
                    session,
                    predictedPersonality,
                    recommendations: [] // You can add product recommendations here later
                });
            } catch (error) {
                console.error('Failed to get result:', error);
                res.status(500).json({ error: 'Failed to get result' });
            }
        });

        // Advanced Personality Analysis API endpoints
        app.get('/api/personality/get-first-question', async (req: Request, res: Response) => {
            try {
                const session = personalityAnalysisService.createSession();
                const question = personalityAnalysisService.getRandomQuestion();

                if (!question) {
                    return res.status(500).json({ error: 'No questions available' });
                }

                session.askedQuestions.push(question.Question);

                res.json({
                    sessionId: session.sessionId,
                    question
                });
            } catch (error) {
                console.error('Error getting first question:', error);
                res.status(500).json({ error: 'Failed to get first question' });
            }
        });

        // Personality-only markdown report endpoint (no products/bags/styles in output)
        app.post('/api/personality/personality-only-report', async (req: Request, res: Response) => {
            try {
                const { personalityType, dominantTraits, allScores, quizJourney, options } = req.body as {
                    personalityType?: string,
                    dominantTraits?: string[],
                    allScores?: Record<string, number>,
                    quizJourney?: Array<{ question: string, selectedOption: string }>,
                    options?: {
                        includeGrowthTips?: boolean,
                        includeVisualSummary?: boolean,
                        userHistory?: Array<{ timestamp?: string, summary?: string, changes?: string[] }>,
                        iterationCount?: number,
                        tonePreference?: 'vibrant' | 'calm' | 'balanced',
                        priorityTraits?: string[]
                    }
                };

                if (!personalityType || !dominantTraits) {
                    return res.status(400).json({ error: 'Missing required fields: personalityType and dominantTraits are required' });
                }

                let markdown_report = '';
                let llmUsed = false;
                const includeGrowthTips = false; // Enforce removal per spec
                const includeVisualSummary = false; // Off by default per spec
                const userHistory = options?.userHistory || [];
                const iterationCount = options?.iterationCount || 1;
                const tonePreference = options?.tonePreference;
                const priorityTraits = options?.priorityTraits && options.priorityTraits.length
                    ? options.priorityTraits
                    : ['Artistic Flair', 'Versatility', 'Color Playfulness', 'Sincerity'];

                // Derive tone hint from scores if not explicitly provided
                const whimsy = (allScores && allScores['Whimsy']) || 0;
                const excitement = (allScores && allScores['Excitement']) || 0;
                const elegance = (allScores && allScores['Elegance']) || 0;
                const sincerity = (allScores && allScores['Sincerity']) || 0;
                const toneHint = tonePreference || ((whimsy + excitement) > (elegance + sincerity) ? 'vibrant' : 'calm');
                if (GEMINI_API_KEY && GEMINI_API_KEY !== 'hardcoded_gemini_api_key_here') {
                    try {
                        const journeyLines = (quizJourney || []).map((j, i) => `Q${i + 1}: ${j.question}\nA${i + 1}: ${j.selectedOption}`).join('\n');
                        const historyText = userHistory.length > 0 ? `\n\nUser history snapshots:\n${userHistory.map((h, i) => `H${i + 1}: ${h.summary || ''}${h.changes && h.changes.length ? ` (changes: ${h.changes.join(', ')})` : ''}`).join('\n')}` : '';
                        const prompt = `# Personality Report Generation Prompt

## 1. Role and Objective
You are an experienced personality specialist with 15+ years across creative and cinematic industries. Your objective is to generate a concise, engaging personality report that focuses ONLY on the user's personality traits. The report must be welcoming, insightful, and affirming. Do NOT include growth tips, strengths, challenges, or numerical data.

## 2. Context
Inputs:
- Suggested base type (optional): ${personalityType || '—'}
- Dominant traits: ${dominantTraits.join(', ')}
- Cues from answers (Q/A Path):\n${journeyLines}
- Tone intent: ${toneHint}
- Iteration count: ${iterationCount}
${historyText}
- Priority traits to emphasize (when supported by cues): ${priorityTraits.join(', ')}

## 3. Instructions
1) Combined Personality Overview & Summary:
- Write 3–4 warm, simple sentences that reflect the user's personality based on the dominant traits and, when supported by cues, emphasize priority traits (Artistic Flair, Versatility, Color Playfulness, Sincerity).
- Seamlessly include the uplifting synthesis that would normally appear in a separate summary; keep the language approachable, engaging, and easy to understand.
- Avoid jargon; use everyday words and friendly phrasing.

2) Detailed Trait Breakdown:
- Select 3–5 traits that best represent the user based on the cues.
- For each selected trait, briefly explain how it shapes thinking, creativity, decision-making, or social interactions.
- Tie each trait to real-life behaviors or moments. Keep explanations short and affirming.

3) Style & Safety Notes:
- Keep the tone aligned to the tone intent (${toneHint}), warm and validating.
- Do NOT include numbers, percentages, strengths, challenges, or development tips.
- No medical or diagnostic language.
- Keep sentences clear and conversational.

## Structure of the Report (use exactly this shape):
## Your Personality: [Short human nickname]

### Personality Overview & Summary
[3–4 warm, simple sentences that combine a reflective overview with an uplifting synthesis. Emphasize priority traits (Artistic Flair, Versatility, Color Playfulness, Sincerity) where supported by the cues.]

### Detailed Trait Breakdown
- [Top trait]: Explain how this trait influences decision-making, creativity, and daily life with relatable context.
- [Next trait]: Describe how this trait affects work or social interactions in friendly, direct language.
- [Next trait]: Affirm this trait with positive language; relate it to how the user interacts with the world.
(Use only 3–5 traits that truly fit, prioritizing priority traits when supported by cues.)`;
                        const genRes = await fetch(
                            `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
                            {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({
                                    contents: [{ parts: [{ text: prompt }] }],
                                    generationConfig: { temperature: 0.6, maxOutputTokens: 900 }
                                })
                            }
                        );
                        if (genRes.ok) {
                            const data: any = await genRes.json();
                            markdown_report = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
                            if (markdown_report && markdown_report.trim().length > 0) {
                                llmUsed = true;
                            }
                        }
                    } catch (err) {
                        console.error('personality-only-report LLM error:', err);
                    }
                }

                if (!markdown_report) {
                    // Generate comprehensive fallback content
                    const cues = (quizJourney || []).slice(0, 3).map(j => j.selectedOption).join(', ');
                    const traits = dominantTraits.length ? dominantTraits.slice(0, 4) : ['Artistic Flair', 'Versatility', 'Color Playfulness', 'Sincerity'];

                    // Ensure we have enough traits
                    while (traits.length < 4) {
                        traits.push('Uniqueness');
                    }

                    const personalityTypeLower = personalityType.toLowerCase();

                    // Generate contextual overview
                    let overview = '';
                    if (personalityTypeLower.includes('refined') || personalityTypeLower.includes('connoisseur')) {
                        overview = `You present as ${personalityType}, embodying refined taste and sophisticated discernment. Your personality combines ${traits.slice(0, 3).join(', ')} in a way that makes you a natural curator of quality and excellence who appreciates the finer things in life.`;
                    } else if (personalityTypeLower.includes('creative') || personalityTypeLower.includes('artistic')) {
                        overview = `You present as ${personalityType}, embodying the spirit of artistic innovation and creative expression. Your personality combines ${traits.slice(0, 3).join(', ')} in a way that makes you a natural creator and visionary who brings fresh perspectives to every situation.`;
                    } else {
                        overview = `You present as ${personalityType}, with distinctive traits that make you unique and valuable. Your personality combines ${traits.slice(0, 3).join(', ')} in a way that creates a truly individual approach to life and work.`;
                    }

                    // Generate detailed trait breakdown with specific descriptions
                    const traitBreakdown = traits.map((trait, index) => {
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

                        return `- **${trait}**: ${description}`;
                    }).join('\n');

                    markdown_report = `## Your Personality: ${personalityType}

### Personality Overview & Summary
${overview}

### Detailed Trait Breakdown
${traitBreakdown}`;
                }

                return res.json({ markdown_report, llm_used: llmUsed });
            } catch (error) {
                console.error('personality-only-report error:', error);
                return res.status(500).json({ error: 'Failed to generate personality report' });
            }
        });

        // New: LLM-driven report generation endpoint (standalone)
        app.post('/api/personality/generate-llm-report', async (req: Request, res: Response) => {
            try {
                const { quizAnswers } = req.body as { quizAnswers?: string };
                if (!quizAnswers || !quizAnswers.trim()) {
                    return res.status(400).json({ error: 'Missing quizAnswers' });
                }

                // Basic traits and thresholds for demonstration (extensible)
                const traits = ['Boldness', 'Elegance', 'Whimsy'];
                // Allowed persona names sourced from this project only
                const allowedPersonas = Array.from(new Set(artworkPersonaMappings.map(m => m.personaName))).sort();
                // Allowed bag types we support
                const allowedBagTypes = ['Crossbody', 'Tote', 'Clutch', 'Backpack', 'Hobo', 'Satchel', 'Shoulder', 'Handbag'];

                // Ask Gemini to produce JSON scores + persona labels and Markdown report in one call
                let markdown_report = '';
                let scores = { raw: {} as Record<string, number>, normalized: {} as Record<string, number>, levels: {} as Record<string, 'Low' | 'Moderate' | 'High'> };
                let style_persona = '';
                let bag_personality = '';

                if (GEMINI_API_KEY && GEMINI_API_KEY !== 'hardcoded_gemini_api_key_here') {
                    try {
                        const prompt = `## Role
You are an **Advanced Personality Assessment Architect** and an **Expert in Tailored Human Design**. Your responsibility is to create a highly detailed, personalized, and dynamic personality analysis based on the user's quiz responses. Your insights will focus on three core traits: **Boldness**, **Elegance**, and **Whimsy**. You will provide a deep, nuanced analysis of these traits, offer a comprehensive style statement, and generate actionable personal growth recommendations. Your tone should be polished, professional, and empathetic — offering both clarity and valuable insights.

## Objective
Your primary goal is to **analyze** and **interpret** the user's personality by deriving clear insights from their quiz responses. You will break down their personality into three distinct, foundational traits: **Boldness**, **Elegance**, and **Whimsy**. Your analysis will include:

1. A **Trait Breakdown** that details each personality dimension with examples from the user's quiz answers.
2. A **Style Statement** that summarizes the user's unique personal aesthetic.
3. A **Summary of Strengths** and **Growth Opportunities**, providing a forward-looking approach to self-improvement.
4. Actionable **Personal Development Tips** to help the user grow based on their unique personality traits.

This report will help the user understand their intrinsic traits and how they shape their life, behavior, and decisions. Make sure to include personal, specific insights that are reflective of their responses.

## Context
The user has answered a personality quiz designed to capture their core traits and preferences. Using these answers, your task is to generate a **refined and customized personality analysis** that not only categorizes their traits but also explains how these traits manifest in their life and what they can do to further embrace or refine them.

You will provide the following:

- **Trait Breakdown**: Analyze **Boldness**, **Elegance**, and **Whimsy** based on the user's choices.
- **Style Statement**: Offer a succinct yet meaningful description of the user's overall style, encompassing their persona across the three traits.
- **Strengths and Challenges**: Identify the user's primary strengths and potential challenges.
- **Personal Development Tips**: Offer actionable advice to enhance the user's strengths or improve any underrepresented traits.

### **Instructions:**
1. **Trait Breakdown**:
   - **Boldness**: Assess the user's inclination towards risk-taking, adventure, and decisiveness. Provide a score of **Low**, **Moderate**, or **High** and explain the connection between their responses and this trait.
   - **Elegance**: Evaluate the user's appreciation for refinement, sophistication, and tasteful simplicity. Assign a score of **Low**, **Moderate**, or **High** and explain the relevance of their choices to this trait.
   - **Whimsy**: Examine the user's creative, playful, and imaginative tendencies. Provide a score of **Low**, **Moderate**, or **High** and explain how their preferences reflect this trait.
   - For each trait, include:
     - **Observed Signals**: Cite specific choices the user made that reflect this trait.
     - **In Daily Life**: Discuss how this trait may show up in their daily behavior, decisions, or relationships.
     - **Helps When / Watch-Outs**: Give balanced advice on how this trait can be beneficial and where the user should remain mindful of potential drawbacks.

2. **Style Statement**:
   - **Concise, insightful, and highly personalized**: Craft a unique style statement that integrates the three traits (Boldness, Elegance, Whimsy) and succinctly describes the user's personality.
   - Your statement should be reflective, dynamic, and tell a **compelling story** about their core identity. For example: "Your style is an embodiment of vibrant creativity and calculated risk, grounded in a love for the finer details and an unwavering sense of artistic freedom."

3. **Strengths and Growth Opportunities**:
   - **Identify Key Strengths**: Highlight the user's most prominent strengths, emphasizing how their dominant traits contribute to their success, creativity, or leadership.
   - **Explore Challenges**: Discuss any potential challenges the user might face as a result of their dominant traits, like impulsiveness (Boldness), being overly meticulous (Elegance), or lack of focus (Whimsy).
   - **Growth Opportunities**: Offer **personalized suggestions** for improvement. Suggest specific activities or habits that can help the user develop their underrepresented traits and optimize their potential.

4. **Actionable Personal Development Tips**:
   - Provide **actionable** and **tailored advice** that will allow the user to harness their strengths and work on any weaker areas. The tips should be specific, clear, and immediately usable. For example: "To refine your boldness, consider setting more mindful goals that balance your adventurous spirit with careful planning."

### **Notes:**
1. **Be Highly Specific**: Your analysis should be based on concrete examples from the user's responses. The more personalized, the better. Avoid any blanket statements or generic language. The user should feel that the report is uniquely crafted for them.
   
2. **Focus on Depth**: Each trait's breakdown should not only include surface-level characteristics but also deeper reflections on how the trait manifests in the user's behavior, interactions, and decisions. Avoid oversimplifying.
   
3. **Use Balanced, Empathetic Tone**: While offering suggestions for growth, maintain an empathetic tone. Provide insights in a way that is **constructive**, **uplifting**, and **supportive**, ensuring the user feels empowered to take actionable steps toward self-improvement.

---

### **Markdown Structure for the Personality Analysis Report**

\`\`\`markdown
## Your Personality: [Create a unique, descriptive personality name based on the user's traits. Examples: "The Refined Connoisseur", "The Bold Adventurer", "The Creative Dreamer", "The Elegant Visionary", etc. Make it specific to their unique combination of Boldness, Elegance, and Whimsy.]

## Personality Overview
[Provide a brief 2-3 sentence summary that synthesizes the user's key personality traits. This should be a summary of how Boldness, Elegance, and Whimsy shape their overall persona. Include specific cues from their quiz answers to support your explanation.]

## Trait Breakdown
- **Boldness:** [Low/Moderate/High] — [Explain how Boldness manifests based on their quiz responses. Do they prefer taking risks? Are they decisive? What does this mean for their everyday life?]
  - **Observed Signals:** [List 3-6 specific cues from their answers that point to their Boldness.]
  - **In Daily Life:** [Describe how this trait might affect their decisions, interactions, or leadership style.]
  - **Helps When / Watch-Outs:** [Offer insights into how Boldness can be both an asset and a potential challenge.]

- **Elegance:** [Low/Moderate/High] — [Assess how Elegance manifests in the user. Are they refined in their tastes, decisions, or actions?]
  - **Observed Signals:** [List 3-6 cues from their answers that reflect Elegance.]
  - **In Daily Life:** [Discuss how Elegance plays out in their routine, personal style, or communication.]
  - **Helps When / Watch-Outs:** [Explain how Elegance helps them excel and when it might lead to overthinking or over-polishing.]

- **Whimsy:** [Low/Moderate/High] — [Analyze the user's tendency towards creativity, playfulness, and imagination.]
  - **Observed Signals:** [List 3-6 cues from their answers that highlight their Whimsy.]
  - **In Daily Life:** [Explain how Whimsy may show up in their creative endeavors, spontaneous decisions, or problem-solving.]
  - **Helps When / Watch-Outs:** [Provide advice on how Whimsy serves them and where it might cause distractions.]

## Style Statement
[Craft a compelling and meaningful style statement that summarizes the user's core aesthetic, personality, and lifestyle. Use the three traits (Boldness, Elegance, and Whimsy) to weave a narrative about their unique personal style.]

## Your Style Profile
[Create a detailed style profile that describes the user's fashion preferences, aesthetic choices, and how they express their personality through style. Include specific details about colors, patterns, textures, and overall aesthetic that would appeal to them. This should be 2-3 paragraphs that paint a vivid picture of their style preferences.]

## Strengths
- [Highlight strengths based on their dominant traits. For example: "Your adventurous spirit helps you seize opportunities others may avoid."]
- [Mention additional strengths related to Elegance, such as "Your attention to detail ensures success in tasks requiring precision."]
- [Discuss strengths stemming from Whimsy, like "Your creativity and free spirit bring innovation to your professional and personal life."]
- [Feel free to list any other strengths.]

## Potential Challenges or Growth Opportunities
- [Discuss challenges, such as "Your boldness might lead to overconfidence or rushed decisions."]
- [Explore potential issues with Elegance, like "While your elegance is a strength, it may lead to perfectionism or indecision."]
- [Discuss challenges related to Whimsy, such as "Your creativity might occasionally cause a lack of focus."]
- [Add any relevant growth opportunities.]

## Suggested Personal Development Tips
- [Offer specific, actionable advice. For example: "Channel your boldness into strategic decision-making by setting clear goals."]
- [Provide suggestions for embracing elegance, such as "Refine your elegance by practicing mindful decision-making."]
- [Give actionable tips for nurturing Whimsy, such as "Explore creative hobbies that allow you to express your whimsical nature."]
- [Feel free to include more personalized tips based on the analysis.]
\`\`\`

## Input Data
- Quiz answers: ${quizAnswers}
- Traits to analyze: ${traits.join(', ')}
- Allowed style personas (choose exactly one): ${allowedPersonas.join(', ')}
- Allowed bag personalities/types (choose exactly one): ${allowedBagTypes.join(', ')}

## Output Requirements
1) Return JSON first with the following structure only:
{
  "scores": {
    "raw": {"Boldness": number, "Elegance": number, "Whimsy": number},
    "normalized": {"Boldness": number, "Elegance": number, "Whimsy": number},
    "levels": {"Boldness": "Low|Moderate|High", "Elegance": "Low|Moderate|High", "Whimsy": "Low|Moderate|High"}
  },
  "style_persona": "string from Allowed style personas only",
  "bag_personality": "string from Allowed bag personalities/types only",
  "markdown_report": "string"
}

2) The markdown_report must use the exact structure provided above and nothing else.

Guidelines:
- Be specific to the user's answers; vary language naturally across users.
- Avoid generic filler; write fresh, tailored content each time.
- Do not use these phrases in the Overview: "balanced, art-forward profile", "crafted details".
- Do not output persona names outside the Allowed list; never output "Refined" as style persona.
Safety: No medical/diagnostic claims, no products, no sentiment scores. No chain-of-thought.
`;

                        const genRes = await fetch(
                            `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
                            {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({
                                    contents: [{ parts: [{ text: prompt }] }],
                                    generationConfig: { temperature: 0.7, maxOutputTokens: 1200, responseMimeType: 'application/json' }
                                })
                            }
                        );

                        if (genRes.ok) {
                            const genData: any = await genRes.json();
                            // Prefer direct JSON when responseMimeType is respected
                            const directJson = genData.candidates?.[0]?.content?.parts?.[0]?.text;
                            try {
                                if (directJson) {
                                    const parsed = JSON.parse(directJson);
                                    scores = parsed.scores || scores;
                                    style_persona = parsed.style_persona || style_persona;
                                    bag_personality = parsed.bag_personality || bag_personality;
                                    markdown_report = parsed.markdown_report || markdown_report;
                                }
                            } catch (e) {
                                // Fallback: try to extract JSON block from text content
                                const raw = typeof directJson === 'string' ? directJson : '';
                                const match = raw.match(/\{[\s\S]*\}/);
                                if (match) {
                                    try {
                                        const parsed = JSON.parse(match[0]);
                                        scores = parsed.scores || scores;
                                        style_persona = parsed.style_persona || style_persona;
                                        bag_personality = parsed.bag_personality || bag_personality;
                                        markdown_report = parsed.markdown_report || markdown_report;
                                    } catch (e2) {
                                        console.error('LLM JSON parse (fallback) failed:', e2);
                                    }
                                }
                            }
                        } else {
                            const errTxt = await genRes.text();
                            console.error('Gemini error:', errTxt);
                        }
                    } catch (err) {
                        console.error('LLM generation error:', err);
                    }
                }

                // Enforce allowed persona names and bag types; randomize fallback for uniqueness
                const pickRandom = (arr: string[]) => arr[Math.floor(Math.random() * arr.length)] || '';
                if (!allowedPersonas.includes(style_persona)) {
                    style_persona = pickRandom(allowedPersonas) || 'The Dreamteller';
                }
                if (!allowedBagTypes.includes(bag_personality)) {
                    bag_personality = pickRandom(allowedBagTypes) || 'Crossbody';
                }

                // Fallbacks if LLM missing
                if (!markdown_report) {
                    const cues = (quizAnswers || '').split(/\n|,|;|\.|\|/).map(s => s.trim()).filter(Boolean).slice(0, 3);
                    const cueLine = cues.length ? cues.join('; ') : `${style_persona} with ${bag_personality}`;
                    const personalityName = style_persona || 'The Distinct Individual';
                    const overview = `You come across as ${style_persona || 'a distinct style'} who favors ${bag_personality || 'practical ease'}. Your answers point to ${cueLine.toLowerCase()}.`;
                    const styleStatement = `Your style reflects a unique blend of personality traits, creating a distinctive aesthetic that's both personal and expressive.`;
                    const styleProfile = `Based on your quiz responses, you gravitate toward ${cueLine || 'sophisticated and well-crafted items'}. Your style preferences suggest an appreciation for quality and attention to detail, with a preference for pieces that reflect your personality traits.`;

                    markdown_report = `## Your Personality: ${personalityName}\n\n## Personality Overview\n${overview}\n\n## Trait Breakdown\n- **Boldness:** Moderate — You enjoy vivid motifs but keep practicality in mind.\n  - **Observed Signals:** ${cueLine}\n  - **In Daily Life:** Takes stylistic risks in accents; keeps core pieces versatile\n  - **Helps When / Watch-Outs:** Great for distinctiveness; avoid over-indexing on trends\n- **Elegance:** High — You prize craftsmanship and refinement in finish and form.\n  - **Observed Signals:** Values craftsmanship; appreciation of quality; consideration for comfort\n  - **In Daily Life:** Prefers timeless silhouettes with artisanal detail\n  - **Helps When / Watch-Outs:** Strong cohesion; watch budget or upkeep\n- **Whimsy:** Moderate — Playful elements draw you in without overwhelming utility.\n  - **Observed Signals:** Interest in color or motifs; selective use of statement pieces\n  - **In Daily Life:** Occasional statement pieces; color accents\n  - **Helps When / Watch-Outs:** Keeps looks fresh; avoid clash with daily needs\n\n## Style Statement\n${styleStatement}\n\n## Your Style Profile\n${styleProfile}\n\n## Strengths\n- Taste for crafted detail with practical selection\n- Comfortable individuality in style choices\n- Consistent, versatile day-to-day curation\n- Appreciation of story-driven design\n\n## Potential Challenges or Growth Opportunities\n- Balancing playful color with outfit cohesion\n- Avoiding impulse picks at markets\n- Ensuring function matches routine load\n- Maintaining artisanal pieces\n\n## Suggested Personal Development Tips\n- Pre-plan two color palettes per season to contain whimsy\n- Rotate one statement accessory per week to keep novelty\n- Set a functional checklist before purchase (strap, weight, pockets)\n- Schedule quarterly care for crafted items\n- Track comfort/use in a 2-week wear log`;
                }

                return res.json({ scores, style_persona, bag_personality, markdown_report });
            } catch (error) {
                console.error('generate-llm-report error:', error);
                return res.status(500).json({ error: 'Failed to generate report' });
            }
        });

        app.post('/api/personality/get-next-question', async (req: Request, res: Response) => {
            try {
                const { sessionId, selectedPersonality } = req.body;

                if (!sessionId || !selectedPersonality) {
                    return res.status(400).json({ error: 'Missing sessionId or selectedPersonality' });
                }

                const question = personalityAnalysisService.getNextQuestion(sessionId, selectedPersonality);

                if (!question) {
                    res.json({ message: 'No more questions' });
                } else {
                    res.json({ question });
                }
            } catch (error) {
                console.error('Error getting next question:', error);
                res.status(500).json({ error: 'Failed to get next question' });
            }
        });

        app.post('/api/personality/get-personality-result', async (req: Request, res: Response) => {
            try {
                const { sessionId } = req.body;

                if (!sessionId) {
                    return res.status(400).json({ error: 'Missing sessionId' });
                }

                const result = await personalityAnalysisService.generateResult(sessionId);
                res.json(result);

            } catch (error) {
                console.error('Error generating result:', error);
                res.status(500).json({ error: 'Failed to generate result' });
            }
        });

        // Generate LLM report from an existing quiz session (structured Q/A)
        app.post('/api/personality/generate-llm-report-from-session', async (req: Request, res: Response) => {
            try {
                const { sessionId } = req.body as { sessionId?: string };
                if (!sessionId) {
                    return res.status(400).json({ error: 'Missing sessionId' });
                }

                const session = personalityAnalysisService.getSession(sessionId);
                if (!session || session.answers.length === 0) {
                    return res.status(400).json({ error: 'Invalid session or no answers' });
                }

                // Build a compact quizAnswers narrative from asked questions and answers
                const qaPairs = session.askedQuestions.map((q, i) => `Q${i + 1}: ${q}\nA${i + 1}: ${session.answers[i]}`);
                const quizAnswers = qaPairs.join('\n');

                // Reuse the LLM path for generating report
                const resp = await fetch(`http://localhost:${PORT}/api/personality/generate-llm-report`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ quizAnswers })
                });

                if (!resp.ok) {
                    const text = await resp.text();
                    return res.status(500).json({ error: text || 'Report generation failed' });
                }

                const data = await resp.json();
                return res.json(data);
            } catch (error) {
                console.error('generate-llm-report-from-session error:', error);
                return res.status(500).json({ error: 'Failed to generate report from session' });
            }
        });

        // Unified personality report generation endpoint (consolidates all personality report types)
        app.post('/api/personality/generate-report', async (req: Request, res: Response) => {
            try {
                const { type, data } = req.body as {
                    type: 'personality-only' | 'comprehensive' | 'from-session';
                    data: any;
                };

                if (!type || !data) {
                    return res.status(400).json({ error: 'Missing type or data' });
                }

                console.log('🎯 Generating personality report:', { type, dataKeys: Object.keys(data) });

                let result: any = {};

                switch (type) {
                    case 'personality-only':
                        // Ensure all user inputs are included
                        const quizAnswers = data.quizJourney?.map((j: any) => `${j.question}: ${j.selectedOption}`).join(', ') ||
                            data.answers?.map((a: any) => `${a.question}: ${a.answer}`).join(', ') ||
                            data.quizAnswers || '';

                        console.log('📝 Quiz answers being sent to LLM:', quizAnswers);

                        result = await llmService.process({
                            type: 'personality-report',
                            data: {
                                quizAnswers,
                                personalityType: data.personalityType || 'Dynamic Individual',
                                dominantTraits: data.dominantTraits || ['Elegance', 'Sincerity']
                            },
                            options: { maxTokens: 2000 }
                        });
                        break;

                    case 'comprehensive':
                        result = await llmService.process({
                            type: 'personality-report',
                            data: {
                                quizAnswers: data.quizAnswers || '',
                                personalityType: data.personalityType || 'Dynamic Individual',
                                dominantTraits: data.dominantTraits || ['Elegance', 'Sincerity']
                            },
                            options: { maxTokens: 2000 }
                        });
                        break;

                    case 'from-session':
                        const session = personalityAnalysisService.getSession(data.sessionId);
                        if (!session || session.answers.length === 0) {
                            return res.status(400).json({ error: 'Invalid session or no answers' });
                        }
                        const qaPairs = session.askedQuestions.map((q, i) => `Q${i + 1}: ${q}\nA${i + 1}: ${session.answers[i]}`);
                        const sessionQuizAnswers = qaPairs.join('\n');

                        result = await llmService.process({
                            type: 'personality-report',
                            data: {
                                quizAnswers: sessionQuizAnswers,
                                personalityType: 'Dynamic Individual',
                                dominantTraits: ['Elegance', 'Sincerity']
                            },
                            options: { maxTokens: 2000 }
                        });
                        break;

                    default:
                        return res.status(400).json({ error: 'Invalid report type' });
                }

                console.log('🤖 LLM result:', { success: result.success, hasData: !!result.data });
                if (result.success && result.data) {
                    console.log('📝 LLM Generated Content Preview:', typeof result.data === 'string' ? result.data.substring(0, 500) + '...' : 'Not a string');
                }

                if (result.success && result.data) {
                    // If LLM returned structured JSON, return it directly
                    if (typeof result.data === 'object' && result.data.reportTitle) {
                        return res.json({
                            success: true,
                            ...result.data,
                            llm_used: true
                        });
                    }

                    // Validate the markdown content structure
                    if (typeof result.data === 'string') {
                        const content = result.data;
                        const hasPersonalityOverview = content.includes('# Personality Overview');
                        const hasUniqueTraits = content.includes('# Your Unique Traits');
                        const hasElegance = content.includes('**Elegance**');
                        const hasSincerity = content.includes('**Sincerity**');
                        const hasVersatility = content.includes('**Versatility**');
                        const hasCompetence = content.includes('**Competence**');

                        console.log('📋 Content Structure Validation:', {
                            hasPersonalityOverview,
                            hasUniqueTraits,
                            hasElegance,
                            hasSincerity,
                            hasVersatility,
                            hasCompetence,
                            contentLength: content.length,
                            wordCount: content.split(/\s+/).length
                        });

                        // If content seems incomplete, log a warning
                        if (!hasPersonalityOverview || !hasUniqueTraits || !hasElegance || !hasSincerity || !hasVersatility || !hasCompetence) {
                            console.warn('⚠️ LLM may have generated incomplete content. Expected format not found.');
                        }
                    }

                    // If LLM returned text, wrap it in markdown_report field
                    return res.json({
                        success: true,
                        markdown_report: result.data,
                        llm_used: true
                    });
                } else {
                    console.error('❌ LLM service failed:', result.error);
                    return res.json({
                        success: false,
                        error: result.error || 'LLM service failed',
                        llm_used: false
                    });
                }
            } catch (error) {
                console.error('generate-report error:', error);
                return res.status(500).json({ error: 'Failed to generate report' });
            }
        });

        // Health check for personality analysis service
        app.get('/api/personality/health', (req: Request, res: Response) => {
            res.json({
                status: 'healthy',
                service: 'personality-analysis',
                timestamp: new Date().toISOString()
            });
        });

        // Check if user is already a member of Silver Circle
        app.post('/api/anuschka-circle/check-membership', async (req: Request, res: Response) => {
            try {
                const { email, phone } = req.body;

                if (!email && !phone) {
                    return res.status(400).json({
                        error: 'Email or phone number is required'
                    });
                }

                const isMember = await databaseService.isUserMember(email, phone);

                res.json({
                    isMember,
                    message: isMember ? 'User is already a member' : 'User is not a member'
                });
            } catch (error) {
                console.error('❌ Error checking membership:', error);
                res.status(500).json({
                    error: 'Failed to check membership status',
                    isMember: false // Default to false if there's an error
                });
            }
        });

        // Product type question endpoint
        app.get('/api/personality/product-type-question', (req: Request, res: Response) => {
            try {
                const question = personalityAnalysisService.getProductTypeQuestion();
                res.json({ question });
            } catch (error) {
                console.error('Error getting product type question:', error);
                res.status(500).json({ error: 'Internal server error' });
            }
        });

        // Set product type preference endpoint
        app.post('/api/personality/set-product-type/:sessionId', (req: Request, res: Response) => {
            try {
                const { sessionId } = req.params;
                const { productType } = req.body;

                if (!productType) {
                    return res.status(400).json({ error: 'Product type is required' });
                }

                personalityAnalysisService.setProductType(sessionId, productType);
                res.json({ success: true, message: 'Product type set successfully' });
            } catch (error) {
                console.error('Error setting product type:', error);
                res.status(500).json({ error: 'Internal server error' });
            }
        });



        // Save complete personality report to CSV
        app.post('/api/personality/save-report', async (req: Request, res: Response) => {
            try {
                const {
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
                    userInfo
                } = req.body;

                // Extract user cookie from request headers or cookies
                const userCookieId = req.headers['x-user-cookie'] as string ||
                    req.cookies?.user_cookie_id ||
                    generateUserCookieId();

                // Check if this is a new or returning user
                const existingUser = await personalityReportCSVService.getUserByCookieId(userCookieId);
                const isNewUser = !existingUser;

                // Get user agent and IP address
                const userAgent = req.headers['user-agent'] || '';
                let ipAddress = req.ip ||
                    req.connection.remoteAddress ||
                    req.socket.remoteAddress || '';

                // Handle x-forwarded-for header which can be an array
                if (req.headers['x-forwarded-for']) {
                    const forwardedFor = req.headers['x-forwarded-for'];
                    ipAddress = Array.isArray(forwardedFor) ? forwardedFor[0] : forwardedFor;
                }

                // Update user visit information
                if (existingUser) {
                    await personalityReportCSVService.updateUserVisitInfo(userCookieId, false);
                }

                if (!personality || !sentiment) {
                    return res.status(400).json({
                        error: 'Missing required fields: personality and sentiment are required'
                    });
                }

                // Helper functions to extract data from markdown report
                const extractPersonalityName = (markdown: string): string | undefined => {
                    if (!markdown) return undefined;
                    const lines = markdown.split('\n');
                    for (let i = 0; i < lines.length; i++) {
                        if (lines[i].includes('## Your Personality:')) {
                            const match = lines[i].match(/## Your Personality:\s*(.+)/);
                            if (match && match[1]) {
                                return match[1].trim();
                            }
                        }
                    }
                    return undefined;
                };

                const extractStyleStatement = (markdown: string): string | undefined => {
                    if (!markdown) return undefined;
                    const lines = markdown.split('\n');
                    for (let i = 0; i < lines.length; i++) {
                        if (lines[i].includes('## Style Statement')) {
                            let content = '';
                            for (let j = i + 1; j < lines.length; j++) {
                                if (lines[j].startsWith('## ')) break;
                                if (lines[j].trim()) {
                                    content += lines[j].trim() + ' ';
                                }
                            }
                            return content.trim() || undefined;
                        }
                    }
                    return undefined;
                };

                const extractStyleProfile = (markdown: string): string | undefined => {
                    if (!markdown) return undefined;
                    const lines = markdown.split('\n');
                    for (let i = 0; i < lines.length; i++) {
                        if (lines[i].includes('## Your Style Profile')) {
                            let content = '';
                            for (let j = i + 1; j < lines.length; j++) {
                                if (lines[j].startsWith('## ')) break;
                                if (lines[j].trim()) {
                                    content += lines[j].trim() + ' ';
                                }
                            }
                            return content.trim() || undefined;
                        }
                    }
                    return undefined;
                };

                // Prepare complete report data
                const completeReportData = {
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
                    extractedPersonalityName: extractPersonalityName(markdownReport),
                    extractedStyleStatement: extractStyleStatement(markdownReport),
                    extractedStyleProfile: extractStyleProfile(markdownReport),
                    recommendations,
                    timestamp: new Date().toISOString(),
                    userInfo: {
                        email: userInfo?.email,
                        name: userInfo?.name,
                        phone: userInfo?.phone,
                        session_id: userInfo?.session_id,
                        circle_member: userInfo?.circle_member || false,
                        // User tracking and cookie data
                        userCookieId,
                        isNewUser,
                        firstVisitDate: isNewUser ? new Date().toISOString() : existingUser?.first_visit_date,
                        lastVisitDate: new Date().toISOString(),
                        visitCount: isNewUser ? 1 : (existingUser?.visit_count || 1),
                        userAgent,
                        ipAddress,
                        userLocation: '' // Could be enhanced with geolocation service
                    }
                };

                // Save to CSV
                await personalityReportCSVService.savePersonalityReport(completeReportData);

                // Set user cookie in response
                res.cookie('user_cookie_id', userCookieId, {
                    maxAge: 365 * 24 * 60 * 60 * 1000, // 1 year
                    httpOnly: true,
                    secure: process.env.NODE_ENV === 'production',
                    sameSite: 'strict'
                });

                res.json({
                    success: true,
                    message: 'Personality report saved successfully',
                    reportId: completeReportData.userInfo.session_id || 'generated_id',
                    userCookieId,
                    isNewUser,
                    visitCount: completeReportData.userInfo.visitCount
                });

            } catch (error) {
                console.error('❌ Error saving personality report:', error);
                res.status(500).json({
                    error: 'Failed to save personality report',
                    details: error instanceof Error ? error.message : 'Unknown error'
                });
            }
        });

        // Get personality reports from CSV
        app.get('/api/personality/reports', async (req: Request, res: Response) => {
            try {
                const reports = await personalityReportCSVService.getReports();
                res.json({
                    success: true,
                    count: reports.length,
                    reports
                });
            } catch (error) {
                console.error('❌ Error retrieving personality reports:', error);
                res.status(500).json({
                    error: 'Failed to retrieve personality reports',
                    details: error instanceof Error ? error.message : 'Unknown error'
                });
            }
        });

        // Get specific personality report by user ID
        app.get('/api/personality/reports/:userId', async (req: Request, res: Response) => {
            try {
                const { userId } = req.params;
                const report = await personalityReportCSVService.getReportByUserId(userId);

                if (!report) {
                    return res.status(404).json({
                        error: 'Report not found',
                        userId
                    });
                }

                res.json({
                    success: true,
                    report
                });
            } catch (error) {
                console.error('❌ Error retrieving personality report by user ID:', error);
                res.status(500).json({
                    error: 'Failed to retrieve personality report',
                    details: error instanceof Error ? error.message : 'Unknown error'
                });
            }
        });

        // User analytics endpoints
        app.get('/api/personality/user-stats', async (req: Request, res: Response) => {
            try {
                const newUsersCount = await personalityReportCSVService.getNewUsersCount();
                const returningUsersCount = await personalityReportCSVService.getReturningUsersCount();
                const totalReports = await personalityReportCSVService.getReports();

                res.json({
                    success: true,
                    stats: {
                        totalUsers: totalReports.length,
                        newUsers: newUsersCount,
                        returningUsers: returningUsersCount,
                        conversionRate: totalReports.length > 0 ? (returningUsersCount / totalReports.length * 100).toFixed(2) : 0
                    }
                });
            } catch (error) {
                console.error('❌ Error getting user stats:', error);
                res.status(500).json({
                    error: 'Failed to get user stats',
                    details: error instanceof Error ? error.message : 'Unknown error'
                });
            }
        });

        // Fashion Recommendations API endpoint - Uses the new FashionRecommendationService
        app.post('/api/fashion-recommendations', async (req: Request, res: Response) => {
            try {
                const { artworkTheme, bagType, personalityScores, sentiment, description } = req.body;

                console.log('🎯 Fashion Recommendation Request:', {
                    artworkTheme,
                    bagType,
                    hasPersonalityScores: !!personalityScores,
                    sentiment
                });

                if (!artworkTheme || !bagType) {
                    return res.status(400).json({
                        success: false,
                        error: 'Artwork theme and bag type are required'
                    });
                }

                const recommendationRequest = {
                    artworkTheme,
                    bagType,
                    personalityScores,
                    sentiment,
                    description
                };

                const result = await fashionRecommendationService.getRecommendations(recommendationRequest);

                if (!result.success) {
                    return res.status(400).json(result);
                }

                console.log(`✅ Fashion recommendations generated: ${result.data?.recommendations.length} products`);
                res.json(result);

            } catch (error) {
                console.error('❌ Fashion recommendation error:', error);
                res.status(500).json({
                    success: false,
                    error: 'Failed to generate fashion recommendations'
                });
            }
        });

        // Artwork Analysis API endpoint - Analyzes artwork selections and suggests optimal bag types from Excel
        app.post('/api/artwork-analysis', async (req: Request, res: Response) => {
            try {
                const {
                    artworkTheme,
                    productType,
                    artworkPreferences,
                    personality,
                    sentiment
                } = req.body;

                console.log(`🎨 Artwork Analysis Request:`, {
                    artworkTheme,
                    productType,
                    artworkPreferences,
                    personality,
                    sentiment
                });

                // LLM Prompt for analyzing artwork selections and suggesting bag types from Excel
                const artworkAnalysisPrompt = `You are an expert fashion stylist and product curator specializing in handbag and accessory recommendations. 

Your task is to analyze the user's artwork and product preferences${personality || sentiment ? ', along with their personality and mood,' : ''} to suggest the most suitable bag types from our available categories.

**User Profile:**
- Selected Artwork Theme: ${artworkTheme}
- Initial Product Choice: ${productType}
- Artwork Preference Details: ${JSON.stringify(artworkPreferences)}
${personality ? `- Personality Traits: ${personality}` : ''}
${sentiment ? `- Current Mood/Sentiment: ${sentiment}` : ''}

**Available Product Categories in Excel Database:**
1. wallet - Wallets & Card Holders (compact organizers for cards, cash, essentials)
2. crossbody - Crossbody Bags (hands-free bags worn across the body)
3. satchel - Satchels & Totes (structured bags with handles and compartments)
4. hobo - Hobo Bags (soft, slouchy shoulder bags)
5. clutch - Clutches & Evening Bags (elegant handheld bags for special occasions)
6. pouch - Pouches & Organizers (small bags for cosmetics, electronics, travel)
7. accessory - Accessories & Charms (bag charms, cuffs, decorative items)

**Analysis Instructions:**
1. Consider how the artwork theme (${artworkTheme}) relates to aesthetic preferences and functional needs
2. Analyze what the artwork theme suggests about the user's style preferences
${personality ? '3. Factor in their personality traits to understand their lifestyle and functional needs' : ''}
${sentiment ? '4. Consider their current mood and how it might influence their style choices' : ''}
${personality || sentiment ? '5. Think about how the chosen product type aligns with their complete profile' : '3. Think about how the chosen product type aligns with the artwork aesthetic'}
${personality || sentiment ? '6. Suggest the BEST bag type from the available categories that matches their artwork, personality, and current state' : '4. Suggest the BEST bag type from the available categories that matches their artwork and product selections'}

**Output Requirements:**
Return JSON only:
{
  "suggestedBagType": "category_name_from_list_above",
  "confidence": 85-95,
  "insights": "Brief explanation of why this bag type suits their artwork preferences${personality ? ', personality traits' : ''}${sentiment ? ', and current mood' : ''}. Focus on style alignment and functional fit.",
  "alternativeTypes": ["type1", "type2"] 
}

No additional text outside JSON.`;

                // Make LLM request for artwork analysis
                const genRes = await fetch(
                    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
                    {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            contents: [{ parts: [{ text: artworkAnalysisPrompt }] }],
                            generationConfig: {
                                temperature: 0.7,
                                maxOutputTokens: 400,
                                responseMimeType: 'application/json'
                            }
                        })
                    }
                );

                if (!genRes.ok) {
                    console.error('❌ LLM request failed:', genRes.status, genRes.statusText);
                    
                    // Handle rate limiting specifically
                    if (genRes.status === 429) {
                        console.log('⚠️ LLM API rate limit exceeded, using fallback analysis');
                        return res.json({
                            success: true,
                            suggestedBagType: productType || 'crossbody',
                            confidence: 85,
                            insights: `Based on your ${artworkTheme} theme preference, a ${productType || 'crossbody'} style would complement your artistic taste perfectly.`,
                            alternativeTypes: getFallbackAlternatives(artworkTheme),
                            originalSelection: productType
                        });
                    }
                    
                    throw new Error(`LLM request failed: ${genRes.status}`);
                }

                const genData = await genRes.json();
                const llmResponse = genData.candidates?.[0]?.content?.parts?.[0]?.text;

                if (!llmResponse) {
                    throw new Error('No response from LLM');
                }

                // Parse LLM JSON response
                let analysisResult;
                try {
                    analysisResult = JSON.parse(llmResponse);
                } catch (parseError) {
                    console.error('❌ Failed to parse LLM response:', llmResponse);
                    throw new Error('Invalid LLM response format');
                }

                console.log(`✅ Artwork Analysis Result:`, analysisResult);

                // Validate suggested bag type is in our available categories
                const validBagTypes = ['wallet', 'crossbody', 'satchel', 'hobo', 'clutch', 'pouch', 'accessory'];
                if (!validBagTypes.includes(analysisResult.suggestedBagType)) {
                    console.warn(`⚠️ Invalid bag type suggested: ${analysisResult.suggestedBagType}, using fallback`);
                    analysisResult.suggestedBagType = productType || 'crossbody';
                }

                res.json({
                    success: true,
                    suggestedBagType: analysisResult.suggestedBagType,
                    confidence: analysisResult.confidence || 85,
                    insights: analysisResult.insights || `Based on your preference for ${artworkTheme} themes, this ${analysisResult.suggestedBagType} style complements your artistic taste perfectly.`,
                    alternativeTypes: analysisResult.alternativeTypes || [],
                    originalSelection: productType
                });

            } catch (error) {
                console.error('❌ Error in artwork analysis:', error);
                res.status(200).json({
                    success: true,
                    suggestedBagType: req.body.productType || 'crossbody', // Fallback to original selection
                    confidence: 85,
                    insights: `Based on your ${req.body.artworkTheme || 'selected'} theme preference, a ${req.body.productType || 'crossbody'} style would complement your artistic taste perfectly.`,
                    alternativeTypes: getFallbackAlternatives(req.body.artworkTheme || 'other (unspecified)'),
                    originalSelection: req.body.productType
                });
            }
        });

        app.get('/api/personality/user/:cookieId', async (req: Request, res: Response) => {
            try {
                const { cookieId } = req.params;
                const user = await personalityReportCSVService.getUserByCookieId(cookieId);

                if (!user) {
                    return res.status(404).json({
                        error: 'User not found',
                        cookieId
                    });
                }

                res.json({
                    success: true,
                    user
                });
            } catch (error) {
                console.error('❌ Error retrieving user by cookie ID:', error);
                res.status(500).json({
                    error: 'Failed to retrieve user',
                    details: error instanceof Error ? error.message : 'Unknown error'
                });
            }
        });

        // User account creation endpoint
        app.post('/api/user/create-account', async (req: Request, res: Response) => {
            try {
                const { name, email, phone, password, selectedMembershipTier } = req.body;
                const userCookieId = req.cookies.user_cookie_id;

                if (!userCookieId) {
                    return res.status(400).json({
                        success: false,
                        message: 'User cookie not found. Please refresh the page and try again.'
                    });
                }

                if (!name || !email || !phone || !password) {
                    return res.status(400).json({
                        success: false,
                        message: 'All fields are required'
                    });
                }

                const userData = {
                    name,
                    email,
                    phone,
                    password,
                    selectedMembershipTier,
                    user_cookie_id: userCookieId,
                    user_agent: req.headers['user-agent'],
                    ip_address: req.ip || req.connection.remoteAddress,
                    user_location: '' // Could be enhanced with geolocation
                };

                const result = await userService.createUser(userData);

                if (result.success) {
                    res.json({
                        success: true,
                        message: result.message,
                        user_id: result.user_id
                    });
                } else {
                    res.status(400).json({
                        success: false,
                        message: result.message
                    });
                }
            } catch (error) {
                console.error('❌ Error creating user account:', error);
                res.status(500).json({
                    success: false,
                    message: 'Failed to create account. Please try again.'
                });
            }
        });

        // Check if user exists by cookie ID
        app.get('/api/user/check-exists/:cookieId', async (req: Request, res: Response) => {
            try {
                const { cookieId } = req.params;
                const result = await userService.checkUserExists(cookieId);

                res.json({
                    exists: result.exists,
                    user: result.user,
                    success: true
                });
            } catch (error) {
                console.error('❌ Error checking user existence:', error);
                res.status(500).json({
                    success: false,
                    error: 'Failed to check user existence'
                });
            }
        });

        // Get all users
        app.get('/api/user/all-users', async (req: Request, res: Response) => {
            try {
                const users = await userService.getAllUsers();

                res.json({
                    success: true,
                    users: users
                });
            } catch (error) {
                console.error('❌ Error getting all users:', error);
                res.status(500).json({
                    success: false,
                    error: 'Failed to get users'
                });
            }
        });

        // Delete user
        app.delete('/api/user/delete/:userId', async (req: Request, res: Response) => {
            try {
                const { userId } = req.params;
                const result = await userService.deleteUser(userId);

                if (result) {
                    res.json({
                        success: true,
                        message: 'User deleted successfully'
                    });
                } else {
                    res.status(404).json({
                        success: false,
                        message: 'User not found'
                    });
                }
            } catch (error) {
                console.error('❌ Error deleting user:', error);
                res.status(500).json({
                    success: false,
                    error: 'Failed to delete user'
                });
            }
        });

        // Check authentication status
        app.get('/api/user/check-auth/:cookieId', async (req: Request, res: Response) => {
            try {
                const { cookieId } = req.params;
                const authToken = req.headers.authorization?.replace('Bearer ', '');

                if (!authToken || !authToken.startsWith('authenticated_')) {
                    return res.status(401).json({
                        success: false,
                        message: 'Invalid authentication token'
                    });
                }

                const user = await userService.getUserByCookieId(cookieId);

                if (user) {
                    res.json({
                        success: true,
                        user: user
                    });
                } else {
                    res.status(404).json({
                        success: false,
                        message: 'User not found'
                    });
                }
            } catch (error) {
                console.error('❌ Error checking authentication:', error);
                res.status(500).json({
                    success: false,
                    error: 'Failed to check authentication'
                });
            }
        });

        // Helper function to generate unique user cookie ID
        const generateUserCookieId = (): string => {
            return 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        };

        // Get next membership number endpoint
        app.get('/api/anuschka-circle/next-membership-number', async (req: Request, res: Response) => {
            try {
                const nextNumber = await databaseService.getNextMembershipNumber();
                res.json({
                    success: true,
                    membershipNumber: nextNumber
                });
            } catch (error) {
                console.error('❌ Failed to get next membership number:', error);
                res.status(500).json({ error: 'Failed to get next membership number' });
            }
        });

        // Anuschka Silver Circle registration endpoint
        app.post('/api/anuschka-circle/register', async (req: Request, res: Response) => {
            try {
                const { name, email, phone } = req.body;

                // Validate required fields
                if (!name || !email || !phone) {
                    return res.status(400).json({
                        error: 'All fields are required: name, email, phone'
                    });
                }

                // Validate email format
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(email)) {
                    return res.status(400).json({ error: 'Invalid email format' });
                }

                // Validate phone format
                const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
                if (!phoneRegex.test(phone.replace(/\s/g, ''))) {
                    return res.status(400).json({ error: 'Invalid phone number format' });
                }

                // Get next membership number
                const membershipNumber = await databaseService.getNextMembershipNumber();

                console.log('👑 New Anuschka Silver Circle registration:', {
                    name,
                    email,
                    phone: phone.replace(/\d(?=\d{4})/g, '*'), // Mask phone for logging
                    membershipNumber
                });

                // FIRST: Save user to database
                const newUser = await databaseService.createUser({
                    name,
                    email,
                    phone,
                    membership_number: membershipNumber
                });

                console.log('✅ User saved to database:', newUser.email);

                res.json({
                    success: true,
                    message: 'Registration successful!',
                    membershipNumber,
                    user: {
                        id: newUser.id,
                        name: newUser.name,
                        email: newUser.email,
                        membershipNumber: newUser.membership_number
                    }
                });

            } catch (error) {
                console.error('❌ Anuschka Circle registration error:', error);

                // Handle specific database errors
                if (error instanceof Error) {
                    if (error.message.includes('already exists')) {
                        return res.status(409).json({ error: 'User with this email already exists' });
                    }
                    if (error.message.includes('membership number already exists')) {
                        return res.status(409).json({ error: 'Membership number already exists' });
                    }
                }

                res.status(500).json({ error: 'Registration failed. Please try again.' });
            }
        });

        // Additional Anuschka Circle API endpoints
        app.get('/api/anuschka-circle/users', async (req: Request, res: Response) => {
            try {
                const users = await databaseService.getAllUsers();
                res.json({
                    success: true,
                    users,
                    count: users.length
                });
            } catch (error) {
                console.error('❌ Failed to get users:', error);
                res.status(500).json({ error: 'Failed to get users' });
            }
        });

        app.get('/api/anuschka-circle/users/count', async (req: Request, res: Response) => {
            try {
                const count = await databaseService.getUsersCount();
                res.json({
                    success: true,
                    count
                });
            } catch (error) {
                console.error('❌ Failed to get users count:', error);
                res.status(500).json({ error: 'Failed to get users count' });
            }
        });

        app.get('/api/anuschka-circle/users/:email', async (req: Request, res: Response) => {
            try {
                const { email } = req.params;
                const user = await databaseService.getUserByEmail(email);

                if (!user) {
                    return res.status(404).json({ error: 'User not found' });
                }

                res.json({
                    success: true,
                    user
                });
            } catch (error) {
                console.error('❌ Failed to get user:', error);
                res.status(500).json({ error: 'Failed to get user' });
            }
        });

        app.get('/api/anuschka-circle/membership/:membershipNumber', async (req: Request, res: Response) => {
            try {
                const { membershipNumber } = req.params;
                const user = await databaseService.getUserByMembershipNumber(membershipNumber);

                if (!user) {
                    return res.status(404).json({ error: 'Membership not found' });
                }

                res.json({
                    success: true,
                    user
                });
            } catch (error) {
                console.error('❌ Failed to get membership:', error);
                res.status(500).json({ error: 'Failed to get membership' });
            }
        });



        // Update user endpoint
        app.put('/api/anuschka-circle/users/:id', async (req: Request, res: Response) => {
            try {
                const { id } = req.params;
                const { name, email, phone, membership_number } = req.body;

                // Validate required fields
                if (!name || !email || !phone || !membership_number) {
                    return res.status(400).json({
                        error: 'All fields are required: name, email, phone, membership_number'
                    });
                }

                // Validate email format
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(email)) {
                    return res.status(400).json({ error: 'Invalid email format' });
                }

                // Validate phone format
                const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
                if (!phoneRegex.test(phone.replace(/\s/g, ''))) {
                    return res.status(400).json({ error: 'Invalid phone number format' });
                }

                const userId = parseInt(id);
                if (isNaN(userId)) {
                    return res.status(400).json({ error: 'Invalid user ID' });
                }

                console.log('👑 Updating Anuschka Circle user:', { id: userId, name, email });

                const updatedUser = await databaseService.updateUser(userId, {
                    name,
                    email,
                    phone,
                    membership_number
                });

                res.json({
                    success: true,
                    message: 'User updated successfully',
                    user: updatedUser
                });

            } catch (error) {
                console.error('❌ Failed to update user:', error);
                if (error instanceof Error && error.message === 'User not found') {
                    res.status(404).json({ error: 'User not found' });
                } else {
                    res.status(500).json({ error: 'Failed to update user' });
                }
            }
        });

        // Delete user endpoint
        app.delete('/api/anuschka-circle/users/:id', async (req: Request, res: Response) => {
            try {
                const { id } = req.params;
                const userId = parseInt(id);

                if (isNaN(userId)) {
                    return res.status(400).json({ error: 'Invalid user ID' });
                }

                console.log('👑 Deleting Anuschka Circle user:', userId);

                const deleted = await databaseService.deleteUser(userId);

                if (deleted) {
                    res.json({
                        success: true,
                        message: 'User deleted successfully'
                    });
                } else {
                    res.status(404).json({ error: 'User not found' });
                }

            } catch (error) {
                console.error('❌ Failed to delete user:', error);
                res.status(500).json({ error: 'Failed to delete user' });
            }
        });

        // Get user by ID endpoint
        app.get('/api/anuschka-circle/users/id/:id', async (req: Request, res: Response) => {
            try {
                const { id } = req.params;
                const userId = parseInt(id);

                if (isNaN(userId)) {
                    return res.status(400).json({ error: 'Invalid user ID' });
                }

                const user = await databaseService.getUserById(userId);

                if (!user) {
                    return res.status(404).json({ error: 'User not found' });
                }

                res.json({
                    success: true,
                    user
                });
            } catch (error) {
                console.error('❌ Failed to get user by ID:', error);
                res.status(500).json({ error: 'Failed to get user' });
            }
        });

        // Missing API endpoints implementation
        app.post('/api/user/profile', async (req: Request, res: Response) => {
            try {
                const { user_cookie_id } = req.body;

                if (!user_cookie_id) {
                    return res.status(400).json({ error: 'User cookie ID is required' });
                }

                const user = await userService.getUserByCookieId(user_cookie_id);

                if (!user) {
                    return res.status(404).json({ error: 'User not found' });
                }

                res.json({
                    success: true,
                    user
                });
            } catch (error) {
                console.error('❌ Error getting user profile:', error);
                res.status(500).json({ error: 'Failed to get user profile' });
            }
        });

        app.post('/api/user/personality-report', async (req: Request, res: Response) => {
            try {
                const { user_cookie_id } = req.body;

                if (!user_cookie_id) {
                    return res.status(400).json({ error: 'User cookie ID is required' });
                }

                const report = await personalityReportCSVService.getUserByCookieId(user_cookie_id);

                if (!report) {
                    return res.status(404).json({ error: 'Personality report not found' });
                }

                res.json({
                    success: true,
                    report
                });
            } catch (error) {
                console.error('❌ Error getting personality report:', error);
                res.status(500).json({ error: 'Failed to get personality report' });
            }
        });

        app.get('/api/products/recommendations', async (req: Request, res: Response) => {
            try {
                const { user_cookie_id } = req.query;

                if (!user_cookie_id) {
                    return res.status(400).json({ error: 'User cookie ID is required' });
                }

                // Get user's personality report to generate recommendations
                const report = await personalityReportCSVService.getUserByCookieId(user_cookie_id as string);

                if (!report) {
                    return res.status(404).json({ error: 'User personality report not found' });
                }

                // Generate recommendations based on personality
                const description = `${report.personality_type} personality with ${report.sentiment} sentiment`;

                // Use the existing recommendation logic
                const keywords = getStyleKeywords(description);
                const matches = findMatchingProducts(keywords, productDatabase);

                // Transform backend Product format to frontend Product format for compatibility
                const frontendCompatibleRecommendations = await Promise.all(matches.slice(0, 12).map(transformToFrontendFormat));

                res.json({
                    success: true,
                    recommendations: frontendCompatibleRecommendations
                });
            } catch (error) {
                console.error('❌ Error getting product recommendations:', error);
                res.status(500).json({ error: 'Failed to get product recommendations' });
            }
        });

        app.post('/api/user/update-preferences', async (req: Request, res: Response) => {
            try {
                const { user_cookie_id, preferences } = req.body;

                if (!user_cookie_id || !preferences) {
                    return res.status(400).json({ error: 'User cookie ID and preferences are required' });
                }

                // Update user preferences in the database
                const updated = await userService.updateUserPreferences(user_cookie_id, preferences);

                if (!updated) {
                    return res.status(404).json({ error: 'User not found' });
                }

                res.json({
                    success: true,
                    message: 'Preferences updated successfully'
                });
            } catch (error) {
                console.error('❌ Error updating user preferences:', error);
                res.status(500).json({ error: 'Failed to update preferences' });
            }
        });

        // Enhanced Personality Quiz endpoints (integrated from enhanced-personality-quiz.ts)
        app.get('/api/enhanced-personality-quiz/questions', async (req: Request, res: Response) => {
            try {
                // Get questions from the enhanced personality quiz service
                const questions = await personalityAnalysisService.getQuestions();
                res.json({
                    success: true,
                    questions
                });
            } catch (error) {
                console.error('❌ Failed to get enhanced quiz questions:', error);
                res.status(500).json({ error: 'Failed to get questions' });
            }
        });

        app.post('/api/enhanced-personality-quiz', async (req: Request, res: Response) => {
            try {
                const { answers, questions } = req.body;

                if (!answers || !questions) {
                    return res.status(400).json({ error: 'Missing answers or questions' });
                }

                // Process the quiz answers and generate results
                const result = await personalityAnalysisService.processEnhancedQuiz(answers, questions);

                res.json({
                    success: true,
                    result
                });
            } catch (error) {
                console.error('❌ Failed to process enhanced quiz:', error);
                res.status(500).json({ error: 'Failed to process quiz' });
            }
        });

        // Personality Report endpoints
        app.post('/api/personality-report/generate', async (req: Request, res: Response) => {
            try {
                const { PersonalityReportController } = await import('./controllers/personalityReportController');
                const controller = new PersonalityReportController();
                await controller.generateReport(req, res);
            } catch (error) {
                console.error('❌ Failed to generate personality report:', error);
                res.status(500).json({ error: 'Failed to generate personality report' });
            }
        });

        app.post('/api/personality-report/generate-from-quiz', async (req: Request, res: Response) => {
            try {
                const { PersonalityReportController } = await import('./controllers/personalityReportController');
                const controller = new PersonalityReportController();
                await controller.generateReportFromQuiz(req, res);
            } catch (error) {
                console.error('❌ Failed to generate personality report from quiz:', error);
                res.status(500).json({ error: 'Failed to generate personality report from quiz' });
            }
        });

        app.get('/api/personality-report/template', async (req: Request, res: Response) => {
            try {
                const { PersonalityReportController } = await import('./controllers/personalityReportController');
                const controller = new PersonalityReportController();
                await controller.getReportTemplate(req, res);
            } catch (error) {
                console.error('❌ Failed to get personality report template:', error);
                res.status(500).json({ error: 'Failed to get personality report template' });
            }
        });

        // Get artwork personality data endpoint
        app.get('/api/artwork-personality/:artworkName', (req: Request, res: Response) => {
            try {
                const { artworkName } = req.params;
                const artworkData = artworkPersonalityService.getArtworkPersonality(artworkName);

                if (!artworkData) {
                    return res.status(404).json({ error: 'Artwork not found' });
                }

                res.json({
                    success: true,
                    artwork: artworkData
                });
            } catch (error) {
                console.error('❌ Failed to get artwork personality:', error);
                res.status(500).json({ error: 'Failed to get artwork personality' });
            }
        });

        // Search artwork personality endpoint
        app.get('/api/artwork-personality/search/:searchTerm', (req: Request, res: Response) => {
            try {
                const { searchTerm } = req.params;
                const results = artworkPersonalityService.searchArtworkByName(searchTerm);

                res.json({
                    success: true,
                    results,
                    count: results.length
                });
            } catch (error) {
                console.error('❌ Failed to search artwork personality:', error);
                res.status(500).json({ error: 'Failed to search artwork personality' });
            }
        });

        // Placeholder image endpoint for frontend fallback images
        app.get('/api/placeholder/:width/:height', (req: Request, res: Response) => {
            try {
                const { width, height } = req.params;
                const { text, bg, fg } = req.query;

                const w = parseInt(width) || 300;
                const h = parseInt(height) || 300;
                const placeholderText = (text as string) || `${w}x${h}`;
                const backgroundColor = (bg as string) || 'f0f0f0';
                const foregroundColor = (fg as string) || '666666';

                // Create a simple SVG placeholder
                const svg = `
                    <svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">
                        <rect width="100%" height="100%" fill="#${backgroundColor}"/>
                        <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="${Math.min(w, h) / 10}" 
                              fill="#${foregroundColor}" text-anchor="middle" dy=".3em">
                            ${placeholderText}
                        </text>
                    </svg>
                `;

                res.setHeader('Content-Type', 'image/svg+xml');
                res.setHeader('Cache-Control', 'public, max-age=3600');
                res.send(svg);
            } catch (error) {
                console.error('❌ Error generating placeholder image:', error);
                res.status(500).json({ error: 'Failed to generate placeholder image' });
            }
        });

        // Helper functions for artwork data processing
        function transformExcelData(rawData: any[]) {
            const artworkData: any[] = [];

            for (const row of rawData) {
                try {
                    // Skip rows without essential data - check for actual Excel column names
                    if (!row['Artwork Name'] || !row['Product Name']) {
                        continue;
                    }

                    // Clean and validate the data using actual Excel column names
                    const artwork = {
                        artworkName: cleanString(row['Artwork Name']),
                        artworkUrl: cleanString(row['Artwork URL']) || generateDefaultUrl(row['Artwork Name']),
                        imageUrl: cleanString(row['Image URL']) || generatePlaceholderImage(row['Artwork Name']),
                        primaryTheme: cleanString(row['Artwork Name']), // Use artwork name as theme for now
                        productType: cleanString(row['Product Name']),
                        personalityTraits: cleanString(row['Personality Traits']) || 'Unique and expressive design',
                        designElements: '', // Not available in current Excel structure
                        overallPersonality: 'Distinctive and creative', // Default value
                        buyerPersonalityMatch: 'Creative and artistic individuals', // Default value
                        psychologicalAppeal: 'Appeals to those who appreciate unique design' // Default value
                    };

                    artworkData.push(artwork);

                } catch (error) {
                    console.warn(`⚠️ Skipping invalid row:`, row, error);
                }
            }

            return artworkData;
        }

        function cleanString(str: any): string {
            if (!str || typeof str !== 'string') return '';
            return str.trim().replace(/\s+/g, ' ');
        }

        function generateDefaultUrl(artworkName: string): string {
            return `https://anuschkaleather.in/collections/${artworkName.toLowerCase().replace(/\s+/g, '-')}`;
        }

        function generatePlaceholderImage(artworkName: string): string {
            return `https://picsum.photos/400/400?random=${artworkName.length}`;
        }

        function getAvailableThemes(artworkData: any[]) {
            const themeCounts = artworkData.reduce((acc: any, artwork: any) => {
                acc[artwork.primaryTheme] = (acc[artwork.primaryTheme] || 0) + 1;
                return acc;
            }, {});

            return Object.keys(themeCounts).map(theme => ({
                theme,
                count: themeCounts[theme]
            }));
        }

        function getAvailableProductTypes(artworkData: any[]) {
            const productCounts = artworkData.reduce((acc: any, artwork: any) => {
                acc[artwork.productType] = (acc[artwork.productType] || 0) + 1;
                return acc;
            }, {});

            return Object.keys(productCounts).map(productType => ({
                productType,
                count: productCounts[productType]
            }));
        }

        function getFallbackData() {
            return [
                {
                    artworkName: "Abstract Leopard",
                    artworkUrl: "https://anuschkaleather.in/collections/abstract-leopard",
                    imageUrl: "https://picsum.photos/400/400?random=1",
                    primaryTheme: "Animal",
                    productType: "Bag",
                    personalityTraits: "Vibrant and wild - for individuals who appreciate the spirit of adventure and are not afraid to stand out",
                    designElements: "Floral Bloom, Soft Pastel Palette",
                    overallPersonality: "Light, joyful, and nurturing",
                    buyerPersonalityMatch: "INFP and ISFJ personalities — warm-hearted, imaginative, and quietly strong",
                    psychologicalAppeal: "Appeals to those who see beauty in subtlety, and seek connection through calm presence"
                },
                {
                    artworkName: "Boho Paisley",
                    artworkUrl: "https://anuschkaleather.in/collections/boho-paisley",
                    imageUrl: "https://picsum.photos/400/400?random=2",
                    primaryTheme: "Pattern/Abstract",
                    productType: "Bag",
                    personalityTraits: "Bohemian and Free-Spirited - creative, nomadic, and expressive",
                    designElements: "Floral Bloom, Soft Pastel Palette",
                    overallPersonality: "Light, joyful, and nurturing",
                    buyerPersonalityMatch: "INFP and ISFJ personalities — warm-hearted, imaginative, and quietly strong",
                    psychologicalAppeal: "Appeals to those who see beauty in subtlety, and seek connection through calm presence"
                }
            ];
        }



        // Serve React app for all non-API routes (catch-all route)
        app.get('*', (req: Request, res: Response) => {
            // Skip API routes and static files
            if (req.path.startsWith('/api/') ||
                req.path.startsWith('/recommendations') ||
                req.path.startsWith('/recommendation') ||
                req.path.startsWith('/loading-images') ||
                req.path.startsWith('/adaptive-quiz-engine.js') ||
                req.path.startsWith('/adaptive_personality_only_GRAPH.json')) {
                console.log(`🚫 Blocked API/static route: ${req.path}`);
                return res.status(404).json({ error: 'API endpoint not found' });
            }

            const indexPath = path.join(process.cwd(), 'dist/index.html');
            console.log(`🔄 Serving React app for route: ${req.path}`);
            console.log(`📄 Index file path: ${indexPath}`);
            console.log(`📄 Index file exists: ${existsSync(indexPath)}`);

            if (existsSync(indexPath)) {
                console.log(`✅ Serving index.html for route: ${req.path}`);
                res.sendFile(indexPath);
            } else {
                console.log('❌ Index.html not found - sending fallback response');
                res.status(404).json({
                    error: 'React app not built properly',
                    message: 'Please check if the build process completed successfully',
                    path: req.path,
                    distExists: existsSync(path.join(process.cwd(), 'dist')),
                    indexExists: existsSync(indexPath)
                });
            }
        });

        app.listen(PORT, () => {
            if (isProduction) {
                console.log(`🚀 Production server running on port ${PORT}`);
                console.log('🌐 Render will provide the public URL');
                console.log('🔗 Your app is live at: https://persona-matcher-ai-1.onrender.com');
            } else {
                console.log(`🚀 Development server running on http://localhost:${PORT}`);
                console.log('📡 Backend API server: http://localhost:8000');
                console.log('🌐 Frontend dev server: http://localhost:3001');
            }
            console.log('📱 Serving React app from /dist');
            console.log('🔧 API endpoints available at /api/*');
            console.log('🎨 New Artwork Quiz available at /artwork-quiz');
            console.log('✨ Optimized API structure with minimal endpoints');
        });
        // Global error handler for JSON responses
        app.use((err: any, req: Request, res: Response, next: any) => {
            console.error('Unhandled error:', err);
            res.status(500).json({ error: err.message || 'Server error' });
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
}

startServer(); 