"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FashionRecommendationService = void 0;
class FashionRecommendationService {
    constructor(llmService, productDatabase) {
        this.llmService = llmService;
        this.productDatabase = productDatabase;
    }
    mapUserThemeToExcelCategory(userTheme) {
        const themeMap = {
            'animal': 'Animal',
            'flowers/plants': 'Flowers/Plants',
            'nature/landscape': 'Nature/Landscape',
            'symbols/emblems': 'Symbols/Emblems',
            'pattern/abstract': 'Pattern/Abstract',
            'vehicles/transport': 'Vehicles/Transport',
            'food & drink': 'Food & Drink',
            'other (unspecified)': 'Other (Unspecified)'
        };
        return themeMap[userTheme.toLowerCase()] || userTheme;
    }
    getRecommendedBagTypes(artworkTheme) {
        const themeMap = {
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
    }
    filterProducts(artworkTheme, bagType) {
        const catalogRows = this.productDatabase.map(p => ({
            ["Artwork Name"]: p.artworkName || '',
            ["Product Name"]: p.productName || p['Product Name'] || '',
            ["Product URL"]: p.productUrl || p['Product URL'] || '',
            ["Image URL"]: p.imageUrl || p['Image URL'] || '',
            ["Price"]: p.price || '',
            ["Themes"]: p.categories || p.Themes || ''
        }));
        const filteredProducts = this.productDatabase.filter(p => {
            const excelThemes = p.categories || p.Themes || '';
            const artworkLower = p.artworkName?.toLowerCase() || '';
            const productName = p.productName || p['Product Name'] || '';
            let themeMatch = false;
            if (artworkTheme.toLowerCase() === 'animal') {
                const animalKeywords = ['animal', 'wild', 'safari', 'jungle', 'lion', 'tiger', 'leopard', 'elephant', 'zebra', 'giraffe', 'cheetah', 'bird', 'eagle', 'owl', 'peacock', 'flamingo', 'parrot', 'swan', 'crane', 'cardinal', 'cat', 'dog', 'horse', 'bear', 'wolf', 'fox', 'deer', 'rabbit', 'butterfly', 'fish', 'turtle', 'creature', 'beast', 'fauna', 'wildlife', 'dragon', 'paw', 'feather', 'fur', 'wing'];
                themeMatch = animalKeywords.some(keyword => excelThemes.includes(keyword) || artworkLower.includes(keyword));
            }
            else if (artworkTheme.toLowerCase() === 'flowers/plants') {
                themeMatch = excelThemes.includes('flower') || excelThemes.includes('plant') || excelThemes.includes('bloom') || excelThemes.includes('floral') || artworkLower.includes('flower') || artworkLower.includes('plant') || artworkLower.includes('bloom') || artworkLower.includes('floral');
            }
            else if (artworkTheme.toLowerCase() === 'nature/landscape') {
                themeMatch = excelThemes.includes('nature') || excelThemes.includes('landscape') || excelThemes.includes('vista') || excelThemes.includes('natural') || artworkLower.includes('nature') || artworkLower.includes('landscape') || artworkLower.includes('vista') || artworkLower.includes('natural');
            }
            else if (artworkTheme.toLowerCase() === 'pattern/abstract') {
                themeMatch = excelThemes.includes('pattern') || excelThemes.includes('abstract') || excelThemes.includes('geometric') || excelThemes.includes('design') || artworkLower.includes('pattern') || artworkLower.includes('abstract') || artworkLower.includes('geometric') || artworkLower.includes('design');
            }
            else if (artworkTheme.toLowerCase() === 'symbols/emblems') {
                themeMatch = excelThemes.includes('symbol') || excelThemes.includes('emblem') || excelThemes.includes('icon') || excelThemes.includes('meaningful') || artworkLower.includes('symbol') || artworkLower.includes('emblem') || artworkLower.includes('icon') || artworkLower.includes('meaningful');
            }
            else if (artworkTheme.toLowerCase() === 'vehicles/transport') {
                themeMatch = excelThemes.includes('vehicle') || excelThemes.includes('transport') || excelThemes.includes('car') || excelThemes.includes('travel') || artworkLower.includes('vehicle') || artworkLower.includes('transport') || artworkLower.includes('car') || artworkLower.includes('travel');
            }
            else if (artworkTheme.toLowerCase() === 'food & drink') {
                themeMatch = excelThemes.includes('food') || excelThemes.includes('drink') || excelThemes.includes('culinary') || excelThemes.includes('gastronomy') || artworkLower.includes('food') || artworkLower.includes('drink') || artworkLower.includes('culinary') || artworkLower.includes('gastronomy');
            }
            else {
                themeMatch = excelThemes.includes(artworkTheme.toLowerCase()) || artworkLower.includes(artworkTheme.toLowerCase());
            }
            const bagMatch = productName.toLowerCase().includes(bagType.toLowerCase());
            return themeMatch && bagMatch;
        });
        console.log(`✅ Found ${filteredProducts.length} products matching theme and bag type`);
        return filteredProducts;
    }
    calculateMatchScore(product, artworkTheme, bagType, personalityScores, sentiment) {
        let score = 0;
        const excelCategory = this.mapUserThemeToExcelCategory(artworkTheme);
        const themeMatch = (product.categories || product.Themes || '') === excelCategory;
        score += themeMatch ? 30 : 0;
        const productName = product.productName || product['Product Name'] || '';
        const bagMatch = productName.toLowerCase().includes(bagType.toLowerCase());
        score += bagMatch ? 20 : 10;
        if (personalityScores) {
            const themeCoefficients = this.getThemeCoefficients(artworkTheme);
            const personalityScore = this.calculatePersonalityAlignment(personalityScores, themeCoefficients);
            score += personalityScore * 40;
        }
        else {
            score += 30;
        }
        if (sentiment) {
            const sentimentScore = this.calculateSentimentScore(sentiment, bagType);
            score += sentimentScore * 10;
        }
        else {
            score += 5;
        }
        return Math.min(100, Math.max(0, score));
    }
    getThemeCoefficients(theme) {
        const coefficients = {
            'animal': { boldness: 0.8, elegance: 0.4, whimsy: 0.7 },
            'flowers/plants': { boldness: 0.4, elegance: 0.9, whimsy: 0.6 },
            'nature/landscape': { boldness: 0.7, elegance: 0.6, whimsy: 0.5 },
            'symbols/emblems': { boldness: 0.5, elegance: 0.7, whimsy: 0.8 },
            'pattern/abstract': { boldness: 0.6, elegance: 0.8, whimsy: 0.9 },
            'vehicles/transport': { boldness: 0.9, elegance: 0.3, whimsy: 0.6 },
            'food & drink': { boldness: 0.5, elegance: 0.6, whimsy: 0.8 },
            'other (unspecified)': { boldness: 0.5, elegance: 0.6, whimsy: 0.7 }
        };
        return coefficients[theme.toLowerCase()] || { boldness: 0.5, elegance: 0.6, whimsy: 0.7 };
    }
    calculatePersonalityAlignment(userScores, themeCoefficients) {
        const userVector = [userScores.boldness / 100, userScores.elegance / 100, userScores.whimsy / 100];
        const themeVector = [themeCoefficients.boldness, themeCoefficients.elegance, themeCoefficients.whimsy];
        const dotProduct = userVector.reduce((sum, val, i) => sum + val * themeVector[i], 0);
        const userMagnitude = Math.sqrt(userVector.reduce((sum, val) => sum + val * val, 0));
        const themeMagnitude = Math.sqrt(themeVector.reduce((sum, val) => sum + val * val, 0));
        return dotProduct / (userMagnitude * themeMagnitude);
    }
    generateFallbackInsights(artworkTheme, bagType) {
        const insights = {
            'animal': {
                'crossbody': 'These animal-themed crossbody bags perfectly capture your adventurous spirit and love for wildlife. The hands-free design makes them ideal for active lifestyles while showcasing beautiful animal artwork that reflects your bold personality.',
                'satchel': 'These animal-themed satchels combine elegance with wild beauty, featuring stunning animal artwork that speaks to your confident nature. The structured design provides both style and functionality for your daily needs.',
                'hobo': 'These animal-themed hobo bags offer a relaxed yet sophisticated look with beautiful wildlife artwork. The soft, slouchy design provides comfort while the animal motifs reflect your free-spirited personality.'
            },
            'flowers/plants': {
                'clutch': 'These floral clutch bags embody elegance and natural beauty, perfect for special occasions. The delicate flower artwork reflects your refined taste and appreciation for nature\'s beauty.',
                'pouch': 'These floral pouches bring a touch of nature to your everyday essentials. The beautiful flower artwork adds a gentle, organic feel that complements your balanced and thoughtful personality.',
                'satchel': 'These floral satchels combine practicality with natural beauty, featuring stunning flower artwork that reflects your appreciation for life\'s simple pleasures and organized lifestyle.'
            },
            'nature/landscape': {
                'crossbody': 'These nature-themed crossbody bags capture the beauty of landscapes and natural elements. The hands-free design is perfect for outdoor adventures while showcasing artwork that reflects your connection to nature.',
                'satchel': 'These nature-themed satchels bring the outdoors to your daily routine with beautiful landscape artwork. The structured design provides organization while the natural motifs reflect your grounded personality.',
                'hobo': 'These nature-themed hobo bags offer a relaxed style with stunning landscape artwork. The comfortable design and natural themes reflect your appreciation for beauty in everyday life.'
            }
        };
        const themeInsights = insights[artworkTheme.toLowerCase()] || {};
        return themeInsights[bagType.toLowerCase()] ||
            `These ${bagType} bags with ${artworkTheme} artwork themes perfectly match your style preferences and personality. The combination reflects your unique taste and lifestyle needs.`;
    }
    calculateSentimentScore(sentiment, bagType) {
        const sentimentBagPreferences = {
            'positive': ['crossbody', 'satchel'],
            'balanced': ['satchel', 'crossbody', 'pouch'],
            'negative': ['pouch', 'wallet', 'satchel']
        };
        const preferredBags = sentimentBagPreferences[sentiment.toLowerCase()] || [];
        return preferredBags.includes(bagType.toLowerCase()) ? 1.0 : 0.5;
    }
    async generateLLMInsights(artworkTheme, bagType, recommendations, personalityScores, sentiment) {
        const prompt = `You are an expert fashion stylist analyzing handbag recommendations.

User Profile:
- Artwork Theme: ${artworkTheme}
- Preferred Bag Type: ${bagType}
- Personality Scores: ${personalityScores ? `Boldness: ${personalityScores.boldness}, Elegance: ${personalityScores.elegance}, Whimsy: ${personalityScores.whimsy}` : 'Not provided'}
- Sentiment: ${sentiment || 'Not specified'}

Selected Products (${recommendations.length} items):
${recommendations.slice(0, 5).map(p => `- ${p.artworkName}: ${p.productName}`).join('\n')}

Write a compelling 2-3 sentence explanation of why these ${bagType} bags with ${artworkTheme} artwork themes are perfect for this user. Focus on:
1. How the artwork theme reflects their personality
2. Why the bag type suits their lifestyle
3. The unique combination of style and functionality

Keep it personal, specific, and inspiring.`;
        try {
            const response = await this.llmService.process({
                type: 'explanation-generation',
                data: {
                    personality: artworkTheme,
                    sentiment: sentiment || 'Balanced',
                    bagPref: bagType,
                    artworkList: recommendations.map(p => p.artworkName).join(', ')
                }
            });
            return response.success ? response.data || this.generateFallbackInsights(artworkTheme, bagType) : this.generateFallbackInsights(artworkTheme, bagType);
        }
        catch (error) {
            console.log('⚠️ LLM insights generation failed, using fallback:', error instanceof Error ? error.message : 'Unknown error');
            return this.generateFallbackInsights(artworkTheme, bagType);
        }
    }
    async getRecommendations(request) {
        try {
            console.log(`🎯 Fashion Recommendation Request:`, {
                artworkTheme: request.artworkTheme,
                bagType: request.bagType,
                hasPersonalityScores: !!request.personalityScores,
                sentiment: request.sentiment
            });
            const filteredProducts = this.filterProducts(request.artworkTheme, request.bagType);
            if (filteredProducts.length === 0) {
                return {
                    success: false,
                    error: `No products found for ${request.artworkTheme} theme and ${request.bagType} bag type. Please try a different combination.`
                };
            }
            const uniqueProducts = filteredProducts.filter((product, index, self) => index === self.findIndex(p => p.artworkName === product.artworkName &&
                p.productName === product.productName));
            const scoredProducts = uniqueProducts.map(product => ({
                product,
                matchScore: this.calculateMatchScore(product, request.artworkTheme, request.bagType, request.personalityScores, request.sentiment)
            }));
            const topProducts = scoredProducts
                .sort((a, b) => b.matchScore - a.matchScore)
                .slice(0, 12);
            const recommendedBagTypes = this.getRecommendedBagTypes(request.artworkTheme);
            const suggestedBagType = request.bagType || recommendedBagTypes[0];
            const alternativeTypes = recommendedBagTypes.filter(bag => bag !== suggestedBagType);
            const insights = await this.generateLLMInsights(request.artworkTheme, request.bagType, topProducts.map(p => p.product), request.personalityScores, request.sentiment);
            const averageMatchScore = topProducts.reduce((sum, p) => sum + p.matchScore, 0) / topProducts.length;
            const confidence = Math.min(95, Math.max(85, Math.round(averageMatchScore)));
            const confidenceLevel = confidence >= 90 ? 'High' : confidence >= 80 ? 'Medium' : 'Low';
            const recommendations = topProducts.map(({ product, matchScore }) => ({
                productId: product.artworkName + '-' + product.productName,
                artworkName: product.artworkName || 'Unknown Artwork',
                productName: product.productName || 'Unknown Product',
                productType: this.detectBagType(product.productName || ''),
                matchScore: Math.round(matchScore),
                confidence: (matchScore >= 90 ? 'High' : matchScore >= 80 ? 'Medium' : 'Low'),
                personalityAlignment: `Perfect match for ${request.artworkTheme} theme preferences`,
                artworkCompatibility: `Features beautiful ${request.artworkTheme} artwork design`,
                functionalFit: `Ideal ${request.bagType} for your lifestyle needs`,
                personalizedInsight: `Reflects your unique style and personality`
            }));
            const userProfile = {
                dominantTraits: request.personalityScores ?
                    this.getDominantTraits(request.personalityScores) :
                    ['Style-conscious', 'Art-appreciative'],
                stylePreferences: [request.artworkTheme, request.bagType],
                lifestyleInsights: `Prefers ${request.artworkTheme} artwork themes with ${request.bagType} functionality`,
                recommendationStrategy: `Curated selection based on ${request.artworkTheme} theme and ${request.bagType} preferences`
            };
            return {
                success: true,
                data: {
                    suggestedBagType,
                    confidence,
                    insights,
                    alternativeTypes,
                    recommendations,
                    userProfile,
                    summary: {
                        totalProducts: recommendations.length,
                        averageMatchScore: Math.round(averageMatchScore),
                        confidenceLevel,
                        keyInsights: `Found ${recommendations.length} perfect ${request.bagType} options with ${request.artworkTheme} artwork themes`
                    }
                }
            };
        }
        catch (error) {
            console.error('❌ Fashion recommendation error:', error);
            return {
                success: false,
                error: 'Failed to generate fashion recommendations. Please try again.'
            };
        }
    }
    detectBagType(productName) {
        const name = productName.toLowerCase();
        if (name.includes('crossbody') || name.includes('cross-body') || name.includes('sling') || name.includes('messenger'))
            return 'crossbody';
        if (name.includes('hobo'))
            return 'hobo';
        if (name.includes('satchel') || name.includes('tote') || name.includes('shopper'))
            return 'satchel';
        if (name.includes('wallet') || name.includes('card holder') || name.includes('cardholder'))
            return 'wallet';
        if (name.includes('clutch') || name.includes('evening'))
            return 'clutch';
        if (name.includes('pouch') || name.includes('organizer') || name.includes('cosmetic') || name.includes('makeup') || name.includes('tech pouch') || name.includes('kit'))
            return 'pouch';
        if (name.includes('charm') || name.includes('keychain') || name.includes('strap') || name.includes('scarf') || name.includes('twilly') || name.includes('accessory'))
            return 'accessory';
        return 'satchel';
    }
    getDominantTraits(scores) {
        const traits = [];
        if (scores.boldness >= 70)
            traits.push('Bold');
        if (scores.elegance >= 70)
            traits.push('Elegant');
        if (scores.whimsy >= 70)
            traits.push('Whimsical');
        if (traits.length === 0)
            traits.push('Balanced');
        return traits;
    }
}
exports.FashionRecommendationService = FashionRecommendationService;
