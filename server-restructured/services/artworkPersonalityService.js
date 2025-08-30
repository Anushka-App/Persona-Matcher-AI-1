/**
 * Artwork Personality Service
 * Handles artwork-personality matching and analysis
 */
const artworkService = require('./artworkService');

class ArtworkPersonalityService {
  /**
   * Find persona for artwork based on personality profile
   */
  async findPersonaForArtwork(artworkName, personalityProfile) {
    try {
      // Get artwork data
      const artwork = await artworkService.getArtworkByName(artworkName);
      
      if (!artwork) {
        return {
          match: false,
          message: `Artwork "${artworkName}" not found`,
          suggestions: []
        };
      }
      
      // Analyze personality-artwork compatibility
      const compatibility = this.analyzeCompatibility(artwork, personalityProfile);
      
      return {
        match: compatibility.score > 0.6,
        score: compatibility.score,
        artwork: artwork,
        personalityProfile: personalityProfile,
        analysis: compatibility.analysis,
        suggestions: compatibility.suggestions
      };
    } catch (error) {
      console.error('Error finding persona for artwork:', error);
      return {
        match: false,
        message: 'Error analyzing artwork-personality match',
        suggestions: []
      };
    }
  }
  
  /**
   * Analyze compatibility between artwork and personality
   */
  analyzeCompatibility(artwork, personalityProfile) {
    const { traits } = personalityProfile;
    const artworkPersonality = artwork.overallPersonality?.toLowerCase() || '';
    const buyerMatch = artwork.buyerPersonalityMatch?.toLowerCase() || '';
    
    let score = 0;
    let analysis = '';
    let suggestions = [];
    
    // Analyze boldness compatibility
    if (traits.boldness.level === 'High' && 
        (artworkPersonality.includes('bold') || artworkPersonality.includes('striking'))) {
      score += 0.3;
      analysis += 'Your high boldness aligns well with this artwork\'s striking personality. ';
    }
    
    // Analyze elegance compatibility
    if (traits.elegance.level === 'High' && 
        (artworkPersonality.includes('elegant') || artworkPersonality.includes('sophisticated'))) {
      score += 0.3;
      analysis += 'Your appreciation for elegance matches this artwork\'s sophisticated nature. ';
    }
    
    // Analyze whimsy compatibility
    if (traits.whimsy.level === 'High' && 
        (artworkPersonality.includes('playful') || artworkPersonality.includes('creative'))) {
      score += 0.3;
      analysis += 'Your whimsical nature resonates with this artwork\'s creative elements. ';
    }
    
    // Check buyer personality match
    if (buyerMatch && buyerMatch.length > 0) {
      score += 0.1;
      analysis += `This artwork is designed for ${buyerMatch} personalities. `;
    }
    
    // Generate suggestions based on compatibility
    if (score > 0.7) {
      suggestions.push('This artwork is an excellent match for your personality!');
      suggestions.push('Consider this piece as a signature item in your collection.');
    } else if (score > 0.4) {
      suggestions.push('This artwork has some elements that align with your style.');
      suggestions.push('Consider how it might complement your existing pieces.');
    } else {
      suggestions.push('This artwork may not be the best match for your current style preferences.');
      suggestions.push('Consider exploring other pieces that better align with your personality.');
    }
    
    return {
      score: Math.min(score, 1.0),
      analysis: analysis || 'This artwork has a neutral compatibility with your personality.',
      suggestions
    };
  }
  
  /**
   * Get artwork recommendations based on personality
   */
  async getArtworkRecommendations(personalityProfile, limit = 5) {
    try {
      const allArtworks = await artworkService.getAllArtworkData();
      
      // Score each artwork based on personality compatibility
      const scoredArtworks = allArtworks.map(artwork => {
        const compatibility = this.analyzeCompatibility(artwork, personalityProfile);
        return {
          artwork,
          score: compatibility.score,
          analysis: compatibility.analysis
        };
      });
      
      // Sort by score and return top recommendations
      return scoredArtworks
        .sort((a, b) => b.score - a.score)
        .slice(0, limit)
        .map(item => ({
          artwork: item.artwork,
          score: item.score,
          analysis: item.analysis
        }));
    } catch (error) {
      console.error('Error getting artwork recommendations:', error);
      return [];
    }
  }
}

module.exports = new ArtworkPersonalityService();
