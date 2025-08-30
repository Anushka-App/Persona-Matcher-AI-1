import { personalityTraits } from '@/data/personalityQuizTree';

export interface UserProfile {
  personality: string;
  sentiment: string;
  personalityScores?: Record<string, number>;
  dominantTraits?: string[];
  artworkTheme: string;
  bagType: string;
  quizAnswers?: Array<{
    question: string;
    answer: string;
    weights?: Record<string, number>;
  }>;
}

export interface ProductMatch {
  id: string;
  name: string;
  artworkName: string;
  productName: string;
  price: string;
  image: string;
  link: string;
  description: string;
  matchScore: number;
  matchReasons: string[];
  personalityAlignment: string;
  styleCompatibility: string;
  occasionSuitability: string;
}

export interface RecommendationResult {
  products: ProductMatch[];
  explanation: string;
  userProfile: UserProfile;
  matchConfidence: number;
  styleInsights: string[];
  personalizedAdvice: string[];
}

export class EnhancedRecommendationEngine {
  private personalityWeightMap: Record<string, Record<string, number>> = {
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

  private bagTypePersonalityMap: Record<string, Record<string, number>> = {
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

  private artworkThemeKeywords: Record<string, string[]> = {
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

  /**
   * Calculate personality scores based on quiz answers
   */
  calculatePersonalityScores(quizAnswers: Array<{ question: string; answer: string; weights?: Record<string, number> }>): Record<string, number> {
    const scores: Record<string, number> = {};
    const traitCounts: Record<string, number> = {};

    // Initialize scores
    Object.keys(personalityTraits).forEach(trait => {
      scores[trait] = 0;
      traitCounts[trait] = 0;
    });

    // Calculate scores from quiz answers
    quizAnswers.forEach(answer => {
      if (answer.weights) {
        Object.entries(answer.weights).forEach(([trait, weight]) => {
          if (Object.prototype.hasOwnProperty.call(scores, trait)) {
            scores[trait] += weight;
            traitCounts[trait]++;
          }
        });
      }
    });

    // Normalize scores
    Object.keys(scores).forEach(trait => {
      if (traitCounts[trait] > 0) {
        scores[trait] = Math.round((scores[trait] / traitCounts[trait]) * 100);
      }
    });

    return scores;
  }

  /**
   * Get dominant personality traits
   */
  getDominantTraits(scores: Record<string, number>, count: number = 3): string[] {
    return Object.entries(scores)
      .sort(([, a], [, b]) => b - a)
      .slice(0, count)
      .map(([trait]) => trait);
  }

  /**
   * Calculate match score for a product based on user profile
   */
  calculateProductMatchScore(
    product: any,
    userProfile: UserProfile
  ): { score: number; reasons: string[] } {
    let totalScore = 0;
    const reasons: string[] = [];
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
  private calculatePersonalityAlignment(product: any, personalityScores: Record<string, number>): number {
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
  private getProductTraitAlignment(product: any, trait: string): number {
    const productText = `${product.productName} ${product.artworkName} ${product.personalityTraits || ''}`.toLowerCase();
    
    const traitKeywords: Record<string, string[]> = {
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
  private calculateArtworkCompatibility(product: any, artworkTheme: string): number {
    const productText = `${product.artworkName} ${product.productName}`.toLowerCase();
    const keywords = this.artworkThemeKeywords[artworkTheme] || [];
    
    // First, check for exact artwork name matches (highest priority)
    const artworkName = product.artworkName.toLowerCase();
    const exactMatches = keywords.filter(keyword => 
      artworkName === keyword || artworkName.includes(keyword)
    );
    
    if (exactMatches.length > 0) {
      return 100; // Perfect match for artwork name
    }
    
    // Check for partial matches in artwork name (high priority)
    const artworkMatches = keywords.filter(keyword => artworkName.includes(keyword));
    if (artworkMatches.length > 0) {
      return Math.min(artworkMatches.length * 30 + 70, 100); // 70-100 points for artwork matches
    }
    
    // Check for matches in product name (medium priority) 
    const productNameMatches = keywords.filter(keyword => product.productName.toLowerCase().includes(keyword));
    if (productNameMatches.length > 0) {
      return Math.min(productNameMatches.length * 20 + 50, 90); // 50-90 points for product name matches
    }
    
    // Check for matches in full product text (lower priority)
    const textMatches = keywords.filter(keyword => productText.includes(keyword));
    if (textMatches.length > 0) {
      return Math.min(textMatches.length * 15 + 40, 80); // 40-80 points for general text matches
    }
    
    // Fallback: check if theme is mentioned in product description
    if (product.personalityTraits && product.personalityTraits.toLowerCase().includes(artworkTheme.toLowerCase())) {
      return 60;
    }
    
    // Special handling for "Other (Unspecified)" - should match anything reasonably well
    if (artworkTheme === 'Other (Unspecified)') {
      return 50; // Neutral compatibility for mixed/surprise selections
    }
    
    return 20; // Low compatibility score for non-matching themes
  }

  /**
   * Calculate bag type compatibility
   */
  private calculateBagTypeCompatibility(product: any, bagType: string): number {
    const productText = `${product.productName} ${product.productType}`.toLowerCase();
    const bagTypeLower = bagType.toLowerCase();
    
    if (productText.includes(bagTypeLower)) {
      return 100; // Exact match
    }
    
    // Handle variations
    const bagTypeVariations: Record<string, string[]> = {
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
  private calculateSentimentAlignment(product: any, sentiment: string): number {
    const productText = `${product.personalityTraits || ''}`.toLowerCase();
    const sentimentLower = sentiment.toLowerCase();
    
    const sentimentKeywords: Record<string, string[]> = {
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
   * Generate personalized recommendations
   */
  async generateRecommendations(
    products: any[],
    userProfile: UserProfile
  ): Promise<RecommendationResult> {
    // Calculate personality scores if not provided
    if (!userProfile.personalityScores && userProfile.quizAnswers) {
      userProfile.personalityScores = this.calculatePersonalityScores(userProfile.quizAnswers);
    }

    // Get dominant traits
    if (!userProfile.dominantTraits && userProfile.personalityScores) {
      userProfile.dominantTraits = this.getDominantTraits(userProfile.personalityScores);
    }

    // Calculate match scores for all products
    const productMatches: ProductMatch[] = products.map(product => {
      const { score, reasons } = this.calculateProductMatchScore(product, userProfile);
      
      return {
        id: product.id || Math.random().toString(),
        name: product.artworkName,
        artworkName: product.artworkName,
        productName: product.productName,
        price: product.price,
        image: product.imageUrl,
        link: product.productUrl,
        description: product.personalityTraits || '',
        matchScore: score,
        matchReasons: reasons,
        personalityAlignment: this.getPersonalityAlignmentDescription(product, userProfile),
        styleCompatibility: this.getStyleCompatibilityDescription(product, userProfile),
        occasionSuitability: this.getOccasionSuitabilityDescription(product, userProfile)
      };
    });

    // Sort by match score and take top recommendations
    const sortedMatches = productMatches
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, 12);

    // Calculate overall confidence
    const avgScore = sortedMatches.reduce((sum, match) => sum + match.matchScore, 0) / sortedMatches.length;
    const matchConfidence = Math.round(avgScore);

    // Generate explanation and insights
    const explanation = this.generateExplanation(sortedMatches, userProfile);
    const styleInsights = this.generateStyleInsights(userProfile);
    const personalizedAdvice = this.generatePersonalizedAdvice(userProfile, sortedMatches);

    return {
      products: sortedMatches,
      explanation,
      userProfile,
      matchConfidence,
      styleInsights,
      personalizedAdvice
    };
  }

  /**
   * Generate personalized explanation
   */
  private generateExplanation(matches: ProductMatch[], userProfile: UserProfile): string {
    const topMatches = matches.slice(0, 12);
    const avgScore = Math.round(matches.reduce((sum, m) => sum + m.matchScore, 0) / matches.length);
    
    return `Based on your ${userProfile.personality.toLowerCase()} personality and preference for ${userProfile.artworkTheme.toLowerCase()} artwork in ${userProfile.bagType.toLowerCase()} format, we've curated these handbags with ${avgScore}% match confidence. 

Your ${userProfile.dominantTraits?.join(', ').toLowerCase()} traits shine through in these selections, which feature ${userProfile.artworkTheme.toLowerCase()} designs that complement your ${userProfile.sentiment.toLowerCase()} energy. Each piece offers the perfect balance of style and functionality for your lifestyle.`;
  }

  /**
   * Generate style insights
   */
  private generateStyleInsights(userProfile: UserProfile): string[] {
    const insights: string[] = [];
    
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
  private getArtworkInsight(artworkTheme: string): string {
    const insights: Record<string, string> = {
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
  private generatePersonalizedAdvice(userProfile: UserProfile, matches: ProductMatch[]): string[] {
    const advice: string[] = [];
    
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
  private getPersonalityAlignmentDescription(product: any, userProfile: UserProfile): string {
    if (!userProfile.dominantTraits) return 'Well-suited to your personality';
    
    const topTrait = userProfile.dominantTraits[0];
    return `Perfectly aligns with your ${topTrait.toLowerCase()} personality traits`;
  }

  /**
   * Get style compatibility description
   */
  private getStyleCompatibilityDescription(product: any, userProfile: UserProfile): string {
    return `Complements your ${userProfile.artworkTheme.toLowerCase()} artwork preference and ${userProfile.sentiment.toLowerCase()} style`;
  }

  /**
   * Get occasion suitability description
   */
  private getOccasionSuitabilityDescription(product: any, userProfile: UserProfile): string {
    const bagType = userProfile.bagType.toLowerCase();
    
    const occasionMap: Record<string, string> = {
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

// Export singleton instance
export const recommendationEngine = new EnhancedRecommendationEngine();
