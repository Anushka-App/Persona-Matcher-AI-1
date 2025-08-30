import fs from 'fs';

// Read the catalog data
const catalogData = JSON.parse(fs.readFileSync('catalog-data.json', 'utf8'));

console.log(`Loaded ${catalogData.length} products from catalog`);

// Simple theme to bag type mapping
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

// Simple product type detection
function detectProductType(productName) {
    const name = productName.toLowerCase();
    if (name.includes('crossbody') || name.includes('cross-body') || name.includes('sling') || name.includes('messenger')) {
        return 'crossbody';
    } else if (name.includes('hobo')) {
        return 'hobo';
    } else if (name.includes('satchel') || name.includes('tote') || name.includes('shopper')) {
        return 'satchel';
    } else if (name.includes('wallet') || name.includes('card holder') || name.includes('cardholder')) {
        return 'wallet';
    } else if (name.includes('clutch') || name.includes('evening')) {
        return 'clutch';
    } else if (name.includes('pouch') || name.includes('organizer') || name.includes('cosmetic') || name.includes('makeup')) {
        return 'pouch';
    } else if (name.includes('charm') || name.includes('keychain') || name.includes('strap') || name.includes('accessory')) {
        return 'accessory';
    }
    return 'other';
}

// Simple scoring function
function calculateScore(product, userTheme, userType, personality, sentiment) {
    let score = 50; // Base score
    
    // Theme match (30%)
    if (product.categories === userTheme) {
        score += 30;
    } else if (product.categories) {
        score += 15; // Partial match
    }
    
    // Product type match (20%)
    const detectedType = detectProductType(product['Product Name']);
    if (detectedType === userType) {
        score += 20;
    } else if (['crossbody', 'satchel', 'hobo'].includes(detectedType) && ['crossbody', 'satchel', 'hobo'].includes(userType)) {
        score += 15; // Same family
    } else if (['wallet', 'pouch', 'clutch'].includes(detectedType) && ['wallet', 'pouch', 'clutch'].includes(userType)) {
        score += 15; // Same family
    }
    
    // Personality alignment (40%)
    if (personality) {
        const themePersonality = {
            'Animal': { boldness: 0.8, elegance: 0.4, whimsy: 0.7 },
            'Flowers/Plants': { boldness: 0.4, elegance: 0.9, whimsy: 0.6 },
            'Nature/Landscape': { boldness: 0.7, elegance: 0.6, whimsy: 0.5 },
            'Pattern/Abstract': { boldness: 0.6, elegance: 0.8, whimsy: 0.9 }
        };
        
        const themeCoeffs = themePersonality[product.categories];
        if (themeCoeffs) {
            const userScores = [personality.boldness/100, personality.elegance/100, personality.whimsy/100];
            const themeScores = [themeCoeffs.boldness, themeCoeffs.elegance, themeCoeffs.whimsy];
            
            const dotProduct = userScores.reduce((sum, score, i) => sum + score * themeScores[i], 0);
            const userMagnitude = Math.sqrt(userScores.reduce((sum, score) => sum + score * score, 0));
            const themeMagnitude = Math.sqrt(themeScores.reduce((sum, score) => sum + score * score, 0));
            
            const similarity = dotProduct / (userMagnitude * themeMagnitude);
            score += similarity * 40;
        }
    }
    
    // Sentiment (10%)
    if (sentiment) {
        const sentimentPreferences = {
            'Positive': ['crossbody', 'satchel'],
            'Balanced': ['satchel', 'crossbody', 'pouch'],
            'Negative': ['pouch', 'wallet', 'satchel']
        };
        
        const detectedType = detectProductType(product['Product Name']);
        const preferredTypes = sentimentPreferences[sentiment] || [];
        if (preferredTypes.includes(detectedType)) {
            score += 10;
        }
    }
    
    return Math.min(100, Math.max(0, Math.round(score)));
}

// Main recommendation function
function getRecommendations(userInputs) {
    const { artworkTheme, productType, personality, sentiment } = userInputs;
    
    // Get recommended bag types
    const recommendedTypes = themeToBagTypes[artworkTheme] || ['satchel', 'crossbody', 'pouch'];
    const suggestedBagType = recommendedTypes[0];
    const alternativeTypes = recommendedTypes.slice(1, 3);
    
    // Score all products
    const scoredProducts = catalogData.map(product => ({
        ...product,
        detectedType: detectProductType(product['Product Name']),
        matchScore: calculateScore(product, artworkTheme, productType, personality, sentiment)
    }));
    
    // Filter to top 3 bag types and get top 12
    const topTypes = [suggestedBagType, ...alternativeTypes];
    const filteredProducts = scoredProducts
        .filter(product => topTypes.includes(product.detectedType))
        .sort((a, b) => b.matchScore - a.matchScore)
        .slice(0, 12);
    
    // Calculate confidence
    const avgScore = Math.round(filteredProducts.reduce((sum, p) => sum + p.matchScore, 0) / filteredProducts.length);
    const confidence = Math.min(95, Math.max(85, avgScore));
    
    // Generate recommendations
    const recommendations = filteredProducts.map(product => ({
        productId: product['Product URL']?.split('/').pop() || `product-${Math.random().toString(36).substr(2, 9)}`,
        artworkName: product['Artwork Name'],
        productName: product['Product Name'],
        productType: product.detectedType,
        matchScore: product.matchScore,
        confidence: product.matchScore >= 90 ? 'High' : product.matchScore >= 80 ? 'Medium' : 'Low',
        personalityAlignment: `This piece aligns with your ${personality ? 'personality profile' : 'style preferences'}.`,
        artworkCompatibility: `The ${product.categories} artwork creates a cohesive style statement.`,
        functionalFit: `The ${product.detectedType} design offers practical functionality.`,
        personalizedInsight: `This piece reflects your ${artworkTheme} aesthetic while maintaining practical functionality.`
    }));
    
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
        insights: `The ${suggestedBagType} style perfectly complements your ${artworkTheme} theme preference, offering both functionality and aesthetic harmony.`,
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

// DEMO
console.log('=== FASHION STYLIST SYSTEM DEMO ===\n');

// Example user inputs
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
const result = getRecommendations(userInputs);
console.log(JSON.stringify(result, null, 2));

console.log('\n' + '='.repeat(80) + '\n');
console.log('System successfully processed user inputs and generated recommendations!');
