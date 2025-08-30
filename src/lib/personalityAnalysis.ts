import { personalityTraits } from '@/data/personalityQuizTree';

export interface PersonalityScore {
  trait: string;
  score: number;
  description: string;
  level: 'Low' | 'Moderate' | 'High';
}

export interface PersonalityAnalysis {
  scores: PersonalityScore[];
  dominantTraits: string[];
  personalityType: string;
  confidenceScore: number;
  insights: string[];
  recommendations: string[];
}

export interface QuizAnswer {
  question: string;
  answer: string;
  weights?: Record<string, number>;
}

export class DynamicPersonalityAnalyzer {
  private traitScores: Record<string, number> = {};
  private answers: QuizAnswer[] = [];

  constructor() {
    this.reset();
  }

  reset(): void {
    this.traitScores = {};
    this.answers = [];
  }

  addAnswer(question: string, answer: string, weights?: Record<string, number>): void {
    this.answers.push({ question, answer, weights });
    
    if (weights) {
      Object.entries(weights).forEach(([trait, score]) => {
        this.traitScores[trait] = (this.traitScores[trait] || 0) + score;
      });
    }
  }

  calculateScores(): PersonalityScore[] {
    const scores: PersonalityScore[] = [];
    
    Object.entries(this.traitScores).forEach(([trait, score]) => {
      const maxPossibleScore = this.getMaxPossibleScore(trait);
      const normalizedScore = Math.min(score, maxPossibleScore);
      const percentage = (normalizedScore / maxPossibleScore) * 100;
      
      let level: 'Low' | 'Moderate' | 'High';
      if (percentage < 40) level = 'Low';
      else if (percentage < 70) level = 'Moderate';
      else level = 'High';

      scores.push({
        trait,
        score: normalizedScore,
        description: personalityTraits[trait as keyof typeof personalityTraits] || trait,
        level
      });
    });

    return scores.sort((a, b) => b.score - a.score);
  }

  private getMaxPossibleScore(trait: string): number {
    // Define maximum possible scores for each trait based on the quiz structure
    const maxScores: Record<string, number> = {
      Boldness: 45,
      Elegance: 45,
      Whimsy: 45,
      Excitement: 36,
      Competence: 36,
      Sincerity: 36,
      Sophistication: 36,
      Ruggedness: 24,
      ArtisticFlair: 45,
      NatureAffinity: 36,
      LuxuryLeaning: 24,
      Versatility: 36,
      ColorPlayfulness: 36,
      Minimalism: 36
    };
    
    return maxScores[trait] || 30;
  }

  getDominantTraits(count: number = 4): string[] {
    const scores = this.calculateScores();
    return scores.slice(0, count).map(score => score.trait);
  }

  generatePersonalityType(): string {
    const scores = this.calculateScores();
    const topTraits = scores.slice(0, 3);
    
    // Create personality type based on dominant traits
    const typeMap: Record<string, string> = {
      'Boldness,Elegance,Whimsy': 'The Dynamic Visionary',
      'Boldness,Elegance,Excitement': 'The Confident Connoisseur',
      'Boldness,Whimsy,ArtisticFlair': 'The Creative Maverick',
      'Elegance,Sophistication,Competence': 'The Refined Professional',
      'Elegance,Whimsy,ColorPlayfulness': 'The Artistic Elegance',
      'Whimsy,ArtisticFlair,ColorPlayfulness': 'The Creative Dreamer',
      'Competence,Sincerity,Minimalism': 'The Practical Perfectionist',
      'NatureAffinity,Sincerity,Elegance': 'The Natural Sophisticate',
      'Excitement,Boldness,ColorPlayfulness': 'The Vibrant Adventurer',
      'Sophistication,Competence,Elegance': 'The Cultured Professional'
    };

    const traitKey = topTraits.map(t => t.trait).join(',');
    return typeMap[traitKey] || this.generateCustomType(topTraits);
  }

  private generateCustomType(topTraits: PersonalityScore[]): string {
    const adjectives = {
      Boldness: ['Bold', 'Confident', 'Dynamic'],
      Elegance: ['Elegant', 'Refined', 'Sophisticated'],
      Whimsy: ['Creative', 'Imaginative', 'Playful'],
      Excitement: ['Energetic', 'Vibrant', 'Enthusiastic'],
      Competence: ['Reliable', 'Thorough', 'Practical'],
      Sincerity: ['Authentic', 'Genuine', 'Honest'],
      Sophistication: ['Cultured', 'Worldly', 'Refined'],
      Ruggedness: ['Resilient', 'Strong', 'Authentic'],
      ArtisticFlair: ['Artistic', 'Creative', 'Expressive'],
      NatureAffinity: ['Natural', 'Organic', 'Connected'],
      LuxuryLeaning: ['Premium', 'Exclusive', 'Refined'],
      Versatility: ['Adaptable', 'Flexible', 'Versatile'],
      ColorPlayfulness: ['Vibrant', 'Dynamic', 'Colorful'],
      Minimalism: ['Minimal', 'Simple', 'Essential']
    };

    const primaryTrait = topTraits[0];
    const secondaryTrait = topTraits[1];
    
    const primaryAdj = adjectives[primaryTrait.trait as keyof typeof adjectives]?.[0] || primaryTrait.trait;
    const secondaryAdj = adjectives[secondaryTrait.trait as keyof typeof adjectives]?.[0] || secondaryTrait.trait;
    
    return `The ${primaryAdj} ${secondaryAdj}`;
  }

  calculateConfidenceScore(): number {
    const scores = this.calculateScores();
    const totalAnswers = this.answers.length;
    const scoreVariance = this.calculateScoreVariance(scores);
    
    // Higher confidence with more answers and clearer trait dominance
    let confidence = Math.min(50 + (totalAnswers * 10), 90);
    
    // Adjust based on score variance (clearer dominance = higher confidence)
    if (scoreVariance > 0.3) confidence += 10;
    
    return Math.min(confidence, 95);
  }

  private calculateScoreVariance(scores: PersonalityScore[]): number {
    if (scores.length < 2) return 0;
    
    const values = scores.map(s => s.score);
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const variance = values.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / values.length;
    
    return variance / (mean * mean); // Normalized variance
  }

  generateInsights(): string[] {
    const scores = this.calculateScores();
    const insights: string[] = [];
    
    scores.forEach(score => {
      if (score.level === 'High') {
        insights.push(`Your strong ${score.trait.toLowerCase()} trait shows in your ${this.getTraitExamples(score.trait)}`);
      } else if (score.level === 'Low') {
        insights.push(`You may want to explore your ${score.trait.toLowerCase()} side through ${this.getTraitSuggestions(score.trait)}`);
      }
    });

    return insights.slice(0, 5);
  }

  private getTraitExamples(trait: string): string {
    const examples: Record<string, string> = {
      Boldness: 'decisive choices and confident approach to challenges',
      Elegance: 'refined taste and attention to sophisticated details',
      Whimsy: 'creative problem-solving and imaginative thinking',
      Excitement: 'enthusiastic engagement and dynamic energy',
      Competence: 'reliable execution and thorough planning',
      Sincerity: 'authentic connections and genuine communication',
      Sophistication: 'cultural awareness and refined preferences',
      ArtisticFlair: 'creative expression and aesthetic sensitivity',
      NatureAffinity: 'connection to natural elements and organic appreciation',
      Versatility: 'adaptable approach and flexible thinking',
      ColorPlayfulness: 'vibrant expression and dynamic color choices',
      Minimalism: 'essential focus and simplified approach'
    };
    
    return examples[trait] || 'unique perspective and approach';
  }

  private getTraitSuggestions(trait: string): string {
    const suggestions: Record<string, string> = {
      Boldness: 'taking calculated risks and making confident decisions',
      Elegance: 'refining your aesthetic choices and attention to detail',
      Whimsy: 'exploring creative hobbies and imaginative activities',
      Excitement: 'seeking new experiences and embracing dynamic situations',
      Competence: 'developing systematic approaches and thorough planning',
      Sincerity: 'practicing authentic communication and genuine connections',
      Sophistication: 'exploring cultural experiences and refined interests',
      ArtisticFlair: 'engaging in creative activities and artistic expression',
      NatureAffinity: 'spending time in natural settings and organic experiences',
      Versatility: 'trying diverse activities and adapting to new situations',
      ColorPlayfulness: 'experimenting with vibrant colors and dynamic expressions',
      Minimalism: 'simplifying your approach and focusing on essentials'
    };
    
    return suggestions[trait] || 'exploring new experiences and perspectives';
  }

  generateRecommendations(): string[] {
    const scores = this.calculateScores();
    const recommendations: string[] = [];
    
    // Leverage strengths
    const highTraits = scores.filter(s => s.level === 'High').slice(0, 2);
    highTraits.forEach(trait => {
      recommendations.push(`Channel your ${trait.trait.toLowerCase()} in leadership and decision-making situations`);
    });
    
    // Develop growth areas
    const lowTraits = scores.filter(s => s.level === 'Low').slice(0, 2);
    lowTraits.forEach(trait => {
      recommendations.push(`Practice ${trait.trait.toLowerCase()} through small daily choices and experiences`);
    });
    
    // Balance recommendations
    if (scores.length >= 3) {
      const topTrait = scores[0];
      const bottomTrait = scores[scores.length - 1];
      recommendations.push(`Balance your ${topTrait.trait.toLowerCase()} with ${bottomTrait.trait.toLowerCase()} for more well-rounded decisions`);
    }
    
    return recommendations.slice(0, 4);
  }

  getFullAnalysis(): PersonalityAnalysis {
    const scores = this.calculateScores();
    const dominantTraits = this.getDominantTraits();
    const personalityType = this.generatePersonalityType();
    const confidenceScore = this.calculateConfidenceScore();
    const insights = this.generateInsights();
    const recommendations = this.generateRecommendations();

    return {
      scores,
      dominantTraits,
      personalityType,
      confidenceScore,
      insights,
      recommendations
    };
  }
}

// Utility function to create analyzer instance
export const createPersonalityAnalyzer = (): DynamicPersonalityAnalyzer => {
  return new DynamicPersonalityAnalyzer();
};
