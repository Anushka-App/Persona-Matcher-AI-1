import { LLMService } from './LLMService';
import { Product } from '../types';
// Removed strictFilter import as it's not needed in this service

export interface FashionRecommendationRequest {
    artworkTheme: string;
    bagType: string;
    personalityScores?: {
        boldness: number;
        elegance: number;
        whimsy: number;
    };
    sentiment?: 'Positive' | 'Balanced' | 'Negative';
    description?: string;
}

export interface FashionRecommendationResponse {
    success: boolean;
    data?: {
        suggestedBagType: string;
        confidence: number;
        insights: string;
        alternativeTypes: string[];
        recommendations: Array<{
            productId: string;
            artworkName: string;
            productName: string;
            productType: string;
            matchScore: number;
            confidence: 'High' | 'Medium' | 'Low';
            personalityAlignment: string;
            artworkCompatibility: string;
            functionalFit: string;
            personalizedInsight: string;
        }>;
        userProfile: {
            dominantTraits: string[];
            stylePreferences: string[];
            lifestyleInsights: string;
            recommendationStrategy: string;
        };
        summary: {
            totalProducts: number;
            averageMatchScore: number;
            confidenceLevel: 'High' | 'Medium' | 'Low';
            keyInsights: string;
        };
    };
    error?: string;
}

export class FashionRecommendationService {
    private llmService: LLMService;
    private productDatabase: Product[];

    constructor(llmService: LLMService, productDatabase: Product[]) {
        this.llmService = llmService;
        this.productDatabase = productDatabase;
    }

    // Simple theme mapping to Excel categories - DIRECT MATCH ONLY
    private mapUserThemeToExcelCategory(userTheme: string): string {
        const themeMap: Record<string, string> = {
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

    // Decision tree for theme to bag type mapping
    private getRecommendedBagTypes(artworkTheme: string): string[] {
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
    }

    // SIMPLIFIED FILTERING - DIRECT EXCEL CATEGORY MATCH ONLY
    private filterProducts(artworkTheme: string, bagType: string): Product[] {
        console.log(`🎯 Filtering products for theme: "${artworkTheme}" and bag type: "${bagType}"`);
        
        // Map user theme to Excel category
        const excelCategory = this.mapUserThemeToExcelCategory(artworkTheme);
        console.log(`📋 Mapped to Excel category: "${excelCategory}"`);
        
        // Filter products by EXACT Excel category match
        const filteredProducts = this.productDatabase.filter(product => {
            const productCategory = product.categories || product.Themes || '';
            const productName = product.productName || product['Product Name'] || '';
            
            // EXACT CATEGORY MATCH - This is the key fix
            const categoryMatch = productCategory === excelCategory;
            
            // Bag type matching - check if product name contains the bag type
            let bagMatch = true; // Default to true if no bag type specified
            if (bagType && bagType.trim()) {
                const bagTypeLower = bagType.toLowerCase();
                bagMatch = productName.toLowerCase().includes(bagTypeLower);
            }
            
            return categoryMatch && bagMatch;
        });

        console.log(`✅ Found ${filteredProducts.length} products with exact category match for "${excelCategory}"`);
        
        // Log sample matches for debugging
        if (filteredProducts.length > 0) {
            console.log(`📝 Sample matches:`);
            filteredProducts.slice(0, 3).forEach((product, index) => {
                console.log(`  ${index + 1}. ${product.artworkName} - ${product.productName} (Category: ${product.categories})`);
            });
        }
        
        return filteredProducts;
    }

    // Calculate match score for a product
    private calculateMatchScore(
        product: Product,
        artworkTheme: string,
        bagType: string,
        personalityScores?: { boldness: number; elegance: number; whimsy: number },
        sentiment?: string
    ): number {
        let score = 0;

        // Theme Compatibility (40%) - HIGH WEIGHT for exact category match
        const excelCategory = this.mapUserThemeToExcelCategory(artworkTheme);
        const themeMatch = (product.categories || product.Themes || '') === excelCategory;
        score += themeMatch ? 40 : 0; // Perfect score for exact match, 0 for mismatch

        // Product Type Preference (30%)
        const productName = product.productName || product['Product Name'] || '';
        const bagMatch = productName.toLowerCase().includes(bagType.toLowerCase());
        score += bagMatch ? 30 : 15; // Higher score for bag type match

        // Personality Alignment (20%) - if personality scores provided
        if (personalityScores) {
            const themeCoefficients = this.getThemeCoefficients(artworkTheme);
            const personalityScore = this.calculatePersonalityAlignment(personalityScores, themeCoefficients);
            score += personalityScore * 20;
        } else {
            score += 15; // Default score if no personality data
        }

        // Sentiment (10%)
        if (sentiment) {
            const sentimentScore = this.calculateSentimentScore(sentiment, bagType);
            score += sentimentScore * 10;
        } else {
            score += 5; // Default sentiment score
        }

        return Math.min(100, Math.max(0, score));
    }

    // Get theme coefficients for personality alignment
    private getThemeCoefficients(theme: string): { boldness: number; elegance: number; whimsy: number } {
        const coefficients: Record<string, { boldness: number; elegance: number; whimsy: number }> = {
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

    // Calculate personality alignment using cosine similarity
    private calculatePersonalityAlignment(
        userScores: { boldness: number; elegance: number; whimsy: number },
        themeCoefficients: { boldness: number; elegance: number; whimsy: number }
    ): number {
        const userVector = [userScores.boldness / 100, userScores.elegance / 100, userScores.whimsy / 100];
        const themeVector = [themeCoefficients.boldness, themeCoefficients.elegance, themeCoefficients.whimsy];
        
        const dotProduct = userVector.reduce((sum, val, i) => sum + val * themeVector[i], 0);
        const userMagnitude = Math.sqrt(userVector.reduce((sum, val) => sum + val * val, 0));
        const themeMagnitude = Math.sqrt(themeVector.reduce((sum, val) => sum + val * val, 0));
        
        return dotProduct / (userMagnitude * themeMagnitude);
    }

    // Generate fallback insights when LLM is unavailable
    private generateFallbackInsights(artworkTheme: string, bagType: string): string {
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

    // Calculate sentiment score
    private calculateSentimentScore(sentiment: string, bagType: string): number {
        const sentimentBagPreferences: Record<string, string[]> = {
            'positive': ['crossbody', 'satchel'],
            'balanced': ['satchel', 'crossbody', 'pouch'],
            'negative': ['pouch', 'wallet', 'satchel']
        };
        
        const preferredBags = sentimentBagPreferences[sentiment.toLowerCase()] || [];
        return preferredBags.includes(bagType.toLowerCase()) ? 1.0 : 0.5;
    }

    // Generate LLM insights for recommendations
    private async generateLLMInsights(
        artworkTheme: string,
        bagType: string,
        recommendations: Product[],
        personalityScores?: { boldness: number; elegance: number; whimsy: number },
        sentiment?: string
    ): Promise<string> {
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
        } catch (error) {
            console.log('⚠️ LLM insights generation failed, using fallback:', error instanceof Error ? error.message : 'Unknown error');
            return this.generateFallbackInsights(artworkTheme, bagType);
        }
    }

    // Main recommendation method
    async getRecommendations(request: FashionRecommendationRequest): Promise<FashionRecommendationResponse> {
        try {
            console.log(`🎯 Fashion Recommendation Request:`, {
                artworkTheme: request.artworkTheme,
                bagType: request.bagType,
                hasPersonalityScores: !!request.personalityScores,
                sentiment: request.sentiment
            });

            // Filter products based on theme and bag type using SIMPLIFIED DIRECT MATCHING
            const filteredProducts = this.filterProducts(request.artworkTheme, request.bagType);

            if (filteredProducts.length === 0) {
                return {
                    success: false,
                    error: `No products found for ${request.artworkTheme} theme and ${request.bagType} bag type. Please try a different combination.`
                };
            }

            // Remove duplicates
            const uniqueProducts = filteredProducts.filter((product, index, self) =>
                index === self.findIndex(p =>
                    p.artworkName === product.artworkName &&
                    p.productName === product.productName
                )
            );

            // Calculate match scores for all products
            const scoredProducts = uniqueProducts.map(product => ({
                product,
                matchScore: this.calculateMatchScore(
                    product,
                    request.artworkTheme,
                    request.bagType,
                    request.personalityScores,
                    request.sentiment
                )
            }));

            // Sort by match score and take top 12
            const topProducts = scoredProducts
                .sort((a, b) => b.matchScore - a.matchScore)
                .slice(0, 12);

            // Get recommended bag types for the theme
            const recommendedBagTypes = this.getRecommendedBagTypes(request.artworkTheme);
            const suggestedBagType = request.bagType || recommendedBagTypes[0];
            const alternativeTypes = recommendedBagTypes.filter(bag => bag !== suggestedBagType);

            // Generate LLM insights
            const insights = await this.generateLLMInsights(
                request.artworkTheme,
                request.bagType,
                topProducts.map(p => p.product),
                request.personalityScores,
                request.sentiment
            );

            // Calculate confidence based on match scores
            const averageMatchScore = topProducts.reduce((sum, p) => sum + p.matchScore, 0) / topProducts.length;
            const confidence = Math.min(95, Math.max(85, Math.round(averageMatchScore)));
            const confidenceLevel = confidence >= 90 ? 'High' : confidence >= 80 ? 'Medium' : 'Low';

            // Format recommendations
            const recommendations = topProducts.map(({ product, matchScore }) => ({
                productId: product.artworkName + '-' + product.productName,
                artworkName: product.artworkName || 'Unknown Artwork',
                productName: product.productName || 'Unknown Product',
                productType: this.detectBagType(product.productName || ''),
                matchScore: Math.round(matchScore),
                confidence: (matchScore >= 90 ? 'High' : matchScore >= 80 ? 'Medium' : 'Low') as 'High' | 'Medium' | 'Low',
                personalityAlignment: `Perfect match for ${request.artworkTheme} theme preferences`,
                artworkCompatibility: `Features beautiful ${request.artworkTheme} artwork design`,
                functionalFit: `Ideal ${request.bagType} for your lifestyle needs`,
                personalizedInsight: `Reflects your unique style and personality`
            }));

            // Generate user profile
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

        } catch (error) {
            console.error('❌ Fashion recommendation error:', error);
            return {
                success: false,
                error: 'Failed to generate fashion recommendations. Please try again.'
            };
        }
    }

    // Helper method to detect bag type from product name
    private detectBagType(productName: string): string {
        const name = productName.toLowerCase();
        if (name.includes('crossbody') || name.includes('cross-body') || name.includes('sling') || name.includes('messenger')) return 'crossbody';
        if (name.includes('hobo')) return 'hobo';
        if (name.includes('satchel') || name.includes('tote') || name.includes('shopper')) return 'satchel';
        if (name.includes('wallet') || name.includes('card holder') || name.includes('cardholder')) return 'wallet';
        if (name.includes('clutch') || name.includes('evening')) return 'clutch';
        if (name.includes('pouch') || name.includes('organizer') || name.includes('cosmetic') || name.includes('makeup') || name.includes('tech pouch') || name.includes('kit')) return 'pouch';
        if (name.includes('charm') || name.includes('keychain') || name.includes('strap') || name.includes('scarf') || name.includes('twilly') || name.includes('accessory')) return 'accessory';
        return 'satchel'; // Default
    }

    // Helper method to get dominant personality traits
    private getDominantTraits(scores: { boldness: number; elegance: number; whimsy: number }): string[] {
        const traits = [];
        if (scores.boldness >= 70) traits.push('Bold');
        if (scores.elegance >= 70) traits.push('Elegant');
        if (scores.whimsy >= 70) traits.push('Whimsical');
        if (traits.length === 0) traits.push('Balanced');
        return traits;
    }
}
