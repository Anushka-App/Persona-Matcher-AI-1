/**
 * Recommendation service
 */
const productService = require('./productService');
const llmService = require('./llmService');

class RecommendationService {
  /**
   * Extract style keywords from text description
   */
  async getStyleKeywords(description) {
    try {
      // Try to use LLM if available
      const keywords = await llmService.extractStyleKeywords(description);
      if (keywords && keywords.length > 0) {
        return keywords;
      }
      
      // Fallback method if LLM is unavailable or fails
      return this.extractKeywordsWithRules(description);
    } catch (error) {
      console.error('Error extracting style keywords:', error);
      return this.extractKeywordsWithRules(description);
    }
  }
  
  /**
   * Extract keywords using rule-based approach (fallback)
   */
  extractKeywordsWithRules(description) {
    // Basic keyword mapping rules
    const styleKeywordMappings = {
      'bold': ['bold', 'striking', 'vibrant', 'bright', 'colorful', 'energetic'],
      'elegant': ['elegant', 'sophisticated', 'refined', 'luxurious', 'classy'],
      'whimsical': ['whimsical', 'playful', 'fun', 'creative', 'artistic'],
      'nature': ['nature', 'floral', 'botanical', 'animal', 'landscape'],
      'geometric': ['geometric', 'pattern', 'abstract', 'modern', 'structured'],
      'classic': ['classic', 'timeless', 'traditional', 'vintage', 'retro']
    };
    
    const lowercaseDesc = description.toLowerCase();
    const foundKeywords = [];
    
    // Check for each keyword category
    Object.entries(styleKeywordMappings).forEach(([category, keywords]) => {
      if (keywords.some(keyword => lowercaseDesc.includes(keyword))) {
        foundKeywords.push(category);
      }
    });
    
    // Ensure we return at least some keywords
    if (foundKeywords.length === 0) {
      // Default to a couple of common styles
      foundKeywords.push('elegant', 'classic');
    }
    
    return foundKeywords;
  }
  
  /**
   * Find products matching given style keywords and bag type
   */
  async findMatchingProducts(styleKeywords, bagType = 'Bag') {
    const products = await productService.getAllProducts();
    
    if (!products || products.length === 0) {
      return [];
    }
    
    // Filter by bag type first
    const bagTypeProducts = products.filter(product =>
      product.productType.toLowerCase().includes(bagType.toLowerCase())
    );
    
    if (bagTypeProducts.length === 0) {
      return [];
    }
    
    // Score products based on keyword matching
    const scoredProducts = bagTypeProducts.map(product => {
      const productTraits = product.personalityTraits.toLowerCase();
      let score = 0;
      
      styleKeywords.forEach(keyword => {
        if (productTraits.includes(keyword.toLowerCase())) {
          score += 1;
        }
      });
      
      return { product, score };
    });
    
    // Sort by score (descending) and return top matches
    const sortedProducts = scoredProducts
      .sort((a, b) => b.score - a.score)
      .map(item => item.product);
    
    // Return top 10 matches or all if fewer than 10
    return sortedProducts.slice(0, 10);
  }
  
  /**
   * Get personalized recommendations based on user profile
   */
  async getPersonalizedRecommendations(userId, preferences) {
    try {
      let userPreferences = preferences;
      
      // If userId is provided but not preferences, try to fetch user preferences
      if (userId && !preferences) {
        const userService = require('./userService');
        userPreferences = await userService.getUserPreferences(userId);
      }
      
      if (!userPreferences) {
        throw new Error('No preferences available for recommendation');
      }
      
      // Extract style keywords from preferences
      let styleKeywords = [];
      
      if (userPreferences.personalityTraits) {
        styleKeywords = userPreferences.personalityTraits.split(',').map(trait => trait.trim());
      }
      
      if (styleKeywords.length === 0 && userPreferences.styleDescription) {
        styleKeywords = await this.getStyleKeywords(userPreferences.styleDescription);
      }
      
      // Get bagType preference
      const bagType = userPreferences.bagType || 'Bag';
      
      // Find matching products
      return await this.findMatchingProducts(styleKeywords, bagType);
    } catch (error) {
      console.error('Error getting personalized recommendations:', error);
      return [];
    }
  }
}

module.exports = new RecommendationService();
