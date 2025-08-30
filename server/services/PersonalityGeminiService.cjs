"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PersonalityGeminiService = void 0;
const generative_ai_1 = require("@google/generative-ai");
class PersonalityGeminiService {
    constructor(dataService) {
        this.dataService = dataService;
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey || apiKey === 'your_gemini_api_key_here') {
            console.warn('⚠️  GEMINI_API_KEY not set. Using fallback personality analysis only.');
            this.genAI = null;
            this.model = null;
            return;
        }
        try {
            this.genAI = new generative_ai_1.GoogleGenerativeAI(apiKey);
            this.model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
        }
        catch (error) {
            console.error('Failed to initialize Gemini API:', error);
            this.genAI = null;
            this.model = null;
        }
    }
    async analyzePersonalityAndRecommend(userAnswers, availableBags, personalityTypes, artworkData) {
        if (!this.model || !this.genAI) {
            console.log('Gemini API not available, using fallback personality analysis...');
            return this.generateFallbackResult(userAnswers, availableBags, personalityTypes);
        }
        const prompt = this.createAdvancedFashionPrompt(userAnswers, availableBags, personalityTypes, artworkData);
        try {
            const result = await this.model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();
            return this.parseGeminiResponse(text, availableBags);
        }
        catch (error) {
            console.error('Gemini API Error:', error);
            console.log('Falling back to basic personality analysis...');
            return this.generateFallbackResult(userAnswers, availableBags, personalityTypes);
        }
    }
    createAdvancedFashionPrompt(userAnswers, availableBags, personalityTypes, artworkData) {
        return `
You are a world-renowned **fashion psychologist** and **luxury bag style consultant**, with deep expertise in interpreting personality traits through fashion preferences. Your role is to analyze user quiz responses to determine their **dominant fashion personality**, style inclinations, and lifestyle choices, and then generate a sophisticated, human-sounding personality summary.

## PERSONALITY TYPES:
${personalityTypes.join(', ')}

## USER QUIZ RESPONSES:
${userAnswers.map((answer, index) => `
${index + 1}. Q: "${answer.question}"  
   A: ${answer.selected_personality}
`).join('')}

## AVAILABLE BAGS DATABASE (${availableBags.length} items):
${availableBags.map(bag => `
- ${bag.Bag_Name}
  Brand: ${bag.Brand || 'Unknown'}
  Style: ${bag.Style || 'Not specified'}
  Price: ${bag.Price || 'Not specified'}
  Material: ${bag.Material || 'Not specified'}
  Color: ${bag.Color || 'Not specified'}
  Description: ${bag.Personality_Description}
  Link: ${bag.Product_Link}
`).join('')}

## ARTWORK & STYLE DATA:
${artworkData.map(art => `
- ${art.Personality_Type}:
  Artwork: ${art.Artwork_Description}
  Style: ${art.Style_Characteristics}
  Colors: ${art.Color_Palette}
  Mood: ${art.Mood}
`).join('')}

---

## YOUR TASK:
1. **Detect the Dominant Personality Type**  
   - Identify the dominant personality from the pattern of responses  
   - Also observe secondary influences if applicable  

2. **Give a Confidence Score (0–100)**  
   - Based on consistency of traits and answer alignment  

3. **Craft a Rich Personality Summary**  
   - Begin with a **one-line poetic description** of the user's essence  
   - Describe 4–5 **core personality traits** (e.g., bold, serene, artistic, structured)  
   - Explain how these traits showed up in their quiz responses  
   - Mention if other personality influences blend in subtly  
   - Describe their **fashion style** with adjectives and phrases (e.g., "bold silhouettes," "earthy minimalism," "playful vintage")  
   - Offer insights into their **lifestyle** (e.g., loves structure, thrives on spontaneity, craves peace, driven by passion)  

4. **Summarize Style Preferences**  
   - List 3–5 fashion style elements they gravitate towards  

5. **Lifestyle Insight**  
   - Provide 1–2 sentences that describe their personality-influenced lifestyle (social habits, values, fashion rituals)

6. **Bag Selection Criteria**:
   - Match personality type with bag descriptions and artwork data
   - Consider style compatibility, materials, colors, and price points
   - IMPORTANT: Select products from the SAME artwork collection for visual consistency
   - Choose the best 5 products that align with personality traits
   - Prioritize bags that match the user's style preferences
   - Ensure all recommendations come from the same artwork/collection
   - CRITICAL: Select only ONE product per artwork design to avoid duplicates

---

## OUTPUT FORMAT (JSON):
Return ONLY a JSON object like this:
{
  "personality_analysis": {
    "predicted_personality": "PERSONALITY_TYPE",
    "confidence_score": 85,
    "personality_analysis": "1–2 paragraph rich narrative combining traits, reasoning, and stylistic tone.",
    "style_preferences": ["e.g., Earthy tones", "Bohemian flair", "Sustainable fashion"],
    "lifestyle_insights": "1–2 sentence lifestyle description based on personality and style."
  },
  "recommendations": [
    {
      "bag_name": "EXACT_BAG_NAME_FROM_DATABASE",
      "reasoning": "Why this bag is perfect for the user",
      "style_match": "How it matches their personality and style",
      "personality_alignment": "Specific personality traits this bag reflects",
      "product_link": "EXACT_LINK_FROM_DATABASE",
      "price_range": "Price information",
      "brand_info": "Brand details",
      "material_details": "Material information",
      "color_options": "Color details",
      "occasion_suitability": "When to use this bag"
    }
    // ... Provide exactly 5 unique recommendations from the same artwork collection
  ]
}

CRITICAL: Use EXACT bag names and links from the database. Do not create fictional products.
Ensure all recommendations are unique and from the provided database.
IMPORTANT: All 5 recommendations must come from the SAME artwork collection for visual consistency.
CRITICAL: Select only ONE product per artwork design to avoid duplicates.
`;
    }
    parseGeminiResponse(response, availableBags) {
        try {
            const jsonMatch = response.match(/\{[\s\S]*\}/);
            if (!jsonMatch) {
                throw new Error('Invalid response format');
            }
            const parsed = JSON.parse(jsonMatch[0]);
            const enhancedRecommendations = parsed.recommendations.map((rec) => {
                const actualBag = availableBags.find(bag => bag.Bag_Name.toLowerCase() === String(rec.bag_name || '').toLowerCase());
                if (!actualBag) {
                    throw new Error(`Bag not found in database: ${rec.bag_name}`);
                }
                return {
                    ...rec,
                    bag_name: actualBag.Bag_Name,
                    product_link: actualBag.Product_Link,
                    price_range: actualBag.Price || 'Not specified',
                    brand_info: actualBag.Brand || 'Not specified',
                    material_details: actualBag.Material || 'Not specified',
                    color_options: actualBag.Color || 'Not specified',
                };
            });
            return {
                personality_analysis: parsed.personality_analysis,
                recommendations: enhancedRecommendations
            };
        }
        catch (error) {
            console.error('Error parsing Gemini response:', error);
            throw error;
        }
    }
    generateFallbackResult(userAnswers, availableBags, personalityTypes) {
        const personalityCounts = userAnswers.reduce((acc, answer) => {
            acc[answer.selected_personality] = (acc[answer.selected_personality] || 0) + 1;
            return acc;
        }, {});
        const predictedPersonality = Object.keys(personalityCounts).reduce((a, b) => personalityCounts[a] > personalityCounts[b] ? a : b);
        let matchingBags = availableBags.filter(bag => bag.Personality_Description.toLowerCase().includes(predictedPersonality.toLowerCase()));
        if (matchingBags.length === 0) {
            console.log('No specific personality matches found, using general recommendations...');
            matchingBags = availableBags;
        }
        const artworkGroups = new Map();
        matchingBags.forEach(bag => {
            const artworkKey = bag.Bag_Name.split(' ')[0] || bag.Personality_Description.split('_')[0] || 'default';
            if (!artworkGroups.has(artworkKey)) {
                artworkGroups.set(artworkKey, []);
            }
            artworkGroups.get(artworkKey).push(bag);
        });
        let largestGroup = [];
        for (const [key, group] of artworkGroups) {
            if (group.length > largestGroup.length) {
                largestGroup = group;
            }
        }
        let finalBags = largestGroup.length > 0 ? largestGroup : matchingBags;
        const uniqueArtworkBags = new Map();
        const seenBagNames = new Set();
        console.log(`🔍 Gemini deduplicating ${finalBags.length} bags...`);
        finalBags.forEach(bag => {
            if (seenBagNames.has(bag.Bag_Name)) {
                console.log(`🚫 Gemini skipping duplicate bag: ${bag.Bag_Name}`);
                return;
            }
            const artworkDetails = this.dataService.findProductDetails(bag.Bag_Name);
            const artworkName = artworkDetails?.Artwork_Name || bag.Bag_Name.split(' ')[0] || 'Unknown';
            if (!uniqueArtworkBags.has(artworkName)) {
                uniqueArtworkBags.set(artworkName, bag);
                seenBagNames.add(bag.Bag_Name);
                console.log(`✅ Gemini added unique artwork: ${artworkName} - ${bag.Bag_Name}`);
            }
            else {
                console.log(`🚫 Gemini skipping duplicate artwork: ${artworkName} - ${bag.Bag_Name}`);
            }
        });
        finalBags = Array.from(uniqueArtworkBags.values());
        finalBags = finalBags.slice(0, 8);
        console.log(`🎯 Gemini final deduplicated bags: ${finalBags.length}`);
        const detailedAnalysis = this.generateDetailedPersonalityAnalysis(predictedPersonality, userAnswers);
        return {
            personality_analysis: {
                predicted_personality: detailedAnalysis.predicted_personality,
                confidence_score: detailedAnalysis.confidence_score,
                personality_analysis: detailedAnalysis.personality_analysis,
                style_preferences: detailedAnalysis.style_preferences,
                lifestyle_insights: detailedAnalysis.lifestyle_insights
            },
            recommendations: finalBags.map(bag => ({
                bag_name: bag.Bag_Name,
                reasoning: this.generatePersonalizedReasoning(bag, predictedPersonality),
                style_match: this.getStyleMatch(bag, predictedPersonality),
                personality_alignment: `Perfectly aligns with your ${predictedPersonality} personality`,
                product_link: bag.Product_Link,
                price_range: bag.Price || 'Premium quality',
                brand_info: bag.Brand || 'Artisan crafted',
                material_details: bag.Material || 'Premium leather',
                color_options: bag.Color || 'Multiple elegant options',
                occasion_suitability: this.getOccasionSuitability(predictedPersonality)
            }))
        };
    }
    generateDetailedPersonalityAnalysis(personality, userAnswers) {
        const personalityInsights = {
            'Boho Spirit': {
                poetic_line: 'You are a wandering soul wrapped in color, rhythm, and wild imagination.',
                traits: ['Creative', 'Free-spirited', 'Artistic', 'Individualistic', 'Adventurous'],
                style_keywords: ['Ethnic prints', 'Layered textures', 'Vintage charm', 'Natural fabrics'],
                lifestyle: 'You thrive on experience, travel, and artistic expression. Your choices reflect a non-conformist attitude and a love for storytelling through style.'
            },
            'Savannah Spirit': {
                poetic_line: 'You are the wild heartbeat of nature, fierce and unafraid.',
                traits: ['Bold', 'Independent', 'Fierce', 'Natural', 'Untamed'],
                style_keywords: ['Animal prints', 'Earth tones', 'Raw textures', 'Statement pieces'],
                lifestyle: 'You embrace challenges with courage and seek beauty in the wild. Your lifestyle is marked by intensity, confidence, and a magnetic presence.'
            },
            'Retro Muse': {
                poetic_line: 'You are a bridge between eras, finding beauty in the dance of past and present.',
                traits: ['Nostalgic', 'Timeless', 'Balanced', 'Appreciative', 'Sophisticated'],
                style_keywords: ['Vintage elegance', 'Classic silhouettes', 'Heritage quality', 'Contemporary twists'],
                lifestyle: 'You value tradition while embracing innovation, finding beauty in the balance between old and new. Your lifestyle reflects an appreciation for quality and craftsmanship.'
            },
            'Dreamscape Urbanite': {
                poetic_line: 'You are the architect of your dreams, building success with every step forward.',
                traits: ['Ambitious', 'Visionary', 'Urban', 'Determined', 'Forward-thinking'],
                style_keywords: ['Modern sophistication', 'Sleek designs', 'Professional elegance', 'Contemporary style'],
                lifestyle: 'You are driven by goals and aspirations, constantly seeking growth and advancement. Your lifestyle is fast-paced and achievement-oriented.'
            },
            'Gentle Guardian': {
                poetic_line: 'You are the warm embrace that protects and nurtures all who cross your path.',
                traits: ['Protective', 'Compassionate', 'Nurturing', 'Reliable', 'Kind'],
                style_keywords: ['Soft colors', 'Comfortable elegance', 'Approachable beauty', 'Practical charm'],
                lifestyle: 'You prioritize relationships and care for others, creating a warm and welcoming environment wherever you go. Your lifestyle is centered around meaningful connections.'
            },
            'Enchanted Rose': {
                poetic_line: 'You are a dreamer who finds magic in every moment, romance in every detail.',
                traits: ['Romantic', 'Magical', 'Elegant', 'Dreamy', 'Vintage-inspired'],
                style_keywords: ['Romantic florals', 'Delicate details', 'Feminine elegance', 'Magical touches'],
                lifestyle: 'You find magic in everyday moments and appreciate beauty in all its forms. Your lifestyle is marked by romance, creativity, and a love for beautiful things.'
            },
            'Wolf Moon': {
                poetic_line: 'You are the loyal guardian of your pack, guided by instinct and inner strength.',
                traits: ['Loyal', 'Strong', 'Intuitive', 'Protective', 'Independent'],
                style_keywords: ['Bold confidence', 'Natural elements', 'Strong designs', 'Protective style'],
                lifestyle: 'You trust your instincts and value loyalty above all else. Your lifestyle is marked by deep connections and a strong sense of personal integrity.'
            },
            'Ocean Mist': {
                poetic_line: 'You are the gentle whisper of tranquility, bringing calm to every storm.',
                traits: ['Tranquil', 'Calm', 'Serene', 'Balanced', 'Peaceful'],
                style_keywords: ['Cool tones', 'Flowing designs', 'Serene beauty', 'Balanced elegance'],
                lifestyle: 'You bring peace and harmony to your surroundings, valuing balance and tranquility. Your lifestyle is marked by mindfulness and a love for peaceful environments.'
            }
        };
        const fallback = {
            poetic_line: `You embody the unique essence of ${personality}, balancing charm and individuality.`,
            traits: ['Unique', 'Expressive', 'Independent'],
            style_keywords: ['Eclectic pieces', 'Statement accessories', 'Artful silhouettes'],
            lifestyle: 'Your lifestyle is defined by self-expression and a distinctive fashion voice. You live by your own rules, curating your world with intention.'
        };
        const insight = personalityInsights[personality] || fallback;
        const selectedTraits = userAnswers.map(answer => answer.selected_personality);
        const uniqueTraits = [...new Set(selectedTraits)];
        const secondaryInfluences = uniqueTraits.filter(t => t !== personality).slice(0, 2);
        const diversityLine = secondaryInfluences.length
            ? `You also show subtle influences from ${secondaryInfluences.join(' and ')}, adding layers to your personality.`
            : '';
        const confidenceScore = Math.floor((selectedTraits.filter(t => t === personality).length / userAnswers.length) * 100);
        const personalityText = `${insight.poetic_line} ${insight.traits.join(', ')} — these are the core traits that shape your essence. Your style leans into ${insight.style_keywords.join(', ')}, expressing your personality through your fashion choices. ${insight.lifestyle} ${diversityLine}`;
        return {
            predicted_personality: personality,
            confidence_score: confidenceScore,
            personality_analysis: personalityText.trim(),
            style_preferences: insight.style_keywords,
            lifestyle_insights: insight.lifestyle
        };
    }
    getStylePreferences(personality) {
        const styleMap = {
            'Boho Spirit': ['Ethnic patterns', 'Vintage charm', 'Artistic details', 'Natural materials', 'Cultural influences'],
            'Savannah Spirit': ['Animal prints', 'Bold designs', 'Earthy tones', 'Statement pieces', 'Natural elements'],
            'Retro Muse': ['Vintage elegance', 'Classic designs', 'Timeless appeal', 'Sophisticated details', 'Heritage quality'],
            'Dreamscape Urbanite': ['Modern sophistication', 'Sleek designs', 'Professional elegance', 'Contemporary style', 'Urban chic'],
            'Gentle Guardian': ['Soft colors', 'Comfortable elegance', 'Approachable beauty', 'Practical charm', 'Nurturing style'],
            'Enchanted Rose': ['Romantic florals', 'Delicate details', 'Vintage-inspired', 'Feminine elegance', 'Magical touches'],
            'Wolf Moon': ['Bold confidence', 'Natural elements', 'Strong designs', 'Protective style', 'Instinctive choices'],
            'Ocean Mist': ['Cool tones', 'Flowing designs', 'Serene beauty', 'Balanced elegance', 'Peaceful style']
        };
        return styleMap[personality] || ['Versatile', 'Classic', 'Practical', 'Elegant', 'Unique'];
    }
    getLifestyleInsights(personality) {
        const lifestyleMap = {
            'Boho Spirit': 'You embrace artistic expression and cultural diversity, finding beauty in unconventional places and valuing experiences that enrich your creative soul.',
            'Savannah Spirit': 'You live with passion and intensity, seeking adventure and embracing challenges with the fierce determination of the wild.',
            'Retro Muse': 'You appreciate the balance between tradition and innovation, finding beauty in timeless designs while embracing contemporary relevance.',
            'Dreamscape Urbanite': 'You are driven by ambition and vision, constantly pursuing growth and success in the dynamic urban landscape.',
            'Gentle Guardian': 'You prioritize meaningful relationships and create warm, nurturing environments that support and protect those you care about.',
            'Enchanted Rose': 'You find magic in everyday moments and surround yourself with beauty, romance, and creative inspiration.',
            'Wolf Moon': 'You trust your instincts and value loyalty, building deep connections based on mutual respect and personal integrity.',
            'Ocean Mist': 'You bring tranquility and balance to your surroundings, creating peaceful environments that promote harmony and well-being.'
        };
        return lifestyleMap[personality] || 'You have a unique approach to life that reflects your distinctive personality and values.';
    }
    generatePersonalizedReasoning(bag, personality) {
        return `This ${bag.Bag_Name} reflects your unique personality and style preferences.`;
    }
    getStyleMatch(bag, personality) {
        const styleMatchMap = {
            'Boho Spirit': 'Ethnic patterns and artistic flair that express your creative spirit',
            'Savannah Spirit': 'Bold statement-making design that reflects your fierce independence',
            'Retro Muse': 'Vintage elegance with modern sophistication that bridges past and present',
            'Dreamscape Urbanite': 'Sleek contemporary style that conveys your professional ambition',
            'Gentle Guardian': 'Soft, approachable beauty that reflects your nurturing nature',
            'Enchanted Rose': 'Romantic, feminine elegance that captures your magical essence',
            'Wolf Moon': 'Strong, confident design that reflects your natural instincts',
            'Ocean Mist': 'Calm, flowing beauty that embodies your serene tranquility'
        };
        return styleMatchMap[personality] ||
            'Reflects your unique style preferences and personality';
    }
    getOccasionSuitability(personality) {
        const occasionMap = {
            'Boho Spirit': 'Perfect for artistic gatherings, cultural events, and creative adventures',
            'Savannah Spirit': 'Ideal for bold social events, adventurous outings, and statement-making occasions',
            'Retro Muse': 'Versatile for both classic events and contemporary social gatherings',
            'Dreamscape Urbanite': 'Perfect for professional settings, urban adventures, and achievement-oriented events',
            'Gentle Guardian': 'Ideal for caring for others, social gatherings, and meaningful connections',
            'Enchanted Rose': 'Perfect for romantic occasions, creative events, and magical moments',
            'Wolf Moon': 'Ideal for trusted gatherings, outdoor adventures, and instinctive choices',
            'Ocean Mist': 'Perfect for peaceful environments, balanced occasions, and serene gatherings'
        };
        return occasionMap[personality] ||
            'Versatile for various occasions that match your lifestyle';
    }
}
exports.PersonalityGeminiService = PersonalityGeminiService;
