import fs from 'fs';

// Read the catalog data
const catalogData = JSON.parse(fs.readFileSync('catalog-data.json', 'utf8'));

// Theme to bag type mapping
const themeToBagTypes = {
    'Animal': ['crossbody', 'satchel', 'hobo'],
    'Flowers/Plants': ['clutch', 'pouch', 'satchel'],
    'Nature/Landscape': ['crossbody', 'satchel', 'hobo'],
    'Symbols/Emblems': ['clutch', 'accessory', 'pouch'],
    'Pattern/Abstract': ['clutch', 'pouch', 'accessory'],
    'Vehicles/Transport': ['crossbody', 'satchel', 'hobo'],
    'Food & Drink': ['pouch', 'accessory', 'clutch'],
    'Other': ['satchel', 'crossbody', 'pouch']
};

// Theme personality coefficients
const themePersonality = {
    'Animal': { boldness: 0.8, elegance: 0.4, whimsy: 0.7 },
    'Flowers/Plants': { boldness: 0.4, elegance: 0.9, whimsy: 0.6 },
    'Nature/Landscape': { boldness: 0.7, elegance: 0.6, whimsy: 0.5 },
    'Symbols/Emblems': { boldness: 0.5, elegance: 0.7, whimsy: 0.8 },
    'Pattern/Abstract': { boldness: 0.6, elegance: 0.8, whimsy: 0.9 },
    'Vehicles/Transport': { boldness: 0.9, elegance: 0.3, whimsy: 0.6 },
    'Food & Drink': { boldness: 0.5, elegance: 0.6, whimsy: 0.8 },
    'Other': { boldness: 0.5, elegance: 0.6, whimsy: 0.7 }
};

// Product type detection keywords
const productTypeKeywords = {
    'crossbody': ['crossbody', 'cross-body', 'sling', 'messenger'],
    'hobo': ['hobo'],
    'satchel': ['satchel', 'tote', 'shopper'],
    'wallet': ['wallet', 'card holder', 'cardholder'],
    'clutch': ['clutch', 'evening'],
    'pouch': ['pouch', 'organizer', 'cosmetic', 'makeup', 'tech pouch', 'kit'],
    'accessory': ['charm', 'keychain', 'strap', 'scarf', 'twilly', 'accessory']
};

// Product type families for scoring
const productTypeFamilies = {
    'crossbody': ['crossbody', 'satchel', 'hobo'],
    'satchel': ['crossbody', 'satchel', 'hobo'],
    'hobo': ['crossbody', 'satchel', 'hobo'],
    'wallet': ['wallet', 'pouch', 'clutch'],
    'pouch': ['wallet', 'pouch', 'clutch'],
    'clutch': ['wallet', 'pouch', 'clutch'],
    'accessory': ['accessory', 'clutch', 'pouch']
};

function detectProductType(productName) {
    const name = productName.toLowerCase();
    for (const [type, keywords] of Object.entries(productTypeKeywords)) {
        if (keywords.some(keyword => name.includes(keyword))) {
            return type;
        }
    }
    return 'other';
}

function calculatePersonalityAlignment(userPersonality, theme) {
    if (!userPersonality) return 0.75;
    
    const themeCoeffs = themePersonality[theme];
    if (!themeCoeffs) return 0.75;
    
    const userScores = [
        userPersonality.boldness / 100,
        userPersonality.elegance / 100,
        userPersonality.whimsy / 100
    ];
    
    const themeScores = [
        themeCoeffs.boldness,
        themeCoeffs.elegance,
        themeCoeffs.whimsy
    ];
    
    // Cosine similarity
    const dotProduct = userScores.reduce((sum, score, i) => sum + score * themeScores[i], 0);
    const userMagnitude = Math.sqrt(userScores.reduce((sum, score) => sum + score * score, 0));
    const themeMagnitude = Math.sqrt(themeScores.reduce((sum, score) => sum + score * score, 0));
    
    return dotProduct / (userMagnitude * themeMagnitude);
}

function calculateThemeCompatibility(userTheme, productTheme) {
    if (userTheme === productTheme) return 1.0;
    
    const userBagTypes = themeToBagTypes[userTheme] || [];
    const productBagTypes = themeToBagTypes[productTheme] || [];
    
    // Check if themes are adjacent (share bag types)
    const hasOverlap = userBagTypes.some(type => productBagTypes.includes(type));
    return hasOverlap ? 0.75 : 0.5;
}

function calculateProductTypePreference(userBagType, detectedType) {
    if (userBagType === detectedType) return 1.0;
    
    const userFamily = productTypeFamilies[userBagType] || [];
    if (userFamily.includes(detectedType)) return 0.85;
    
    return 0.6;
}

function calculateSentimentScore(sentiment, detectedType) {
    if (!sentiment) return 0.5;
    
    const sentimentPreferences = {
        'Positive': ['crossbody', 'satchel'],
        'Balanced': ['satchel', 'crossbody', 'pouch'],
        'Negative': ['pouch', 'wallet', 'satchel']
    };
    
    const preferredTypes = sentimentPreferences[sentiment] || [];
    if (preferredTypes.includes(detectedType)) return 1.0;
    if (preferredTypes.some(type => productTypeFamilies[type]?.includes(detectedType))) return 0.85;
    return 0.6;
}

function calculateMatchScore(product, userInputs) {
    const {
        artworkTheme,
        productType,
        personality,
        sentiment
    } = userInputs;
    
    const detectedType = detectProductType(product['Product Name']);
    const productTheme = product.categories || 'Other';
    
    // Calculate individual scores
    const personalityScore = calculatePersonalityAlignment(personality, productTheme) * 0.4;
    const themeScore = calculateThemeCompatibility(artworkTheme, productTheme) * 0.3;
    const productTypeScore = calculateProductTypePreference(productType, detectedType) * 0.2;
    const sentimentScore = calculateSentimentScore(sentiment, detectedType) * 0.1;
    
    return Math.round((personalityScore + themeScore + productTypeScore + sentimentScore) * 100);
}

function getRecommendations(userInputs) {
    const {
        artworkTheme,
        productType,
        personality,
        sentiment
    } = userInputs;
    
    // Calculate scores for all products
    const scoredProducts = catalogData.map(product => ({
        ...product,
        detectedType: detectProductType(product['Product Name']),
        matchScore: calculateMatchScore(product, userInputs)
    }));
    
    // Get recommended bag types
    const recommendedTypes = themeToBagTypes[artworkTheme] || ['satchel', 'crossbody', 'pouch'];
    const suggestedBagType = recommendedTypes[0];
    const alternativeTypes = recommendedTypes.slice(1, 3);
    
    // Filter to top 3 bag types and get top 12 products
    const topTypes = [suggestedBagType, ...alternativeTypes];
    const filteredProducts = scoredProducts
        .filter(product => topTypes.includes(product.detectedType))
        .sort((a, b) => b.matchScore - a.matchScore)
        .slice(0, 12);
    
    // Calculate confidence
    const avgScore = Math.round(filteredProducts.reduce((sum, p) => sum + p.matchScore, 0) / filteredProducts.length);
    const confidence = Math.min(95, Math.max(85, avgScore));
    
    // Generate insights
    const insights = `The ${suggestedBagType} style perfectly complements your ${artworkTheme} theme preference, offering both functionality and aesthetic harmony. This choice reflects your style preferences while ensuring practical daily use.`;
    
    // Generate recommendations array
    const recommendations = filteredProducts.map(product => {
        const personalityText = personality ? 
            `Your ${personality.boldness > 70 ? 'bold' : personality.elegance > 70 ? 'elegant' : 'whimsical'} personality aligns beautifully with this ${product.categories} themed piece.` :
            `This piece captures the essence of ${product.categories} themes.`;
        
        const artworkText = `The ${product.categories} artwork creates a cohesive style statement.`;
        
        const functionalText = `The ${product.detectedType} design offers ${product.detectedType === 'crossbody' ? 'hands-free convenience' : 
            product.detectedType === 'wallet' ? 'compact organization' : 
            product.detectedType === 'pouch' ? 'versatile storage' : 
            product.detectedType === 'clutch' ? 'elegant evening wear' : 
            product.detectedType === 'satchel' ? 'spacious functionality' : 
            product.detectedType === 'hobo' ? 'casual sophistication' : 'unique style accent'}.`;
        
        const personalizedText = `This piece reflects your ${artworkTheme} aesthetic while maintaining practical functionality for your lifestyle.`;
        
        return {
            productId: product['Product URL']?.split('/').pop() || `product-${Math.random().toString(36).substr(2, 9)}`,
            artworkName: product['Artwork Name'],
            productName: product['Product Name'],
            productType: product.detectedType,
            matchScore: product.matchScore,
            confidence: product.matchScore >= 90 ? 'High' : product.matchScore >= 80 ? 'Medium' : 'Low',
            personalityAlignment: personalityText,
            artworkCompatibility: artworkText,
            functionalFit: functionalText,
            personalizedInsight: personalizedText
        };
    });
    
    // Generate user profile
    const dominantTraits = personality ? [
        personality.boldness > 70 ? 'Boldness' : null,
        personality.elegance > 70 ? 'Elegance' : null,
        personality.whimsy > 70 ? 'Whimsy' : null
    ].filter(Boolean) : ['Style-conscious', 'Practical'];
    
    const stylePreferences = [artworkTheme, suggestedBagType, sentiment || 'Balanced'];
    const lifestyleInsights = `Your preference for ${artworkTheme} themes suggests a ${sentiment === 'Positive' ? 'confident and optimistic' : sentiment === 'Negative' ? 'thoughtful and introspective' : 'balanced and adaptable'} approach to style.`;
    const recommendationStrategy = `Focusing on ${suggestedBagType} styles that complement your ${artworkTheme} aesthetic while ensuring practical functionality.`;
    
    // Generate summary
    const totalProducts = recommendations.length;
    const averageMatchScore = Math.round(recommendations.reduce((sum, r) => sum + r.matchScore, 0) / totalProducts);
    const confidenceLevel = averageMatchScore >= 90 ? 'High' : averageMatchScore >= 80 ? 'Medium' : 'Low';
    const keyInsights = `Successfully matched ${artworkTheme} theme with ${suggestedBagType} functionality, achieving ${averageMatchScore}% average compatibility across ${totalProducts} curated selections.`;
    
    return {
        suggestedBagType,
        confidence,
        insights,
        alternativeTypes,
        recommendations,
        userProfile: {
            dominantTraits,
            stylePreferences,
            lifestyleInsights,
            recommendationStrategy
        },
        summary: {
            totalProducts,
            averageMatchScore,
            confidenceLevel,
            keyInsights
        }
    };
}

// DEMO: Process user inputs and return recommendations
console.log('=== FASHION STYLIST SYSTEM DEMO ===\n');

// Example user inputs (this would come from the LLM's questions)
const userInputs = {
    artworkTheme: 'Animal',
    productType: 'crossbody',
    personality: {
        boldness: 85,
        elegance: 45,
        whimsy: 70
    },
    sentiment: 'Positive'
};

console.log('User Inputs:');
console.log(JSON.stringify(userInputs, null, 2));

console.log('\n' + '='.repeat(80) + '\n');

console.log('RECOMMENDATIONS:');
const recommendations = getRecommendations(userInputs);
console.log(JSON.stringify(recommendations, null, 2));
