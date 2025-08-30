// Enhanced Recommendation Engine for Server-side use
// CommonJS version

class EnhancedRecommendationEngine {
  constructor() {
    this.personalityWeightMap = {
      'Boldness': {
        'Animals': 0.8,
        'Nature/Landscape': 0.7,
        'Pattern/Abstract': 0.6,
        'Symbols/Emblems': 0.5,
        'Flowers/Plants': 0.4,
        'Other (Unspecified)': 0.5
      },
      'Elegance': {
        'Flowers/Plants': 0.9,
        'Pattern/Abstract': 0.8,
        'Symbols/Emblems': 0.7,
        'Nature/Landscape': 0.6,
        'Animals': 0.4,
        'Other (Unspecified)': 0.6
      },
      'Whimsy': {
        'Pattern/Abstract': 0.9,
        'Symbols/Emblems': 0.8,
        'Animals': 0.7,
        'Flowers/Plants': 0.6,
        'Nature/Landscape': 0.5,
        'Other (Unspecified)': 0.7
      }
    };

    this.bagTypePersonalityMap = {
      'Bag': {
        'Boldness': 0.6,
        'Elegance': 0.7,
        'Whimsy': 0.5
      },
      'Tote': {
        'Boldness': 0.7,
        'Elegance': 0.6,
        'Whimsy': 0.4
      },
      'Crossbody': {
        'Boldness': 0.8,
        'Elegance': 0.5,
        'Whimsy': 0.6
      },
      'Pouch': {
        'Boldness': 0.4,
        'Elegance': 0.8,
        'Whimsy': 0.7
      },
      'Case': {
        'Boldness': 0.5,
        'Elegance': 0.9,
        'Whimsy': 0.3
      },
      'Hobo': {
        'Boldness': 0.6,
        'Elegance': 0.5,
        'Whimsy': 0.8
      }
    };

    this.artworkThemeKeywords = {
      'Animals': [
        // Safari/Wildlife themes
        'abstract leopard', 'african adventure', 'african elephant', 'amazing amazon', 'cleopatra', 'imperial tiger', 
        'india safari', 'jungle queen', 'king of the jungle', 'leopard', 'rose safari', 'savanna roar', 
        'tropical jungle', 'elephant', 'tiger', 'lion', 'animals', 'safari', 'wildlife', 'creature', 
        'gentle giant', 'happy panda', 'siamese cats', 'wise owl', 'deer', 'cardinal', 'bird', 'cat', 'owl', 'panda'
      ],
      'Flowers/Plants': [
        // Botanical/Garden themes
        'bel fiori', 'butterfly blooms', 'camellia', 'caribbean garden', 'crimson garden', 'dancing leaves',
        'dreamy floral', 'earth song', 'enchanted garden', 'ethereal garden', 'floral charm', 'floral paradise',
        'floral passion', 'flower garden', 'garden', 'magical garden', 'midnight garden', 'orchid garden',
        'poppy garden', 'tropical bloom', 'tulip garden', 'zen garden', 'jardin bleu', 'romantic roses',
        'flower', 'plant', 'bloom', 'petal', 'leaf', 'botanical', 'floral', 'rose', 'lily', 'lotus', 'peony', 'peonies'
      ],
      'Nature/Landscape': [
        // Natural landscapes and scenery
        'canyon birds', 'gift of the sea', 'mystical reef', 'paradise found', 'turtle cove', 'rainforest beauties',
        'japanese garden', 'starry night', 'whimsical forest', 'mystic forest', 'meadow birds', 'island escape',
        'nature', 'landscape', 'mountain', 'sea', 'ocean', 'forest', 'vista', 'scenery', 'canyon', 'reef', 'cove'
      ],
      'Pattern/Abstract': [
        // Geometric and abstract patterns
        'basket embossed', 'croc embossed', 'herringbone embossed', 'mandala', 'mosaic floral', 'tooled',
        'boho paisley', 'denim paisley', 'indian paisley', 'city lights', 'pattern', 'abstract', 'geometric', 
        'design', 'shape', 'form', 'modern', 'artistic', 'embossed', 'tooled', 'paisley', 'mosaic'
      ],
      'Symbols/Emblems': [
        // Cultural symbols and meaningful emblems
        'angel wings', 'calaveras de azucar', 'dragon legend', 'elephant mandala', 'feather skull', 'heritage',
        'high roller', 'love in paris', 'city of dreams', 'painted dream', 'wings of hope', 'free spirit',
        'guiding light', 'symbol', 'emblem', 'icon', 'meaningful', 'timeless', 'heritage', 'cultural', 
        'mandala', 'skull', 'wings', 'dragon', 'legend', 'dream'
      ],
      'Other (Unspecified)': [
        // Mixed themes and unspecified
        'mixed', 'variety', 'diverse', 'eclectic', 'unique', 'special', 'surprise', 'other'
      ]
    };
  }

  /**
   * Calculate match score for a product based on user profile
   */
  calculateProductMatchScore(product, userProfile) {
    let totalScore = 0;
    const reasons = [];
    let maxPossibleScore = 0;

    // 1. Personality Trait Alignment (40% weight)
    if (userProfile.personalityScores) {
      const personalityScore = this.calculatePersonalityAlignment(product, userProfile.personalityScores);
      totalScore += personalityScore * 0.4;
      maxPossibleScore += 100 * 0.4;
      
      if (personalityScore > 70) {
        reasons.push(`Strong personality alignment (${personalityScore}%)`);
      } else if (personalityScore > 50) {
        reasons.push(`Good personality match (${personalityScore}%)`);
      }
    }

    // 2. Artwork Theme Compatibility (30% weight)
    const artworkScore = this.calculateArtworkCompatibility(product, userProfile.artworkTheme);
    totalScore += artworkScore * 0.3;
    maxPossibleScore += 100 * 0.3;
    
    if (artworkScore > 80) {
      reasons.push(`Perfect artwork theme match`);
    } else if (artworkScore > 60) {
      reasons.push(`Good artwork theme compatibility`);
    }

    // 3. Bag Type Preference (20% weight)
    const bagTypeScore = this.calculateBagTypeCompatibility(product, userProfile.bagType);
    totalScore += bagTypeScore * 0.2;
    maxPossibleScore += 100 * 0.2;
    
    if (bagTypeScore > 90) {
      reasons.push(`Exact bag type match`);
    } else if (bagTypeScore > 70) {
      reasons.push(`Suitable bag type`);
    }

    // 4. Sentiment Alignment (10% weight)
    const sentimentScore = this.calculateSentimentAlignment(product, userProfile.sentiment);
    totalScore += sentimentScore * 0.1;
    maxPossibleScore += 100 * 0.1;
    
    if (sentimentScore > 75) {
      reasons.push(`Matches your ${userProfile.sentiment.toLowerCase()} sentiment`);
    }

    const finalScore = Math.round((totalScore / maxPossibleScore) * 100);
    return { score: finalScore, reasons };
  }

  /**
   * Calculate personality alignment score
   */
  calculatePersonalityAlignment(product, personalityScores) {
    let alignmentScore = 0;
    let totalWeight = 0;

    Object.entries(personalityScores).forEach(([trait, score]) => {
      const weight = score / 100; // Normalize to 0-1
      const productAlignment = this.getProductTraitAlignment(product, trait);
      alignmentScore += productAlignment * weight;
      totalWeight += weight;
    });

    return totalWeight > 0 ? Math.round((alignmentScore / totalWeight) * 100) : 50;
  }

  /**
   * Get product alignment with a specific trait
   */
  getProductTraitAlignment(product, trait) {
    const productText = `${product.productName} ${product.artworkName} ${product.personalityTraits || ''}`.toLowerCase();
    
    const traitKeywords = {
      'Boldness': ['bold', 'daring', 'confident', 'strong', 'powerful', 'assertive', 'adventurous'],
      'Elegance': ['elegant', 'refined', 'sophisticated', 'graceful', 'classic', 'timeless', 'polished'],
      'Whimsy': ['whimsical', 'playful', 'creative', 'artistic', 'imaginative', 'fun', 'unique']
    };

    const keywords = traitKeywords[trait] || [];
    const matches = keywords.filter(keyword => productText.includes(keyword));
    
    return Math.min(matches.length * 20, 100); // 20 points per keyword match, max 100
  }

  /**
   * Calculate artwork theme compatibility
   */
  calculateArtworkCompatibility(product, artworkTheme) {
    const productText = `${product.artworkName} ${product.productName}`.toLowerCase();
    const keywords = this.artworkThemeKeywords[artworkTheme] || [];
    
    console.log(`  Calculating artwork compatibility for "${product.artworkName}" with theme "${artworkTheme}"`);
    console.log(`  Available keywords: ${keywords.slice(0, 5).join(', ')}${keywords.length > 5 ? '...' : ''}`);
    
    // First, check for exact artwork name matches (highest priority)
    const artworkName = product.artworkName.toLowerCase();
    const exactMatches = keywords.filter(keyword => 
      artworkName === keyword || artworkName.includes(keyword)
    );
    
    if (exactMatches.length > 0) {
      console.log(`    ✅ Exact artwork name match found: ${exactMatches.join(', ')} - Score: 100`);
      return 100; // Perfect match for artwork name
    }
    
    // Check for partial matches in artwork name (high priority)
    const artworkMatches = keywords.filter(keyword => artworkName.includes(keyword));
    if (artworkMatches.length > 0) {
      const score = Math.min(artworkMatches.length * 30 + 70, 100);
      console.log(`    ✅ Partial artwork name match: ${artworkMatches.join(', ')} - Score: ${score}`);
      return score; // 70-100 points for artwork matches
    }
    
    // Check for matches in product name (medium priority) 
    const productNameMatches = keywords.filter(keyword => product.productName.toLowerCase().includes(keyword));
    if (productNameMatches.length > 0) {
      const score = Math.min(productNameMatches.length * 20 + 50, 90);
      console.log(`    ✅ Product name match: ${productNameMatches.join(', ')} - Score: ${score}`);
      return score; // 50-90 points for product name matches
    }
    
    // Check for matches in full product text (lower priority)
    const textMatches = keywords.filter(keyword => productText.includes(keyword));
    if (textMatches.length > 0) {
      const score = Math.min(textMatches.length * 15 + 40, 80);
      console.log(`    ✅ General text match: ${textMatches.join(', ')} - Score: ${score}`);
      return score; // 40-80 points for general text matches
    }
    
    // Fallback: check if theme is mentioned in product description
    if (product.personalityTraits && product.personalityTraits.toLowerCase().includes(artworkTheme.toLowerCase())) {
      console.log(`    ⚠️ Theme mentioned in description - Score: 60`);
      return 60;
    }
    
    // Special handling for "Other (Unspecified)" - should match anything reasonably well
    if (artworkTheme === 'Other (Unspecified)') {
      console.log(`    ⚠️ Other theme - neutral compatibility - Score: 50`);
      return 50; // Neutral compatibility for mixed/surprise selections
    }
    
    console.log(`    ❌ No theme matches found - Score: 20`);
    return 20; // Low compatibility score for non-matching themes
  }

  /**
   * Calculate bag type compatibility
   */
  calculateBagTypeCompatibility(product, bagType) {
    const productText = `${product.productName} ${product.productType}`.toLowerCase();
    const bagTypeLower = bagType.toLowerCase();
    
    if (productText.includes(bagTypeLower)) {
      return 100; // Exact match
    }
    
    // Handle variations
    const bagTypeVariations = {
      'Bag': ['handbag', 'purse', 'medium', 'large', 'small'],
      'Tote': ['tote'],
      'Crossbody': ['crossbody', 'cross body'],
      'Pouch': ['pouch', 'clutch'],
      'Case': ['case', 'tech case'],
      'Hobo': ['hobo']
    };
    
    const variations = bagTypeVariations[bagType] || [];
    const hasVariation = variations.some(variation => productText.includes(variation));
    
    return hasVariation ? 80 : 40;
  }

  /**
   * Calculate sentiment alignment
   */
  calculateSentimentAlignment(product, sentiment) {
    const productText = `${product.personalityTraits || ''}`.toLowerCase();
    const sentimentLower = sentiment.toLowerCase();
    
    const sentimentKeywords = {
      'optimistic': ['optimistic', 'positive', 'bright', 'cheerful', 'uplifting'],
      'balanced': ['balanced', 'harmonious', 'equilibrium', 'stable', 'centered'],
      'adventurous': ['adventurous', 'exploratory', 'daring', 'bold', 'exciting'],
      'elegant': ['elegant', 'refined', 'sophisticated', 'graceful', 'classic'],
      'creative': ['creative', 'artistic', 'imaginative', 'innovative', 'unique']
    };
    
    const keywords = sentimentKeywords[sentimentLower] || [];
    const matches = keywords.filter(keyword => productText.includes(keyword));
    
    return Math.min(matches.length * 30, 100);
  }

  /**
   * Generate enhanced recommendations
   */
  generateRecommendations(products, userProfile) {
    console.log('=== ENHANCED RECOMMENDATION ENGINE START ===');
    console.log(`Input: ${products.length} products, userProfile:`, {
      personality: userProfile.personality,
      dominantTraits: userProfile.dominantTraits,
      artworkTheme: userProfile.artworkTheme,
      bagType: userProfile.bagType
    });

    try {
      // Calculate personality scores
      const personalityScores = this.calculatePersonalityScores(userProfile);
      console.log('Personality scores calculated:', personalityScores);

      // Calculate sentiment scores
      const sentimentScores = this.calculateSentimentScores(userProfile);
      console.log('Sentiment scores calculated:', sentimentScores);

      // Calculate artwork theme compatibility
      const artworkScores = products.map(product => ({
        product,
        score: this.calculateArtworkCompatibility(product, userProfile.artworkTheme)
      }));
      console.log(`Artwork compatibility scores calculated for ${artworkScores.length} products`);

      // Calculate bag type compatibility
      const bagTypeScores = products.map(product => ({
        product,
        score: this.calculateBagTypeCompatibility(product, userProfile.bagType)
      }));
      console.log(`Bag type compatibility scores calculated for ${bagTypeScores.length} products`);

      // Combine all scores
      const combinedScores = products.map((product, index) => {
        const personalityScore = personalityScores[index] || 0;
        const sentimentScore = sentimentScores[index] || 0;
        const artworkScore = artworkScores[index]?.score || 0;
        const bagTypeScore = bagTypeScores[index]?.score || 0;

        const totalScore = (
          personalityScore * 0.4 +
          sentimentScore * 0.2 +
          artworkScore * 0.25 +
          bagTypeScore * 0.15
        );

        return {
          product,
          scores: {
            personality: personalityScore,
            sentiment: sentimentScore,
            artwork: artworkScore,
            bagType: bagTypeScore,
            total: totalScore
          }
        };
      });

      console.log('Combined scores calculated for all products');
      console.log('Sample combined scores:', combinedScores.slice(0, 3).map(item => ({
        artworkName: item.product.artworkName,
        totalScore: item.scores.total.toFixed(2),
        breakdown: item.scores
      })));

      // Sort by total score and get top recommendations
      const sortedProducts = combinedScores
        .sort((a, b) => b.scores.total - a.scores.total)
        .slice(0, 12)
        .map(item => item.product);

      console.log(`Top ${sortedProducts.length} products selected based on combined scores`);

      // Calculate match confidence
      const topScores = combinedScores.slice(0, 12).map(item => item.scores.total);
      const averageScore = topScores.reduce((sum, score) => sum + score, 0) / topScores.length;
      const matchConfidence = Math.min(95, Math.max(60, Math.round(averageScore * 100)));

      console.log(`Match confidence calculated: ${matchConfidence}% (average score: ${averageScore.toFixed(2)})`);

      // Generate insights
      const insights = this.generateInsights(userProfile, sortedProducts, matchConfidence);
      console.log('Insights generated:', {
        styleInsights: insights.styleInsights?.substring(0, 100) + '...',
        personalizedAdvice: insights.personalizedAdvice?.substring(0, 100) + '...',
        explanation: insights.explanation?.substring(0, 100) + '...'
      });

      console.log('=== ENHANCED RECOMMENDATION ENGINE COMPLETE ===');

      return {
        products: sortedProducts,
        matchConfidence,
        styleInsights: insights.styleInsights,
        personalizedAdvice: insights.personalizedAdvice,
        explanation: insights.explanation
      };
    } catch (error) {
      console.error('❌ Enhanced recommendation engine error:', error);
      throw error;
    }
  }

  /**
   * Generate personalized explanation
   */
  generateExplanation(matches, userProfile) {
    const topMatches = matches.slice(0, 12);
    const avgScore = Math.round(matches.reduce((sum, m) => sum + m.matchScore, 0) / matches.length);
    
    return `Based on your ${userProfile.personality.toLowerCase()} personality and preference for ${userProfile.artworkTheme.toLowerCase()} artwork in ${userProfile.bagType.toLowerCase()} format, we've curated these handbags with ${avgScore}% match confidence. 

Your ${userProfile.dominantTraits?.join(', ').toLowerCase()} traits shine through in these selections, which feature ${userProfile.artworkTheme.toLowerCase()} designs that complement your ${userProfile.sentiment.toLowerCase()} energy. Each piece offers the perfect balance of style and functionality for your lifestyle.`;
  }

  /**
   * Generate style insights
   */
  generateStyleInsights(userProfile) {
    const insights = [];
    
    if (userProfile.dominantTraits) {
      insights.push(`Your ${userProfile.dominantTraits[0].toLowerCase()} nature calls for accessories that make a statement`);
      insights.push(`${userProfile.artworkTheme} artwork reflects your appreciation for ${this.getArtworkInsight(userProfile.artworkTheme)}`);
    }
    
    insights.push(`${userProfile.bagType} bags suit your practical yet stylish approach to fashion`);
    insights.push(`Your ${userProfile.sentiment.toLowerCase()} sentiment is perfectly captured in these design choices`);
    
    return insights;
  }

  /**
   * Get artwork-specific insight
   */
  getArtworkInsight(artworkTheme) {
    const insights = {
      'Animals': 'the wild and untamed beauty of nature',
      'Flowers/Plants': 'the delicate and refined aspects of life',
      'Nature/Landscape': 'the grandeur and serenity of natural landscapes',
      'Pattern/Abstract': 'modern artistic expression and geometric harmony',
      'Symbols/Emblems': 'timeless meaning and cultural heritage',
      'Other (Unspecified)': 'unique and eclectic artistic expression'
    };
    
    return insights[artworkTheme] || 'artistic expression';
  }

  /**
   * Generate personalized advice
   */
  generatePersonalizedAdvice(userProfile, matches) {
    const advice = [];
    
    if (userProfile.dominantTraits) {
      const topTrait = userProfile.dominantTraits[0];
      advice.push(`Embrace your ${topTrait.toLowerCase()} by choosing bold, statement pieces that reflect your confidence`);
    }
    
    advice.push(`Consider pairing these ${userProfile.bagType.toLowerCase()} bags with complementary accessories in similar artwork themes`);
    advice.push(`Your ${userProfile.sentiment.toLowerCase()} energy works beautifully with these designs - trust your instincts`);
    
    if (matches.length > 0 && matches[0].matchScore > 85) {
      advice.push(`The top recommendations have exceptional match scores - these are perfect for your style`);
    }
    
    return advice;
  }

  /**
   * Get personality alignment description
   */
  getPersonalityAlignmentDescription(product, userProfile) {
    if (!userProfile.dominantTraits) return 'Well-suited to your personality';
    
    const topTrait = userProfile.dominantTraits[0];
    return `Perfectly aligns with your ${topTrait.toLowerCase()} personality traits`;
  }

  /**
   * Get style compatibility description
   */
  getStyleCompatibilityDescription(product, userProfile) {
    return `Complements your ${userProfile.artworkTheme.toLowerCase()} artwork preference and ${userProfile.sentiment.toLowerCase()} style`;
  }

  /**
   * Get occasion suitability description
   */
  getOccasionSuitabilityDescription(product, userProfile) {
    const bagType = userProfile.bagType.toLowerCase();
    
    const occasionMap = {
      'bag': 'Versatile for everyday use and special occasions',
      'tote': 'Perfect for work, shopping, and casual outings',
      'crossbody': 'Ideal for hands-free activities and travel',
      'pouch': 'Great for evenings out and special events',
      'case': 'Essential for protecting your devices and tech accessories',
      'hobo': 'Comfortable for daily use with a relaxed, stylish vibe'
    };
    
    return occasionMap[bagType] || 'Suitable for various occasions';
  }
}

module.exports = { EnhancedRecommendationEngine };
