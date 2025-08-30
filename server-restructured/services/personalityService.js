/**
 * Personality quiz and analysis service
 */
const fs = require('fs');
const path = require('path');
const llmService = require('./llmService');

class PersonalityService {
  constructor() {
    this.quizData = null;
    this.personalityReports = new Map();
    this.isLoaded = false;
  }
  
  /**
   * Load quiz data from JSON file
   */
  async loadQuizData() {
    try {
      const quizPath = path.join(process.cwd(), 'public', 'adaptive_personality_only_GRAPH.json');
      
      if (!fs.existsSync(quizPath)) {
        console.warn('⚠️ Personality quiz data file not found:', quizPath);
        return null;
      }
      
      const data = fs.readFileSync(quizPath, 'utf8');
      this.quizData = JSON.parse(data);
      this.isLoaded = true;
      
      console.log('✅ Personality quiz data loaded successfully');
      return this.quizData;
    } catch (error) {
      console.error('❌ Error loading personality quiz data:', error);
      return null;
    }
  }
  
  /**
   * Get quiz questions
   */
  async getQuizQuestions() {
    if (!this.isLoaded) {
      await this.loadQuizData();
    }
    
    if (!this.quizData || !this.quizData.nodes) {
      return [];
    }
    
    // Extract questions and answers from graph structure
    const questionNodes = this.quizData.nodes.filter(node => 
      node.type === 'question' && node.data && node.data.question
    );
    
    return questionNodes.map(node => ({
      id: node.id,
      question: node.data.question,
      options: this.getAnswerOptionsForQuestion(node.id)
    }));
  }
  
  /**
   * Get answer options for a specific question
   */
  getAnswerOptionsForQuestion(questionId) {
    if (!this.quizData || !this.quizData.edges) {
      return [];
    }
    
    // Find all edges that start from this question node
    const answerEdges = this.quizData.edges.filter(edge => 
      edge.source === questionId && edge.data && edge.data.answer
    );
    
    return answerEdges.map(edge => ({
      id: edge.id,
      text: edge.data.answer,
      nextQuestionId: edge.target
    }));
  }
  
  /**
   * Process quiz answers and generate personality profile
   */
  async processQuizAnswers(answers) {
    try {
      if (!Array.isArray(answers) || answers.length === 0) {
        throw new Error('Invalid answers format');
      }
      
      // Map answers to personality traits
      // This is a simplified implementation
      const traitCounts = {
        boldness: 0,
        elegance: 0,
        whimsy: 0
      };
      
      // Count trait associations from answers
      answers.forEach(answer => {
        if (answer.traits) {
          if (answer.traits.includes('bold')) traitCounts.boldness++;
          if (answer.traits.includes('elegant')) traitCounts.elegance++;
          if (answer.traits.includes('whimsical')) traitCounts.whimsy++;
        }
      });
      
      // Determine trait levels
      const getLevel = count => {
        if (count <= 1) return 'Low';
        if (count <= 3) return 'Moderate';
        return 'High';
      };
      
      const personalityProfile = {
        traits: {
          boldness: {
            level: getLevel(traitCounts.boldness),
            description: this.getTraitDescription('boldness', getLevel(traitCounts.boldness))
          },
          elegance: {
            level: getLevel(traitCounts.elegance),
            description: this.getTraitDescription('elegance', getLevel(traitCounts.elegance))
          },
          whimsy: {
            level: getLevel(traitCounts.whimsy),
            description: this.getTraitDescription('whimsy', getLevel(traitCounts.whimsy))
          }
        },
        styleStatement: this.generateStyleStatement(traitCounts),
        strengths: this.generateStrengths(traitCounts),
        growthAreas: this.generateGrowthAreas(traitCounts)
      };
      
      // Try to enhance with LLM if available
      if (llmService.isAvailable()) {
        try {
          const enhancedProfile = await llmService.generatePersonalityAnalysis(answers);
          if (enhancedProfile) {
            return enhancedProfile;
          }
        } catch (llmError) {
          console.error('❌ Error enhancing profile with LLM:', llmError);
          // Fall back to rule-based profile
        }
      }
      
      return personalityProfile;
    } catch (error) {
      console.error('❌ Error processing quiz answers:', error);
      throw error;
    }
  }
  
  /**
   * Generate a description for a personality trait
   */
  getTraitDescription(trait, level) {
    const descriptions = {
      boldness: {
        'Low': 'You prefer subtlety and thoughtfulness over making bold statements.',
        'Moderate': 'You strike a balance between bold choices and more subdued preferences.',
        'High': 'You embrace boldness and aren\'t afraid to make a statement or take risks.'
      },
      elegance: {
        'Low': 'You prioritize comfort and practicality over formal elegance.',
        'Moderate': 'You appreciate refined aesthetics but balance them with casual comfort.',
        'High': 'You value sophistication and have a natural inclination toward polished aesthetics.'
      },
      whimsy: {
        'Low': 'You prefer clarity and structure over spontaneous whimsy.',
        'Moderate': 'You enjoy creative touches while maintaining a grounded approach.',
        'High': 'You embrace playfulness and delight in unexpected creative expression.'
      }
    };
    
    return descriptions[trait][level] || `Your ${trait} level is ${level}.`;
  }
  
  /**
   * Generate a style statement based on trait counts
   */
  generateStyleStatement(traitCounts) {
    const dominantTrait = Object.entries(traitCounts).reduce(
      (max, [trait, count]) => count > max.count ? { trait, count } : max,
      { trait: 'elegance', count: 0 }
    ).trait;
    
    const statements = {
      boldness: 'Your style radiates confidence and impact, making a memorable statement wherever you go.',
      elegance: 'Your style reflects sophistication and refined taste, with an appreciation for quality and timeless beauty.',
      whimsy: 'Your style expresses creativity and playfulness, embracing unique details that spark joy and conversation.'
    };
    
    return statements[dominantTrait];
  }
  
  /**
   * Generate strengths based on trait counts
   */
  generateStrengths(traitCounts) {
    const strengths = [];
    
    if (traitCounts.boldness > 2) {
      strengths.push('Confidence in self-expression', 'Ability to make decisive choices');
    }
    
    if (traitCounts.elegance > 2) {
      strengths.push('Appreciation for quality and craftsmanship', 'Discerning eye for balanced aesthetics');
    }
    
    if (traitCounts.whimsy > 2) {
      strengths.push('Creative approach to personal expression', 'Willingness to embrace unique elements');
    }
    
    // Add general strengths if few trait-specific ones were found
    if (strengths.length < 2) {
      strengths.push('Versatility in personal style', 'Authentic self-expression');
    }
    
    return strengths;
  }
  
  /**
   * Generate growth areas based on trait counts
   */
  generateGrowthAreas(traitCounts) {
    const growthAreas = [];
    
    if (traitCounts.boldness < 2) {
      growthAreas.push('Embracing more confidence in style choices');
    }
    
    if (traitCounts.elegance < 2) {
      growthAreas.push('Developing appreciation for refined details');
    }
    
    if (traitCounts.whimsy < 2) {
      growthAreas.push('Incorporating more playful elements into your style');
    }
    
    // Add general growth areas if few trait-specific ones were found
    if (growthAreas.length < 1) {
      growthAreas.push('Finding balance among your strong traits');
    }
    
    return growthAreas;
  }
  
  /**
   * Save personality result for a user
   */
  async savePersonalityResult(userId, personalityResult) {
    try {
      // Store in memory (in a real app, this would be persisted to a database)
      this.personalityReports.set(userId, {
        userId,
        personalityResult,
        timestamp: new Date().toISOString()
      });
      
      return true;
    } catch (error) {
      console.error('❌ Error saving personality result:', error);
      return false;
    }
  }
  
  /**
   * Get personality report for user
   */
  async getPersonalityReport(userId) {
    // Check if report exists in memory
    const reportData = this.personalityReports.get(userId);
    
    if (!reportData) {
      console.warn(`⚠️ No personality report found for user ${userId}`);
      return null;
    }
    
    // Generate formatted report if using LLM
    if (llmService.isAvailable()) {
      try {
        const formattedReport = await llmService.generatePersonalityReport(reportData.personalityResult);
        return {
          ...reportData,
          formattedReport
        };
      } catch (error) {
        console.error('❌ Error generating formatted personality report:', error);
      }
    }
    
    // Return raw report if LLM not available
    return reportData;
  }
}

module.exports = new PersonalityService();
