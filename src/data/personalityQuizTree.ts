export interface QuizNode {
  question: string;
  options: {
    answer: string;
    next_question: QuizNode | null;
    result?: string;
    weights?: Record<string, number>; // Add personality trait weights
  }[];
  adaptiveLogic?: {
    condition?: string; // Condition for showing this question
    skipIf?: string[]; // Skip if certain traits are already determined
  };
}

// Enhanced personality quiz with more dynamic structure
const personalityQuiz: QuizNode = {
  question: "Which of these qualities feels most aligned with who you truly are?",
  options: [
    {
      answer: "Adventurous",
      weights: { Boldness: 15, Excitement: 12, Ruggedness: 8 },
      next_question: {
        question: "When you picture a perfect day, do you imagine vibrant, bold experiences or serene, tranquil moments?",
        options: [
          {
            answer: "Vibrant, Bold Experiences",
            weights: { Boldness: 12, Excitement: 10, ColorPlayfulness: 6 },
            next_question: {
              question: "Do you prefer abstract or realistic representations of nature or animals?",
              options: [
                { 
                  answer: "Abstract", 
                  weights: { ArtisticFlair: 10, Whimsy: 8, Boldness: 6 },
                  result: "Abstract Leopard (Vibrant, Bold)", 
                  next_question: null 
                },
                { 
                  answer: "Realistic", 
                  weights: { Competence: 10, Sophistication: 8, Boldness: 6 },
                  result: "African Elephant (Majestic, Powerful)", 
                  next_question: null 
                }
              ]
            }
          },
          {
            answer: "Serene, Tranquil Moments",
            weights: { Elegance: 12, Sincerity: 8, Minimalism: 6 },
            next_question: {
              question: "Do you enjoy serene landscapes or nature-inspired motifs?",
              options: [
                { 
                  answer: "Serene Landscapes", 
                  weights: { Elegance: 10, Sincerity: 8, NatureAffinity: 6 },
                  result: "Wings of Peace (Calm, Gentle)", 
                  next_question: null 
                },
                { 
                  answer: "Nature-inspired Motifs", 
                  weights: { NatureAffinity: 10, Versatility: 8, Elegance: 6 },
                  result: "Wild Desert (Adventurous, Free-spirited)", 
                  next_question: null 
                }
              ]
            }
          }
        ]
      }
    },
    {
      answer: "Creative and Artistic",
      weights: { ArtisticFlair: 15, Whimsy: 10, ColorPlayfulness: 8 },
      next_question: {
        question: "Do you gravitate toward abstract or realistic designs in art?",
        options: [
          {
            answer: "Abstract",
            weights: { ArtisticFlair: 12, Whimsy: 10, Boldness: 6 },
            next_question: {
              question: "Do you prefer cosmic or natural influences in the art you enjoy?",
              options: [
                { 
                  answer: "Cosmic", 
                  weights: { Whimsy: 12, ArtisticFlair: 10, Boldness: 8 },
                  result: "Untitled AI Artwork 92 (Introspective, Cosmic)", 
                  next_question: null 
                },
                { 
                  answer: "Natural", 
                  weights: { NatureAffinity: 12, ArtisticFlair: 8, Versatility: 6 },
                  result: "Canyon Birds (Nature, Wild)", 
                  next_question: null 
                }
              ]
            }
          },
          {
            answer: "Realistic",
            weights: { Competence: 10, Sophistication: 8, Elegance: 6 },
            next_question: {
              question: "Do you enjoy detailed, nostalgic art or more contemporary pieces?",
              options: [
                { 
                  answer: "Nostalgic", 
                  weights: { Sincerity: 10, Competence: 8, Elegance: 6 },
                  result: "Vintage Bike (Nostalgic, Classic)", 
                  next_question: null 
                },
                { 
                  answer: "Contemporary", 
                  weights: { Sophistication: 12, ArtisticFlair: 8, Boldness: 6 },
                  result: "Venetian Story (Sophisticated, Artistic)", 
                  next_question: null 
                }
              ]
            }
          }
        ]
      }
    },
    {
      answer: "Elegant and Sophisticated",
      weights: { Elegance: 15, Sophistication: 12, Competence: 8 },
      next_question: {
        question: "Do you prefer nature-inspired or geometric patterns?",
        options: [
          {
            answer: "Nature-inspired",
            weights: { NatureAffinity: 10, Elegance: 8, Sincerity: 6 },
            next_question: {
              question: "Do you like soft, pastel tones or vibrant, lively colors?",
              options: [
                { 
                  answer: "Pastel Shades", 
                  weights: { Elegance: 12, Sincerity: 8, Minimalism: 6 },
                  result: "Wondrous Wings (Graceful, Serene)", 
                  next_question: null 
                },
                { 
                  answer: "Vibrant Colors", 
                  weights: { ColorPlayfulness: 12, NatureAffinity: 8, Boldness: 6 },
                  result: "Butterfly Honey (Vibrant, Nature)", 
                  next_question: null 
                }
              ]
            }
          },
          {
            answer: "Geometric Patterns",
            weights: { Sophistication: 10, Competence: 8, Minimalism: 6 },
            next_question: {
              question: "Do you prefer subtle or bold statements in geometric designs?",
              options: [
                { 
                  answer: "Subtle", 
                  weights: { Elegance: 12, Minimalism: 10, Competence: 6 },
                  result: "Vintage Floral (Timeless, Elegant)", 
                  next_question: null 
                },
                { 
                  answer: "Bold", 
                  weights: { Boldness: 12, Sophistication: 8, Excitement: 6 },
                  result: "Skyscrapers (Energetic, Modern)", 
                  next_question: null 
                }
              ]
            }
          }
        ]
      }
    },
    {
      answer: "Free-Spirited",
      weights: { Whimsy: 15, Versatility: 12, Excitement: 8 },
      next_question: {
        question: "Do you enjoy abstract nature or bold animal designs?",
        options: [
          {
            answer: "Abstract Nature",
            weights: { ArtisticFlair: 10, Whimsy: 8, NatureAffinity: 6 },
            next_question: {
              question: "Do you prefer earthy tones or vibrant colors?",
              options: [
                { 
                  answer: "Earthy Tones", 
                  weights: { NatureAffinity: 10, Sincerity: 8, Versatility: 6 },
                  result: "Wild Desert (Adventurous, Free-spirited)", 
                  next_question: null 
                },
                { 
                  answer: "Vibrant Colors", 
                  weights: { ColorPlayfulness: 12, Whimsy: 8, Excitement: 6 },
                  result: "Underwater Beauty (Calm, Dreamy)", 
                  next_question: null 
                }
              ]
            }
          },
          {
            answer: "Bold Animal Designs",
            weights: { Boldness: 10, Excitement: 8, ArtisticFlair: 6 },
            next_question: {
              question: "Do you prefer realistic or stylized animal representations?",
              options: [
                { 
                  answer: "Realistic", 
                  weights: { Competence: 10, Boldness: 8, NatureAffinity: 6 },
                  result: "Abstract Leopard (Vibrant, Bold)", 
                  next_question: null 
                },
                { 
                  answer: "Stylized", 
                  weights: { ArtisticFlair: 12, Whimsy: 8, ColorPlayfulness: 6 },
                  result: "Butterfly Honey (Vibrant, Nature)", 
                  next_question: null 
                }
              ]
            }
          }
        ]
      }
    }
  ]
};

// Additional question pools for more variety
export const additionalQuestions: QuizNode[] = [
  {
    question: "How do you typically approach decision-making?",
    options: [
      {
        answer: "I trust my instincts and go with my gut feeling",
        weights: { Boldness: 12, Excitement: 8, Whimsy: 6 },
        next_question: null
      },
      {
        answer: "I carefully analyze all options before deciding",
        weights: { Competence: 12, Elegance: 8, Sincerity: 6 },
        next_question: null
      },
      {
        answer: "I seek input from others and collaborate",
        weights: { Sincerity: 12, Versatility: 8, NatureAffinity: 6 },
        next_question: null
      },
      {
        answer: "I experiment and learn through trial and error",
        weights: { Whimsy: 12, ArtisticFlair: 8, Excitement: 6 },
        next_question: null
      }
    ]
  },
  {
    question: "What type of environment energizes you most?",
    options: [
      {
        answer: "Bustling city streets with constant activity",
        weights: { Boldness: 12, Excitement: 10, Sophistication: 6 },
        next_question: null
      },
      {
        answer: "Quiet, peaceful natural settings",
        weights: { NatureAffinity: 12, Sincerity: 8, Elegance: 6 },
        next_question: null
      },
      {
        answer: "Creative spaces filled with art and inspiration",
        weights: { ArtisticFlair: 12, Whimsy: 8, ColorPlayfulness: 6 },
        next_question: null
      },
      {
        answer: "Organized, minimalist spaces",
        weights: { Minimalism: 12, Competence: 8, Elegance: 6 },
        next_question: null
      }
    ]
  },
  {
    question: "How do you prefer to express your creativity?",
    options: [
      {
        answer: "Through bold, dramatic statements",
        weights: { Boldness: 12, Excitement: 8, ArtisticFlair: 6 },
        next_question: null
      },
      {
        answer: "Through subtle, refined details",
        weights: { Elegance: 12, Sophistication: 8, Competence: 6 },
        next_question: null
      },
      {
        answer: "Through playful, unexpected elements",
        weights: { Whimsy: 12, ColorPlayfulness: 8, Versatility: 6 },
        next_question: null
      },
      {
        answer: "Through practical, functional solutions",
        weights: { Competence: 12, Sincerity: 8, Minimalism: 6 },
        next_question: null
      }
    ]
  }
];

// Personality trait definitions for dynamic analysis
export const personalityTraits = {
  Boldness: "Confidence, risk-taking, and decisive action",
  Elegance: "Refinement, sophistication, and tasteful simplicity",
  Whimsy: "Creativity, playfulness, and imaginative thinking",
  Excitement: "Energy, enthusiasm, and dynamic engagement",
  Competence: "Reliability, thoroughness, and practical wisdom",
  Sincerity: "Authenticity, honesty, and genuine connection",
  Sophistication: "Cultural awareness, refinement, and worldly knowledge",
  Ruggedness: "Resilience, strength, and natural authenticity",
  ArtisticFlair: "Creative expression, aesthetic sensitivity, and artistic vision",
  NatureAffinity: "Connection to natural elements, organic appreciation, and environmental awareness",
  LuxuryLeaning: "Appreciation for premium quality, exclusivity, and refined taste",
  Versatility: "Adaptability, flexibility, and multi-faceted approach",
  ColorPlayfulness: "Vibrant expression, dynamic color choices, and energetic aesthetics",
  Minimalism: "Simplicity, clarity, and essential focus"
};

export default personalityQuiz;
