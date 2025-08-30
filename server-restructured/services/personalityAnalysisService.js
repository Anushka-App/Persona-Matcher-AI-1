/**
 * Personality Analysis Service
 * Handles advanced personality analysis and reporting
 */
const llmService = require('./llmService');

class PersonalityAnalysisService {
  /**
   * Generate comprehensive personality analysis
   */
  async generatePersonalityAnalysis(quizAnswers, personalityType, dominantTraits) {
    try {
      if (llmService.isAvailable()) {
        const result = await llmService.generatePersonalityAnalysis(quizAnswers);
        return result;
      }
      
      // Fallback to basic analysis
      return this.generateBasicAnalysis(quizAnswers, personalityType, dominantTraits);
    } catch (error) {
      console.error('Error generating personality analysis:', error);
      return this.generateBasicAnalysis(quizAnswers, personalityType, dominantTraits);
    }
  }
  
  /**
   * Generate basic personality analysis without LLM
   */
  generateBasicAnalysis(quizAnswers, personalityType, dominantTraits) {
    return {
      personalityType: personalityType || 'Balanced',
      dominantTraits: dominantTraits || ['elegance', 'classic'],
      analysis: 'Your personality shows a balanced approach to style and expression.',
      recommendations: [
        'Consider exploring classic and timeless pieces',
        'Balance bold choices with refined details',
        'Embrace your unique style preferences'
      ]
    };
  }
  
  /**
   * Generate personality report in markdown format
   */
  async generatePersonalityReport(personalityProfile) {
    try {
      if (llmService.isAvailable()) {
        return await llmService.generatePersonalityReport(personalityProfile);
      }
      
      // Fallback to basic report
      return this.generateBasicReport(personalityProfile);
    } catch (error) {
      console.error('Error generating personality report:', error);
      return this.generateBasicReport(personalityProfile);
    }
  }
  
  /**
   * Generate basic personality report without LLM
   */
  generateBasicReport(personalityProfile) {
    const { traits, styleStatement, strengths, growthAreas } = personalityProfile;
    
    return `# Personality Report

## Your Style Statement
${styleStatement}

## Personality Traits

### Boldness: ${traits.boldness.level}
${traits.boldness.description}

### Elegance: ${traits.elegance.level}
${traits.elegance.description}

### Whimsy: ${traits.whimsy.level}
${traits.whimsy.description}

## Your Strengths
${strengths.map(strength => `- ${strength}`).join('\n')}

## Growth Opportunities
${growthAreas.map(area => `- ${area}`).join('\n')}

## Recommendations
- Embrace your unique personality blend
- Use your strengths to guide style choices
- Consider exploring areas for growth in small ways
- Remember that style is personal and evolving

*This report is based on your quiz responses and reflects your current style preferences.*`;
  }
}

module.exports = new PersonalityAnalysisService();
