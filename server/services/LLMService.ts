import fetch from 'node-fetch';

export interface LLMRequest {
  type: 'personality-report' | 'product-selection' | 'description-processing' | 'explanation-generation' | 'style-summary';
  data: Record<string, unknown>;
  options?: {
    temperature?: number;
    maxTokens?: number;
  };
}

export interface LLMResponse {
  success: boolean;
  data?: string;
  error?: string;
}

export class LLMService {
  private apiKey: string;
  private baseUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async process(request: LLMRequest): Promise<LLMResponse> {
    if (!this.apiKey || this.apiKey === 'hardcoded_gemini_api_key_here') {
      return { success: false, error: 'LLM API key not configured' };
    }

    try {
      let prompt = '';
      const config = {
        temperature: request.options?.temperature || 0.7,
        maxOutputTokens: request.options?.maxTokens || 512
      };

      switch (request.type) {
        case 'personality-report':
          prompt = this.generatePersonalityReportPrompt(request.data);
          config.maxOutputTokens = 2000;
          break;
        case 'product-selection':
          prompt = this.generateProductSelectionPrompt(request.data);
          config.temperature = 0.9;
          break;
        case 'description-processing':
          prompt = this.generateDescriptionProcessingPrompt(request.data);
          config.maxOutputTokens = 200;
          break;
        case 'explanation-generation':
          prompt = this.generateExplanationPrompt(request.data);
          config.maxOutputTokens = 512;
          break;
        case 'style-summary':
          prompt = this.generateStyleSummaryPrompt(request.data);
          config.maxOutputTokens = 256;
          break;
        default:
          return { success: false, error: 'Unknown request type' };
      }

      const response = await fetch(`${this.baseUrl}?key=${this.apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: config
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('LLM API error:', response.status, errorText);
        
        // Handle rate limiting specifically
        if (response.status === 429) {
          return { success: false, error: 'LLM API rate limit exceeded. Please try again later.' };
        }
        
        return { success: false, error: `LLM API error: ${response.status}` };
      }

      const data: Record<string, unknown> = await response.json();
      const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

      // For personality reports, return the markdown text directly
      if (request.type === 'personality-report') {
        return { success: true, data: generatedText };
      }

      return { success: true, data: generatedText };
    } catch (error) {
      console.error('LLM service error:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  private generatePersonalityReportPrompt(data: Record<string, unknown>): string {
    const { quizAnswers, personalityType, dominantTraits } = data;
    return `## Role
You are an **Expert Personality Analyst** and **Life Coach** specializing in creating beautiful, personalized personality reports. Your task is to generate a comprehensive personality analysis based on the user's quiz responses that follows a specific markdown format.

## Input Data
- Quiz answers: ${quizAnswers}
- Personality type: ${personalityType}
- Dominant traits: ${Array.isArray(dominantTraits) ? dominantTraits.join(', ') : dominantTraits || 'Not specified'}

## Output Requirements
Generate a COMPLETE personality report in the following EXACT markdown format. DO NOT skip any sections:

# Personality Overview

[First paragraph: 3-4 sentences describing their overall personality, creative spirit, and unique perspective. Focus on their visionary nature and inventive approach to life. Use warm, engaging language that makes them feel special and understood.]

[Second paragraph: 2-3 sentences that give them a specific persona title (like "Creative Catalyst") and explain how they blend different qualities. Describe their impact on others and their ability to transform ordinary situations into something extraordinary.]

# Your Unique Traits

**Elegance**
[2-3 sentences explaining how elegance manifests in their personality. Focus on their appreciation for quality, refined taste, and ability to bring order and beauty to their surroundings. Be specific about how this trait shows up in their choices and daily life.]

**Sincerity**
[2-3 sentences about their authentic communication style and genuine nature. Explain how their honesty and directness build trust and create meaningful connections. Focus on their grounded approach to relationships.]

**Versatility**
[2-3 sentences describing their adaptability and ability to read situations. Explain how they switch gears easily and find creative solutions. Focus on their flexibility in different contexts and their ability to turn challenges into opportunities.]

**Competence**
[2-3 sentences about their reliability and consistent delivery. Explain how they execute plans thoroughly and finish what they start. Focus on their results-oriented approach and how others can depend on them.]

## CRITICAL GUIDELINES:

1. **COMPLETE REPORT REQUIRED**: You MUST generate ALL sections above - Personality Overview (2 paragraphs) + Your Unique Traits (4 traits with descriptions).

2. **EXACT FORMAT**: Follow the markdown structure above precisely - use the exact headers, bold formatting, and paragraph structure shown.

3. **PERSONALIZED CONTENT**: Base all content on their specific quiz answers and personality type. Make each section feel uniquely tailored to them.

4. **WARM AND INSPIRING TONE**: Use encouraging, positive language that makes them feel valued and understood. Avoid generic statements.

5. **SPECIFIC EXAMPLES**: Reference their quiz choices and explain how those choices reflect their personality traits.

6. **CONSISTENT LENGTH**: Each trait description should be 2-3 sentences (similar to the example you saw).

7. **NO REPETITION**: Each trait should have completely different content and focus on different aspects of their personality.

8. **MARKDOWN FORMATTING**: Use proper markdown with # for headers and ** for bold trait names.

9. **MINIMUM LENGTH**: The complete report should be at least 300-400 words total.

## EXAMPLE STRUCTURE (follow exactly):

\`\`\`
# Personality Overview
[First paragraph about their creative spirit and unique perspective]
[Second paragraph about their persona title and impact]

# Your Unique Traits

**Elegance**
[2-3 sentences about their appreciation for quality and refined taste]

**Sincerity**
[2-3 sentences about their authentic communication]

**Versatility**
[2-3 sentences about their adaptability]

**Competence**
[2-3 sentences about their reliability]
\`\`\`

## VALIDATION CHECKLIST:
Before submitting, ensure your response contains:
✅ # Personality Overview (with 2 paragraphs)
✅ # Your Unique Traits (with 4 traits)
✅ **Elegance** (with description)
✅ **Sincerity** (with description)  
✅ **Versatility** (with description)
✅ **Competence** (with description)
✅ Total word count: 300-400+ words

IMPORTANT: This is NOT a short summary. Generate a FULL, DETAILED personality analysis with all sections completed. Each trait must have its own description paragraph.`;
  }

  private generateProductSelectionPrompt(data: Record<string, unknown>): string {
    const { personality, sentiment, artworkNames, bagType } = data;
    const bagTypeText = typeof bagType === 'string' && bagType.toLowerCase().includes('no preference') ? 'handbags' : `${bagType} bags`;
    const artworkNamesArray = Array.isArray(artworkNames) ? artworkNames : [];

    return `Given user personality: "${personality}" and sentiment: "${sentiment}", recommend exactly 12 DIFFERENT and VARIED ${bagTypeText} from this list of artwork designs: ${artworkNamesArray.join(', ')}. 

REQUIREMENTS:
1. Select 12 different artwork designs and styles
2. Ensure variety in colors, patterns, and aesthetics  
3. Match the user's personality and sentiment
4. Avoid repetitive or similar designs
5. Return ONLY the exact artwork names from the list, separated by commas, no additional text

User wants ${bagTypeText} with artwork designs that reflect their ${personality} personality and ${sentiment} sentiment.`;
  }

  private generateDescriptionProcessingPrompt(data: Record<string, unknown>): string {
    const { description } = data;
    return `Please rewrite this product description in 2-3 short, engaging sentences. Remove any product names, prices, or technical details. Focus only on the personality and style aspects. Keep it under 150 words.

Original description: "${description}"

Write a clean, concise version that captures the essence and personality traits.`;
  }

  private generateExplanationPrompt(data: Record<string, unknown>): string {
    const { personality, sentiment, bagPref, artworkList } = data;
    return `User Profile:
- Personality: ${personality}
- Sentiment: ${sentiment}
- Preferred Bag Type: ${bagPref}

Selected Artwork Designs: ${artworkList}

Write a detailed, engaging explanation (150-200 words) about why these specific ${bagPref} bags with these artwork designs suit this user's personality and sentiment. Include:
1. How the artwork design reflects their personality
2. Why these designs match their sentiment
3. Specific artistic elements that complement their character
4. How these bags enhance their overall look and lifestyle

Make it personal, specific, and compelling. Focus on the connection between their personality traits and the artwork characteristics.`;
  }

  private generateStyleSummaryPrompt(data: Record<string, unknown>): string {
    const { description, hasImage } = data;
    const initialPrompt = hasImage
      ? `Analyze the uploaded image and generate a concise style and sentiment summary. Recommend a fitting bag type.`
      : `Based on this user description: ${description}, generate a concise style and sentiment summary and recommend a bag type.`;

    return initialPrompt;
  }
}
