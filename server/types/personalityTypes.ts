export interface Question {
  Question: string;
  Option_1: string;
  Option_1_Personality: string;
  Option_2: string;
  Option_2_Personality: string;
  Option_3: string;
  Option_3_Personality: string;
  Option_4: string;
  Option_4_Personality: string;
}

export interface ProductTypeQuestion {
  question: string;
  options: {
    label: string;
    value: string;
    description: string;
  }[];
}

export interface BagRecommendation {
  Bag_Name: string;
  Personality_Description: string;
  Product_Link: string;
  Price?: string;
  Brand?: string;
  Style?: string;
  Material?: string;
  Color?: string;
}

export interface ArtworkData {
  Personality_Type: string;
  Artwork_Description: string;
  Style_Characteristics: string;
  Color_Palette: string;
  Mood: string;
  Product_Name?: string;
  Artwork_Name?: string;
  Image_URL?: string;
  Product_URL?: string;
}

export interface UserSession {
  sessionId: string;
  askedQuestions: string[];
  answers: string[];
  productType?: string;
  timestamp: Date;
}

export interface PersonalityAnalysis {
  predicted_personality: string;
  confidence_score: number;
  personality_analysis: string;
  style_preferences: string[];
  lifestyle_insights: string;
}

export interface EnhancedRecommendation {
  bag_name: string;
  reasoning: string;
  style_match: string;
  personality_alignment: string;
  product_link: string;
  price_range: string;
  brand_info: string;
  material_details: string;
  color_options: string;
  occasion_suitability: string;
  image_url?: string;
  artwork_name?: string;
  product_url?: string;
}

export interface QuizResult {
  personality_analysis: PersonalityAnalysis;
  recommendations: EnhancedRecommendation[];
  artwork_insights: ArtworkData | null;
  total_questions_answered: number;
  session_duration: number;
} 